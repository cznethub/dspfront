import type { UserModule } from '~/types'
// TODO: cznet-vue-core needs buefy's upload component, but fails to bundle it.
// We add it here as a workaround
import { Upload } from 'buefy'

export const install: UserModule = ({ app }) => {
  app.use(Upload)
}
