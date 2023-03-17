<template>
  <div class="my-4">
    <fieldset
      class="cz-fieldset"
      :class="{ 'is-invalid': control.errors && control.errors.length > 0 }"
      :data-id="computedLabel.replaceAll(` `, ``)"
    >
      <legend
        v-if="computedLabel"
        @click="control.enabled ? (isCollapsed = false) : null"
        class="v-label"
        :class="
          styles.group.label +
          (!isCollapsed || !hasToggle ? ' v-label--active' : '')
        "
      >
        {{ computedLabel }}
      </legend>

      <v-tooltip v-if="hasToggle" bottom transition="fade">
        <template v-slot:activator="{ on: onTooltip }">
          <!-- ADD BUTTON -->
          <v-btn
            v-if="isCollapsed"
            icon
            color="primary"
            @click="isCollapsed = false"
            :aria-label="`Add ${control.schema.title}`"
            :disabled="!control.enabled"
            class="btn-add"
            v-on="onTooltip"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>

          <!-- REMOVE BUTTON -->
          <v-btn
            v-else
            icon
            color="error"
            @click="collapse"
            :aria-label="`Remove ${control.schema.title}`"
            :disabled="!control.enabled"
            class="btn-add"
            v-on="onTooltip"
          >
            <v-icon>mdi-minus</v-icon>
          </v-btn>
        </template>
        {{ isCollapsed ? "Add" : "Remove" }} {{ control.schema.title }}
      </v-tooltip>

      <div v-if="!(isCollapsed && hasToggle)">
        <dispatch-renderer
          :visible="control.visible"
          :enabled="control.enabled"
          :schema="control.schema"
          :uischema="detailUiSchema"
          :path="control.path"
          :renderers="control.renderers"
          :cells="control.cells"
        />
      </div>
    </fieldset>

    <div v-if="cleanedErrors || description">
      <div class="text--secondary text-body-1 ml-2">{{ description }}</div>
      <div
        v-if="cleanedErrors"
        class="ml-2 v-messages error--text"
        :class="styles.control.error"
      >
        {{ cleanedErrors }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  ControlElement,
  findUISchema,
  Generate,
  isObjectControl,
  JsonFormsRendererRegistryEntry,
  rankWith,
  UISchemaElement,
} from "@jsonforms/core";
import {
  DispatchRenderer,
  rendererProps,
  RendererProps,
  useJsonFormsControlWithDetail,
} from "@jsonforms/vue2";
import cloneDeep from "lodash/cloneDeep";
import { useNested, useVuetifyControl } from "@/renderers/util/composition";
import { defineComponent, ref } from "vue";
import { isEqual } from "lodash";

const controlRenderer = defineComponent({
  name: "object-renderer",
  components: {
    DispatchRenderer,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const control = useVuetifyControl(useJsonFormsControlWithDetail(props));
    const isCollapsed = ref(true);
    const nested = useNested("object");
    return {
      ...control,
      isCollapsed,
      input: control,
      nested,
    };
  },
  watch: {
    "control.data": function (newVal, oldVal) {
      if (newVal) {
        const filteredObj = Object.fromEntries(
          Object.entries(newVal).filter(([_, value]) => value !== undefined)  // strip out undefined properties
        );
        
        if (isEqual(filteredObj, {})) {
          this.handleChange(this.control.path, undefined);
        }
      }
    },
  },
  created() {
    this.isCollapsed = !this.control.data;
  },
  methods: {
    collapse() {
      this.handleChange(this.control.path, undefined);
      this.isCollapsed = true;
    },
  },
  computed: {
    detailUiSchema(): UISchemaElement {
      const uiSchemaGenerator = () => {
        const uiSchema = Generate.uiSchema(this.control.schema, "Object");
        return uiSchema;
      };
      let result = findUISchema(
        this.control.uischemas,
        this.control.schema,
        this.control.uischema.scope,
        this.control.path,
        uiSchemaGenerator,
        this.control.uischema,
        this.control.rootSchema
      );
      if (this.nested.level > 0) {
        result = cloneDeep(result);
        result.options = {
          ...result.options,
          bare: true,
          alignLeft:
            this.nested.level >= 4 || this.nested.parentElement === "array",
        };
      }
      return result;
    },
    description(): string {
      return this.control.description || this.appliedOptions.description || "";
    },
    cleanedErrors() {
      // @ts-ignore
      return this.control.errors.replaceAll(`is a required property`, ``);
    },
    hasToggle() {
      // @ts-ignore
      return !this.control.required;
    },
  },
});
export default controlRenderer;
export const objectControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isObjectControl),
};
</script>