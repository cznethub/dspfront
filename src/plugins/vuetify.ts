import Vue from "vue";
import Vuetify from "vuetify/lib/framework";
import colors from "vuetify/lib/util/colors";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#1976d2",
        navbar: colors.blueGrey.lighten4,
        secondary: colors.blueGrey.lighten4,
        // accent: colors.blue,
        // error: colors.red.accent3,
        // success: colors.teal.accent4,
        // info: colors.blueGrey,
      },
      dark: {
        // primary: "#1976d2",
        // navbar: colors.blueGrey.lighten4,
        // secondary: colors.blueGrey,
        // accent: colors.blue,
        // error: colors.red.accent3,
        // success: colors.teal.accent4,
        // info: colors.blueGrey,
      },
    },
  },
});
