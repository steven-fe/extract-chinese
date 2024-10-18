<template>
  <SingleForm ref="form" :type="type" :form-data="formData" :form-items="formItems" @input="changeFormData" />
</template>

<script>
import { $t } from '@/lang/index'
import _ from 'lodash'
import SingleForm from '@/components/list-single/form'
import { MessageBox } from 'element-ui'
import { linkTypes, clientTypes, getLanguages } from '../../../../../../data'

const DEFAULT_LANGUAGE_ID = 'en_US'

const createContent = (language) => ({ language, img: null, url: null })

export default {
  name: 'NotAccountedForForm',
  components: {
    SingleForm
  },
  props: {
    type: {
      type: String, // 'create', 'edit', 'view'
      required: true
    },
    // eslint-disable-next-line vue/require-default-prop
    id: {
      type: [String, Number]
    },
    // eslint-disable-next-line vue/require-default-prop
    responseFormData: {
      type: Object
    }
  },
  data() {
    const createFormData = () => ({
      id: null,
      title: null,
      type: null,
      clientType: null,
      languages: [DEFAULT_LANGUAGE_ID],
      contentByLanguage: { [DEFAULT_LANGUAGE_ID]: createContent(DEFAULT_LANGUAGE_ID) }
    })

    return {
      createFormData: Object.freeze(createFormData),
      formData: createFormData(),

      languages: { list: [] }
    }
  },
  computed: {
    formItems() {
      return [
        {
          prop: 'languages',
          label: $t(`['common']['language']`),
          component: 'checkboxGroup',
          attrs: {
            options: (() => {
              const options = _.cloneDeep(this.languages.list)
              const item = options.find(({ value }) => value === DEFAULT_LANGUAGE_ID)
              if (item) item.disabled = true
              return options
            })()
          }
        },
        {
          prop: 'title',
          label: $t(`['common']['title']`),
          rules: [{ required: true, message: $t(`['common']['title1']`) }],
          component: 'input',
          attrs: { trim: true }
        },
        {
          prop: 'type',
          label: $t(`['common']['jumpType']`),
          rules: [{ required: true, message: '请选择跳转类型' }],
          component: 'radioGroup',
          attrs: { options: linkTypes.list }
        },
        ...(() => {
          const { type, contentByLanguage } = this.formData

          // hide
          if (!type || type === 'noJump') {
            for (const languageType in contentByLanguage) {
              contentByLanguage[languageType].url = null
            }
            return []
          }

          // show
          return this.languages.list
            .filter(language => [language.type] in contentByLanguage)
            .map(language => {
              return {
                prop: `contentByLanguage.${language.type}.url`,
                label: `${language.label}-跳转地址`,
                rules: language.type === DEFAULT_LANGUAGE_ID ? [{ required: true, message: '请输入跳转地址' }] : [],
                component: 'input',
                attrs: { trim: true }
              }
            })
        })(),
        ...(() => {
          const { contentByLanguage } = this.formData

          // hide

          // show
          return this.languages.list
            .filter(language => [language.type] in contentByLanguage)
            .map(language => {
              return {
                prop: `contentByLanguage.${language.type}.img`,
                label: `${language.label}-图片`,
                rules: language.type === DEFAULT_LANGUAGE_ID ? [{ required: true, message: '请上传图片' }] : [],
                component: 'imageUpload',
                attrs: { props: { accept: '.png,.jpg,.jpeg', volume: [0, 500 * 1024], tips: '提示：尺寸：1080×1920px，大小：500K 以内，格式 jpg\\jpeg\\png' } }
              }
            })
        })(),
        {
          prop: 'clientType',
          label: $t(`['common']['clientType']`),
          rules: [{ required: true, message: '请选择客户端类型' }],
          component: 'radioGroup',
          attrs: { options: clientTypes.list }
        }
      ]
    }
  },
  async created() {
    await this.setOptions()
    this.initFormData()
    this.syncDataForLanguagesChanged()
  },
  methods: {
    async setOptions() {
      this.languages = await getLanguages()
    },
    initFormData() {
      if (this.type === 'create') return

      const { batchId, title, type, clientType, languageList } = this.responseFormData

      this.formData.id = batchId
      this.formData.title = title
      this.formData.type = linkTypes.mapByValue.get(type).type
      this.formData.clientType = clientTypes.mapByValue.get(clientType).type
      this.formData.languages = languageList.map(content => content.language)

      languageList.forEach(content => {
        this.$set(this.formData.contentByLanguage, content.language, content)
      })
    },
    changeFormData(options) {
      debugger
      for (const key in options) {
        if (_.has(this.formData, key)) {
          _.set(this.formData, key, options[key])
        }
      }
    },
    syncDataForLanguagesChanged() {
      const handler = () => {
        _.forOwn(this.formData.contentByLanguage, (_, languageKey) => {
          if (!this.formData.languages.includes(languageKey)) {
            this.$delete(this.formData.contentByLanguage, languageKey)
          }
        })

        this.formData.languages.forEach(languageKey => {
          if (!(languageKey in this.formData.contentByLanguage)) {
            this.$set(this.formData.contentByLanguage, languageKey, createContent(languageKey))
          }
        })
      }

      this.$watch('formData.contentByLanguage', handler, { immediate: true })
      this.$watch('formData.languages', handler, { immediate: true })
    },
    async validate() {
      await this.$refs.form.validate()
    },
    async getRequestFormData() {
      const { id: batchId, title, type, clientType, contentByLanguage } = this.formData

      const formCommonData = {
        title,
        type: linkTypes.mapByType.get(type).value,
        clientType: clientTypes.mapByType.get(clientType).value,
        languageList: _.cloneDeep(_.toArray(contentByLanguage))
      }

      // eslint-disable-next-line no-lone-blocks
      {
        /** auto fill data */
        if (formCommonData.languageList.some(({ img, url }) => !img || !url)) {
          await MessageBox.confirm(
            '将英文语种配置应用到其他语种上（保留其他语种已填写的配置）',
            {
              type: 'warning',
              confirmButtonText: this.$t('common.sure'),
              cancelButtonText: $t(`['common']['cancel']`)
            }
          )
          formCommonData.languageList.forEach(
            content => _.mergeWith(
              content,
              _.omit(contentByLanguage[DEFAULT_LANGUAGE_ID], 'language'), (valueFromContent, valueFromDefault) => valueFromContent || valueFromDefault
            )
          )
        }
      }

      return this.type === 'create' ? formCommonData : { batchId, ...formCommonData }
    }
  }
}
</script>
