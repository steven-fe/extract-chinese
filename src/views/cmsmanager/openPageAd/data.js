import { $t } from '@/lang/index'
import { listConfig as listConfigApi } from '@/api/system/languageconfig'
import { createDataCombination } from '@/utils/data'

export const states = createDataCombination([
  { value: '1', type: 'online', label: $t(`['common']['goOnline']`) },
  { value: '0', type: 'offline', label: $t(`['common']['offline']`) }
])

export const clientTypes = createDataCombination([
  { value: 0, type: 'all', label: $t(`['common']['all']`) },
  { value: 2, type: 'IOS', label: 'IOS' },
  { value: 1, type: 'Android', label: 'Android' }
])

export const linkTypes = createDataCombination([
  { value: 1, type: 'app', label: 'APP' },
  { value: 2, type: 'web', label: '网站' },
  { value: 0, type: 'noJump', label: $t(`['common']['nojump']`) }
])

export const getLanguages = async() => {
  const { rows: languages } = await listConfigApi()
  return createDataCombination(languages.map(({ key: value, key: type, language: label }) => ({ value, type, label })))
}
