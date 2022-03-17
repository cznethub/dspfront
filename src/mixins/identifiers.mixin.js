import { Component } from 'vue-property-decorator'
import Vue from 'vue'

// this counter is scoped at the component level
let idCounter = 0;

@Component
export class IdentifiersMixin extends Vue {
    // Assign a unique id to each component
    beforeCreate() {
      this.idCounter = idCounter.toString();
      idCounter += 1;
    }
  
    // Generate a component-scoped id
    $id(id_text) {
      return id_text + "-" + this.idCounter;
    };
}
