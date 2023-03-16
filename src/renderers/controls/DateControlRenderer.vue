<template>
  <v-menu
    ref="menu"
    v-model="showMenu"
    :close-on-content-click="false"
    :return-value.sync="pickerValue"
    transition="scale-transition"
    offset-y
    min-width="290px"
    v-bind="vuetifyProps('v-menu')"
    :disabled="!control.enabled"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        :id="control.id + '-input'"
        :class="styles.control.input"
        :disabled="!control.enabled"
        :autofocus="appliedOptions.focus"
        :placeholder="placeholder"
        :label="computedLabel"
        :hint="description"
        persistent-hint
        :required="control.required"
        :error-messages="control.errors"
        prepend-inner-icon="mdi-calendar"
        v-mask="mask"
        :value="inputValue"
        @input="onInputChange"
        outlined
        class="py-3"
        v-bind="attrs"
        v-on="on"
      >
        <template v-slot:message>
          <div v-if="description" class="text-subtitle-1 text--secondary">
            {{ description }}
          </div>
          <div v-if="cleanedErrors" class="ml-2 v-messages error--text">
            {{ cleanedErrors }}
          </div>
        </template>
        <template slot="append">
          <v-icon v-if="control.enabled" tabindex="-1" @click="clear"
            >$clear</v-icon
          >
        </template>
      </v-text-field>
    </template>

    <v-date-picker
      v-if="showMenu"
      v-model="pickerValue"
      ref="picker"
      v-bind="vuetifyProps('v-date-picker')"
      :min="minDate"
      :max="maxDate"
      :type="pickerType"
      @click:year="onYear"
    >
      <v-spacer></v-spacer>
      <v-btn text @click="showMenu = false">
        {{ cancelLabel }}
      </v-btn>
      <v-btn text color="primary" @click="okHandler">
        {{ okLabel }}
      </v-btn>
    </v-date-picker>
  </v-menu>
</template>

<script lang="ts">
import {
  ControlElement,
  isDateControl,
  JsonFormsRendererRegistryEntry,
  JsonSchema,
  // JsonSchema,
  rankWith,
} from "@jsonforms/core";
import { VueMaskDirective as Mask } from "v-mask";
import { defineComponent, ref } from "vue";

import {
  rendererProps,
  RendererProps,
  useJsonFormsControl,
} from "@jsonforms/vue2";
import dayjs from "dayjs";
import {
  parseDateTime,
  useTranslator,
  useVuetifyControl,
} from "@/renderers/util";

const JSON_SCHEMA_DATE_FORMATS = ["YYYY-MM-DD"];

type MinMaxFormat =
  | {
      amount: number;
      unit: "day" | "month" | "year";
    }
  | "today";

const controlRenderer = defineComponent({
  name: "date-control-renderer",
  directives: { Mask },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const t = useTranslator();

    const showMenu = ref(false);
    const mask = ref<((value: string) => (string | RegExp)[]) | undefined>(
      undefined
    );

    const adaptValue = (value: any) => value || undefined;
    const control = useVuetifyControl(useJsonFormsControl(props), adaptValue);
    return { ...control, showMenu, mask, t, adaptValue };
  },
  watch: {
    isFocused(newFocus) {
      if (newFocus && this.applyMask) {
        this.mask = this.maskFunction.bind(this);
      } else {
        this.mask = undefined;
      }
    },
  },
  computed: {
    placeholder(): string {
      return (
        // @ts-ignore
        this.control.schema.options?.placeholder ||
        this.appliedOptions.placeholder ||
        ""
      );
    },
    description(): string {
      return this.control.description || this.appliedOptions.description || "";
    },
    cleanedErrors() {
      // @ts-ignore
      return this.control.errors.replaceAll(`is a required property`, ``);
    },
    applyMask(): boolean {
      return typeof this.appliedOptions.mask == "boolean"
        ? this.appliedOptions.mask
        : true;
    },
    pickerIcon(): string {
      if (typeof this.appliedOptions.pickerIcon === "string") {
        return this.appliedOptions.pickerIcon;
      }

      if (this.pickerType === "year") {
        return "mdi-alpha-y-box-outline";
      }

      if (this.pickerType === "month") {
        return "mdi-calendar-month";
      }

      return "mdi-calendar";
    },
    dateFormat(): string {
      return typeof this.appliedOptions.dateFormat == "string"
        ? this.appliedOptions.dateFormat
        : "YYYY-MM-DD";
    },
    dateSaveFormat(): string {
      return typeof this.appliedOptions.dateSaveFormat == "string"
        ? this.appliedOptions.dateSaveFormat
        : "YYYY-MM-DD";
    },
    formats(): string[] {
      return [
        this.dateSaveFormat,
        this.dateFormat,
        ...JSON_SCHEMA_DATE_FORMATS,
      ];
    },
    pickerType(): "date" | "month" | "year" {
      if (!this.dateFormat.includes("M") && !this.dateFormat.includes("D")) {
        return "year";
      }
      if (!this.dateFormat.includes("D")) {
        return "month";
      }
      return "date";
    },
    maxDate(): string | undefined {
      const schema = this.control.schema as JsonSchema & {
        options: Partial<{
          min?: MinMaxFormat;
          max?: MinMaxFormat;
          default?: MinMaxFormat;
        }>;
      };
      if (schema.options?.max) {
        return this.getDateFromOption(schema.options.max);
      }
    },
    minDate(): string | undefined {
      const schema = this.control.schema as JsonSchema & {
        options: Partial<{
          min?: MinMaxFormat;
          max?: MinMaxFormat;
          default?: MinMaxFormat;
        }>;
      };
      if (schema.options?.min) {
        return this.getDateFromOption(schema.options.min);
      }
    },
    inputValue(): string | undefined {
      const value = this.control.data;
      const date = parseDateTime(
        typeof value === "number" ? value.toString() : value,
        this.formats
      );
      return date ? date.format(this.dateFormat) : value;
    },
    pickerValue: {
      get(): string | undefined {
        const value = this.control.data;
        const date = parseDateTime(
          typeof value === "number" ? value.toString() : value,
          this.formats
        );
        // show only valid values
        return date ? date.format("YYYY-MM-DD") : undefined;
      },
      set(val: string): void {
        this.onPickerChange(val);
      },
    },
    clearLabel(): string {
      const label =
        typeof this.appliedOptions.clearLabel == "string"
          ? this.appliedOptions.clearLabel
          : "Clear";

      return this.t(label, label);
    },
    cancelLabel(): string {
      const label =
        typeof this.appliedOptions.cancelLabel == "string"
          ? this.appliedOptions.cancelLabel
          : "Cancel";

      return this.t(label, label);
    },
    okLabel(): string {
      const label =
        typeof this.appliedOptions.okLabel == "string"
          ? this.appliedOptions.okLabel
          : "OK";
      return this.t(label, label);
    },
  },
  methods: {
    getDateFromOption(option: MinMaxFormat) {
      if (option) {
        const now = dayjs();

        if (typeof option === "string" || option instanceof String) {
          if (option === "today") {
            return now.format("YYYY-MM-DD");
          }
        } else if (option.unit && option.amount) {
          if (option.unit === "day") {
            const targetDate = now.add(option.amount, "day");
            return targetDate.format("YYYY-MM-DD");
          } else if (option.unit === "month") {
            const targetDate = now.add(option.amount, "month");
            return targetDate.format("YYYY-MM-DD");
          } else if (option.unit === "year") {
            const targetDate = now.add(option.amount, "year");
            return targetDate.format("YYYY-MM-DD");
          }
        }
      }
    },
    onInputChange(value: string): void {
      const date = parseDateTime(value, this.dateFormat);
      let newdata: string | number = date
        ? date.format(this.dateSaveFormat)
        : value;
      // if only numbers and the target is number type then convert (this will support when we want year as an integer/number)
      if (
        (this.control.schema.type === "integer" ||
          this.control.schema.type === "number") &&
        /^[\d]*$/.test(newdata)
      ) {
        newdata = parseInt(value, 10) || newdata;
      }
      if (this.adaptValue(newdata) !== this.control.data) {
        // only invoke onChange when values are different since v-mask is also listening on input which lead to loop
        this.onChange(newdata);
      }
    },
    onPickerChange(value: string): void {
      const date = parseDateTime(value, "YYYY-MM-DD");
      let newdata: string | number = date
        ? date.format(this.dateSaveFormat)
        : value;
      // check if is is only year and the target type is number or integer
      if (
        (this.control.schema.type === "integer" ||
          this.control.schema.type === "number") &&
        /^[\d]*$/.test(newdata)
      ) {
        newdata = parseInt(value, 10) || newdata;
      }
      this.onChange(newdata);
    },
    clear(): void {
      this.mask = undefined;
      this.onChange(null);
    },
    okHandler(): void {
      (this.$refs.menu as any).save(this.pickerValue);
      this.showMenu = false;
    },
    onYear(year: number): void {
      if (this.pickerType === "year") {
        this.pickerValue = `${year}`;
      }
    },
    maskFunction(value: string): (string | RegExp)[] {
      const format = this.dateFormat;

      const parts = format.split(/([^YMD]*)(YYYY|YY|MMMM|MMM|MM|M|DD|D)/);

      let index = 0;

      let result: (string | RegExp)[] = [];
      for (const part of parts) {
        if (!part || part === "") {
          continue;
        }
        if (index > value.length) {
          break;
        }
        if (part == "YYYY") {
          result.push(/[0-9]/);
          result.push(/[0-9]/);
          result.push(/[0-9]/);
          result.push(/[0-9]/);
          index += 4;
        } else if (part == "YY") {
          result.push(/[0-9]/);
          result.push(/[0-9]/);
          index += 2;
        } else if (part == "M") {
          result.push(/[1]/);
          if (value.charAt(index) === "1") {
            if (
              value.charAt(index + 1) == "0" ||
              value.charAt(index + 1) == "1" ||
              value.charAt(index + 1) == "2"
            ) {
              result.push(/[0-2]/);
              index += 1;
            } else if (value.charAt(index + 1) === "") {
              result.push(/[0-2]?/);
            }
          }
          index += 1;
        } else if (part == "MM") {
          result.push(/[0-1]/);
          result.push(value.charAt(index) === "0" ? /[1-9]/ : /[0-2]/);
          index += 2;
        } else if (part == "MMM") {
          let increment = 0;
          for (let position = 0; position <= 2; position++) {
            let regex: string | undefined = undefined;
            for (let i = 0; i <= 11; i++) {
              const month = dayjs().month(i).format("MMM");
              if (
                value.charAt(index + position) === month.charAt(position) ||
                value.charAt(index + position) === ""
              ) {
                if (regex === undefined) {
                  regex = "(";
                } else {
                  regex += "|";
                }
                regex += month.charAt(position);
              }
            }
            if (regex) {
              regex += ")";
              result.push(new RegExp(regex));
              increment++;
            } else {
              break;
            }
          }
          index += increment;
        } else if (part == "MMMM") {
          let increment = 0;
          let maxLength = 0;
          let months: string[] = [];

          for (let i = 0; i <= 11; i++) {
            const month = dayjs().month(i).format("MMMM");
            months.push(month);
            if (month.length > maxLength) {
              maxLength = month.length;
            }
          }

          for (let position = 0; position < maxLength; position++) {
            let regex: string | undefined = undefined;
            for (let i = 0; i <= 11; i++) {
              const month = months[i];
              if (
                value.charAt(index + position) == month.charAt(position) ||
                value.charAt(index + position) === ""
              ) {
                if (regex === undefined) {
                  regex = "(";
                } else {
                  regex += "|";
                }
                regex += month.charAt(position);
              }
            }
            if (regex) {
              regex += ")";
              result.push(new RegExp(regex));
              increment++;
            } else {
              break;
            }
          }
          index += increment;
        } else if (part == "D") {
          result.push(/[1-3]/);
          if (
            value.charAt(index) === "1" ||
            value.charAt(index) === "2" ||
            value.charAt(index) === "3"
          ) {
            if (value.charAt(index) === "3") {
              if (
                value.charAt(index + 1) === "0" ||
                value.charAt(index + 1) === "1"
              ) {
                result.push(/[0-1]/);
                index += 1;
              } else if (value.charAt(index + 1) === "") {
                result.push(/[0-1]?/);
              }
            } else {
              if (
                value.charAt(index + 1) === "0" ||
                value.charAt(index + 1) === "1" ||
                value.charAt(index + 1) === "2" ||
                value.charAt(index + 1) === "3" ||
                value.charAt(index + 1) === "4" ||
                value.charAt(index + 1) === "5" ||
                value.charAt(index + 1) === "6" ||
                value.charAt(index + 1) === "7" ||
                value.charAt(index + 1) === "8" ||
                value.charAt(index + 1) === "9"
              ) {
                result.push(/[0-9]/);
                index += 1;
              } else if (value.charAt(index + 1) === "") {
                result.push(/[0-9]?/);
              }
            }
          }
          index += 1;
        } else if (part == "DD") {
          result.push(/[0-3]/);
          result.push(
            value.charAt(index) === "3"
              ? /[0-1]/
              : value.charAt(index) === "0"
              ? /[1-9]/
              : /[0-9]/
          );
          index += 2;
        } else {
          result.push(part);
          index += part.length;
        }
      }

      return result;
    },
  },
});

export default controlRenderer;

export const dateControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, isDateControl),
};
</script>

<style lang="scss" scoped>
.v-picker::v-deep {
  border-radius: 0px;

  .v-picker__title {
    min-height: 102px;
  }

  .v-card__actions {
    border-top: 1px solid #ddd;
  }
}
</style>
