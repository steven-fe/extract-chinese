import { add, getDetail, edit } from '@/api/kingkong-area'
import { uploadImage } from '@/views/operatemanager/vote-for-listing/utils'
import $data, { linkTypeMap, homeFlagMap } from '../../data'

const getRules = (() => {
  let _vm = null

  const checkLanguageName = (languageId, languageName, _1, _2, callback) => {
    const { languageNameList } = _vm.form
    const name = languageNameList.find(({ code }) => code === languageId).name
    if (!name) return callback(new Error(`请输入${languageName}名称`))
    callback()
  }

  const rules = {
    title: [{ required: true, message: '请输入标题', trigger: 'change' }],
    linkAdd: [{ required: true, message: '请输入跳转地址', trigger: 'change' }],
    typeCode: [{ required: true, message: '请选择应用类型', trigger: 'change' }],
    iconAddress: [{ required: true, message: '请上传icon', trigger: 'change' }]
  }

  const setLanguageRules = (() => {
    let inited = 0

    return () => {
      if (!_vm || inited) return
      inited++

      _vm.$watch('languageList', (languageList) => {
        languageList.forEach(({ id, name }) => {
          rules[`languageName-${id}`] = [{ required: true, validator: checkLanguageName.bind(null, id, name), trigger: 'change' }]
        })
      }, { immediate: true })
    }
  })()

  return (vm) => {
    _vm = _vm || vm

    setLanguageRules()

    return rules
  }
})()

const toNumberOrNull = value => (typeof value === 'number') ? value : null

let updateList = () => {}

export default {
  name: 'Single',
  data() {
    const selectedLanguageFactory = () => []

    const formFactory = () => ({
      id: null,
      title: '',
      languageNameList: [],
      linkType: 1,
      linkAdd: '',
      typeCode: null,
      homeFlag: 1,
      weight: 1,
      iconAddress: null
    })

    return {
      show: false,
      type: 'create', // 'create', 'edit'

      watchListOfAfterOpen: new Set(),

      selectedLanguageFactory,
      selectedLanguage: selectedLanguageFactory(), // [ 'en_US', ... ]

      formFactory,
      form: formFactory(),

      submitBtnLoading: false
    }
  },
  computed: {
    languageList() {
      return [...$data.languageMap.values()]
    }
  },
  methods: {
    initLanguageNameList() {
      this.$watch('selectedLanguage', () => {
        this.form.languageNameList = this.form.languageNameList.filter(({ code }) => this.selectedLanguage.includes(code))

        const languageNameMap = new Map(this.form.languageNameList.map(languageName => ([languageName.code, languageName])))

        this.selectedLanguage.forEach(id => {
          if (!languageNameMap.has(id)) this.form.languageNameList.push({ code: id, name: '' })
        })
      })
    },
    async open(info, callback = () => {}) {
      const { id, type } = info || { type: 'create' }

      this.show = true
      this.type = type

      updateList = callback

      /** setForm */
      if (this.type === 'edit') await this.setForm(id)

      this.afterOpen()
    },
    async setForm(id) {
      const { data } = await getDetail({ id })

      for (const key in data) {
        if (key in this.form) this.form[key] = data[key]
      }
    },
    afterOpen() {
      /** update some data in $data */
      $data.updateLabelList()

      // set selectedLanguage
      if (this.type === 'create') {
        const unwatch = this.$watch('languageList', () => {
          this.selectedLanguage = this.languageList.map(({ id }) => id)
        }, { immediate: true })

        this.watchListOfAfterOpen.add(unwatch)
      } else if (this.type === 'edit') {
        this.selectedLanguage = this.form.languageNameList.map(({ code }) => code)
      }
    },
    close() {
      this.show = false
    },
    closed() {
      this.watchListOfAfterOpen.forEach(unwatch => unwatch())
      this.watchListOfAfterOpen.clear()

      this.selectedLanguage = this.selectedLanguageFactory()
      this.form = this.formFactory()
      this.$nextTick(() => this.$refs.form.clearValidate())
    },
    async submit() {
      try {
        this.submitBtnLoading = true

        await this.$refs.form.validate()
        await (this.type === 'edit' ? edit : add)(this.form)
        updateList()
        this.close()
        this.msgSuccess('操作成功')
      } catch (e) {
        console.log(e)
      } finally {
        this.submitBtnLoading = false
      }
    }
  },
  created() {
    this.initLanguageNameList()
  },
  render() {
    const languageMap = $data.languageMap

    return <el-dialog
      title={`${this.type === 'create' ? '新增' : '修改'}金刚区`}
      width="800px"
      close-on-click-modal={false}
      close-on-press-escape={false}
      show-close={false}
      visible={this.show}
      onClosed={this.closed}
      on={{ 'update:visible': (visible) => !visible && this.close() }}
    >
      <el-form ref="form" props={ { model: this.form } } rules={getRules(this)} label-width="120px">

        <el-row>
          <el-form-item label="标题：" prop="title">
            <el-input value={this.form.title} onInput={ title => (this.form.title = title || null) } />
          </el-form-item>
        </el-row>

        {
          this.selectedLanguage.map(id => {
            const languageName = this.form.languageNameList.find(({ code }) => code === id)
            return (
              <el-form-item key={id} label={`${languageMap.get(id).name}名称：`} prop={`languageName-${id}`}>
                <el-input value={languageName.name} onInput={ name => (languageName.name = name || null) } />
              </el-form-item>
            )
          })
        }

        <el-form-item label="语言：">
          <el-checkbox-group
            value={this.selectedLanguage}
            onInput={languageList => {
              const languageIdList = this.languageList.map(({ id }) => id)
              /** sort language */
              this.selectedLanguage = [...languageList].sort((id1, id2) => (languageIdList.indexOf(id1) - languageIdList.indexOf(id2)))
            }}
          >
            { this.languageList.map(({ id, name }) => <el-checkbox label={id} key={id}>{name}</el-checkbox>) }
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="跳转类型：">
          {
            [...linkTypeMap.values()].map(({ id, name }) => <el-radio value={this.form.linkType} key={id} label={id} onInput={linkType => (this.form.linkType = linkType)}>{name}</el-radio>)
          }
        </el-form-item>

        <el-row>
          <el-form-item label="跳转地址：" prop="linkAdd">
            <el-input value={this.form.linkAdd} onInput={ linkAdd => (this.form.linkAdd = linkAdd || null) } />
          </el-form-item>
        </el-row>

        <el-form-item label="应用类型：" prop="typeCode">
          <el-select value={this.form.typeCode} size="mini" filterable clearable placeholder="选择类型" onInput={typeCode => (this.form.typeCode = typeof typeCode === 'number' ? typeCode : typeCode || null)}>
            { [...$data.labelList.values()].map(({ id, name }) => (<el-option key={id} label={name} value={id} />)) }
          </el-select>
        </el-form-item>

        <el-form-item label="是否默认首页：">
          {
            [...homeFlagMap.values()].map(({ id, name }) => <el-radio value={this.form.homeFlag} key={id} label={id} onInput={homeFlag => (this.form.homeFlag = homeFlag)}>{name}</el-radio>)
          }
        </el-form-item>

        <el-form-item label="前端排序：">
          <el-input-number min={1} step-strictly value={this.form.weight} onInput={ weight => (this.form.weight = toNumberOrNull(weight)) } />
        </el-form-item>

        <el-row>
          <el-form-item label="上传icon：" prop="iconAddress">
            <el-input
              value={this.form.iconAddress}
              nativeOnClick={async(event) => {
                event.stopPropagation()
                this.form.iconAddress = await uploadImage()
              }}
            />
          </el-form-item>
        </el-row>

      </el-form>

      <div slot="footer" style="text-align: right;">
        <el-button onClick={this.close}>取 消</el-button>
        <el-button type="primary" loading={this.submitBtnLoading} onClick={this.submit}>确 定</el-button>
      </div>
    </el-dialog>
  }
}
