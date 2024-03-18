import { CzNet } from '@cznethub/cznet-vue-core'
import type { UserModule } from '~/types'

export const install: UserModule = ({ app }) => {
  app.use(CzNet)
}
