import { createPinia } from 'pinia'
import { piniaUserPersistPlugin } from '~/stores/user.store'
import { piniaRepositoryPersistPlugin } from '~/stores/repository.store'
import { piniaSubmissionPersistPlugin } from '~/stores/submission.store'
import type { UserModule } from '~/types'

export const install: UserModule = ({ app }) => {
  const pinia = createPinia()
  pinia.use(piniaUserPersistPlugin)
  pinia.use(piniaRepositoryPersistPlugin)
  pinia.use(piniaSubmissionPersistPlugin)
  app.use(pinia)
}
