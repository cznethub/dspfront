import 'vuetify/styles'
import type { ThemeDefinition } from 'vuetify'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import type { UserModule } from '~/types'

const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: '#1976d2',
    surface: 'FFF',
    navbar: '#cfd8dc',
    // secondary: colors.blueGrey,
    // accent: colors.blue,
    // error: colors.red.accent3,
    // success: colors.teal.accent4,
    // info: colors.blueGrey,
    // navbar: colors.blueGrey.lighten4,
  },
}

const darkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    // primary: colors.blueGrey,
    // secondary: colors.teal.darken1,
    // accent: colors.amber,
    // error: colors.red.accent3,
    // success: colors.teal.accent4,
    // info: colors.blueGrey,
  },
}

export const install: UserModule = ({ app }) => {
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'lightTheme',
      themes: {
        lightTheme,
        darkTheme,
      },
    },
  })
  app.use(vuetify)
}
