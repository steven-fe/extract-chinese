import { add, edit, getDetail } from '@/api/discover/management'
import { Message, MessageBox } from 'element-ui'
import { uploadImage } from '@/views/operatemanager/vote-for-listing/utils'
import $data from '../../data'
import Label from './components/label'
import { upload } from '@/api/indexImg'

const DEFAULT_LANGUAGE = 'en_US'

const getRules = (() => {
  const rulesOfCheckLanguageNameList = (language, _1, _2, callback) => {
    const { languageNameList } = _vm.form
    const { introduction } = languageNameList.find(({ code }) => (code === language))
    if (!introduction) return callback(new Error('请输入描述'))
    callback()
  }

  let _vm = null

  const rules = {
    title: [{ required: true, message: '请输入项目名称', trigger: 'change' }],
    [`languageName-${DEFAULT_LANGUAGE}`]: [{ required: true, validator: rulesOfCheckLanguageNameList.bind(null, DEFAULT_LANGUAGE), trigger: 'change' }],
    icon: [{ required: true, message: '请上传Logo', trigger: 'change' }],
    url: [{ required: true, message: '请填写跳转地址-web', trigger: 'change' }],
    urlApplet: [{ required: true, message: '请填写跳转地址-app', trigger: 'change' }]
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

    const languageNameFactory = () => ({ code: DEFAULT_LANGUAGE, introduction: '' })

    const formFactory = () => ({
      id: null,

      title: '',
      languageNameList: [languageNameFactory()],
      icon: '',
      url: '',
      urlApplet: '',
      label: [],
      weight: 0,
      pictureList: [],
      twitter: '',
      discord: '',
      telegram: ''
    })

    return {
      show: false,
      type: 'create', // 'create', 'edit'

      selectedLanguageFactory,
      selectedLanguage: selectedLanguageFactory(), // [ 'en_US', ... ]

      languageNameFactory,

      formFactory,
      form: formFactory(),

      submitBtnLoading: false,
      fileList: []
    }
  },
  methods: {
    initLanguageNameList() {
      this.$watch('selectedLanguage', () => {
        this.form.languageNameList = this.form.languageNameList.filter(({ code }) => this.selectedLanguage.includes(code))
        this.selectedLanguage.forEach(id => {
          if (!this.form.languageNameList.find(({ code }) => code === id)) this.form.languageNameList.push({ ...this.languageNameFactory(), code: id })
        })
      })
    },
    async setForm(id) {
      const { data } = await getDetail({ id })

      for (const key in data) {
        if (key in this.form) this.form[key] = data[key]
      }
      /** set selectedLanguage in edit mode */
      (() => {
        if (data.pictureList && data.pictureList.length > 0) {
          this.fileList = data.pictureList.map(item => ({ url: item }))
        }
        const unwatchLanguageMap = $data.$watch('languageMap', (languageMap) => {
          if (languageMap.size) {
            this.selectedLanguage = this.form.languageNameList
              .map(({ code }) => code)
              .sort((code1, code2) => ($data.languages.idsList.indexOf(code1) - $data.languages.idsList.indexOf(code2)))

            setTimeout(() => unwatchLanguageMap && unwatchLanguageMap(), 0)
          }
        }, { immediate: true })

        const unwatchShow = this.$watch('show', (show) => {
          if (show) return
          if (unwatchLanguageMap) unwatchLanguageMap()
          if (unwatchShow) unwatchShow()
        })
      })()
    },
    async open(info, callback = () => {}) {
      const { id, type } = info || { type: 'create' }

      this.type = type

      updateList = callback
      this.fileList = [] // 新增清空
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
      const completed = this.form.languageNameList.every(({ introduction }) => !!introduction)
      if (!completed) {
        await MessageBox.confirm('将英文语种配置应用到其他语种上（保留其他语种已填写的配置）', { type: 'warning' })

        const { introduction } = this.form.languageNameList.find(({ code }) => code === DEFAULT_LANGUAGE) || { introduction: '' }
        this.form.languageNameList.forEach(languageName => (languageName.introduction = languageName.introduction || introduction))
      }
    },
    remove(data) {
      const index = this.fileList.findIndex(item => item.uid === data.uid)
      if (index !== -1) {
        this.fileList.splice(index, 1)
      }
    },
    upload(data) {
      upload({ file: data.raw }).then(res => {
        this.fileList.push({ url: res.data.fullPath, uid: data.uid })
        this.$message.success('上传成功')
      })
    },
    async submit() {
      try {
        this.submitBtnLoading = true

        await this.$refs.form.validate()

        await this.autofillContentOfOtherLanguages()
        this.form.pictureList = this.fileList.map(item => item.url)
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
    this.initLanguageNameList()
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
      <el-form ref="form" props={ { model: this.form } } rules={getRules(this)} label-width="130px">

        <el-form-item label="项目名称：" prop="title">
          <el-input value={this.form.title} maxlength="50" show-word-limit onInput={ title => (this.form.title = title || null) } />
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

        {
          [...this.form.languageNameList]
            .sort(({ code: code1 }, { code: code2 }) => ($data.languages.idsList.indexOf(code1) - $data.languages.idsList.indexOf(code2)))
            .map(introduction => {
              const { code: languageId } = introduction
              return <el-form-item key={languageId} label={`描述-${$data.languages.map.get(languageId) ? $data.languages.map.get(languageId).name : ''}：`} prop={`languageName-${languageId}`}>
                <el-input type="textarea" value={introduction.introduction} maxlength="100" show-word-limit onInput={ text => (introduction.introduction = text) } />
              </el-form-item>
            })
        }

        <el-form-item label="Logo：" prop="icon">
          <el-input
            value={this.form.icon}
            nativeOnClick={async(event) => {
              event.stopPropagation()
              try {
                this.form.icon = await uploadImage({ accept: '.png', intrinsicSize: '1:1' })
              } catch (e) {
                if (e.message === '[UploadImage-WrongImageRatio]') Message.warning('请上传指定比例的图片')
              }
            }}
          />
        </el-form-item>

        <el-form-item label="跳转地址-web：" prop="url">
          <el-input value={this.form.url} onInput={ url => (this.form.url = url || null) } />
        </el-form-item>

        <el-form-item label="跳转地址-app：" prop="urlApplet">
          <el-input value={this.form.urlApplet} onInput={ urlApplet => (this.form.urlApplet = urlApplet || null) } />
        </el-form-item>

        <el-form-item label="截图：" prop="pictureList">
          <el-upload
            ref="upload"
            action="#"
            limit={5}
            autoUpload={false}
            list-type="picture-card"
            file-list={this.fileList}
            props={{
              'on-exceed': this.msgSuccess.bind(this, '最多上传5张图片'),
              'on-remove': (file, fileList) => (this.remove(file, fileList)),
              'on-change': (file, fileList) => (this.upload(file, fileList))
            }}
          >
            <i slot="default" class="el-icon-plus"></i>
            <div slot="tip" class="el-upload__tip">推荐尺寸 690 * 270</div>
          </el-upload>
        </el-form-item>

        <el-form-item label="Twitter：" prop="twitter">
          <el-input value={this.form.twitter} onInput={ twitter => (this.form.twitter = twitter || null) } />
        </el-form-item>

        <el-form-item label="Discord：" prop="discord">
          <el-input value={this.form.discord} onInput={ discord => (this.form.discord = discord || null) } />
        </el-form-item>

        <el-form-item label="Telegram：" prop="telegram">
          <el-input value={this.form.telegram} onInput={ telegram => (this.form.telegram = telegram || null) } />
        </el-form-item>

        <el-form-item label="标签：" prop="label">
          <Label max={3} value={this.form.label || []} onInput={ label => (this.form.label = label) } />
        </el-form-item>

        <el-form-item label="权重：">
          <el-input-number min={0} step-strictly value={this.form.weight} onInput={ weight => (this.form.weight = toNumberOrNull(weight)) } />
        </el-form-item>

      </el-form>

      <div slot="footer" style="text-align: right;">
        <el-button onClick={this.close}>取 消</el-button>
        <el-button type="primary" loading={this.submitBtnLoading} onClick={this.submit}>确 定</el-button>
      </div>
    </el-dialog>
  }
}
