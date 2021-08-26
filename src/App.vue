<template>
  <div v-if="loggedIn">
    <p>{{ message }}</p>
    <a href="/api/logout" class="button">Logout</a>
    <br>
    <select v-model="repository" @change="repositorySelected($event)">
      <option v-for="repo in repositories" v-bind:key="repo" v-bind:value="repo">{{ repo }}</option>
    </select>
    <br>
    <a :href="authorizeUrl" class="button">Authorize {{ repository }}</a>
    <br>
    <button @click="create()">Create</button>
    <br>
    <input v-model="recordId">
    <button @click="read()">Show</button>
    <div v-if="edit">
      <button @click="save()">Save</button>
      <h1>{{ repository }}</h1>
      <SimpleFileUpload :loadFiles="loadFiles" @finishedListFiles="finishedListFiles"></SimpleFileUpload>
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
  mounted() {
    if (localStorage.repository) {
      this.repository = localStorage.repository
    }
  },
  watch: {
    repository(newRepo) {
      localStorage.repository = this.repository
      this.getUrls()
    }
  },
  data() {
    return {
      // freeze renderers for performance gains
      renderers: Object.freeze(renderers),
      data: {},
      repositories: ['zenodo', 'hydroshare'],
      repository: "zenodo",
      schema: "",
      recordId: "",
      edit: false,
      message: "",
      loggedIn: false,
      uischema: null,

      createUrl: "",
      updateUrl: "",
      readUrl: "",
      fileCreateUrl: "",
      fileDeleteUrl: "",
      fileReadUrl: "",
      schemaUrl: "",
      accessTokenUrl: "",
      authorizeUrl: "",
      recordKey: "",
      filesKey: "",
      metadataKey: "",

      loadFiles: false
    };
  },
  methods: {
    finishedListFiles(){
      this.loadFiles = false
    },
    repositorySelected(event: any) {
      this.getUrls()
    },
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
    async getUrls() {
      const resp = await axios.get("/api/urls/" + this.repository);

      this.schemaUrl = resp.data.schema;
      this.createUrl = resp.data.create;
      this.updateUrl = resp.data.update;
      this.readUrl = resp.data.read;
      this.fileCreateUrl = resp.data.file_create;
      this.fileDeleteUrl = resp.data.file_delete;
      this.fileReadUrl = resp.data.file_read;
      this.accessTokenUrl = resp.data.access_token;
      this.authorizeUrl = resp.data.authorize_url;
      this.recordKey = resp.data.record_key;
      this.filesKey = resp.data.files_key;
      this.metadataKey = resp.data.metadata_key;
      await this.getSchema();
    },
    async getSchema(){
      const resp = await axios.get(this.schemaUrl);
      this.schema = resp.data;
    },
    async getAccessToken(){
      return await axios.get(this.accessTokenUrl).then((resp) => {
        return resp.data.token;
      })
        .catch((error) => {
          this.message = error.message;
          throw error;
        }
      );
    },
    async create(){
      const token = await this.getAccessToken()
      await axios.post(this.createUrl, {},
          {headers: {"Content-Type": "application/json"}, params: {"access_token": token}})
          .then((resp) => {
            this.recordId = resp.data[this.recordKey];
            this.edit = true;
            this.read()
          })
          .catch((error) => {
            this.data = {}
            this.edit = false;
            this.message = error.message;
          });
    },
    async save(){
      const token = await this.getAccessToken()
      const url = sprintf(this.updateUrl, this.recordId)
      let data: {[index: string]: any} = {}
      if(this.metadataKey){
        data[this.metadataKey] = this.data;
      } else{
        data = this.data;
      }
      await axios.put(url,
          data,
          {headers: {"Content-Type": "application/json"}, params: {"access_token": token}})
          .then(async (resp) => {
            await this.read();
          }).catch((error) => {
            this.message = error.message;
          });
    },
    async read(){
      const token = await this.getAccessToken()
      const url = sprintf(this.readUrl, this.recordId)
      await axios.get(url,
          {params: {"access_token": token}})
      .then((resp) => {
        this.data = this.metadataKey ? resp.data["metadata"] : resp.data;
        this.edit = true;
        this.loadFiles = true
      })
      .catch((error) => {
        this.data = {}
        this.edit = false;
        this.message = error.message;
      });
    }
  },
  created: function() {
    this.checkAuthorization()
    this.getUrls()
  },
  provide() {
    return {
      styles: myStyles,
    }
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
