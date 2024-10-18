<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="110px">
      <el-form-item label="活动名称:" placeholder="活动名称">
        <el-input v-model="form.activityName" clearable />
      </el-form-item>
      <el-form-item label="活动id:" placeholder="活动名称">
        <el-input v-model="form.activityId" clearable />
      </el-form-item>
      <el-form-item label="活动时间范围：">
        <el-date-picker
          v-model="date"
          type="daterange"
          :start-placeholder="$t('common.startTime')"
          :end-placeholder="$t('common.endTime')"
          :range-separator="$t('common.toTime')"
          align="right"
          value-format="timestamp"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList(true)">查找</el-button>
      </el-form-item>
    </el-form>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="addActivity">添加活动</el-button>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column :label="$t('common.operation')" width="350px" align="center">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status === 1" type="danger" size="mini" @click="updateStatus(scope.row)">下线</el-button>
          <el-button v-else type="primary" size="mini" @click="updateStatus(scope.row)">上线</el-button>
          <el-button type="primary" size="mini" @click="update(scope.row)">修改</el-button>
          <el-button type="primary" size="mini" @click="copy(scope.row)">复制并创建</el-button>
          <el-button type="primary" size="mini" @click="preview(scope.row)">预览</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="activityId" label="活动ID" align="center" />
      <el-table-column prop="activityLink" label="活动链接" align="center" width="300px" />
      <el-table-column prop="activityName" label="活动名称" align="center" />
      <el-table-column label="活动开始时间" align="center" width="180">
        <template slot-scope="scope" type="form">{{ scope.row.startTime | dateFilter }}</template>
      </el-table-column>
      <el-table-column label="活动结束时间" align="center" width="180">
        <template slot-scope="scope">{{ scope.row.endTime | dateFilter }}</template>
      </el-table-column>
      <el-table-column label="活动状态" align="center">
        <template slot-scope="scope">{{ scope.row.status === 0 ? '下线' : '上线' }}</template>
      </el-table-column>
      <el-table-column prop="operator" label="操作者" align="center" />
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
    <el-dialog :title="digform.status ? '修改活动' : '添加活动'" :visible.sync="open" width="1000px" :before-close="cancel">
      语言选择：
      <el-select v-model="lang" :placeholder="$t('common.pleaseChoose')">
        <el-option
          v-for="item in languages"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      选择添加活动的语言环境，选择后所有的链接和文案都将只支持该语言
      <el-tabs v-model="activeName" @tab-click="tabChange">
        <el-tab-pane label="基础信息" name="first">
          <el-form
            ref="digform"
            :model="digform"
            :rules="rules"
            class="form-grid"
          >
            <el-form-item class="grid-item" label="活动名称:" prop="activityName">
              <el-input v-model="digform.activityName" placeholder="请输入活动名称" clearable />
            </el-form-item>
            <el-form-item class="grid-item" label="活动id:" prop="activityId">
              <el-input v-model="digform.activityId" placeholder="请输入活动id" clearable :disabled="!!String(digform.status)" />
            </el-form-item>
            <el-form-item class="grid-item" label="活动开始时间:" prop="activityStartTime">
              <el-date-picker
                v-model="digform.startTime"
                style="width: 410px"
                type="datetime"
                value-format="timestamp"
                placeholder="选择日期时间"
              />
            </el-form-item>
            <el-form-item class="grid-item" label="活动结束时间:" prop="activityStartTime">
              <el-date-picker
                v-model="digform.endTime"
                style="width: 410px"
                type="datetime"
                value-format="timestamp"
                placeholder="选择日期时间"
              />
            </el-form-item>
            <el-form-item class="grid-item" label="Banner(750x600)">
              <el-upload
                class="upload-demo"
                action="#"
                :data="{property: `digform.banners.${lang}`}"
                :show-file-list="false"
                accept=".jpg,.jpeg,.png"
                :http-request="upload"
              >
                <el-input v-model="digform.banners[lang]" placeholder="请上传banner" style="width: 410px" clearable />
              </el-upload>
            </el-form-item>
            <el-form-item class="grid-item" label="活动规则链接">
              <el-input v-model="digform.ruleDesks[lang]" placeholder="请输入活动规则链接" clearable />
            </el-form-item>
            <el-form-item class="grid-item" label="底部活动图片(690x160)">
              <el-upload
                class="upload-demo"
                action="#"
                :data="{property: `digform.desks.${lang}`}"
                :show-file-list="false"
                accept=".jpg,.jpeg,.png"
                :http-request="upload"
              >
                <el-input v-model="digform.desks[lang]" placeholder="请上传底部活动图片" style="width: 410px" clearable />
              </el-upload>
            </el-form-item>
            <el-form-item class="grid-item" label="底部活动链接">
              <el-input v-model="digform.bottomActivity[lang]" placeholder="请输入底部活动链接" clearable />
            </el-form-item>
            <el-form-item class="grid-item" label="分享海报图片(576x892)">
              <el-upload
                class="upload-demo"
                action="#"
                :data="{property: `digform.sharePosters.${lang}`}"
                :show-file-list="false"
                accept=".jpg,.jpeg,.png"
                :http-request="upload"
              >
                <el-input v-model="digform.sharePosters[lang]" placeholder="请上传分享海报图片" style="width: 410px" clearable />
              </el-upload>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="任务信息" name="second">
          <el-button type="primary" size="mini" icon="el-icon-plus" @click="beforeAddTask">添加任务</el-button>
          <div v-for="(item, index) of tasklistSort" :key="index" class="tasktable">
            <div>{{ taskTypes.find(el => el.value === item.taskType).label }}</div>
            <div>
              <span @click="taskEdit(item)">编辑</span>
              <span v-show="item.sort !== 0" @click="taskChangeSort(item, -1)">上移</span>
              <span v-show="item.sort !== 5" @click="taskChangeSort(item, 1)">下移</span>
              <span @click="taskDel(item)">删除</span>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button size="mini" type="primary" @click="setConfig">保 存</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="taskForm.sort ? '修改任务' : '添加任务'" :visible.sync="addTaskDialog" width="500px" :before-close="cancelTask">
      <el-form
        ref="taskForm"
        :model="taskForm"
        :rules="taskFormRules"
        class="form-grid-task"
        label-position="right"
        label-width="150px"
      >
        <el-form-item class="grid-item" label="任务类型:" prop="taskType">
          <el-select v-model="taskForm.taskType" placeholder="请选择任务类型" style="width: 100%">
            <el-option
              v-for="item in taskTypesFilter"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <!--        根据任务类型选择不同的条件字段-->
        <el-form-item v-if="taskForm.taskType === 2" label="邀请人数:" prop="taskFactor">
          <el-input v-model="taskForm.taskFactor" placeholder="请输入邀请人数" clearable />
        </el-form-item>
        <el-form-item v-if="taskForm.taskType === 3" class="grid-item" label="完成人数:" prop="taskFactor">
          <el-input v-model="taskForm.taskFactor" placeholder="请输入完成人数" clearable />
        </el-form-item>
        <el-form-item v-if="taskForm.taskType === 5" class="grid-item" label="充值币种:" prop="symbol">
          <el-select v-model="taskForm.symbol" placeholder="请选择充值币种" style="width: 100%">
            <el-option
              v-for="item in currencyList"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="taskForm.taskType === 5" class="grid-item" label="充值数量:" prop="taskFactor">
          <el-input v-model="taskForm.taskFactor" placeholder="请输入充值数量" clearable />
        </el-form-item>

        <el-form-item class="grid-item" label="奖励类型:" prop="rewardType">
          <el-select v-model="taskForm.rewardType" placeholder="请选择奖励类型" style="width: 100%">
            <el-option
              v-for="item in rewardTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <!--        根据奖励类型选择不同的条件字段-->
        <el-form-item v-if="taskForm.rewardType === 1 || taskForm.rewardType === 2" class="grid-item" label="奖励币种:" prop="rewardCurrencyId">
          <el-select v-model="taskForm.rewardCurrencyId" placeholder="请选择奖励币种" style="width: 100%">
            <el-option
              v-for="item in currencyOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="taskForm.rewardType === 1 || taskForm.rewardType === 3" class="grid-item" label="单份奖励数量:" prop="rewardAmount">
          <el-input v-model="taskForm.rewardAmount" placeholder="请输入单份奖励数量" clearable />
        </el-form-item>
        <el-form-item v-if="taskForm.rewardType === 2" class="grid-item" label="单份奖励面值:" prop="rewardAmount">
          <el-input v-model="taskForm.rewardAmount" placeholder="请输入单份奖励面值" clearable />
        </el-form-item>
        <el-form-item v-if="taskForm.rewardType === 2" class="grid-item" label="有效期截至时间:" prop="rewardTs">
          <el-date-picker
            v-model="taskForm.rewardTs"
            style="width: 100%"
            type="datetime"
            value-format="timestamp"
            placeholder="选择日期时间"
          />
        </el-form-item>
        <el-form-item v-if="taskForm.rewardType === 3" class="grid-item" label="KEY:" prop="taskKey">
          <el-input v-model="taskForm.taskKey" placeholder="请输入体验金KEY" clearable />
        </el-form-item>
        <el-form-item v-if="taskForm.rewardType === 3" class="grid-item" label="有效期:" prop="rewardTs">
          <el-input v-model="taskForm.rewardTs" placeholder="请输入有效期" clearable />
        </el-form-item>

        <el-form-item class="grid-item" label="总奖励份数:" prop="rewardTotal">
          <el-input v-model="taskForm.rewardTotal" placeholder="请输入总奖励份数" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="奖励图标（40*40）:" prop="rewardIcon">
          <el-upload
            class="upload-demo"
            action="#"
            :data="{property: `taskForm.rewardIcon`}"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
          >
            <el-input v-model="taskForm.rewardIcon" placeholder="请上传奖励图标" style="width: 310px" clearable />
          </el-upload>
        </el-form-item>
        <el-form-item class="grid-item" label="奖励描述:" prop="taskTarget">
          <el-input v-model="taskForm.taskTarget[lang]" placeholder="请输入奖励描述" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="addTaskDialog = false">{{$t('common.cancel')}}</el-button>
        <el-button size="mini" type="primary" @click="addTask">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
    <preview v-model="previewShow" :task-list="taskList" :dialog-info="previewRowInfo" />
  </div>
</template>
<script>
import { commonFilter } from '@/utils/filters'
import { date, time } from '@/utils/format'
import * as API from '@/api/operate/pullNewActivity'
import { mapActions, mapState } from 'vuex'
import { upload } from '@/api/indexImg'
import dayjs from 'dayjs'
import preview from '../persionalActiRecord/preview.vue'

export default {
  name: 'ActivityList',
  components: { preview },
  filters: {
    timeFilter(val) {
      if (Number(val) === 0) {
        return '- -'
      }
      return date(val) + ' ' + time(val)
    },
    dateFilter(time) {
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  data() {
    const activityNameRule = (rule, value, callback) => {
      // 20个中文字符以内，包括20个字符
      if (value.trim() === '') {
        callback(new Error('请输入活动名称'))
      } else if (value.length > 20) {
        callback(new Error('活动名称限制20个中文字符以内'))
      } else {
        callback()
      }
    }
    const activityIdRule = async(rule, value, callback) => {
      // 16个英文或数字，如果配置有重复，在输入框失去焦点时，toast提示“活动id重复”
      if (value.trim() === '') {
        callback(new Error('请输入活动id'))
      } else if (!new RegExp(/[0-9a-zA-Z]{8,16}/).test(value) || value.length > 16 || value.length < 8) {
        callback(new Error('活动id为8到16位英文或数字'))
      } else {
        if (String(this.digform.status)) {
          callback()
        } else {
          const { data } = await API.detail({ activityId: value })
          if (data && data.length > 0) {
            callback(new Error('活动id已经存在'))
          } else {
            callback()
          }
        }
      }
    }
    const rewardTotalRule = (rule, value, callback) => {
      if (new RegExp(/[^0-9]/).test(value) || +value <= 0) {
        callback(new Error('只支持输入大于0的整数'))
      } else {
        callback()
      }
    }
    const rewardTsRule = (rule, value, callback) => {
      if (new RegExp(/[^0-9]/).test(value) || +value <= 0) {
        callback(new Error('只支持输入大于0的整数'))
      } else {
        callback()
      }
    }
    return {
      addTaskDialog: false,
      activeName: 'first',
      lang: 'zh_CN',
      languages: [
        { value: 'zh_CN', label: '中文' },
        { value: 'en_US', label: '英文' },
        { value: 'ja_JP', label: '日文' },
        { value: 'ko_KR', label: '韩文' }
      ],
      pickerOptions: {
        disabledDate: (time) => {
          if (time) {
            return time.getTime() < new Date(new Date().toLocaleDateString()).getTime()
          }
          return true
        }
      },
      stateOptions: [
        { label: '上线', value: 1 },
        { label: '下线', value: 2 }
      ],
      registerTypeOptions: [
        { label: '空投', value: 1 },
        { label: '抵扣劵', value: 2 }
      ],
      taskTypes: [
        { label: '注册任务', value: 1 },
        { label: '邀请好友', value: 2 },
        { label: '邀请好友kyc', value: 3 },
        { label: 'kyc任务', value: 4 },
        { label: '充值任务', value: 5 }
      ],
      rewardTypes: [
        { label: '代币', value: 1 },
        { label: '优惠券', value: 2 },
        { label: '体验金', value: 3 }
      ],
      kycStateOptions: [
        { label: '开启', value: 1 },
        { label: '关闭', value: 2 }
      ],
      total: 0,
      configId: '',
      updateId: '',
      form: {
        activityId: undefined,
        activityName: undefined,
        startTime: undefined,
        endTime: undefined,
        pageNum: 1,
        pageSize: 10
      },
      date: '',
      tableData: [{}],
      open: false,
      digform: {
        activityId: '',
        activityName: '',
        startTime: '',
        endTime: '',
        banners: {
          zh_CN: '',
          en_US: '',
          ja_JP: '',
          ko_KR: ''
        },
        ruleDesks: {
          zh_CN: '',
          en_US: '',
          ja_JP: '',
          ko_KR: ''
        },
        desks: { // 底部活动图片
          zh_CN: '',
          en_US: '',
          ja_JP: '',
          ko_KR: ''
        },
        bottomActivity: { // 底部活动链接
          zh_CN: '',
          en_US: '',
          ja_JP: '',
          ko_KR: ''
        },
        sharePosters: { // 海报图
          zh_CN: '',
          en_US: '',
          ja_JP: '',
          ko_KR: ''
        },
        status: '',
        operator: ''
      },
      rules: {
        activityId: [
          { validator: activityIdRule, trigger: 'blur' } // 16个英文或数字，如果配置有重复，在输入框失去焦点时，toast提示“活动id重复”
        ],
        activityName: [
          { validator: activityNameRule, trigger: 'blur' } // 20个中文字符以内，包括20个字符
        ]
      },
      taskList: [],
      taskForm: {
        activityId: '',
        sort: '',
        taskType: '',
        taskKey: '',
        taskTarget: { // 任务描述
          zh_CN: '',
          en_US: '',
          ja_JP: '',
          ko_KR: ''
        },
        rewardCurrencyId: '', // 奖励币种id
        rewardSymbol: '', // 奖励币种name
        rewardAmount: '', // 奖励数量
        taskFactor: '', // 满足条件数量
        rewardType: '', // 奖励类型:1空投,2优惠券,3体验金
        rewardTs: '', // 奖励截止有效期毫秒
        rewardTotal: '', // 奖励份数
        rewardIcon: '', // 奖励图标
        status: 1 // 状态0删除,1正常
      },
      taskFormRules: {
        rewardTotal: [
          { validator: rewardTotalRule, trigger: 'blur' }
        ],
        taskFactor: [
          { validator: rewardTotalRule, trigger: 'blur' }
        ],
        rewardTs: [
          { validator: rewardTsRule, trigger: 'blur' }
        ],
        rewardAmount: [
          { validator: rewardTsRule, trigger: 'blur' }
        ]
      },
      previewShow: false,
      previewRowInfo: {}
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    // 同一活动，注册任务，邀请注册任务，邀请kyc任务，kyc任务，同一类型任务只能配置一个，例如已经配置过一个邀请注册任务，再次添加任务时，任务类型下拉框就不能再选择邀请注册任务类型；
    // 入金任务可以配置多个，但是每个任务入金的币种不能相同，例如一个入金任务配置入金usdt，再配置入金任务时，下拉选择币种就没法选择usdt，
    // 总任务数，上限6个
    taskTypesFilter() {
      const list = this.taskTypes.filter(item => {
        const index = this.taskList.findIndex(el => el.taskType === item.value && item.value !== 5 && el.taskType !== this.taskForm.taskType && el.status !== 0)
        return index === -1
      })
      return list
    },
    currencyOptions() {
      const list = this.currencyList.filter(item => {
        const index = this.taskList.findIndex(el => el.taskType === 5 && el.rewardCurrencyId === item.id && el.status !== 0 && el.activityId === '')
        return index === -1
      })
      return list
    },
    tasklistSort() {
      this.taskList.sort((a, b) => a.sort - b.sort)
      return this.taskList.filter(item => item.status !== 0)
    }
  },
  watch: {
    date: {
      handler() {
        this.form.startTime = this.date && this.date.length > 0 ? this.date[0] : ''
        this.form.endTime = this.date && this.date.length > 0 ? this.date[1] : ''
      },
      deep: true
    },
    taskList() {
      this.taskList.forEach((item, index) => item.sort = index)
    }
  },
  mounted() {
    this.getConfigList()
    this.getCurrency()
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    tabChange(tab, event) {
      console.log(tab, event)
    },
    preview(row) {
      this.previewRowInfo = row
      this.previewGetTaskList(row)
    },
    // 币种类型过滤方法
    typeLabel(data, val) {
      return commonFilter(data, val)
    },
    // 日期改变事件
    timeChange(val) {
      if (val) {
        this.form.startTime = val[0]
        this.form.endTime = val[0]
        return
      }
      this.form.startTime = ''
      this.form.endTime = ''
    },
    // 分页改变
    pageChange(val) {
      if (val) {
        this.pageNum = val.page
        this.pageSize = val.limit
        this.getConfigList()
      }
    },
    cancel() {
      this.open = false
      this.$refs['digform'].clearValidate()
    },
    cancelTask() {
      this.addTaskDialog = false
      this.$refs['taskForm'].clearValidate()
    },
    addActivity() {
      this.open = true
      if (this.digform.status) {
        this.taskForm = Object.assign({}, this.$options.data().taskForm)
        this.digform = Object.assign({}, this.$options.data().digform)
        this.taskList = []
      }
    },
    taskEdit(item) {
      this.taskForm = item
      this.addTaskDialog = true
    },
    taskChangeSort(item, sort) {
      this.taskList.splice(item.sort, 1)
      this.taskList.splice(item.sort + sort, 0, item)
    },
    taskDel(item) {
      // 如果是添加则直接删除，如果是修改则改变状态
      if (String(item.status)) {
        item.status = 0
      } else {
        this.taskList.splice(item.sort, 1)
      }
      console.log('任务类型', this.taskTypesFilter, this.taskList)
      this.msgSuccess('删除成功')
    },
    beforeAddTask() {
      if (this.taskList.length === 6) {
        this.$message({
          type: 'warning',
          message: '只能添加6条任务'
        })
        return
      }
      this.taskForm = Object.assign({}, this.$options.data().taskForm)
      this.addTaskDialog = true
    },
    addTask() {
      if (!String(this.taskForm.sort)) {
        this.taskList.push(Object.assign({}, this.taskForm))
      }
      this.addTaskDialog = false
    },
    getConfigList(flag) {
      if (flag) {
        this.form.pageNum = 1
      }
      Object.keys(this.form).forEach(item => {
        if (!this.form[item]) {
          this.form[item] = undefined
        }
      })
      API.pageList(this.form).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.tableData = this.tableData.map(item => {
            return {
              ...item,
              activityLink: `${process.env.VUE_APP_H5}activity/${item.activityId}`
            }
          })
          this.total = response.data
        } else {
          this.msgError(response.msg)
        }
      })
    },
    updateStatus(row) {
      // activityId	Integer	Y	活动id
      // status	Integer	Y	0关闭,1开启
      API.updateStatus({ activityId: row.activityId, status: row.status === 0 ? 1 : 0 }).then(res => {
        console.log('当前数据', res)
        if (res.code === 200) {
          this.msgSuccess(row.status === 0 ? '上线成功' : '下线成功')
          this.getConfigList()
        }
      })
    },
    setConfig() {
      if (!this.taskList || this.taskList.length === 0) {
        this.msgSuccess('任务不能为空')
        return
      }
      this.$refs['digform'].validate(valid => {
        if (valid) {
          this.digform.operator = this.digform.operator || this.$store.state.user.name
          this.digform.status = String(this.digform.status) ? this.digform.status : 0
          this.taskList.forEach(item => {
            item.activityId = this.digform.activityId
          })
          const params = {
            activityInfo: this.digform,
            taskList: this.taskList
          }
          console.log('当前用户名', params)
          API.insert(params).then(response => {
            if (response.code == 200) {
              this.msgSuccess(this.$t('common.operationSucceed'))
              this.getConfigList()
              this.cancel()
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    },
    copy(row) {
      const temp = Object.assign({}, row)
      temp.status = ''
      temp.activityId = ''
      this.update(temp, row.activityId)
    },
    async previewGetTaskList(row) {
      const { data = [] } = await API.detail({ activityId: row.activityId || activityId })
      const list = ['banners', 'ruleDesks', 'desks', 'bottomActivity', 'sharePosters']
      list.forEach(item => {
        if (!row[item]) {
          row[item] = {
            zh_CN: '',
            en_US: '',
            ja_JP: '',
            ko_KR: ''
          }
        } else if (typeof row[item] === 'string') {
          row[item] = JSON.parse(row[item])
        }
      })
      data.forEach(item => {
        if (!item.taskTarget) {
          item.taskTarget = {
            zh_CN: '',
            en_US: '',
            ja_JP: '',
            ko_KR: ''
          }
        } else if (typeof item.taskTarget === 'string') {
          item.taskTarget = JSON.parse(item.taskTarget)
        }
      })
      this.taskList = data
      this.previewShow = true
    },
    async update(row, activityId) {
      const temp = Object.assign({}, row)
      if (+new Date() > temp.startTime && !activityId) {
        this.msgSuccess('活动已经开始，不能修改')
        return
      }
      if (row.status == 1) {
        this.msgSuccess('活动已经上线，不能修改')
        return
      }
      const { data = [] } = await API.detail({ activityId: temp.activityId || activityId })
      const list = ['banners', 'ruleDesks', 'desks', 'bottomActivity', 'sharePosters']
      list.forEach(item => {
        if (!temp[item]) {
          temp[item] = {
            zh_CN: '',
            en_US: '',
            ja_JP: '',
            ko_KR: ''
          }
        } else if (typeof temp[item] === 'string') {
          temp[item] = JSON.parse(temp[item])
        }
      })
      data.forEach(item => {
        if (!item.taskTarget) {
          item.taskTarget = {
            zh_CN: '',
            en_US: '',
            ja_JP: '',
            ko_KR: ''
          }
        } else if (typeof item.taskTarget === 'string') {
          item.taskTarget = JSON.parse(item.taskTarget)
        }
      })
      this.taskList = data
      this.digform = temp
      this.open = true
    },
    // 图片上传
    upload(data) {
      console.log('图片大小', data)
      if (data.file.size > 500 * 1024) {
        this.$message.warning('图片大小不能超过500k')
        return
      }
      upload({ file: data.file }).then(res => {
        if (res.code === 200) {
          const arr = data.data.property.split('.')
          if (arr && arr.length > 0) {
            let form = this[arr[0]]
            arr.forEach(item => {
              if (typeof form[item] === 'object') {
                form = form[item]
              } else {
                form[item] = res.data.fullPath
              }
            })
          }
          this.$message.success(this.$t('common.uploadSucceeded'))
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.table {
  margin-top: 20px;
}
.form-grid {
  display: grid;
  grid-template-columns: 50% 50%;
  margin-left: 5%;
  .grid-item {
    width: 90%;
  }
}
// .form-grid-task {
//   display: grid;
//   grid-template-columns: 50% 50%;
//   margin-left: 5%;
//   .grid-item {
//    width: 70%;
//   }
// }
.upload-demo {
  float: left;
  width: 100%;
}
.tasktable {
  width: 500px;
  margin: 20px auto;
  display: flex;
  & > div {
    border: 1px solid #c0cfda;
    width: 50%;
    text-align: center;
    padding: 10px;
    span {
      margin: 10px;
      cursor: pointer;
    }
  }
}
</style>
