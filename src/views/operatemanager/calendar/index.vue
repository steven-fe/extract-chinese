<template>
  <div class="app-container">
    <!--form-->
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="日历名称">
        <el-input v-model="queryParams.title" placeholder="请输入日历名称" size="mini" clearable />
      </el-form-item>

      <el-form-item label="日程类型" prop="type">
        <el-select v-model="queryParams.type" filterable clearable placeholder="请选择日程类型">
          <el-option :key="-1" :label="$t('common.all')" value="" />
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="日程时间">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('common.startDate')"
          :range-separator="$t('common.toTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="timestamp"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" size="mini" @click="load">{{$t('common.search')}}</el-button>
        <el-button type="primary" size="mini" @click="handleAddSchedule">新增日程</el-button>
      </el-form-item>
    </el-form>

    <!--table-->
    <el-table border class="top" :data="tableData">
      <el-table-column :label="$t('common.operation')" width="260" align="center">
        <template slot-scope="scope">
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="日程名称" width="260" align="center" />
      <el-table-column prop="type" label="日程类型" width="260" align="center">
        <template slot-scope="scope">
          <span v-for="(item, index) in typeOptions" :key="index">
            <span v-if="scope.row.type === item.value">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="日程开始时间" align="center" prop="recordTime" width="270">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.recordTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日程结束时间" align="center" prop="recordEndTime" width="270">
        <template slot-scope="scope">
          <span v-if="scope.row.recordEndTime !==0">{{ parseTime(scope.row.recordEndTime) }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="日程状态" width="260" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.type === 0 || scope.row.type === 2">
            <span v-for="(item, index) in launchpadStatus" :key="index">
              <span v-if="scope.row.status === item.value">{{ item.label }}</span>
            </span>
          </span>

          <span v-if="scope.row.type === 1">
            <span v-for="(item, index) in liveStatus" :key="index">
              <span v-if="scope.row.status === item.value">{{ item.label }}</span>
            </span>
          </span>

          <span v-if="scope.row.type === 3">
            <span v-for="(item, index) in tradingContestStatus" :key="index">
              <span v-if="scope.row.status === item.value">{{ item.label }}</span>
            </span>
          </span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增日程 -->
    <el-dialog title="新增日程" :visible.sync="dialogStatus" width="550px" :close-on-click-modal="false" :before-close="cancel">
      <el-form ref="digform" :model="digform" label-width="130px" :rules="rules">
        <el-form-item label="日程类型" prop="type">
          <el-select v-model="digform.type" placeholder="请选择日程类型" clearable filterable @change="changeType(digform.type)">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <!-- launchpad -->
        <el-form-item v-if="scheduleType === 0 || scheduleType === undefined" label="活动ID" prop="businessId">
          <el-select v-model="digform.businessId" :placeholder="$t('common.pleaseChoose')" clearable filterable @change="changeBusinessId(digform.businessId)">
            <el-option
              v-for="(item, index) in launchpadIdOptions"
              :key="index"
              :label="item.id"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="scheduleType === 0 || scheduleType === undefined" label="币种名称">
          <el-input v-model="digform.currencyCode" disabled />
        </el-form-item>
        <el-form-item v-if="scheduleType === 0 || scheduleType === undefined" label="活动开启时间" prop="startTs">
          <el-date-picker v-model="digform.startTs" type="datetime" disabled />
        </el-form-item>
        <el-form-item v-if="scheduleType === 0 || scheduleType === undefined" label="活动结束时间" prop="endTs">
          <el-date-picker v-model="digform.endTs" type="datetime" disabled />
        </el-form-item>
        <!-- 直播 -->
        <el-form-item v-if="scheduleType === 1" label="直播ID" prop="businessId">
          <el-select v-model="digform.businessId" :placeholder="$t('common.pleaseChoose')" clearable filterable @change="changeBusinessId(digform.businessId)">
            <el-option
              v-for="(item, index) in liveOptions"
              :key="index"
              :label="item.id"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="scheduleType === 1" label="直播主题">
          <el-input v-model="digform.liveTopic" disabled />
        </el-form-item>
        <el-form-item v-if="scheduleType === 1" label="开播时间">
          <el-date-picker v-model="digform.startTs" type="datetime" disabled />
        </el-form-item>
        <!-- 投票上币 -->
        <el-form-item v-if="scheduleType ===2" label="活动ID" prop="businessId">
          <el-select v-model="digform.businessId" :placeholder="$t('common.pleaseChoose')" clearable filterable @change="changeBusinessId(digform.businessId)">
            <el-option
              v-for="(item, index) in voteOptions"
              :key="index"
              :label="item.id"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="scheduleType === 2" label="币种名称">
          <el-input v-model="digform.currencyCode" disabled />
        </el-form-item>
        <el-form-item v-if="scheduleType === 2" label="投票活动开启时间" prop="startTs">
          <el-date-picker v-model="digform.startTs" type="datetime" disabled />
        </el-form-item>
        <el-form-item v-if="scheduleType === 2" label="投票活动结束时间" prop="endTs">
          <el-date-picker v-model="digform.endTs" type="datetime" disabled />
        </el-form-item>
        <!-- 交易赛 -->
        <el-form-item v-if="scheduleType ===3" label="交易赛ID" prop="businessId">
          <el-select v-model="digform.businessId" :placeholder="$t('common.pleaseChoose')" clearable filterable @change="changeBusinessId(digform.businessId)">
            <el-option
              v-for="(item, index) in tradingContestOptions"
              :key="index"
              :label="item.id"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="scheduleType === 3" label="现货-有效交易币对">
          <el-input v-model="digform.spotEffectiveSymbols" disabled />
        </el-form-item>
        <el-form-item v-if="scheduleType === 3" label="合约-有效交易币对">
          <el-input v-model="digform.contractEffectiveSymbols" disabled />
        </el-form-item>
        <el-form-item v-if="scheduleType === 3" label="日历展示图片">
          <el-input v-model="digform.backgroundImg" disabled />
        </el-form-item>
        <el-form-item v-if="scheduleType === 3" label="交易赛开始时间" prop="startTs">
          <el-date-picker v-model="digform.startTs" type="datetime" disabled />
        </el-form-item>
        <el-form-item v-if="scheduleType === 3" label="交易赛结束时间" prop="endTs">
          <el-date-picker v-model="digform.endTs" type="datetime" disabled />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmit">确 认</el-button>
      </div>
    </el-dialog>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>
  </div>
</template>

<script>
import { getPageList, deleteData, AddCalendar } from '@/api/operate/calendar'
import { activityList, activityDetail } from '@/api/launchpad'
import { pageList } from '@/api/broadcast/broadcastList'
import { getList, getVoteDetail } from '@/api/operate/vote-for-listing'
import { getTradingList, getTradingContestDetail } from '@/api/trading-contest'

export default {
  data() {
    const digformFactory = () => ({
      type: '',
      businessId: '',
      startTs: '',
      endTs: '',
      currencyCode: '',
      liveTopic: '',
      spotEffectiveSymbols: '',
      contractEffectiveSymbols: '',
      backgroundImg: ''
    })
    return {
      time: undefined,
      // 总条数
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: '',
        type: '',
        startTime: '',
        endTime: ''
      },
      scheduleType: undefined, // 0:launchpad,1:直播,2:投票上币,3:交易赛
      typeOptions: [
        { value: 1, label: '直播' },
        { value: 0, label: 'launchpad' },
        { value: 2, label: '投票上币' },
        { value: 3, label: '交易赛' }
      ],
      launchpadStatus: [
        { value: 1, label: '进行中' },
        { value: 2, label: '预热中' },
        { value: 3, label: '已结束' }
      ],
      liveStatus: [
        { value: 0, label: '未审核' },
        { value: 1, label: '已拒绝' },
        { value: 2, label: '预告中' },
        { value: 3, label: '直播中' },
        { value: 4, label: '已结束' },
        { value: 5, label: '已失效' }
      ],
      tradingContestStatus: [
        { value: 0, label: this.$t('earn.unStart') },
        { value: 1, label: '进行中' },
        { value: 2, label: '已结束' }
      ],
      dialogStatus: false,
      digformFactory,
      digform: digformFactory(),
      tableData: [],
      launchpadIdOptions: [],
      liveOptions: [],
      voteOptions: [],
      tradingContestOptions: [],
      rules: {
        type: [{ required: true, message: '请选择日程类型', trigger: 'blur' }],
        businessId: [{ required: true, message: '请选择业务ID', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getLaunchpadList()
    this.getLiveList()
    this.getVoteList()
    this.getTradingContestList()
  },
  methods: {
    getLaunchpadList() {
      activityList({ pageNum: 1, pageSize: 999999 }).then(response => {
        this.launchpadIdOptions = response.rows
      })
    },
    getLiveList() {
      pageList({ pageNum: 1, pageSize: 999999 }).then(response => {
        this.liveOptions = response.rows
      })
    },
    getVoteList() {
      getList({ pageNum: 1, pageSize: 999999 }).then(response => {
        this.voteOptions = response.rows
      })
    },
    getTradingContestList() {
      getTradingList({ pageNum: 1, pageSize: 999999 }).then(response => {
        this.tradingContestOptions = response.rows
      })
    },
    getList() {
      getPageList(this.queryParams).then(res => {
        if (res.code === 200) {
          this.tableData = res.rows
          this.total = res.total
        }
      })
    },
    load() {
      this.queryParams.pageNum = 1
      if (this.time && this.time[0]) {
        this.queryParams.startTime = this.time && this.time[0]
      } else {
        this.queryParams.startTime = undefined
      }
      if (this.time && this.time[1]) {
        this.queryParams.endTime = this.time && this.time[1]
      } else {
        this.queryParams.endTime = undefined
      }
      this.getList()
    },
    handleDelete(row) {
      deleteData({ id: row.id }).then(response => {
        if (response.code === 200) {
          this.msgSuccess('删除成功')
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    handleAddSchedule() {
      this.dialogStatus = true
      this.scheduleType = undefined
    },
    cancel() {
      this.dialogStatus = false
      this.digform = this.digformFactory()
      this.$refs.digform.clearValidate()
    },
    changeBusinessId(itemId) {
      if (this.scheduleType === 0) {
        this.launchpadIdOptions.map(el => {
          if (el.id === itemId) {
            this.digform.currencyCode = el.currencyCode
          }
        })
        activityDetail({ id: itemId }).then(response => {
          this.digform.startTs = response.data.subscriptionStartTime
          this.digform.endTs = response.data.distributionEndTime
        })
      }
      if (this.scheduleType === 1) {
        this.liveOptions.map(el => {
          if (el.id === itemId) {
            this.digform.liveTopic = el.liveTopic
            this.digform.startTs = el.startTs
          }
        })
      }
      if (this.scheduleType === 2) {
        getVoteDetail(itemId).then(response => {
          this.digform.currencyCode = response.data.currencyCode
          this.digform.startTs = response.data.startTime
          this.digform.endTs = response.data.endTime
        })
      }
      if (this.scheduleType === 3) {
        this.tradingContestOptions.map(el => {
          if (el.id === itemId) {
            if (el.symbol !== '--') {
              this.digform.spotEffectiveSymbols = el.symbol
            } else {
              this.digform.spotEffectiveSymbols = ''
            }
            if (el.contractSymbol !== '--') {
              this.digform.contractEffectiveSymbols = el.contractSymbol
            } else {
              this.digform.contractEffectiveSymbols = ''
            }
            this.digform.startTs = el.startTime
            this.digform.endTs = el.endTime
          }
        })
        getTradingContestDetail(itemId).then(response => {
          response.data.contentList.map(el => {
            if (el.languageCode === 'en_US' && el.clientType === '1') {
              this.digform.backgroundImg = el.banner
            }
          })
        })
      }
    },
    changeType(type) {
      this.digform.businessId = ''
      this.digform.startTs = ''
      this.digform.endTs = ''
      this.digform.currencyCode = ''
      this.digform.liveTopic = ''
      this.digform.spotEffectiveSymbols = ''
      this.digform.contractEffectiveSymbols = ''
      this.digform.backgroundImg = ''
      this.typeOptions.map(el => {
        if (el.value === type) {
          this.scheduleType = el.value
        }
      })
      return this.scheduleType
    },
    handleSubmit() {
      this.$refs['digform'].validate((valid) => {
        if (valid) {
          const params = {
            type: this.digform.type,
            businessId: this.digform.businessId,
            startTs: this.digform.startTs,
            endTs: this.digform.endTs
          }
          AddCalendar(params).then(response => {
            this.msgSuccess(this.$t('common.operationSucceed'))
            this.cancel()
            this.getList()
          })
        }
      })
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" scoped>
  .el-date-editor.el-input,
  .el-date-editor.el-input__inner {
    width: 100%;
  }

  .top {
    margin-top: 20px;
  }

  .dividing-line {
    position: relative;
    height: 30px;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 100%;
      border: 1px dashed #ccc;
      z-index: 3;
    }

    span {
      position: absolute;
      top: 50%;
      left: 50%;
      display: block;
      padding: 0 10px;
      background: #fff;
      transform: translate(-50%, -50%);
      z-index: 4;
    }
  }
  </style>
