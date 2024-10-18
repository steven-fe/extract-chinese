import { appendToBody } from '@/utils/component'
import editUserCategoryVue from './main'

const instance = appendToBody(editUserCategoryVue)

export {
  editUserCategoryVue,
  instance
}
