<template>
  <div v-if="loggedIn">
    <p>{{message}}</p>
    <a href="/api/logout" class="button">Logout</a>
    <br>
    <a href="/api/authorize/zenodo" class="button">Authorize Zenodo</a>
    <br>
    <button @click="create()">Create</button>
    <br>
    <input v-model="recordId">
    <button @click="read()">Show</button>
    <div v-if="edit">
      <button @click="save()">Save</button>
      <h1>{{ repository }}</h1>
      <SimpleFileUpload></SimpleFileUpload>
      <div class="myform">
        <json-forms
          :data="data"
          :renderers="renderers"
          :schema="schema"
          :uischema="uischema"
          @change="onChange"
        />
      </div>
    </div>
  </div>
  <div v-else>
    <a href="/api/login" class="button">Login</a>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";
import { JsonForms, JsonFormsChangeEvent } from "@jsonforms/vue";
import {
  defaultStyles,
  mergeStyles,
  vanillaRenderers,
} from "@jsonforms/vue-vanilla";
import SimpleFileUpload from "@/SimpleFileUpload.vue";

const sprintf = require('sprintf-js').sprintf;
// mergeStyles combines all classes from both styles definitions into one
const myStyles = mergeStyles(defaultStyles, { control: { label: "mylabel" } });

const renderers = [
  ...vanillaRenderers,
  // here you can add custom renderers
];

export default defineComponent({
  name: "DSP",
  components: {
    SimpleFileUpload,
    JsonForms,
  },
  data() {
    return {
      // freeze renderers for performance gains
      renderers: Object.freeze(renderers),
      data: {},
      repository: "Zenodo",
      schema: this.getSchema(),
      recordId: "",
      edit: false,
      message: "",
      loggedIn: false,
      uischema: null,
    };
  },
  methods: {
    onChange(event: JsonFormsChangeEvent) {
      this.data = event.data;
    },
    async checkAuthorization() {
      const status = await axios.get("/api")
          .then((resp) => {
            return true;
          })
          .catch((error) => {
            return false;
          });
      this.loggedIn = status;
    },
    async getSchema(){
      const resp = await axios.get("/api/schema/zenodo.json");
      this.schema = resp.data;
    },
    async getAccessToken(){
      return await axios.get("/api/access_token/zenodo/").then((resp) => {
        return resp.data.token;
      })
        .catch((error) => {
          this.message = error.message;
          throw error;
        }
      );
    },
    async create(){
      const token = await this.getAccessToken();
      const createUrl = "https://sandbox.zenodo.org/api/deposit/depositions"
      await axios.post(createUrl, {},
          {headers: {"Content-Type": "application/json"}, params: {"access_token": token}})
          .then((resp) => {
            this.recordId = resp.data.record_id;
            this.edit = true;
          })
          .catch((error) => {
            this.data = {}
            this.edit = false;
            this.message = error.message;
          });
    },
    async save(){
      const token = await this.getAccessToken();
      const recordUrl = "https://sandbox.zenodo.org/api/deposit/depositions/%s"
      const url = sprintf(recordUrl, this.recordId)
      await axios.put(url,
          {metadata: this.data},
          {headers: {"Content-Type": "application/json"}, params: {"access_token": token}})
          .then(async (resp) => {
            await this.read();
          }).catch((error) => {
            this.message = error.message;
          });
    },
    async read(){
      const token = await this.getAccessToken();
      const recordUrl = "https://sandbox.zenodo.org/api/deposit/depositions/%s"
      const url = sprintf(recordUrl, this.recordId)
      await axios.get(url,
          {params: {"access_token": token}})
      .then((resp) => {
        this.data = resp.data.metadata;
        this.edit = true;
      })
      .catch((error) => {
        this.data = {}
        this.edit = false;
        this.message = error.message;
      });
    }
  },
  created: function() {
    this.checkAuthorization();
  },
  provide() {
    return {
      styles: myStyles,
    };
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  margin-left: 120px;
  margin-right: 120px;
}

.mylabel {
  color: darkslategrey;
}

.vertical-layout {
  margin-left: 10px;
  margin-right: 10px;
}

.myform {
  width: 640px;
  margin: 0 auto;
}

.text-area {
  min-height: 80px;
}
</style>
