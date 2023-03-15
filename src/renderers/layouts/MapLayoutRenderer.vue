<template>
  <div class="my-4" v-if="control.visible" v-bind="vuetifyProps('v-container')">
    <v-container>
      <v-row>
        <v-col sm="12" md="5">
          <v-row
            v-for="(element, index) in control.uischema.elements"
            :data-id="`vertical-${index}`"
            :key="`${control.path}-${index}`"
            no-gutters
            v-bind="vuetifyProps(`v-row[${index}]`)"
          >
            <v-col cols="12" :class="styles.verticalLayout.item">
              <dispatch-renderer
                :schema="control.schema"
                :uischema="element"
                :path="control.path"
                :enabled="control.enabled"
                :renderers="control.renderers"
                :cells="control.cells"
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
  rankWith,
  ControlElement,
} from "@jsonforms/core";
import { defineComponent } from 'vue';
import {
  DispatchRenderer,
  rendererProps,
  RendererProps,
  useJsonFormsControlWithDetail
} from "@jsonforms/vue2";
import { useVuetifyControl,  } from "@/renderers/util/composition";
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
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const marker: any = null;
    const rectangle: any = null;
    const map: google.maps.Map | null = null;
    const isEventFromMap = false;
    const timeout = 50;
    const initialized = false;
    
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
      initialized,
      ...useVuetifyControl(useJsonFormsControlWithDetail(props))
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
            lat: this.control.data.north,
            lng: this.control.data.east,
          });
        }
      }
    }
  },
  watch: {
    'control.data': function (newData, oldData) {
      if (this.isEventFromMap) {
        this.isEventFromMap = false
      }
      else {
        if (this.initialized) {
          this.loadDrawing()
          this.isEventFromMap = false
        }
      }
    }
  },
  computed: {
    mapType(): "point" | "box" {
      return this.control.uischema.options?.map.type || "point";
    },
    inputFields(): { [key: string]: string } {
      const options = this.control.uischema.options?.map;

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
          !isNaN(this.control.data.north) && 
          !isNaN(this.control.data.east)) ||
        (this.mapType === "box" &&
          !isNaN(this.control.data.northlimit) &&
          !isNaN(this.control.data.eastlimit) &&
          !isNaN(this.control.data.southlimit) &&
          !isNaN(this.control.data.westlimit))
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

      this.initialized = true;
    },
    debouncedHandleChange() {
      window.clearTimeout(this.timeout)
      this.timeout = window.setTimeout(() => {
        this.handleChange(this.control.path, this.control.data)
      }, 150)
    },
    handleDrawing() {
      // propagate to form inputs
      if (this.mapType === "box") {
        const bounds = this.rectangle.getBounds();
        const northEast = bounds.getNorthEast();
        const southWeast = bounds.getSouthWest();

        this.control.data[this.inputFields.northlimit] = +northEast
          .lat()
          .toFixed(4);
        this.control.data[this.inputFields.eastlimit] = +northEast
          .lng()
          .toFixed(4);
        this.control.data[this.inputFields.southlimit] = +southWeast
          .lat()
          .toFixed(4);
        this.control.data[this.inputFields.westlimit] = +southWeast
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
          this.control.data[this.inputFields.north] = +lat;
          this.control.data[this.inputFields.east] = +lng;
        }

        if (this.isEventFromMap) {
          this.handleChange(this.control.path, this.control.data)
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
              north: this.control.data.northlimit,
              south: this.control.data.southlimit,
              east: this.control.data.eastlimit,
              west: this.control.data.westlimit,
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
            position: { lat: this.control.data.north, lng: this.control.data.east },
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
