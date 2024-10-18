<template>
  <div class="app-container">
    <el-form ref="form" :model="form" label-position="top" :rules="rules">

      <el-form-item label="目标人群" :rules="rules.targetType">
        <el-radio-group v-model="customeType" @input="changeCustomeType">
          <el-radio-button label="first">全部用户</el-radio-button>
          <el-radio-button label="second">指定用户</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="customeType === 'second'" prop="targetType" :rules="rules.targetType">
        <el-radio-group v-model="form.targetType" @input="changeTargetType">
          <el-radio :label="1">手动输入</el-radio>
          <el-radio :label="2">批量上传</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="form.targetType === 1 && customeType === 'second'" prop="uIds" :rules="rules.uIds">
        <el-input
          v-model="form.uIds"
          type="textarea"
          :rows="5"
          maxlength="400"
          show-word-limit
          placeholder="请输入用户 UID（长 ID），多个 UID 以','隔开"
        />
      </el-form-item>

      <el-form-item v-if="form.targetType === 2 && customeType === 'second'">
        <div style="display: flex;">
          <div style="margin-right: 20px;">
            <el-upload
              ref="upload"
              action="#"
              :on-change="handleChangeFile"
              :show-file-list="false"
              accept=".csv,.xlsx"
              :auto-upload="false"
              class="upload-demo"
            >
              <el-button type="primary" icon="el-icon-upload" size="mini">上传文件</el-button>
              <div>支持格式：.csv .xlsx</div>
            </el-upload>
          </div>
          <div><span style="font-size: 14px; color: red; margin-right: 20px;">文件上传状态：{{ fileName }}</span></div>
          <div>
            <el-button type="primary" size="mini" @click="downLoad">下载导入模板</el-button>
          </div>
        </div>
      </el-form-item>

      <div class="message">消息内容</div>
      <el-form-item label="消息类型" prop="msgType" :rules="rules.msgType">
        <el-select v-model="form.msgType" size="small" placeholder="请选择消息类型">
          <el-option v-for="item in msgTypeOptions" :key="item.type" :label="item.typeName" :value="item.type" />
        </el-select>
      </el-form-item>

      <el-form-item label="语种">
        <el-checkbox-group v-model="selectedLanguageInForm">
          <el-checkbox
            v-for="[key, name] in languageMap"
            :key="key"
            :label="key"
            :disabled="form.defaultSelectedLanguage === key"
          >{{ name }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item
        v-for="(content, index) in form.stationMsgTaskContents"
        :key="`title_for_${content.languageCode}`"
        :label="`标题-${languageMap.get(content.languageCode)}`"
        :prop="`stationMsgTaskContents.${index}.title`"
        :rules="content.languageCode === 'en_US' ? rules.title : [{ required: false }]"
      >
        <el-input
          v-model="content.title"
          maxlength="40"
          show-word-limit
          :placeholder="content.languageCode === 'en_US' ? '请输入消息标题' : '非必填，标题若为空，在保存时将英语标题复用至此'"
        />
      </el-form-item>

      <el-form-item
        v-for="(content, index) in form.stationMsgTaskContents"
        :key="`content_for_${content.languageCode}`"
        :label="`内容-${languageMap.get(content.languageCode)}`"
        :prop="`stationMsgTaskContents.${index}.content`"
        :rules="content.languageCode === 'en_US' ? rules.content : [{ required: false }]"
      >
        <el-input
          v-model="content.content"
          type="textarea"
          :rows="7"
          maxlength="200"
          show-word-limit
          :placeholder="content.languageCode === 'en_US' ? '请输入消息内容' : '非必填，内容若为空，在保存时将英语内容复用至此'"
        />
      </el-form-item>

      <el-form-item label="跳转链接" :rules="rules.jumpType">
        <el-radio-group v-model="jumpLink" @input="changeJumpLink">
          <el-radio label="first">不跳转</el-radio>
          <el-radio label="second">业务落地页</el-radio>
          <el-radio label="third">自定义链接</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        v-if="jumpLink === 'second'"
        prop="jumpUrlConfig.businessLandingPage.name"
        :rules="rules.businessLandingPage"
      >
        <el-select
          v-model="form.jumpUrlConfig.businessLandingPage.name"
          size="small"
          placeholder="选择业务落地页"
          clearable
          @change="handleChangeName"
        >
          <el-option v-for="item in businessLandingPageOptions" :key="item.id" :label="item.name" :value="item.name" />
        </el-select>

        <el-select
          v-if="form.jumpUrlConfig.businessLandingPage.id === 2 || form.jumpUrlConfig.businessLandingPage.id === 3"
          v-model="form.jumpUrlConfig.businessLandingPage.paramValue"
          size="small"
          placeholder="选择币种"
          clearable
          filterable
        >
          <el-option v-for="item in currencyOptions" :key="item.id" :label="item.name" :value="item.name" />
        </el-select>

        <el-select
          v-if="form.jumpUrlConfig.businessLandingPage.id === 4"
          v-model="form.jumpUrlConfig.businessLandingPage.paramValue"
          size="small"
          placeholder="选择币对"
          clearable
          filterable
        >
          <el-option v-for="item in spotCurrencyPairOptions" :key="item.id" :label="item.name" :value="item.name" />
        </el-select>

        <el-select
          v-if="form.jumpUrlConfig.businessLandingPage.id === 5"
          v-model="form.jumpUrlConfig.businessLandingPage.paramValue"
          size="small"
          placeholder="选择币对"
          clearable
          filterable
        >
          <el-option
            v-for="item in contractCurrencyPairOptions"
            :key="item.contractId"
            :label="item.displayName"
            :value="item.displayName"
          />
        </el-select>

        <el-select
          v-if="form.jumpUrlConfig.businessLandingPage.id === 6"
          v-model="form.jumpUrlConfig.businessLandingPage.paramValue"
          size="small"
          placeholder="选择直播活动id"
          clearable
          filterable
        >
          <el-option v-for="item in liveIdOptions" :key="item" :label="item" :value="item" />
        </el-select>

        <el-select
          v-if="form.jumpUrlConfig.businessLandingPage.id === 7"
          v-model="form.jumpUrlConfig.businessLandingPage.paramValue"
          size="small"
          placeholder="选择IEO活动id"
          clearable
          filterable
        >
          <el-option v-for="item in ieoIdOptions" :key="item" :label="item" :value="item" />
        </el-select>

      </el-form-item>

      <el-form-item v-if="jumpLink === 'third'" prop="jumpType" :rules="rules.jumpType">
        <el-radio-group v-model="form.jumpType">
          <el-radio :label="2">多语言统一</el-radio>
          <el-radio :label="3">多语言区分</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        v-if="form.jumpType === 2"
        label="跳转地址-统一地址"
        prop="jumpUrlConfig.multilingualUnificationUrl"
        :rules="rules.jumpAddress"
      >
        <el-input v-model="form.jumpUrlConfig.multilingualUnificationUrl" placeholder="请输入跳转地址" />
      </el-form-item>

      <template v-if="form.jumpType === 3">
        <el-form-item
          v-for="(item, index) in form.jumpUrlConfig.multilingualDistinctions"
          :key="`jumpAddress_for_${item.languageCode}`"
          :label="`跳转地址-${languageMap.get(item.languageCode)}`"
          :prop="`jumpUrlConfig.multilingualDistinctions.${index}.url`"
          :rules="rules.jumpAddress"
        >
          <el-input v-model="item.url" placeholder="请输入跳转地址" />
        </el-form-item>
      </template>

      <el-form-item label="发送时机" :rules="rules.time">
        <el-radio-group v-model="form.sendType" @input="changeSendType">
          <el-radio-button :label="0">立即发送</el-radio-button>
          <el-radio-button :label="1">指定时间(UTC+8)</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="form.sendType === 1" prop="appointTs" :rules="rules.time">
        <el-date-picker
          v-model="form.appointTs"
          type="datetime"
          start-placeholder="日期"
          align="right"
          format="yyyy-MM-dd HH:mm"
          placeholder="请选择时间"
          value-format="timestamp"
        />
      </el-form-item>

      <el-form-item label="App通知" prop="appNotice">
        <div style="display: flex; align-items: center;">
          <el-switch
            v-model="form.appNotice"
            :active-value="1"
            :inactive-value="0"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
          <div style="margin-left: 20px">
            <el-tooltip class="item" effect="dark" content="开启后，该条消息还将以 App 通知的形式提醒用户" placement="top-start">
              <i class="el-icon-question" />
            </el-tooltip>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <div style="margin-left: 200px;">
      <el-button @click="goBack">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSure">保 存</el-button>
    </div>

    <el-dialog :visible.sync="dialogCopyVisible" :close-on-click-modal="false" width="500px">
      <div>将英文语种配置复用至其他语种？（保留其他语种已填写的配置）</div>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" size="mini" @click="dialogCopyVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" size="mini" @click="handleCopeContent">{{ $t('common.sure') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listConfig } from '@/api/system/languageconfig'
import { getCurrencyList } from '@/api/systemsetting/common'
import { getPairList } from '@/api/systemsetting/common'
import { getContractList } from '@/api/cmsSymbolSort'
import { getBasicShowName } from './api'
import { getMsgType, getBusinessLandingPage, createMsgTask, getMsgTaskDetail, modifyMsgTask, fileUpload, getLiveIds, getIeoIds } from '@/api/operate/messageCenter'

export default {
  data() {
    var checktime = (rule, value, callback) => {
      if (!this.form.appointTs) {
        callback(new Error('请选择发送时间'))
      } else if (value < new Date().getTime()) {
        callback(new Error('指定发送时间不能早于当前时间'))
      } else {
        callback()
      }
    }

    const initForm = () => ({
      id: '',
      targetType: 0,
      uIds: '',
      filePath: '',
      languageCodes: '',
      msgType: '',
      jumpType: 0,

      defaultSelectedLanguage: 'en_US',
      jumpUrlConfig: {
        businessLandingPage: { id: '', name: '', paramName: '', paramValue: '' },
        multilingualUnificationUrl: '',
        multilingualDistinctions: [{ languageCode: 'en_US', url: '' }]
      },
      initMultilingualDistinctions: () => ({ languageCode: 'en_US', url: '' }),
      appNotice: 0,
      sendType: 0,
      appointTs: '',
      initStationMsgTaskContents: () => ({ languageCode: 'en_US', title: '', content: '' }),
      stationMsgTaskContents: [{ languageCode: 'en_US', title: '', content: '' }]
    })

    return {
      customeType: 'first',
      jumpLink: 'first',
      msgTypeOptions: [],
      businessLandingPageOptions: [],
      currencyOptions: [],
      spotCurrencyPairOptions: [],
      contractCurrencyPairOptions: [],
      liveIdOptions: [],
      ieoIdOptions: [],
      initForm,
      form: initForm(),
      fileName: '未上传',
      file: '',
      dialogCopyVisible: false,
      languageMap: new Map(),
      rules: {
        targetType: [{ required: true, message: '请设置目标人群', trigger: 'blur' }],
        uIds: [{ required: true, message: '请输入用户uid', trigger: 'blur' }],
        fileName: [{ required: true, message: '请上传文件', trigger: 'blur' }],
        msgType: [{ required: true, message: '请选择消息类型', trigger: 'blur' }],
        title: [{ required: true, message: '请填写消息标题', trigger: 'blur' }],
        content: [{ required: true, message: '请填写消息内容', trigger: 'blur' }],
        jumpType: [{ required: true, message: '请选择跳转方式以及填写跳转链接', trigger: 'blur' }],
        businessLandingPage: [{ required: true, message: '请选择业务落地页', trigger: 'blur' }],
        jumpAddress: [{ required: true, message: '请输入跳转地址', trigger: 'blur' }],
        time: [
          { required: true, message: '请选择发送时间', trigger: 'blur' },
          { validator: checktime, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    selectedLanguageInForm: {
      get() {
        return this.form.stationMsgTaskContents.map(({ languageCode: language }) => language).filter(language => !!language)
      },
      set(languageList) {
        const stationMsgTaskContents = []
        const multilingualDistinctions = []
        const staticLanguageKeys = Array.from(this.languageMap.keys())
        const sortedLanguageList = Array.from(languageList)
          .sort((language1, language2) => staticLanguageKeys.indexOf(language1) - staticLanguageKeys.indexOf(language2))
        sortedLanguageList
          .forEach(language => {
            if (this.selectedLanguageInForm.includes(language)) {
              const staticLanguageItem = this.form.stationMsgTaskContents.find(staticLanguageItem => staticLanguageItem.languageCode === language)

              if (staticLanguageItem) stationMsgTaskContents.push(staticLanguageItem)

              if (this.form.jumpUrlConfig.multilingualDistinctions !== null) {
                const staticLanguageItem1 = this.form.jumpUrlConfig.multilingualDistinctions.find(staticLanguageItem1 => staticLanguageItem1.languageCode === language)
                if (staticLanguageItem1) multilingualDistinctions.push(staticLanguageItem1)
              }
            } else {
              stationMsgTaskContents.push({ ...this.form.initStationMsgTaskContents(), languageCode: language })
              multilingualDistinctions.push({ ...this.form.initMultilingualDistinctions(), languageCode: language })
            }
          })

        this.form.stationMsgTaskContents = stationMsgTaskContents
        this.form.jumpUrlConfig.multilingualDistinctions = multilingualDistinctions
      }
    }
  },
  async created() {
    await this.getLanguageSelect()
    this.getSendMsgType()
    const type = this.$route.query.type

    if (['edit', 'copy', 'quickCreationByQuotePush'].includes(type)) {
      const data = await this.getMsgTaskDetail()
      this.handleMsgTaskDetail(data)
    }
  },
  mounted() {
    this.getLandingPage()
    this.getCurrencyList()
    this.getSpotCurrencyPair()
    this.getContractCurrencyPair()
    this.getLiveIds()
    this.getIeoIds()
  },
  methods: {
    // 文件上传
    handleChangeFile(file) {
      this.file = file.raw
      fileUpload({ file: this.file }).then(response => {
        if (response.code === 200) {
          this.form.filePath = response.msg
          this.fileName = '已上传完成'
          this.msgSuccess(this.$t('common.operationSucceed'))
        } else {
          this.msgError(response.msg)
        }
      })
    },
    getLandingPage() {
      getBusinessLandingPage().then(res => {
        if (res.code === 200) {
          this.businessLandingPageOptions = res.data
        } else {
          this.msgError(res.msg)
        }
      })
    },
    getCurrencyList() {
      getCurrencyList().then(res => {
        if (res.code === 200) {
          this.currencyOptions = res.data
        }
      })
    },
    getSpotCurrencyPair() {
      getPairList().then(res => {
        if (res.code === 200) {
          this.spotCurrencyPairOptions = res.data
        }
      })
    },
    getContractCurrencyPair() {
      getContractList().then(res => {
        if (res.code === 200) {
          this.contractCurrencyPairOptions = res.rows
        }
      })
    },
    getLiveIds() {
      getLiveIds().then(res => {
        if (res.code === 200) {
          this.liveIdOptions = res.data
        }
      })
    },
    getIeoIds() {
      getIeoIds().then(res => {
        if (res.code === 200) {
          this.ieoIdOptions = res.data
        }
      })
    },
    getLanguageSelect() {
      return new Promise((resolve, reject) => {
        return listConfig()
          .then((response) => {
            (response && response.rows || []).forEach(({ key, language }) => this.languageMap.set(key, language))
            // 将map转换成类数组
            const arr = [...this.languageMap]
            // 互换类数组中的前两个元素的位置（将英语语种放在第一个元素位置）
            arr[0] = arr.splice(1, 1, arr[0])[0]
            // 将类数组转换成map
            const map1 = new Map(arr)
            this.languageMap = map1
            resolve()
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    async getMsgTaskDetail() {
      if (this.$route.query.type === 'quickCreationByQuotePush') {
        const initData = JSON.parse(this.$route.query.initData)
        const { data: { showName: showBasicName }} = await getBasicShowName(initData.symbol)
        const languageKeys = [...this.languageMap.keys()].filter(languageKey => languageKey !== 'zh_CN')

        const data = {
          'id': 511,
          'targetType': 0,
          'languageCodes': languageKeys.join(','),
          'msgType': 6,
          'msgTypeDesc': '行情資訊',
          'jumpType': 1,
          'jumpUrlConfig': {
            'businessLandingPage': {
              'id': 4,
              'name': '现货交易',
              'paramName': 'symbolname',
              'paramValue': initData.symbol
            },
            'multilingualUnificationUrl': null,
            'multilingualDistinctions': null
          },
          'sendState': 1,
          'realSendTs': 1713322534613,
          'appNotice': 1,
          'sendType': 0,
          'appointTs': null,
          'stationMsgTaskContents': languageKeys.map(languageKey => ({
            'languageCode': languageKey,
            'title': `${showBasicName} is up!`,
            'content': `${showBasicName} is up by ${initData.dayChange}% to ${initData.currencyPrice} USDT in the last 24 hours!`
          })),
          'createTs': 1713322534586,
          'modifyTs': 1713322534586,
          'uids': ''
        }
        return data
      }

      const msgTaskId = this.$route.query.id
      return (await getMsgTaskDetail(msgTaskId)).data
    },
    handleMsgTaskDetail(data) {
      for (const key in data) {
        this.form[key] = data[key]
      }

      if (this.form.jumpUrlConfig.businessLandingPage === null) {
        this.form.jumpUrlConfig.businessLandingPage = { id: '', name: '', paramName: '', paramValue: '' }
      }
      if (this.form.jumpUrlConfig.multilingualDistinctions === null) {
        const multilingualDistinctions = []
        this.selectedLanguageInForm.map(item => {
          multilingualDistinctions.push({ languageCode: item, url: '' })
          this.form.jumpUrlConfig.multilingualDistinctions = multilingualDistinctions
        })
      }

      if (this.form.targetType === 2) {
        const type = this.$route.query.type
        if (type === 'edit') {
          this.fileName = '已上传完成'
        }
      }
      if (this.form.targetType === 0) {
        this.customeType = 'first'
      }
      if (this.form.targetType === 1 || this.form.targetType === 2) {
        this.customeType = 'second'
      }
      this.form.uIds = data.uids
      if (this.form.jumpType === 0) {
        this.jumpLink = 'first'
      }
      if (this.form.jumpType === 1) {
        this.jumpLink = 'second'
      }
      if (this.form.jumpType === 2 || this.form.jumpType === 3) {
        this.jumpLink = 'third'
      }
    },
    getSendMsgType() {
      getMsgType().then(res => {
        if (res.code === 200) {
          this.msgTypeOptions = res.data
        } else {
          this.msgError(res.msg)
        }
      })
    },
    changeCustomeType() {
      if (this.customeType === 'first') {
        this.form.targetType = 0
        this.form.uIds = ''
        this.form.filePath = ''
        this.fileName = '未上传'
      } else {
        this.form.targetType = undefined
      }
    },
    changeSendType() {
      if (this.form.sendType === 0) {
        this.form.appointTs = ''
      }
    },
    changeJumpLink() {
      if (this.jumpLink === 'first') {
        this.form.jumpType = 0
      }
      if (this.jumpLink === 'second') {
        this.form.jumpType = 1
      }
      if (this.jumpLink === 'third') {
        this.form.jumpType = undefined
      }
    },
    goBack() {
      this.$router.go(-1)
    },
    handleChangeName() {
      if (this.form.jumpUrlConfig.businessLandingPage !== null) {
        this.businessLandingPageOptions.find(item => {
          if (item.name === this.form.jumpUrlConfig.businessLandingPage.name) {
            this.form.jumpUrlConfig.businessLandingPage.paramName = item.paramName
            this.form.jumpUrlConfig.businessLandingPage.id = item.id
          }
        })
      }
    },
    handleSure() {
      const type = this.$route.query.type
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.jumpType === 0) {
            this.form.jumpUrlConfig.businessLandingPage = { id: '', name: '', paramName: '', paramValue: '' }
            this.form.jumpUrlConfig.multilingualDistinctions = [{ languageCode: 'en_US', url: '' }]
            this.form.jumpUrlConfig.multilingualUnificationUrl = null
          }
          if (this.form.jumpType === 1) {
            this.form.jumpUrlConfig.multilingualDistinctions = [{ languageCode: 'en_US', url: '' }]
            this.form.jumpUrlConfig.multilingualUnificationUrl = null
          }
          if (this.form.jumpType === 2) {
            this.form.jumpUrlConfig.multilingualDistinctions = [{ languageCode: 'en_US', url: '' }]
            this.form.jumpUrlConfig.businessLandingPage = { id: '', name: '', paramName: '', paramValue: '' }
          }
          if (this.form.jumpType === 3) {
            this.form.jumpUrlConfig.multilingualUnificationUrl = null
            this.form.jumpUrlConfig.businessLandingPage = { id: '', name: '', paramName: '', paramValue: '' }
          }
          if (['add', 'copy', 'quickCreationByQuotePush'].includes(type)) {
            const list = []
            this.form.stationMsgTaskContents.map(item => {
              if ((item.languageCode !== 'en_US' && item.title === '') || (item.languageCode !== 'en_US' && item.content === '')) {
                list.push(item)
              }
              return list
            })
            if (list.length > 0) {
              this.dialogCopyVisible = true
              return
            }
            this.form.languageCodes = this.selectedLanguageInForm.join()
            if (this.form.jumpUrlConfig.businessLandingPage.id === 5) {
              this.form.jumpUrlConfig.businessLandingPage.paramValue = this.form.jumpUrlConfig.businessLandingPage.paramValue.replace('/', '')
            }
            const params = {
              targetType: this.form.targetType,
              uIds: this.form.uIds,
              filePath: this.form.filePath,
              languageCodes: this.form.languageCodes,
              msgType: this.form.msgType,
              jumpType: this.form.jumpType,
              jumpUrlConfig: this.form.jumpUrlConfig,
              appNotice: this.form.appNotice,
              sendType: this.form.sendType,
              appointTs: this.form.appointTs,
              stationMsgTaskContents: this.form.stationMsgTaskContents
            }
            createMsgTask(params)
              .then(response => {
                this.$message({
                  showClose: true,
                  message: this.$t('common.operationSucceed'),
                  type: 'success'
                })
                setTimeout(() => this.$router.go(-1), 1000)
              })
              .catch(error => {
                console.log(error)
              })
          } else {
            const list = []
            this.form.stationMsgTaskContents.map(item => {
              if ((item.languageCode !== 'en_US' && item.title === '') || (item.languageCode !== 'en_US' && item.content === '')) {
                list.push(item)
              }
              return list
            })
            if (list.length > 0) {
              this.dialogCopyVisible = true
              return
            }
            this.form.languageCodes = this.selectedLanguageInForm.join()
            if (this.form.jumpUrlConfig.businessLandingPage.id === 5) {
              this.form.jumpUrlConfig.businessLandingPage.paramValue = this.form.jumpUrlConfig.businessLandingPage.paramValue.replace('/', '')
            }
            const params = {
              id: this.$route.query.id,
              targetType: this.form.targetType,
              uIds: this.form.uIds,
              filePath: this.form.filePath,
              languageCodes: this.form.languageCodes,
              msgType: this.form.msgType,
              jumpType: this.form.jumpType,
              jumpUrlConfig: this.form.jumpUrlConfig,
              appNotice: this.form.appNotice,
              sendType: this.form.sendType,
              appointTs: this.form.appointTs,
              stationMsgTaskContents: this.form.stationMsgTaskContents
            }
            modifyMsgTask(params)
              .then(response => {
                this.$message({
                  showClose: true,
                  message: this.$t('common.operationSucceed'),
                  type: 'success'
                })
                setTimeout(() => this.$router.go(-1), 1000)
              })
              .catch(error => {
                console.log(error)
              })
          }
        }
      })
    },
    changeTargetType() {
      if (this.form.targetType === 1) {
        this.form.filePath = ''
        this.fileName = '未上传'
      }
      if (this.form.targetType === 2) {
        this.form.uids = ''
        this.form.uIds = ''
      }
    },
    handleCopeContent() {
      let enObj = {}
      const enList = []
      this.form.stationMsgTaskContents.map(item => {
        if (item.languageCode === 'en_US') {
          enList.push(item)
        }
        return enList
      })
      enObj = enList[0]
      this.form.stationMsgTaskContents.map(item => {
        if (item.languageCode !== 'en_US' && item.title === '') {
          item.title = enObj.title
        }
        if (item.languageCode !== 'en_US' && item.content === '') {
          item.content = enObj.content
        }
      })
      this.dialogCopyVisible = false
    },
    // 下载模版
    downLoad() {
      window.open('https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/msgTaskUidTemplate.xlsx')
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" scoped>
::v-deep .el-tabs--card>.el-tabs__header {
  border-bottom: 1px solid #dfe4ed;
  width: fit-content;
}

::v-deep .el-tabs__item.is-active {
  color: white;
  background-color: #1890ff;
}

::v-deep .el-tabs__item:hover {
  cursor: pointer;
}

::v-deep .el-input--medium {
  width: 500px;
}

.message {
  font-size: 14px;
  color: #606266;
  font-weight: bold;
}

.el-icon-question {
  font-size: 20px;
  position: absolute;
  top: 0;
}

::v-deep .el-switch__core::before {
  content: '否';
  position: absolute;
  top: 0;
  right: 5px;
  color: #fff;
}

.is-checked ::v-deep .el-switch__core::before {
  content: '是';
  position: absolute;
  top: 0;
  left: 5px;
  color: #fff;
}

.upload-demo {
  float: left;
  width: 100%;
}
</style>
