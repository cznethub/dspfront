<template>
  <div class="my-4" v-if="layout.visible" v-bind="vuetifyProps('v-container')">
    <v-container>
      <v-row>
        <v-col sm="12" md="5">
          <v-row
            v-for="(element, index) in layout.uischema.elements"
            :data-id="`vertical-${index}`"
            :key="`${layout.path}-${index}`"
            no-gutters
            v-bind="vuetifyProps(`v-row[${index}]`)"
          >
            <v-col cols="12" :class="styles.verticalLayout.item">
              <dispatch-renderer
                :schema="layout.schema"
                :uischema="element"
                :path="layout.path"
                :enabled="layout.enabled"
                :renderers="layout.renderers"
                :cells="layout.cells"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-col sm="12" md="7">
          <div ref="map" class="map-container elevation-2"></div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import {
  uiTypeIs,
  JsonFormsRendererRegistryEntry,
  Layout,
  rankWith,
  ControlProps,
} from "@jsonforms/core";
import { defineComponent } from "@vue/composition-api";
import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsLayout,
  RendererProps,
  useJsonFormsControl,
} from "@jsonforms/vue2";
import { useVuetifyControl, useVuetifyLayout } from "@jsonforms/vue2-vuetify";
import { VContainer, VRow, VCol } from "vuetify/lib";
import { Loader, LoaderOptions } from "google-maps";
const options: LoaderOptions = { libraries: ["drawing"] };
const loader = new Loader(process.env.VUE_APP_GOOGLE_MAPS_API_KEY, options);

const layoutRenderer = defineComponent({
  name: "map-layout-renderer",
  components: {
    DispatchRenderer,
    VContainer,
    VRow,
    VCol,
  },
  props: {
    ...rendererProps<Layout>(),
  },
  setup(props: RendererProps<Layout>) {
    let marker: any = null;
    let rectangle: any = null;
    let map: google.maps.Map | null = null;
    let isEventFromMap = false;
    let timeout = 50;
    
    const rectangleOptions: google.maps.RectangleOptions = {
      fillColor: "#1976d2",
      fillOpacity: 0.25,
      strokeWeight: 2,
      strokeColor: "#1976d2",
      editable: true,
      zIndex: 1,
      draggable: true,
    };

    const markerOptions: google.maps.MarkerOptions = {}
    return {
      marker,
      rectangle,
      map,
      rectangleOptions,
      markerOptions,
      isEventFromMap,
      timeout,
      ...useVuetifyLayout(useJsonFormsLayout(props)),
      // Constructed just so we can call handleChange from a layout element
      ...useVuetifyControl(
        useJsonFormsControl({
          uischema: { ...props.uischema, scope: "" },
          schema: props.schema,
          label: "",
          errors: "",
          data: [],
          id: "",
          visible: true,
          rootSchema: props.schema,
          enabled: props.enabled,
          path: props.path,
          handleChange: () => {},
        } as ControlProps),
        (value) => value || undefined
      ),
    };
  },
  mounted: async function () {
    await this.initMap();

    if (this.hasData) {
      this.loadDrawing();

      if (this.map) {
        if (this.mapType === 'box') {
          // Zoom and center to rectangle
          (this.map as google.maps.Map).fitBounds(this.rectangle.bounds)
        }
        else {
          // Recenter at marker
          (this.map as google.maps.Map).setCenter({
            lat: this.layout.data.north,
            lng: this.layout.data.east,
          });
        }
      }
    }
  },
  watch: {
    'layout.data': function (newData, oldData) {
      if (this.isEventFromMap) {
        this.isEventFromMap = false
      }
      else {
        this.loadDrawing()
        this.isEventFromMap = false
      }
    }
  },
  computed: {
    mapType(): "point" | "box" {
      return this.layout.uischema.options?.map.type || "point";
    },
    inputFields(): { [key: string]: string } {
      const options = this.layout.uischema.options?.map;

      return this.mapType === "point"
        ? { east: options.east, north: options.north }
        : {
            northlimit: options.northlimit,
            eastlimit: options.eastlimit,
            southlimit: options.southlimit,
            westlimit: options.westlimit,
          };
    },
    hasData(): boolean {
      return (
        (this.mapType === "point" &&
          !isNaN(this.layout.data.north) && 
          !isNaN(this.layout.data.east)) ||
        (this.mapType === "box" &&
          !isNaN(this.layout.data.northlimit) &&
          !isNaN(this.layout.data.eastlimit) &&
          !isNaN(this.layout.data.southlimit) &&
          !isNaN(this.layout.data.westlimit))
      );
    },
  },
  methods: {
    async initMap() {
      const google = await loader.load();
      // @ts-ignore

      this.map = new google.maps.Map(this.$refs.map, {
        center: { lat: 39.8097343, lng: -98.5556199 },
        zoom: 5,
      });

      const drawwingMode =
        this.mapType === "point"
          ? google.maps.drawing.OverlayType.MARKER
          : google.maps.drawing.OverlayType.RECTANGLE;

      // Icon base from: http://kml4earth.appspot.com/icons.html
      const iconBase = "http://earth.google.com/images/kml-icons/";
      const icons = {
        track_directional: {
          icon: iconBase + "track-directional/track-8.png",
        }
      };

      this.markerOptions = { 
        ...this.markerOptions, 
        // animation: google.maps.Animation.DROP,
        icon: {
          url: icons.track_directional.icon,
          anchor: new google.maps.Point(20, 35),
          scaledSize: new google.maps.Size(40, 40)
        }
      }

      // add drawing menu
      const drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: drawwingMode,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [drawwingMode],
        },
        rectangleOptions: this.rectangleOptions,
        markerOptions: this.markerOptions
      });

      drawingManager.setMap(this.map);

      google.maps.event.addListener(
        drawingManager,
        "markercomplete",
        (marker: google.maps.Marker) => {
          this.clearMarkers();
          this.marker = marker;
          this.isEventFromMap = true
          this.handleDrawing();
        }
      );

      google.maps.event.addListener(
        drawingManager,
        "rectanglecomplete",
        (rectangle: google.maps.Rectangle) => {
          this.clearRectangles();
          this.rectangle = rectangle;
          rectangle.addListener("bounds_changed", () => { this.isEventFromMap = true; this.handleDrawing() });
          this.isEventFromMap = true
          this.handleDrawing();
        }
      );
    },
    debouncedHandleChange() {
      window.clearTimeout(this.timeout)
      this.timeout = window.setTimeout(() => {
        this.handleChange(this.layout.path, this.layout.data)
      }, 150)
    },
    handleDrawing() {
      // propagate to form inputs
      if (this.mapType === "box") {
        const bounds = this.rectangle.getBounds();
        const northEast = bounds.getNorthEast();
        const southWeast = bounds.getSouthWest();

        this.layout.data[this.inputFields.northlimit] = +northEast
          .lat()
          .toFixed(4);
        this.layout.data[this.inputFields.eastlimit] = +northEast
          .lng()
          .toFixed(4);
        this.layout.data[this.inputFields.southlimit] = +southWeast
          .lat()
          .toFixed(4);
        this.layout.data[this.inputFields.westlimit] = +southWeast
          .lng()
          .toFixed(4);

        if (this.isEventFromMap) {
          // Debounced to prevent stuttering while draging the rectangle around
          this.debouncedHandleChange()
        }
      } else if (this.mapType === "point") {
        const position = this.marker.getPosition();
        const lat = position?.lat().toFixed(4);
        const lng = position?.lng().toFixed(4);

        if (lat && lng) {
          this.layout.data[this.inputFields.north] = +lat;
          this.layout.data[this.inputFields.east] = +lng;
        }

        if (this.isEventFromMap) {
          this.handleChange(this.layout.path, this.layout.data)
        }
      }
    },
    clearMarkers() {
      if (this.marker) {
        this.marker.setMap(null);
        this.marker = null;
      }
    },
    clearRectangles() {
      if (this.rectangle) {
        this.rectangle.setMap(null);
        this.rectangle = null;
      }
    },
    loadDrawing() {
      if (this.mapType === "point") {
        this.loadPoint();
      } else {
        this.loadRectangle();
      }
    },
    loadRectangle() {
      if (this.map) {
        this.clearRectangles()

        if (this.hasData) {
          this.rectangle = new google.maps.Rectangle({
            ...this.rectangleOptions,
            bounds: {
              north: this.layout.data.northlimit,
              south: this.layout.data.southlimit,
              east: this.layout.data.eastlimit,
              west: this.layout.data.westlimit,
            },
            map: this.map,
          });

          this.rectangle.addListener("bounds_changed", () => { this.isEventFromMap = true; this.handleDrawing() });
        }
      }
    },
    loadPoint() {
      if (this.map) {
        this.clearMarkers();

        if (this.hasData) {
          const marker = new google.maps.Marker({
            ...this.markerOptions,
            position: { lat: this.layout.data.north, lng: this.layout.data.east },
            map: this.map,
          });
          
          this.marker = marker;
        }
      }
    },
  },
});

export default layoutRenderer;
export const mapLayoutRenderer: JsonFormsRendererRegistryEntry = {
  renderer: layoutRenderer,
  tester: rankWith(2, uiTypeIs("MapLayout")),
};
</script>

<style lang="scss" scoped>
.map-container {
  width: 100%;
  min-height: 400px;
  height: 100%;
  border: 1px solid #ffffff;
  border-radius: 0.5rem;
}
</style>
