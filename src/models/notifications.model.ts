import { DEFAULT_TOAST_DURATION } from '@/constants'
import { Model } from '@vuex-orm/core'
import { Subject } from 'rxjs'

export interface IToast {
  message: string
  duration?: number
  position?: 'center' | 'left'
  isInfinite?: boolean
  // isPersistent?: boolean // Currently has no effect
}

export default class CzNotification extends Model {
  static entity = 'cz-notification'
  static toast$ = new Subject<IToast>()

  static toast(params: IToast) {
    this.toast$.next({
      ...params,
      duration: params.duration !== undefined ? params.duration : DEFAULT_TOAST_DURATION,
      position: params.position || 'center',
      isInfinite: !!params.isInfinite,
      // isPersistent: params.isPersistent !== undefined ? params.isPersistent : true,
    })
  }
}