<template>
  <div class="app-container">
    <el-form :inline="true" :model="queryParams">
      <el-form-item :label="$t('giftLaxin.activityName')" prop="activityName">
        <el-input v-model="queryParams.activityName" clearable size="mini" />
      </el-form-item>
      <el-form-item :label="$t('giftLaxin.activityId')" prop="activityId">
        <el-input v-model="queryParams.activityId" clearable size="mini" />
      </el-form-item>
      <el-form-item :label="$t('giftLaxin.activityCreatedTs')">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('giftLaxin.startTime')"
          :range-separator="$t('giftLaxin.to')"
          :end-placeholder="$t('giftLaxin.endTime')"
          value-format="timestamp"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="search">{{ $t('giftLaxin.search') }}</el-button>
      </el-form-item>
    </el-form>
    <div :class="$style.mb">
      <el-button type="primary" size="mini" class="el-icon-plus" @click="handkeAddActive">{{ $t('giftLaxin.addActive') }}</el-button>
    </div>
    <el-table :data="tableData" border>
      <el-table-column :label="$t('giftLaxin.operate')" align="center" min-width="500">
        <template slot-scope="scope">
          <el-button type="success" :disabled="scope.row.state === 2" v-if="scope.row.state !== 0" size="mini" @click="handleChangeState(scope.row, 0)">{{ $t('giftLaxin.online') }}</el-button>
          <el-button type="danger" v-if="scope.row.state === 0" size="mini" @click="handleChangeState(scope.row, 1)">{{ $t('giftLaxin.offline') }}</el-button>
          <el-button type="primary" size="mini" :disabled="scope.row.state !== 1" @click="handleEditActive(scope.row)">{{ $t('giftLaxin.edit') }}</el-button>
          <el-button type="primary" size="mini" @click="handleAddChannel(scope.row)">{{ $t('giftLaxin.addChannel') }}</el-button>
          <el-button type="warning" size="mini" :disabled="scope.row.state !== 1" @click="releaseFrozenAssets(scope.row)">{{ $t('giftLaxin.releaseFrozenAssets') }}</el-button>
        </template>
      </el-table-column>
      <el-table-column :label="$t('giftLaxin.activityId')" prop="activityId" align="center" min-width="200" />
      <el-table-column :label="$t('giftLaxin.activityName')" prop="activityName" align="center" min-width="200" />
      <el-table-column :label="$t('giftLaxin.activityCreatedTs')" prop="ctime" align="center" min-width="250">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('giftLaxin.basicActivityLink')" align="center" min-width="300">
        <template slot-scope="scope">
          {{ `https://h5.coinstore.com/Welcomebonus?activityId=${scope.row.activityId}` }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('giftLaxin.promotionChannel')" align="center" min-width="150">
        <template slot-scope="scope">
          <span v-if="scope.row.channelCount">
            <el-link type="primary" :underline="false" @click="openChannel(scope.row)" >{{ scope.row.channelCount }}</el-link>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('giftLaxin.giftCurrency')" prop="currencyName" align="center" min-width="150" />
      <el-table-column :label="$t('giftLaxin.totalNumberOfRedPackets')" prop="count" align="center" min-width="150" />
      <el-table-column :label="$t('giftLaxin.numberOfRedPacketsRemaining')" prop="activityRemainingCount" align="center" min-width="150" />
      <el-table-column :label="$t('giftLaxin.totalRedPacketAmount')" prop="amountStr" align="center" min-width="150" />
      <el-table-column :label="$t('giftLaxin.redEnvelopeBalance')" prop="activityRemainingAmountStr" align="center" min-width="150" />
      <el-table-column :label="$t('giftLaxin.activityState')" prop="state" align="center" min-width="150">
        <template slot-scope="scope">
          <span v-if="scope.row.state === 0">{{ $t('giftLaxin.online') }}</span>
          <span v-if="scope.row.state === 1">{{ $t('giftLaxin.offline') }}</span>
          <span v-if="scope.row.state === 2">{{ $t('giftLaxin.unfrozenBalanceDownLine') }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>
    <!-- 创建/修改活动弹窗 -->
    <el-dialog :title="addActiveTitle" :visible.sync="addActiveVisible" :close-on-click-modal="false" width="600px" @closed="closedActiveDialog">
      <el-form ref="addActiveForm" :model="addActiveForm" label-position='top' :rules="addActiveFormRules">
        <el-form-item :label="$t('giftLaxin.activityName')" prop="activityName">
          <el-input v-model="addActiveForm.activityName" clearable  maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('giftLaxin.giftCurrency')" prop="currencyId">
          <el-select v-model="addActiveForm.currencyId" filterable clearable style="display:block;" :disabled="type === 2">
            <el-option v-for="item in currencyOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('giftLaxin.totalNumberOfRedPackets')" prop="count">
          <el-input v-model="addActiveForm.count" clearable :disabled="type === 2" @input="(value)=>(addActiveForm.count = value.replace(/^(0+)|[^\d]+/g, ''))" />
        </el-form-item>
        <el-form-item :label="$t('giftLaxin.singleMinimumAmount')" prop="currencyMinVolume">
          <el-input v-model="addActiveForm.currencyMinVolume" clearable :disabled="type === 2" @input="(value)=>(addActiveForm.currencyMinVolume = value.replace(/^\D*(\d*(?:\.\d{0,6})?).*$/g, '$1'))" />
        </el-form-item>
        <el-form-item :label="$t('giftLaxin.singleMaximumAmount')" prop="currencyMaxVolume">
          <el-input v-model="addActiveForm.currencyMaxVolume" clearable :disabled="type === 2" @input="(value)=>(addActiveForm.currencyMaxVolume = value.replace(/^\D*(\d*(?:\.\d{0,6})?).*$/g, '$1'))" />
        </el-form-item>
        <el-form-item :label="$t('giftLaxin.totalRedPacketAmount')" prop="amount">
          <el-input v-model="addActiveForm.amount" clearable :disabled="type === 2" @input="(value)=>(addActiveForm.amount = value.replace(/^\D*(\d*(?:\.\d{0,6})?).*$/g, '$1'))" />
        </el-form-item>
        <el-form-item :label="$t('giftLaxin.redEnvelopeCover')" prop="activityUrl">
          <el-upload
            class="upload-demo"
            action="#"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
          >
            <el-input v-model="addActiveForm.activityUrl" :placeholder="$t('giftLaxin.clickToUploadPicture')" clearable style="width: 560px" />
          </el-upload>
          <span>{{ $t('giftLaxin.tips6') }}</span>
        </el-form-item>
        <el-form-item :label="$t('giftLaxin.activityRule')" prop="activityRule">
          <Editor v-model="addActiveForm.activityRule" :wordLimit=1000 />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSure">{{ $t('giftLaxin.sure') }}</el-button>
      </span>
    </el-dialog>

    <!-- 添加渠道弹窗 -->
    <el-dialog :title="$t('giftLaxin.addChannel')" :visible.sync="addChannelVisible" :close-on-click-modal="false" width="700px" @closed="closedChannelDialog">
      <el-form ref="addChannelForm" :model="addChannelForm" :rules="addChannelFormRules">
        <div v-for="(channelItem, index) in addChannelForm.channelList" :key="index" :class="$style.holdCoinSection">
          <el-row :gutter="30">
            <el-col :span="11">
              <el-form-item :label="$t('giftLaxin.channelId')" :prop="`channelList.${index}.channelId`" :rules="addChannelFormRules.channelId">
                <el-input v-model.trim="channelItem.channelId" clearable maxlength="50" show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="11">
              <el-form-item :label="$t('giftLaxin.channelName')" :prop="`channelList.${index}.channelName`" :rules="addChannelFormRules.channelName">
                <el-input v-model="channelItem.channelName" clearable maxlength="50" show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="2">
              <i class="el-icon-remove-outline" :class="$style.removeBtn" @click="removeChannel(index)" />
            </el-col>
          </el-row>
        </div>
        <div :class="$style.holdCoin">
          <i class="el-icon-circle-plus-outline" :class="$style.addBtn" @click="addChannel()" />
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleChannelSure">{{ $t('giftLaxin.sure') }}</el-button>
      </span>
    </el-dialog>

    <!-- 查看渠道 -->
    <el-dialog :title="$t('giftLaxin.viewChannel')" :visible.sync="viewChannelVisible" :close-on-click-modal="false" width="600px">
      <div v-for="(item, index) in channelList" :key="index">
        <el-row :gutter="50">
          <el-col :span="8">
            {{ $t('giftLaxin.channelId') }}: {{item.channelId}}
          </el-col>
          <el-col :span="8">
            {{ $t('giftLaxin.channelName') }}: {{item.channelName}}
          </el-col>
          <el-col :span="8">
            <el-link type="primary" :underline="false" @click="toChannelManage(item.channelId)">{{ $t('giftLaxin.viewDetail') }}</el-link>
          </el-col>
        </el-row>
        <div :class="$style.df">
          <div :class="$style.title">{{ $t('giftLaxin.activityLink') }}</div>
          <div :class="$style.input">
            <el-input v-model="item.activityLink" disabled>
              <template slot="append"><span :class="$style.copy" @click="handleCopy(item.activityLink)"><i class="el-icon-document-copy"></i></span></template>
            </el-input>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="viewChannelVisible = false">{{ $t('giftLaxin.closed') }}</el-button>
      </span>
    </el-dialog>

  </div>
</template>
<script>
import Editor from '@/components/wangEditor'
import BigNumber from 'bignumber.js'
import { getCurrencyList } from '@/api/systemsetting/common'
import { filesUploadAws } from '@/api/upload/upload'
import { getActiveList, getActiveDetail, addActive, editActive, changeState, unlock, addChannel, searchByActivityId } from "../../../api/giftLaxin"
export default {
  components: {
    Editor
  },
  data() {
    const checkCurrencyMinVolume = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('giftLaxin.canNotBeEmpty')))
      }
      if (value <= 0) {
         return callback(new Error(this.$t('giftLaxin.currencyMinVolumeThan0')))
       } else {
        return callback()
      }
    }
    const checkCurrencyMaxVolume = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('giftLaxin.canNotBeEmpty')))
      }
      if (value <= 0) {
         return callback(new Error(this.$t('giftLaxin.currencyMaxVolumeThan0')))
       } else {
        return callback()
      }
    }
    const checkAmount = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('giftLaxin.canNotBeEmpty')))
      }
      if (value <= 0) {
        return callback(new Error(this.$t('giftLaxin.amountThan0')))
      } else {
        const minTotalAmount = Number(BigNumber(this.addActiveForm.count).times(this.addActiveForm.currencyMinVolume))
        const maxTotalAmount = Number(BigNumber(this.addActiveForm.count).times(this.addActiveForm.currencyMaxVolume))
        const limitTotalAmount = Number(BigNumber(this.addActiveForm.count).times(this.addActiveForm.currencyMinVolume).plus(this.addActiveForm.currencyMaxVolume))
        if (Number(this.addActiveForm.amount) < minTotalAmount) {
          return callback(this.$t('giftLaxin.tips1'))
        }
        if (Number(this.addActiveForm.amount) > maxTotalAmount) {
          return callback(this.$t('giftLaxin.tips2'))
        }
        if (Number(this.addActiveForm.amount) < limitTotalAmount) {
          return callback(this.$t('giftLaxin.tips7'))
        } else {
          return callback()
        }
      }
    }
    return {
      time: '',
      total: 0,
      tableData: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        activityId: undefined,
        activityName: undefined,
        ctimeStart: undefined,
        ctimeEnd: undefined
      },
      activityId: '',
      type: undefined, // 1：新增活动，2：修改活动
      addActiveTitle: '',
      addActiveVisible: false,
      addActiveForm: {
        id: undefined,
        activityName: '',
        currencyName: '',
        currencyId: undefined,
        count: undefined,
        currencyMinVolume: undefined,
        currencyMaxVolume: undefined,
        amount: undefined,
        activityUrl: '',
        activityRule: ''
      },
      addChannelForm: {
        channelList: [{ channelId: '', channelName: '' }]
      },
      currencyOptions: [],
      addChannelVisible: false,
      viewChannelVisible: false,
      // 查看渠道
      channelList: [],
      // 新增活动表单校验
      addActiveFormRules: {
        activityName: [
          { required: true, message: this.$t('giftLaxin.canNotBeEmpty'), trigger: 'blur' }
        ],
        currencyId: [
          { required: true, message: this.$t('giftLaxin.canNotBeEmpty'), trigger: 'change' }
        ],
        count: [
          { required: true, message: this.$t('giftLaxin.canNotBeEmpty'), trigger: 'blur' }
        ],
        currencyMinVolume: [
          { required: true, validator: checkCurrencyMinVolume, trigger: 'blur' }
        ],
        currencyMaxVolume: [
          { required: true, validator: checkCurrencyMaxVolume, trigger: 'blur' }
        ],
        amount: [
          { required: true, validator: checkAmount, trigger: 'blur' }
        ],
        activityUrl: [
          { required: true, message: this.$t('giftLaxin.canNotBeEmpty'), trigger: 'change' }
        ],
        activityRule: [
          { required: true, message: this.$t('giftLaxin.canNotBeEmpty'), trigger: 'change' }
        ]
      },
      addChannelFormRules: {
        channelId: [
          { required: true, message: this.$t('giftLaxin.canNotBeEmpty'), trigger: 'blur' }
        ],
        channelName: [
          { required: true, message: this.$t('giftLaxin.canNotBeEmpty'), trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    if (this.$route.query.activityName) {
      this.queryParams.activityName = this.$route.query.activityName
    } else {
      this.queryParams.activityName = undefined
    }
    this.getList()
    this.getCurrencyList()
  },
  beforeDestroy() {
    this.queryParams.activityName = undefined
  },
  methods: {
    async getList() {
      this.queryParams.ctimeStart = (this.time && this.time[0]) || undefined
      this.queryParams.ctimeEnd = (this.time && this.time[1]) || undefined
      const params = {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
        activityId: this.queryParams.activityId ? this.queryParams.activityId : undefined,
        activityName: this.queryParams.activityName ? this.queryParams.activityName : undefined,
        ctimeStart: this.queryParams.ctimeStart ? this.queryParams.ctimeStart : undefined,
        ctimeEnd: this.queryParams.ctimeEnd ? this.queryParams.ctimeEnd : undefined
      }
      const { rows, total } = await getActiveList(params)
      this.tableData = rows
      this.total = total
    },
    async openChannel(row) {
      const { data } = await searchByActivityId({ activityId: row.activityId })
      const channelList = data.channelList
      channelList.map(item => {
        item.activityLink = `https://h5.coinstore.com/Welcomebonus?activityId=${row.activityId}&Channelid=${item.channelId}`
      })
      this.channelList = channelList
      this.viewChannelVisible = true
    },
    handleCopy(activityLink) {
      const input = document.createElement('input') // 直接构建input
      input.value = activityLink  // 设置内容
      document.body.appendChild(input) // 添加临时实例
      input.select() // 选择实例内容
      document.execCommand('Copy') // 执行复制
      document.body.removeChild(input) // 删除临时实例
      this.msgSuccess(this.$t('giftLaxin.copySuccess'))
    },
    search() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 活动上下线
    handleChangeState(row, state) {
      changeState({ id: row.id, state: state }).then(res => {
        if (res.code === 200) {
          state === 0 ? this.msgSuccess(this.$t('giftLaxin.onlineSuccess')) : this.msgSuccess(this.$t('giftLaxin.offlineSuccess'))
          this.getList()
        } else {
          this.msgError(res.msg)
        }
      })
    },
    // 释放冻结资金
    releaseFrozenAssets(row) {
      unlock({ id: row.id }).then(res => {
        this.msgSuccess(this.$t('giftLaxin.operateSuccess'))
        this.getList()
      })
    },
    // 红包币种
    getCurrencyList() {
      getCurrencyList().then(res => {
        if (res.code === 200) {
          this.currencyOptions = res.data
        }
      })
    },
    // 跳转到 渠道管理页面
    toChannelManage(channelId) {
      this.$router.push({ name: 'channel', query: { channelId: channelId }})
    },
    handkeAddActive() {
      this.addActiveVisible = true
      this.type = 1
      this.addActiveTitle = this.$t('giftLaxin.createActive')
    },
    async handleEditActive(row) {
      this.addActiveVisible = true
      this.type = 2
      const { data } = await getActiveDetail({activityId: row.activityId})
      this.addActiveForm = data
      this.addActiveForm.amount = data.amountStr
      this.addActiveForm.currencyMinVolume = data.currencyMinVolumeStr
      this.addActiveForm.currencyMaxVolume = data.currencyMaxVolumeStr
    },
    // 上传红包封面
    upload(data) {
      if (data.file.size > 500 * 1024) {
        this.$message.warning(this.$t('giftLaxin.tips5'))
        return
      }
      filesUploadAws({ file: data.file }).then(res => {
        this.$set(this.addActiveForm, 'activityUrl', res.data.fullPath)
        this.$message.success(this.$t('giftLaxin.uploadSuccess'))
      })
    },
    handleSure() {
      this.$refs['addActiveForm'].validate((valid) => {
        if (valid) {
          this.currencyOptions.map(item => {
            if (item.id === this.addActiveForm.currencyId) {
              this.addActiveForm.currencyName = item.name
            }
          })
          if (this.type === 1) {
            const params = {
              activityName: this.addActiveForm.activityName,
              currencyName: this.addActiveForm.currencyName,
              currencyId: this.addActiveForm.currencyId,
              count: this.addActiveForm.count,
              currencyMinVolume: this.addActiveForm.currencyMinVolume,
              currencyMaxVolume: this.addActiveForm.currencyMaxVolume,
              amount: this.addActiveForm.amount,
              activityUrl: this.addActiveForm.activityUrl,
              activityRule: this.addActiveForm.activityRule
            }
            addActive(params).then(res => {
              this.getList()
              this.addActiveVisible = false
              this.msgSuccess(this.$t('giftLaxin.operateSuccess'))
            })
          } else {
            const params = {
              id: this.addActiveForm.id,
              activityName: this.addActiveForm.activityName,
              currencyName: this.addActiveForm.currencyName,
              currencyId: this.addActiveForm.currencyId,
              count: this.addActiveForm.count,
              currencyMinVolume: this.addActiveForm.currencyMinVolume,
              currencyMaxVolume: this.addActiveForm.currencyMaxVolume,
              amount: this.addActiveForm.amount,
              activityUrl: this.addActiveForm.activityUrl,
              activityRule: this.addActiveForm.activityRule
            }
            editActive(params).then(res => {
              this.getList()
              this.addActiveVisible = false
              this.msgSuccess(this.$t('giftLaxin.operateSuccess'))
            })
          }
        }
      })
    },
    closedActiveDialog() {
      this.$refs['addActiveForm'].resetFields()
    },
    // 添加渠道
    handleAddChannel(row) {
      this.addChannelVisible = true
      this.activityId = row.activityId
    },
    closedChannelDialog() {
      this.$refs['addChannelForm'].resetFields()
      this.addChannelForm.channelList = [{ channelId: '', channelName: '' }]
    },
    handleChannelSure() {
      this.$refs['addChannelForm'].validate((valid) => {
        if(valid) {
          addChannel({ channelList: this.addChannelForm.channelList, activityId: this.activityId }).then(res => {
            this.msgSuccess(this.$t('giftLaxin.operateSuccess'))
            this.addChannelVisible = false
            this.getList()
          })
        }
      })
    },
    removeChannel(index) {
      if (this.addChannelForm.channelList && this.addChannelForm.channelList.length > 1) this.addChannelForm.channelList.splice(index, 1)
    },
    addChannel() {
      if(this.addChannelForm.channelList) this.addChannelForm.channelList.push({ channelId: '', channelName: '' })
    }
  }
}
</script>

<style lang="scss" module>
.mb {
  margin-bottom: 20px;
}
.holdCoinSection {
  overflow: hidden;
  .removeBtn {
    margin-top: 50px;
    font-size: 24px;
    color: red;
    font-weight: bold;
    cursor: pointer;
  }
}
.holdCoin {
  .addBtn {
    color: green;
    font-weight: bold;
    font-size: 24px;
    cursor: pointer;
  }
}
.df {
  display: flex;
  margin: 20px 0;
  .title {
    margin-top: 10px;
  }
  .input {
    width: 450px
  }
}
.copy {
  cursor: pointer;
}
</style>
