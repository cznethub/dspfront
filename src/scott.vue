<template>
  <div v-if="isLoggedIn">
    <p>{{ message }}</p>
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
      <!-- <SimpleFileUpload :loadFiles="loadFiles" @finishedListFiles="finishedListFiles" /> -->
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
  import { Component, Vue, Watch } from 'vue-property-decorator'
  import { JsonForms, JsonFormsChangeEvent } from "@jsonforms/vue2"
  import { vanillaRenderers } from "@jsonforms/vue2-vanilla"
  import User from '@/models/user.model'
  // import SimpleFileUpload from "./SimpleFileUpload.vue"
  import axios from "axios"

  const sprintf = require('sprintf-js').sprintf;
  // mergeStyles combines all classes from both styles definitions into one

  const renderers = [
    ...vanillaRenderers,
    // here you can add custom renderers
  ];

  @Component({
    name: 'cz-scott',
    components: {
      // SimpleFileUpload,
      JsonForms,
     },
  })
  export default class CzScott extends Vue {
    // freeze renderers for performance gains
    protected loggedIn = false
    protected repository = "zenodo"
    private renderers = Object.freeze(renderers)
    private data = {}
    private repositories= ['zenodo', 'hydroshare']
    private schema = ""
    private recordId = ""
    private edit= false
    private message = ""
    private uischema = null
    private createUrl = ""
    private updateUrl = ""
    private readUrl = ""
    private fileCreateUrl = ""
    private fileDeleteUrl = ""
    private fileReadUrl = ""
    private schemaUrl = ""
    private accessTokenUrl = ""
    private authorizeUrl = ""
    private recordKey = ""
    private filesKey = ""
    private metadataKey = ""

    loadFiles= false

    protected get isLoggedIn() {
      return User.isLoggedIn
    }

    mounted() {
      if (localStorage.repository) {
        this.repository = localStorage.repository
      }
    }

    @Watch('repository')
    onRepositoryChange(newRepo: string) {
      localStorage.repository = this.repository
      this.getUrls()
    }
    
    finishedListFiles(){
      this.loadFiles = false
    }
    repositorySelected(event: any) {
      this.getUrls()
    }
    onChange(event: JsonFormsChangeEvent) {
      this.data = event.data;
    }
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
    }
    async getSchema(){
      const resp = await axios.get(this.schemaUrl);
      this.schema = resp.data;
    }

    async getAccessToken(){
      return await axios.get(this.accessTokenUrl).then((resp) => {
        return resp.data.token;
      })
        .catch((error) => {
          this.message = error.message;
          throw error;
        }
      );
    }

    async create(){
      const token = await this.getAccessToken()
      await axios.post(
        this.createUrl, 
        { },
        { 
          headers: {"Content-Type": "application/json"},
          params: {"access_token": token} 
        })
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
    }

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
    }
    async read(){
      const token = await this.getAccessToken()
      const url = sprintf(this.readUrl, this.recordId)
      await axios.get(url,
          {params: {"access_token": token}})
      .then((resp) => {
        this.data = this.metadataKey ? resp.data["metadata"] : resp.data;
        console.log(this.data, resp.data)
        this.edit = true;
        this.loadFiles = true
      })
      .catch((error) => {
        this.data = {}
        this.edit = false;
        this.message = error.message;
      });
    }
    created() {
      this.getUrls()
    }
  }
</script>

<style lang="scss" scoped>
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
