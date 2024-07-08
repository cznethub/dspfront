// TODO: cznet-vue-core needs buefy's upload component, but fails to bundle it.
// We add it here as a workaround
// @ts-expect-error buefy actually exports modules like this
import { Upload } from 'buefy'
import type { UserModule } from '~/types'

export const install: UserModule = ({ app }) => {
  app.use(Upload)
}
