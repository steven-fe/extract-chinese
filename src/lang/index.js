import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Element from 'element-ui'
import Cookies from 'js-cookie'
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'

Vue.use(VueI18n)

// 自动加载多语言字典文件
const langsFiles = require.context('./languages', false, /.js$/)

const langItems = []
const langs = langsFiles.keys().reduce((langs, path) => {
  const lang = langsFiles(path)
  const code = lang.code
  langs[code] = lang.dicts
  langItems.push({ value: code, label: lang.name, sort: lang.sort })
  return langs
}, {})

// Vue.locale = () => {}
export const languages = langItems.sort((a, b) => a.sort - b.sort)

const messages = {
  zh_CN: Object.assign(zhLocale, langs.zh_CN),
  en_US: Object.assign(enLocale, langs.en_US)
}
const localeLang = () => {
  let navigatorLang = window.navigator.language
  if (navigatorLang && navigatorLang.split('-').length === 2) {
    const arr = navigatorLang.split('-')
    navigatorLang = `${arr[0]}_${arr[1]}`
  }
  const lang = Cookies.get('lan') || navigatorLang
  return languages.find(item => item.value === lang) ? lang : 'en_US'
}

const i18n = new VueI18n({
  // 定义默认语言为英文
  locale: localeLang(),
  // locale: 'en_US',
  messages
  // silentTranslationWarn: true // 去除警告
})
Vue.use(Element, {
  i18n: (key, value) => i18n.t(key, value)

})
export const $t = (...args) => i18n.t(...args)
export default i18n
