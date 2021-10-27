import { Model } from '@vuex-orm/core'
import { IRepository, IRepositoryUrls } from '@/components/submissions/types'
import Zenodo from './zenodo.model'

export default class Repository extends Model implements IRepository {
  static entity = 'repository'
  static primaryKey = 'key'
  public readonly key!: string
  public readonly name!: string
  public readonly logoSrc!: string
  public readonly description!: string
  public readonly submitLabel?: string
  public readonly urls?: IRepositoryUrls
  public readonly schema?: any
  public readonly uischema?: any
  public readonly schemaDefaults?: any

  static get $state() {
    return this.store().state.entities[this.entity]
  }

  static fields () {
    return {
      key:  this.attr(''),
      name:  this.attr(''),
      logoSrc:  this.attr(''),
      description:  this.attr(''),
      submitLabel:  this.attr(''),
      urls: this.attr({}),
      schema: this.attr({}),
      uischema: this.attr({}),
      schemaDefaults: this.attr({}),
    }
  }

  static state() {
    return {
      
    }
  }

  static types() {
    return {
      [Zenodo.entity]: Zenodo,
    }
  }

  static get(): Repository | null {
    return this.query().withAll().first()
  }
  
  static init: () => Promise<void>
  protected static getJson: (jsonUrl: string | undefined) => Promise<any>
  protected static getUrls: () => Promise<undefined | IRepositoryUrls>
}