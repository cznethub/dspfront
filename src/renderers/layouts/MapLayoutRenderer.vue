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
          <div ref="map" class="map-container"></div>
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
const loader = new Loader(process.env.GOOGLE_MAPS_API_KEY, options);

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
    const rectangleOptions: google.maps.RectangleOptions = {
      fillColor: "#1976d2",
      fillOpacity: 0.25,
      strokeWeight: 2,
      strokeColor: "#1976d2",
      editable: true,
      zIndex: 1,
      draggable: true,
    };

    return {
      marker,
      rectangle,
      map,
      rectangleOptions,
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
          this.layout.data.hasOwnProperty("north") &&
          this.layout.data.hasOwnProperty("east")) ||
        (this.mapType === "box" &&
          this.layout.data.hasOwnProperty("northlimit") &&
          this.layout.data.hasOwnProperty("eastlimit") &&
          this.layout.data.hasOwnProperty("southlimit") &&
          this.layout.data.hasOwnProperty("westlimit"))
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

      // add drawing menu
      const drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: drawwingMode,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [drawwingMode],
        },
        rectangleOptions: this.rectangleOptions,
      });

      drawingManager.setMap(this.map);

      google.maps.event.addListener(
        drawingManager,
        "markercomplete",
        (marker: google.maps.Marker) => {
          this.clearMarkers();
          this.marker = marker;
          this.handleDrawing();
        }
      );

      google.maps.event.addListener(
        drawingManager,
        "rectanglecomplete",
        (rectangle: google.maps.Rectangle) => {
          this.clearRectangles();
          this.rectangle = rectangle;
          rectangle.addListener("bounds_changed", this.handleDrawing);
          this.handleDrawing();
        }
      );
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

        this.handleChange(this.layout.path, this.layout.data);
      } else if (this.mapType === "point") {
        const position = this.marker.getPosition();
        const lat = position?.lat().toFixed(4);
        const lng = position?.lng().toFixed(4);

        if (lat && lng) {
          this.layout.data[this.inputFields.north] = +lat;
          this.layout.data[this.inputFields.east] = +lng;
        }

        this.handleChange(this.layout.path, this.layout.data);
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
        const rectangle = new google.maps.Rectangle({
          ...this.rectangleOptions,
          bounds: {
            north: this.layout.data.northlimit,
            south: this.layout.data.southlimit,
            east: this.layout.data.eastlimit,
            west: this.layout.data.westlimit,
          },
          map: this.map,
        });
        this.clearRectangles();
        this.rectangle = rectangle;
        rectangle.addListener("bounds_changed", this.handleDrawing);

        // zoom to rectangle
        // TODO: calculate appropiate zoom level
        const centerLat =
          (this.layout.data.northlimit + this.layout.data.southlimit) / 2;
        const centerLng =
          (this.layout.data.eastlimit + this.layout.data.westlimit) / 2;
        (this.map as google.maps.Map).setCenter({
          lat: centerLat,
          lng: centerLng,
        });
      }
    },
    loadPoint() {
      if (this.map) {
        const marker = new google.maps.Marker({
          position: { lat: this.layout.data.north, lng: this.layout.data.east },
          map: this.map,
        });
        this.clearMarkers();
        this.marker = marker;

        // zoom to marker
        (this.map as google.maps.Map).setCenter({
          lat: this.layout.data.north,
          lng: this.layout.data.east,
        });
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
}
</style>
