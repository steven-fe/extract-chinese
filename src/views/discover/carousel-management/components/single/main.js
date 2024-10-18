import { add, edit, getDetail } from '@/api/discover/carousel'
import { Message, MessageBox } from 'element-ui'
import { uploadImage } from '@/views/operatemanager/vote-for-listing/utils'
import $data, { devicesMap, clientsMap, clientIdsList, clientValuesList, linkTypesMap } from '../../data'
import styles from './index.module.scss'

const DEFAULT_LANGUAGE = 'en_US'

const getRules = (() => {
  const rulesOfCheckPictureConfig = (deviceId, language, _1, _2, callback) => {
    const { pictureConfig } = _vm.form
    const { address } = pictureConfig[deviceId].find(({ code }) => (code === language))
    if (!address) return callback(new Error('请上传图片'))
    callback()
  }

  let _vm = null

  const rules = {
    title: [{ required: true, message: '请输入标题', trigger: 'change' }],
    linkAdd: [{ required: true, message: '请填写跳转地址', trigger: 'change' }],
    [`pictureConfig-mobile-${DEFAULT_LANGUAGE}`]: [{ required: true, validator: rulesOfCheckPictureConfig.bind(null, 'mobile', DEFAULT_LANGUAGE), trigger: 'change' }],
    [`pictureConfig-web-${DEFAULT_LANGUAGE}`]: [{ required: true, validator: rulesOfCheckPictureConfig.bind(null, 'web', DEFAULT_LANGUAGE), trigger: 'change' }]
  }

  return (vm) => {
    _vm = _vm || vm
    return rules
  }
})()

const toNumberOrNull = value => (typeof value === 'number') ? value : null

let updateList = () => {}

export default {
  name: 'Single',
  data() {
    const selectedLanguageFactory = () => [DEFAULT_LANGUAGE]

    const pictureConfigFactory = () => ({ code: DEFAULT_LANGUAGE, address: '' })

    const formFactory = () => ({
      id: null,

      title: '',
      clientType: clientIdsList.join(','),
      linkType: 1,
      linkAdd: '',
      weight: 0,
      pictureConfig: { mobile: [pictureConfigFactory()], web: [pictureConfigFactory()] }
    })

    return {
      show: false,
      type: 'create', // 'create', 'edit'

      selectedLanguageFactory,
      selectedLanguage: selectedLanguageFactory(), // [ 'en_US', ... ]

      pictureConfigFactory,

      formFactory,
      form: formFactory(),

      submitBtnLoading: false
    }
  },
  computed: {
    selectedDevices() {
      const clientIds = this.form.clientType.split(',')
      const map = new Map(clientIds.reduce((list, clientId) => {
        const device = clientsMap.get(clientId).device
        list.push([device.id, device])
        return list
      }, []))
      return { map, idsList: [...map.keys()], valuesList: [...map.values()] }
    },
    optionalLinkTypes() {
      const clientIds = this.form.clientType.split(',')
      const map = new Map(clientIds.reduce((list, clientId) => list.concat([...clientsMap.get(clientId).linkTypesMap]), []))
      return { map, idsList: [...map.keys()], valuesList: [...map.values()] }
    }
  },
  methods: {
    initLinkAdd() {
      this.$watch('form.linkType', (linkType) => {
        if (linkType === 0) this.form.linkAdd = ''
      })
    },
    initPictureConfig() {
      this.$watch('selectedLanguage', (selectedLanguage) => {
        const deviceTypes = Object.keys(this.form.pictureConfig)

        deviceTypes.forEach(deviceType => {
          this.form.pictureConfig[deviceType] = this.form.pictureConfig[deviceType].filter(({ code }) => selectedLanguage.includes(code))
        })

        selectedLanguage.forEach(id => {
          if (!this.form.pictureConfig[deviceTypes[0]].find(({ code }) => code === id)) {
            deviceTypes.forEach(deviceType => {
              this.form.pictureConfig[deviceType].push({ ...this.pictureConfigFactory(), code: id })
            })
          }
        })
      })

      this.$watch('selectedDevices', () => {
        for (const deviceId in this.form.pictureConfig) {
          if (!this.selectedDevices.idsList.includes(deviceId)) {
            const copy = { ...this.form.pictureConfig }
            delete copy[deviceId]
            this.form.pictureConfig = copy
          }
        }

        this.selectedDevices.idsList.forEach(deviceId => {
          if (!(deviceId in this.form.pictureConfig)) {
            this.form.pictureConfig = {
              ...this.form.pictureConfig,
              [deviceId]: this.selectedLanguage.map(language => ({ ...this.pictureConfigFactory(), code: language }))
            }
          }
        })
      })
    },
    async setForm(id) {
      const { data } = await getDetail({ id })

      /** for pictureConfig */
      data.pictureConfig = Object.keys(data.pictureConfig).reduce((pictureConfig, deviceId) => {
        if (data.pictureConfig[deviceId]) pictureConfig[deviceId] = data.pictureConfig[deviceId]
        return pictureConfig
      }, {})

      for (const key in data) {
        if (key in this.form) this.form[key] = data[key]
      }

      /** set selectedLanguage in edit mode */
      (() => {
        const unwatchLanguageMap = $data.$watch('languages', (languages) => {
          if (languages.map.size) {
            this.selectedLanguage = this.form.pictureConfig[Object.keys(this.form.pictureConfig)[0]]
              .map(({ code }) => code)
              .sort((code1, code2) => (languages.idsList.indexOf(code1) - languages.idsList.indexOf(code2)))

            setTimeout(() => unwatchLanguageMap && unwatchLanguageMap(), 0)
          }
        }, { immediate: true })

        const unwatchShow = this.$watch('show', (show) => {
          if (!show) {
            if (unwatchLanguageMap) unwatchLanguageMap()
            if (unwatchShow) unwatchShow()
          }
        })
      })()
    },
    async open(info, callback = () => {}) {
      const { id, type } = info || { type: 'create' }

      this.type = type

      updateList = callback

      if (this.type === 'edit') await this.setForm(id)

      this.show = true
    },
    close() {
      this.show = false
    },
    closed() {
      this.selectedLanguage = this.selectedLanguageFactory()
      this.form = this.formFactory()
      this.$nextTick(() => this.$refs.form.clearValidate())
    },
    async autofillContentOfOtherLanguages() {
      const completed = this.selectedDevices.idsList.every(deviceId => {
        return this.form.pictureConfig[deviceId].every(({ address }) => !!address)
      })

      if (!completed) {
        await MessageBox.confirm('将英文语种配置应用到其他语种上（保留其他语种已填写的配置）', { type: 'warning' })

        this.selectedDevices.idsList.forEach(deviceId => {
          const { address } = this.form.pictureConfig[deviceId].find(({ code }) => code === DEFAULT_LANGUAGE) || { address: '' }
          this.form.pictureConfig[deviceId].forEach(pictureConfig => (pictureConfig.address = pictureConfig.address || address))
        })
      }
    },
    async submit() {
      try {
        this.submitBtnLoading = true

        await this.$refs.form.validate()

        await this.autofillContentOfOtherLanguages()

        await (this.type === 'edit' ? edit : add)(this.form)
        updateList()
        this.close()
        Message.success('操作成功！')
      } catch (e) {
        console.log(e)
      } finally {
        this.submitBtnLoading = false
      }
    }
  },
  created() {
    this.initLinkAdd()
    this.initPictureConfig()
  },
  render() {
    return <el-dialog
      title={this.type === 'create' ? '新增' : '修改'}
      width="800px"
      close-on-click-modal={false}
      close-on-press-escape={false}
      show-close={false}
      visible={this.show}
      onClosed={this.closed}
      on={{ 'update:visible': (visible) => !visible && this.close() }}
    >
      <el-form ref="form" props={ { model: this.form } } rules={getRules(this)} label-width="160px">

        <el-form-item label="标题：" prop="title">
          <el-input value={this.form.title} onInput={ title => (this.form.title = title || null) } />
        </el-form-item>

        <el-form-item label="客户端类型：">
          <el-checkbox-group
            value={this.form.clientType.split(',')}
            onInput={clientType => {
              this.form.clientType = [...clientType].sort((id1, id2) => (clientIdsList.indexOf(id1) - clientIdsList.indexOf(id2))).join(',')
            }}
          >{
              clientValuesList.map(({ id, name }) => <el-checkbox label={id} key={id} disabled={this.form.clientType === id}>{name}</el-checkbox>)
            }</el-checkbox-group>
        </el-form-item>

        <el-form-item label="语言：">
          <el-checkbox-group
            value={this.selectedLanguage}
            onInput={languageList => {
              this.selectedLanguage = [...languageList].sort((id1, id2) => ($data.languages.idsList.indexOf(id1) - $data.languages.idsList.indexOf(id2)))
            }}
          >
            { $data.languages.valuesList.map(({ id, name }) => <el-checkbox label={id} key={id} disabled={id === DEFAULT_LANGUAGE}>{name}</el-checkbox>) }
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="跳转类型：">
          {
            (() => {
              if (!this.optionalLinkTypes.idsList.includes(this.form.linkType)) this.form.linkType = this.optionalLinkTypes.idsList[0]

              return this.optionalLinkTypes.valuesList.map(({ id, name }) => <el-radio
                key={id}
                label={id}
                value={this.form.linkType}
                onInput={linkType => (this.form.linkType = linkType)}
              >{name}</el-radio>)
            })()
          }
        </el-form-item>

        {
          (linkTypesMap.get(this.form.linkType).type !== 'noInput') && <el-form-item label="跳转地址：" prop="linkAdd">
            <el-input value={this.form.linkAdd} onInput={ linkAdd => (this.form.linkAdd = linkAdd || null) } />
          </el-form-item>
        }

        <el-form-item label="排序权重：">
          <el-input-number min={0} step-strictly value={this.form.weight} onInput={ weight => (this.form.weight = toNumberOrNull(weight)) } />
        </el-form-item>

        <p class={styles.dividingLine}><span>上传图片</span></p>

        {
          [...this.form.pictureConfig[Object.keys(this.form.pictureConfig)[0]]]
            .sort(({ code: languageId1 }, { code: languageId2 }) => ($data.languages.idsList.indexOf(languageId1) - $data.languages.idsList.indexOf(languageId2)))
            .reduce((imageInputList, { code: languageId }) => {
              // language
              const language = $data.languages.map.get(languageId)
              const languageName = language ? language.name : ''

              return imageInputList.concat(Object.keys(this.form.pictureConfig)
                .sort((deviceId1, deviceId2) => this.selectedDevices.idsList.indexOf(deviceId1) - this.selectedDevices.idsList.indexOf(deviceId2))
                .map((deviceId) => {
                  // device
                  const device = devicesMap.get(deviceId)
                  const config = this.form.pictureConfig[deviceId].find(({ code }) => code === languageId)

                  return <el-form-item key={`pictureConfig-${deviceId}-${languageId}`} label={`${device.name}图片-${languageName}：`} prop={`pictureConfig-${device.id}-${languageId}`}>
                    <div style="display:flex">
                      <el-input
                        value={config.address}
                        nativeOnClick={async(event) => {
                          event.stopPropagation()
                          try {
                            config.address = await uploadImage({ intrinsicSize: device.intrinsicSize })
                          } catch (e) {
                            if (e.message === '[UploadImage-WrongImageSize]') Message.warning('请上传指定尺寸的图片')
                          }
                        }}
                      />
                      <span style="display:block;width:80px;text-align:right;">{device.intrinsicSize}</span>
                    </div>
                  </el-form-item>
                })
              )
            }, [])
        }

      </el-form>

      <div slot="footer" style="text-align: right;">
        <el-button onClick={this.close}>取 消</el-button>
        <el-button type="primary" loading={this.submitBtnLoading} onClick={this.submit}>确 定</el-button>
      </div>
    </el-dialog>
  }
}
