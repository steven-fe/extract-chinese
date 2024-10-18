<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="120px">
      <el-form-item :label="$t('giftLaxin.channelIdAndName')" label-width="190px">
        <el-input v-model="form.channelId" :placeholder="$t('giftLaxin.inputChannelIdAndName')" clearable />
      </el-form-item>
      <el-form-item :label="$t('giftLaxin.createTime')">
        <el-date-picker
          v-model="date"
          type="datetimerange"
          value-format="timestamp"
          :start-placeholder="$t('giftLaxin.startTime')"
          :range-separator="$t('giftLaxin.to')"
          :end-placeholder="$t('giftLaxin.endTime')"
          @change="timeChange"
        />
      </el-form-item>
      <el-form-item :label="$t('giftLaxin.channelType')">
        <el-select v-model="form.channelType" clearable>
          <el-option v-for="item in channelTypes" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList(true)">{{ $t('giftLaxin.search') }}</el-button>
      </el-form-item>
    </el-form>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="addActivity">{{ $t('giftLaxin.addChannel') }}</el-button>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column :label="$t('giftLaxin.operate')" width="200px" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" :disabled="scope.row.channelType === 1" @click="update(scope.row)">{{ $t('giftLaxin.edit') }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="channelId" :label="$t('giftLaxin.channelId')" align="center" />
      <el-table-column prop="channelName" :label="$t('giftLaxin.channelName')" align="center" width="180" />
      <el-table-column prop="channelType" :label="$t('giftLaxin.channelType')" align="center">
        <template slot-scope="scope">
          <span v-for="item in channelTypes" :key="item.value">
            <span v-if="scope.row.channelType === item.value">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('giftLaxin.createTime')" align="center" width="160">
        <template slot-scope="scope">{{ scope.row.createTime | dateFilter }}</template>
      </el-table-column>
      <el-table-column :label="$t('giftLaxin.whetherToConfigureRegistrationPageAds')" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.channelType === 1">--</span>
          <span v-else>
            {{ scope.row.advertStatus === 0 ? $t('giftLaxin.no') : $t('giftLaxin.yes') }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('giftLaxin.registeAd')" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.channelType === 1">--</span>
          <span v-if="scope.row.advertBanner !== 'null' && scope.row.advertBanner && scope.row.channelType !== 1" style="cursor: pointer; color: #1c84c6" @click="viewImg(scope.row.advertBanner)">{{ $t('giftLaxin.viewPicture') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('giftLaxin.advertisingSkip')" align="center" width="260">
        <template slot-scope="scope">
          <span v-if="scope.row.channelType === 1">--</span>
          <span v-else>
            <div>{{ $t('giftLaxin.chinese') }}: {{ scope.row.advertSkip && scope.row.advertSkip.indexOf('{') !== -1 ? JSON.parse(scope.row.advertSkip).zh_CN : '' }}</div>
            <div>{{ $t('giftLaxin.english') }}: {{ scope.row.advertSkip && scope.row.advertSkip.indexOf('{') !== -1 ? JSON.parse(scope.row.advertSkip).en_US : '' }}</div>
            <div>{{ $t('giftLaxin.japanese') }}: {{ scope.row.advertSkip && scope.row.advertSkip.indexOf('{') !== -1 ? JSON.parse(scope.row.advertSkip).ja_JP : '' }}</div>
            <div>{{ $t('giftLaxin.korean') }}: {{ scope.row.advertSkip && scope.row.advertSkip.indexOf('{') !== -1 ? JSON.parse(scope.row.advertSkip).ko_KR : '' }}</div>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('giftLaxin.channelLink')" align="center" width="300">
        <template slot-scope="scope">
          <span v-if="scope.row.channelType === 0">
            {{ `https://www.coinstore.com/#/SignUp?Channelid=${scope.row.channelId}` }}
          </span>
          <span v-if="scope.row.channelType === 1">
            {{ `https://h5.coinstore.com/Welcomebonus?activityId=${scope.row.activityId}&Channelid=${scope.row.channelId}` }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('giftLaxin.laxinName')" prop="activityName" align="center" width="300">
        <template slot-scope="scope">
          <span v-if="scope.row.channelType === 0">--</span>
          <span v-if="scope.row.channelType === 1">
            <el-link type="primary" :underline="false" @click="toLaxin(scope.row.activityName)" >{{ scope.row.activityName }}</el-link>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('giftLaxin.turnoverTime')" align="center" width="160">
        <template slot-scope="scope">{{ scope.row.updateTime | dateFilter }}</template>
      </el-table-column>
      <el-table-column prop="registerNumber" :label="$t('giftLaxin.enrollment')" align="center" />
      <el-table-column prop="rechargeNumber" :label="$t('giftLaxin.chargeNumber')" align="center" />
      <el-table-column prop="rechargeAmount" :label="$t('giftLaxin.amountCharged')" align="center" />
      <el-table-column prop="withdrawNumber" :label="$t('giftLaxin.numberOfWithdrawals')" align="center" />
      <el-table-column prop="withdrawAmount" :label="$t('giftLaxin.withdrawalAmount')" align="center" />
      <el-table-column prop="spotTradeNumber" :label="$t('giftLaxin.spotTradingNumber')" align="center" />
      <el-table-column prop="spotTradeAmount" :label="$t('giftLaxin.spotTradeAmount')" align="center" />
      <el-table-column prop="contractTradeNumber" :label="$t('giftLaxin.contractTradeNumber')" align="center" />
      <el-table-column prop="contractTradeAmount" :label="$t('giftLaxin.contractTradeAmount')" align="center" />
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="pageChange"
      />
    </div>
    <el-dialog :title="updateId ? $t('giftLaxin.editChannel') : $t('giftLaxin.addChannel')" :visible.sync="open" width="800px" :before-close="cancel" :close-on-click-modal="false">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        label-width="180px"
        class="form-grid"
      >
        <el-form-item class="grid-item" :label="$t('giftLaxin.channelId')" prop="channelId">
          <el-input v-model="digform.channelId" :placeholder="$t('giftLaxin.pleaseEnterTheChannelID')" :disabled="!!updateId" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('giftLaxin.channelName')" prop="channelName">
          <el-input v-model="digform.channelName" :placeholder="$t('giftLaxin.pleaseEnterTheChannelName')" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('giftLaxin.whetherToConfigureRegistrationPageAds')" prop="advertStatus">
          <el-radio-group v-model="digform.advertStatus">
            <el-radio :label="1">{{ $t('giftLaxin.yes') }}</el-radio>
            <el-radio :label="0">{{ $t('giftLaxin.no') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="String(digform.advertStatus) == 1" class="grid-item" :label="$t('giftLaxin.jumpType')" prop="skipType">
          <el-radio-group v-model="digform.skipType">
            <el-radio :label="1">{{ $t('giftLaxin.website') }}</el-radio>
            <el-radio :label="0">{{ $t('giftLaxin.nonJump') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="String(digform.advertStatus) == 1 && String(digform.skipType) == 1" class="grid-item" :label="$t('giftLaxin.jumpAddress')">
          <!--          <el-input v-model="digform.advertSkip" placeholder="请输入跳转地址" clearable></el-input>-->
        </el-form-item>
        <el-form-item v-if="String(digform.advertStatus) == 1 && String(digform.skipType) == 1" class="grid-item" :label="$t('giftLaxin.chinese')" prop="advertSkips.zh_CN">
          <el-input v-model="digform.advertSkips.zh_CN" :placeholder="$t('giftLaxin.pleaseEnterTheForwardAddress')" clearable />
        </el-form-item>
        <el-form-item v-if="String(digform.advertStatus) == 1 && String(digform.skipType) == 1" class="grid-item" :label="$t('giftLaxin.english')" prop="advertSkips.en_US">
          <el-input v-model="digform.advertSkips.en_US" :placeholder="$t('giftLaxin.pleaseEnterTheForwardAddress')" clearable />
        </el-form-item>
        <el-form-item v-if="String(digform.advertStatus) == 1 && String(digform.skipType) == 1" class="grid-item" :label="$t('giftLaxin.japanese')" prop="advertSkips.ja_JP">
          <el-input v-model="digform.advertSkips.ja_JP" :placeholder="$t('giftLaxin.pleaseEnterTheForwardAddress')" clearable />
        </el-form-item>
        <el-form-item v-if="String(digform.advertStatus) == 1 && String(digform.skipType) == 1" class="grid-item" :label="$t('giftLaxin.korean')" prop="advertSkips.ko_KR">
          <el-input v-model="digform.advertSkips.ko_KR" :placeholder="$t('giftLaxin.pleaseEnterTheForwardAddress')" clearable />
        </el-form-item>
        <el-form-item v-if="String(digform.advertStatus) == 1" class="grid-item" :label="$t('giftLaxin.webRegistrationPageImage')" prop="advertBanners">
          {{ $t('giftLaxin.tips3') }}
        </el-form-item>
        <el-form-item v-if="String(digform.advertStatus) == 1" class="grid-item" :label="$t('giftLaxin.chinese')" prop="advertBanners.zh_CN">
          <el-upload
            class="upload-demo"
            action="#"
            :data="{property: `digform.advertBanners.zh_CN`}"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
          >
            <el-input v-model="digform.advertBanners.zh_CN" :placeholder="$t('giftLaxin.pleaseUploadPictures')" style="width: 410px" clearable />
          </el-upload>
        </el-form-item>
        <el-form-item v-if="String(digform.advertStatus) == 1" class="grid-item" :label="$t('giftLaxin.english')" prop="advertBanners.en_US">
          <el-upload
            class="upload-demo"
            action="#"
            :data="{property: `digform.advertBanners.en_US`}"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
          >
            <el-input v-model="digform.advertBanners.en_US" :placeholder="$t('giftLaxin.pleaseUploadPictures')" style="width: 410px" clearable />
          </el-upload>
        </el-form-item>
        <el-form-item v-if="String(digform.advertStatus) == 1" class="grid-item" :label="$t('giftLaxin.japanese')" prop="advertBanners.ja_JP">
          <el-upload
            class="upload-demo"
            action="#"
            :data="{property: `digform.advertBanners.ja_JP`}"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
          >
            <el-input v-model="digform.advertBanners.ja_JP" :placeholder="$t('giftLaxin.pleaseUploadPictures')" style="width: 410px" clearable />
          </el-upload>
        </el-form-item>
        <el-form-item v-if="String(digform.advertStatus) == 1" class="grid-item" :label="$t('giftLaxin.korean')" prop="advertBanners.ko_KR">
          <el-upload
            class="upload-demo"
            action="#"
            :data="{property: `digform.advertBanners.ko_KR`}"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
          >
            <el-input v-model="digform.advertBanners.ko_KR" :placeholder="$t('giftLaxin.pleaseUploadPictures')" style="width: 410px" clearable />
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{ $t('giftLaxin.cancel') }}</el-button>
        <el-button size="mini" type="primary" @click="setConfig">{{ $t('giftLaxin.save') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="$t('giftLaxin.viewPicture')" :visible.sync="viewImgDialog" width="800px" :before-close="cancelImgs" :close-on-click-modal="false">
      <div>{{ $t('giftLaxin.webRegistrationPageImage') }}</div>
      <div class="viewImg">
        <div><div>{{ $t('giftLaxin.chinese') }}</div><img :src="imgs.zh_CN" alt=""></div>
        <div><div>{{ $t('giftLaxin.english') }}</div><img :src="imgs.en_US" alt=""></div>
        <div><div>{{ $t('giftLaxin.japanese') }}</div><img :src="imgs.ja_JP" alt=""></div>
        <div><div>{{ $t('giftLaxin.korean') }}</div><img :src="imgs.ko_KR" alt=""></div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import * as API from '@/api/channel'
import { upload } from '@/api/indexImg'
import dayjs from 'dayjs'

export default {
  name: 'ActivityList',
  filters: {
    dateFilter(time) {
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  data() {
    const validateChannelIds = async(rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('giftLaxin.pleaseEnterTheChannelID')))
      } else if (value.length > 12) {
        callback(new Error(this.$t('giftLaxin.tips4')))
      } else {
        const res = await API.pageList({ channelId: value, pageNum: 1, pageSize: 10 })
        if (res.total > 0 && !this.updateId) {
          callback(new Error(this.$t('giftLaxin.theChannelIDAlreadyExists')))
        } else {
          callback()
        }
      }
    }
    const validateChannelName = async(rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('giftLaxin.pleaseEnterTheChannelName')))
      } else if (value.length > 12) {
        callback(new Error(this.$t('giftLaxin.tips4')))
      } else {
        const res = await API.pageList({ channelId: value, pageNum: 1, pageSize: 10 })
        if (res.total > 0 && res.rows[0].id !== this.updateId) {
          callback(new Error(this.$t('giftLaxin.theChannelNameAlreadyExists')))
        } else {
          callback()
        }
      }
    }
    return {
      imgs: {
        zh_CN: undefined,
        en_US: undefined,
        ja_JP: undefined,
        ko_KR: undefined
      },
      viewImgDialog: false,
      updateId: '',
      total: 0,
      form: {
        channelId: undefined,
        startTime: undefined,
        endTime: undefined,
        channelType: undefined,
        pageNum: 1,
        pageSize: 10
      },
      channelTypes: [
        { value: undefined, label: this.$t('giftLaxin.all') },
        { value: 0, label: this.$t('giftLaxin.register') },
        { value: 1, label: this.$t('giftLaxin.laxin') }
      ],
      date: '',
      tableData: [{}],
      open: false,
      digform: {
        channelId: '',
        channelName: '',
        advertStatus: 1, // 广告状态
        advertBanners: {
          zh_CN: '',
          en_US: '',
          ja_JP: '',
          ko_KR: ''
        }, // 广告图片json串
        advertSkips: {
          zh_CN: '',
          en_US: '',
          ja_JP: '',
          ko_KR: ''
        }, // 广告跳转
        skipType: 1 // 0无跳转,1网站
      },
      rules: {
        channelId: [
          { required: true, validator: validateChannelIds, trigger: 'blur' }
        ],
        channelName: [
          { required: true, validator: validateChannelName, trigger: 'blur' }
        ],
        advertStatus: [
          { required: true, trigger: 'blur' }
        ],
        skipType: [
          { required: true, trigger: 'blur' }
        ],
        'advertSkips.zh_CN': [
          { required: true, message: this.$t('giftLaxin.pleaseEnterTheForwardAddress'), trigger: 'blur' }
        ],
        'advertSkips.en_US': [
          { required: true, message: this.$t('giftLaxin.pleaseEnterTheForwardAddress'), trigger: 'blur' }
        ],
        'advertSkips.ja_JP': [
          { required: true, message: this.$t('giftLaxin.pleaseEnterTheForwardAddress'), trigger: 'blur' }
        ],
        'advertSkips.ko_KR': [
          { required: true, message: this.$t('giftLaxin.pleaseEnterTheForwardAddress'), trigger: 'blur' }
        ],
        'advertBanners.zh_CN': [
          { required: true, message: this.$t('giftLaxin.pleaseEnterUploadPicture'), trigger: 'blur' }
        ],
        'advertBanners.en_US': [
          { required: true, message: this.$t('giftLaxin.pleaseEnterUploadPicture'), trigger: 'blur' }
        ],
        'advertBanners.ja_JP': [
          { required: true, message: this.$t('giftLaxin.pleaseEnterUploadPicture'), trigger: 'blur' }
        ],
        'advertBanners.ko_KR': [
          { required: true, message: this.$t('giftLaxin.pleaseEnterUploadPicture'), trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    'digform.advertStatus'() {
      if (this.digform.advertStatus == 1) {
        this.digform.skipType = 1
        this.digform.advertBanners = {
          zh_CN: undefined,
          en_US: undefined,
          ja_JP: undefined,
          ko_KR: undefined
        }
      } else {
        this.digform.skipType = undefined
        this.digform.advertSkips = {
          zh_CN: undefined,
          en_US: undefined,
          ja_JP: undefined,
          ko_KR: undefined
        }
        this.digform.advertBanners = undefined
      }
    },
    'digform.skipType'() {
      if (this.digform.skipType == 0) {
        this.digform.advertSkips = {
          zh_CN: undefined,
          en_US: undefined,
          ja_JP: undefined,
          ko_KR: undefined
        }
      }
    }
  },
  mounted() {
    if (this.$route.query.channelId) {
      this.form.channelId = this.$route.query.channelId
    } else {
      this.form.channelId = undefined
    }
    this.getConfigList()
  },
  beforeDestroy() {
    this.form.channelId = undefined
  },
  methods: {
    viewImg(imgs) {
      console.log('当前图片', typeof imgs)
      this.viewImgDialog = true
      this.imgs = {
        zh_CN: undefined,
        en_US: undefined,
        ja_JP: undefined,
        ko_KR: undefined
      }
      this.imgs = imgs !== 'null' && imgs ? JSON.parse(imgs) : this.imgs
    },
    // 日期改变事件
    timeChange(val) {
      if (val && val.length > 0) {
        this.form.startTime = val[0]
        this.form.endTime = val[1]
        return
      }
      this.form.startTime = undefined
      this.form.endTime = undefined
    },
    // 分页改变
    pageChange(val) {
      if (val) {
        this.form.pageNum = val.page
        this.form.pageSize = val.limit
        this.getConfigList()
      }
    },
    cancelImgs() {
      this.viewImgDialog = false
      this.imgs = {
        zh_CN: undefined,
        en_US: undefined,
        ja_JP: undefined,
        ko_KR: undefined
      }
    },
    cancel() {
      this.open = false
      this.$refs['digform'].resetFields()
    },
    getConfigList(flag) {
      if (flag) {
        this.form.pageNum = 1
      }
      const params = {
        pageNum: this.form.pageNum,
        pageSize: this.form.pageSize,
        channelId: this.form.channelId ? this.form.channelId : undefined,
        channelType: this.form.channelType !== '' ? this.form.channelType : undefined,
        startTime: this.form.startTime ? this.form.startTime : undefined,
        endTime: this.form.endTime ? this.form.endTime : undefined
      }
      API.pageList(params).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 跳转到红包拉新管理页面
    toLaxin(activityName) {
      this.$router.push({ name: 'giftManager', query: { activityName: activityName }})
    },
    /** 新增按钮操作 */
    addActivity() {
      this.open = true
      this.updateId = ''
    },
    update(row) {
      this.updateId = row.id
      this.digform = Object.assign({}, row)
      this.digform.advertBanners = {
        zh_CN: undefined,
        en_US: undefined,
        ja_JP: undefined,
        ko_KR: undefined
      }
      this.digform.advertBanners = row.advertBanner !== 'null' && row.advertBanner ? JSON.parse(row.advertBanner) : this.digform.advertBanners
      this.digform.advertSkips = {
        zh_CN: undefined,
        en_US: undefined,
        ja_JP: undefined,
        ko_KR: undefined
      }
      this.digform.advertSkips = row.advertSkip !== 'null' && row.advertSkip ? JSON.parse(row.advertSkip) : this.digform.advertSkips
      this.open = true
    },
    setConfig() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          if (this.updateId == '') {
            API.add(this.digform).then(response => {
              if (response.code == 200) {
                this.msgSuccess(this.$t('giftLaxin.addSuccess'))
                this.getConfigList()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            API.update(this.digform).then(response => {
              if (response.code == 200) {
                this.msgSuccess(this.$t('giftLaxin.aditSuccess'))
                this.getConfigList()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    // 图片上传
    upload(data) {
      if (data.file.size > 500 * 1024) {
        this.$message.warning(this.$t('giftLaxin.tips5'))
        return
      }
      upload({ file: data.file }).then(res => {
        if (res.code === 200) {
          const arr = data.data.property.split('.')
          if (arr && arr.length > 0) {
            let form = ''
            arr.forEach((item, index) => {
              if (index === 0) {
                form = this[item]
              } else {
                if (typeof form[item] === 'object') {
                  form = form[item]
                } else {
                  form[item] = res.data.fullPath
                }
              }
            })
          }
          this.$message.success(this.$t('giftLaxin.uploadSuccess'))
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.viewImg {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  & > div {
    padding: 20px;
  }
  img {
    width: 250px;
    margin-top: 10px;
  }
}
.upload-demo {
  float: left;
  width: 100%;
}
.table {
  margin-top: 20px;
}
.form-grid {
  display: grid;
  .grid-item {
    width: 90%;
  }
}
.upload-demo {
  float: left;
  width: 100%;
}
</style>
