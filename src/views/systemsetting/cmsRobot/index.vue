<template>
  <div class="cmsRobot">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="币对:">
        <el-select v-model="formInline.symbol" :placeholder="$t('common.pleaseChoose')" filterable>
          <el-option
            v-for="item in symbols"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="做市状态:">
        <el-select v-model="formInline.status" :placeholder="$t('common.all')">
          <el-option
            v-for="item in status"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="刷量状态:">
        <el-select v-model="formInline.robotStatus" :placeholder="$t('common.all')">
          <el-option
            v-for="item in robotList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="做市账户">
        <el-input
          v-model="formInline.account"
          placeholder="账户UID"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
      </el-form-item>
    </el-form>
    <div class="addSetting">
      <el-button type="primary" @click="addSetting">+添加配置</el-button>
    </div>
    <!-- table -->
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column fixed="left" :label="$t('common.operation')" width="250">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="edie(scope.row,'edie')"
          >修改</el-button>
          <el-button
            :type="computedButtonStyle(scope.row).buttonStyle"
            size="small"
            @click="startQuantify(computedButtonStyle(scope.row), scope.row.id)"
          >{{ computedButtonStyle(scope.row).buttonText }}</el-button>
          <el-button
            :type="scope.row.quantifyState === 1 ? 'info' : 'danger'"
            size="small"
            @click="delateRow(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="symbol" label="交易对" />
      <el-table-column prop="makeUserIds" label="做市账户UID" />
      <el-table-column prop="makeState" label="做市状态">
        <template slot-scope="scope">
          <span>{{ scope.row.makeState === 1 ? '开启' : '关闭' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="quantifyState" label="刷量状态">
        <template slot-scope="scope">
          <span>{{ scope.row.quantifyState === 1 ? '开启' : '关闭' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="minAmt"
        label="单次刷量下限金额(U)"
      />
      <el-table-column
        prop="maxAmt"
        label="单次刷量上限金额(U)"
      />
      <el-table-column label="刷量时间间隔(S)">
        <template slot-scope="scope">
          <span>{{ scope.row.minTime }}～{{ scope.row.maxTime }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="minDayAmt"
        label="24H刷量下限金额(U)"
      />
      <el-table-column
        prop="maxDayAmt"
        label="24H刷量上限金额(U)"
      />
    </el-table>
    <div class="pageNationBox">
      <el-pagination
        :current-page="currentPage"
        :background="true"
        :page-sizes="[10, 20]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <el-dialog
      title="刷量配置"
      :visible.sync="dialogFormVisible"
      @closed="resetDialogForm"
    >
      <el-form
        ref="digform"
        :model="dialogForm"
        :label-position="labelPosition"
        :rules="rules"
      >
        <div class="flex-box">
          <el-form-item label="币对:" :label-width="formLabelWidth" prop="coin">
            <el-select
              v-model="dialogForm.coin"
              :placeholder="$t('common.pleaseChoose')"
              filterable
            >
              <el-option
                v-for="item in symbolsNew"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="做市状态:"
            :label-width="formLabelWidth"
            class="mr95"
          >
            <span>{{ symbolState === 1 ? '开启' : '关闭' }}</span>
          </el-form-item>
        </div>
        <div class="flex-box">
          <el-form-item :label-width="formLabelWidth" prop="robotStatus">
            <span
              slot="label"
            ><span>刷量状态</span><span class="leftTip">做市状态先开启，才能开启刷量</span></span>
            <el-select v-model="dialogForm.robotStatus" :placeholder="$t('common.pleaseChoose')">
              <el-option
                v-for="item in robotListNew"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="刷量时间间隔:"
            label-width="40px"
            class="mr10"
            required
          >
            <el-col :span="11">
              <el-form-item prop="lowInterval">
                <el-input
                  v-model="dialogForm.lowInterval"
                  autocomplete="off"
                  placeholder="下限"
                  class="timeInput1"
                >
                  <span slot="append">秒</span></el-input>
              </el-form-item>
            </el-col>
            <el-col class="line" :span="2">-</el-col>
            <el-col :span="11">
              <el-form-item prop="topInterval">
                <el-input
                  v-model="dialogForm.topInterval"
                  autocomplete="off"
                  placeholder="上限"
                  class="timeInput1"
                >
                  <span slot="append">秒</span>
                </el-input>
              </el-form-item>
            </el-col>
          </el-form-item>
        </div>
        <div class="flex-box">
          <el-form-item
            label="单次下单金额下限:"
            :label-width="formLabelWidth"
            prop="lowLimit"
          >
            <el-input
              v-model="dialogForm.lowLimit"
              autocomplete="off"
              placeholder="请输入大于0的数字"
              class="timeInput2"
            ><span slot="append">USDT</span></el-input>
          </el-form-item>
          <el-form-item
            label="单次下单金额上限:"
            :label-width="formLabelWidth"
            class="mr97"
            prop="topLimit"
          >
            <el-input
              v-model="dialogForm.topLimit"
              autocomplete="off"
              placeholder="请输入大于0的数字"
              class="timeInput2"
            ><span slot="append">USDT</span></el-input>
          </el-form-item>
        </div>
        <div class="flex-box">
          <el-form-item label="24H刷量下限金额" :label-width="formLabelWidth">
            <span>{{ num1 }} USDT</span>
          </el-form-item>
          <el-form-item
            label="24H刷量上限金额"
            :label-width="formLabelWidth"
            style="margin-left:95px"
          >
            <span>{{ num2 }} USDT</span>
          </el-form-item>
        </div>
        <el-form-item label="报警时间间隔:" prop="time">
          <el-input
            v-model="dialogForm.time"
            autocomplete="off"
            placeholder="请输入大于0的正整数"
            class="timeInput"
          ><span slot="append">分钟</span></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="add">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogVisible2" width="30%">
      <span
        class="flex-box1"
      ><i
        class="el-notification__icon el-icon-success"
        style="color:#67c23a"
      /><span style="margin-left:10px">确定删除改刷量机器人？</span></span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2 = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="sureDelate">{{$t('common.sure')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getRobotList,
  delateData,
  changeRobotState,
  getSymbolState,
  addInfo,
  updateLog
} from '@/api/systemsetting/cmsRobot.js'
import { getPairList } from '@/api/systemsetting/common.js'
import BigNumber from 'bignumber.js'
export default {
  name: 'CmsRobot',
  data() {
    // 刷量时间间隔 下限
    const lowIntervalRule = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入刷量时间间隔下限'))
      } else if (!/(^[1-9]\d*$)/.test(value)) {
        callback(new Error('请输入正整数'))
      } else if (value > 300) {
        callback(new Error('时间间隔不能大于300'))
        // Number(value) >= Number(this.dialogForm.topInterval)
      } else if (
        new BigNumber(value).gte(this.dialogForm.topInterval) &&
        this.dialogForm.topInterval
      ) {
        callback(new Error('下限需要小于上限'))
      } else {
        callback()
      }
    }
    const topIntervalRule = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入刷量时间间隔上限'))
      } else if (!/(^[1-9]\d*$)/.test(value)) {
        callback(new Error('请输入正整数'))
      } else if (value > 300) {
        callback(new Error('时间间隔不能大于300'))
        // Number(value) <= Number(this.dialogForm.lowInterval)
      } else if (
        this.dialogForm.lowInterval &&
        (new BigNumber(value).lte(this.dialogForm.lowInterval))
      ) {
        callback(new Error('上限需要大于上限'))
      } else {
        callback()
      }
    }

    const lowLimitRule = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入正确数字'))
      } else if (!/^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/.test(value)) {
        callback(new Error('请输入大于0的数字'))
      } else if (!/^0\.(\d{1,4})$|^[1-9]\d{0,8}\.\d{0,2}$|^[1-9]\d{0,8}$/.test(value)) {
        callback(new Error('数值精度最多为4'))
        // Number(value)>=Number(this.dialogForm.topLimit)
      } else if (this.dialogForm.topLimit && new BigNumber(value).gte(this.dialogForm.topLimit)) {
        callback(new Error('单次下单金额下限需要小于单次下单金额上限'))
      } else {
        callback()
      }
    }

    const topLimitRule = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入正确数字'))
      } else if (!/^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/.test(value)) {
        callback(new Error('请输入大于0的数字'))
      } else if (!/^0\.(\d{1,4})$|^[1-9]\d{0,8}\.\d{0,2}$|^[1-9]\d{0,8}$/.test(value)) {
        callback(new Error('数值精度最多为4'))
        // Number(value)<=Number(this.dialogForm.lowLimit)
      } else if (this.dialogForm.lowLimit && new BigNumber(value).lte(this.dialogForm.lowLimit)) {
        callback(new Error('单次下单金额上限需要大于单次下单金额下限'))
      } else {
        callback()
      }
    }

    const timeInputRule = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入报警间隔时间'))
      } else if (!/(^[1-9]\d*$)/.test(value)) {
        callback(new Error('请输入正整数'))
      } else {
        callback()
      }
    }

    return {
      symbols: [], // 币对list
      symbolsNew: [],
      status: [
        {
          label: this.$t('common.all'),
          value: ''
        },
        {
          label: '开启',
          value: 1
        },
        {
          label: '关闭',
          value: 2
        }
      ], // 做市状态list
      robotList: [
        {
          label: this.$t('common.all'),
          value: ''
        },
        {
          label: '开启',
          value: 1
        },
        {
          label: '关闭',
          value: 2
        }
      ], // 刷量list

      formInline: {
        symbol: '', // 币对
        status: '', // 做市状态
        robotStatus: '', // 刷量状态
        account: '' // 做市账户
      },
      dialogForm: {
        coin: '', // 当前币对
        robotStatus: 2, // 刷量状态
        lowLimit: '', // 下单下限
        topLimit: '', // 下单上限
        topInterval: '', // 刷量上限
        lowInterval: '', // 刷量下限
        time: '' // 报警时间间隔
      },
      tableData: [],
      edieId: null,
      pageSize: 10, //
      total: 0,
      currentPage: 1, // 当前页数
      formLabelWidth: '120px',
      dialogFormVisible: false,
      labelPosition: 'top',
      dialogVisible2: false,
      currentId: null,
      symbolState: 0,
      dialogType: '',
      rules: {
        coin: [{ required: true, message: '请选择币对', trigger: 'change' }],
        robotStatus: [
          { required: true, message: '请选择刷量状态', trigger: 'change' }
        ],
        lowInterval: [
          { required: true, validator: lowIntervalRule, trigger: 'blur' }
        ],
        topInterval: [
          { required: true, validator: topIntervalRule, trigger: 'blur' }
        ],
        lowLimit: [
          { required: true, validator: lowLimitRule, trigger: 'blur' }
        ],
        topLimit: [
          { required: true, validator: topLimitRule, trigger: 'blur' }
        ],
        time: [{ required: true, validator: timeInputRule, trigger: 'blur' }]
      }
    }
  },
  computed: {
    robotListNew() {
      const data = [{ label: '开启', value: 1 }, { label: '关闭', value: 2 }]
      if (this.symbolState === 1) {
        return data
      } else {
        return data.filter((item) => item.value === 2)
      }
    },
    // 24H刷量下限金额
    num1() {
      // 24H刷量下限金额=单次刷量下限金额×24H刷量次数。
      // 24H刷量次数=每小时刷量次数上限×24=(3600÷刷量时间间隔下限)×24
      let value = 0
      if (!this.dialogForm.topInterval || !this.dialogForm.lowLimit) {
        return value
      }
      const times = new BigNumber(3600)
        .dividedBy(this.dialogForm.lowInterval)
        .multipliedBy(24)
      value = new BigNumber(this.dialogForm.lowLimit)
        .multipliedBy(times)
        .toFixed(2)
      return value
    },
    num2() {
      let value = 0
      if (!this.dialogForm.topInterval || !this.dialogForm.topLimit) {
        return value
      }
      const times = new BigNumber(3600)
        .dividedBy(this.dialogForm.lowInterval)
        .multipliedBy(24)
      value = new BigNumber(this.dialogForm.topLimit)
        .multipliedBy(times)
        .toFixed(2)
      return value
    }
  },
  watch: {
    'dialogForm.coin'(val) {
      val &&
        getSymbolState({ instrumentId: val }).then((res) => {
          if (res.code === 200) {
            this.symbolState = res.data
          }
        })
    }
  },
  created() {
    this.getSymbolList()
    this.getTableData()
  },
  methods: {
    // 刷量按钮的状态样式
    computedButtonStyle(row) {
      if (row.quantifyState === 1) {
        // 做市账号的刷量状态为”开启“，才显示此操作
        return {
          buttonStyle: 'danger',
          buttonText: '关闭刷量'
        }
      } else if (row.quantifyState === 2 || !row.quantifyState) {
        // 做市账号的刷量状态为”关闭“，才显示此操作
        if (row.makeState === 2 || !row.makeState) {
          // 做市状态未开启
          return {
            buttonStyle: 'info',
            buttonText: '开启刷量'
          }
        } else {
          return {
            buttonStyle: 'success',
            buttonText: '开启刷量'
          }
        }
      }
    },
    startQuantify(data, id) {
      if (data.buttonStyle === 'info') {
        this.$message.error('请先开启做市后，再开启刷量')
        return
      }
      const params = {
        id,
        quantifyState: data.buttonStyle === 'success' ? 1 : 2
      }
      changeRobotState(params).then((res) => {
        if (res.code === 200) {
          this.$message({
            message: this.$t('common.operationSucceed'),
            type: 'success'
          })
          this.getTableData()
        } else {
          this.$message.error('操作失败')
        }
      })
    },
    delateRow(row) {
      if (row.quantifyState === 1) {
        this.$message.error('请先关闭刷量后，再删除机器人')
      } else {
        this.currentId = row.id
        this.dialogVisible2 = true
      }
    },
    sureDelate() {
      delateData(this.currentId)
        .then((res) => {
          if (res.code === 200) {
            this.$message({
              message: '删除成功',
              type: 'success'
            })
            this.dialogVisible2 = false
            this.currentId = null
            this.getTableData()
          } else {
            this.$message.error('删除失败')
          }
        })
        .catch((err) => {
          this.$message.error('删除失败')
        })
    },
    // 提交查询
    onSubmit() {
      this.getTableData()
    },
    // 获取币对信息
    getSymbolList() {
      getPairList().then((res) => {
        if (res.code === 200) {
          this.symbolsNew = res.data
          this.symbols = [{ name: '全部', id: '' }].concat(res.data)
        }
      })
    },
    // 获取列表数据
    getTableData() {
      const data = {
        pageSize: this.pageSize,
        pageNum: this.currentPage,
        instrumentId: this.formInline.symbol,
        makeState: this.formInline.status,
        quantifyState: this.formInline.robotStatus,
        makeUserId: this.formInline.account
      }
      getRobotList(data)
        .then((res) => {
          if (res.code === 200) {
            this.tableData = res.rows
            this.total = res.total
          } else {
            this.tableData = []
            this.total = 0
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },
    // 添加配置
    addSetting() {
      this.dialogType = 'add'
      this.dialogFormVisible = true
    },
    add() {
      this.$refs['digform'].validate((valid) => {
        if (new BigNumber(this.dialogForm.lowLimit).gte(this.dialogForm.topLimit)) {
          this.$message.error('单次下单金额下限需要小于单次下单金额上限')
          return
        }
        if (valid) {
          if (this.dialogType === 'add') {
            const data = {
              instrumentId: this.dialogForm.coin,
              maxAmt: this.dialogForm.topLimit,
              minAmt: this.dialogForm.lowLimit,
              maxDayAmt: this.num2,
              minDayAmt: this.num1,
              minTime: this.dialogForm.lowInterval,
              maxTime: this.dialogForm.topInterval,
              alarmTime: this.dialogForm.time,
              quantifyState: this.dialogForm.robotStatus
            }
            addInfo(data)
              .then((res) => {
                if (res.code === 200) {
                  this.$message({
                    message: '增加成功',
                    type: 'success'
                  })
                  this.getTableData()
                  this.dialogFormVisible = false
                  this.resetDialogForm()
                } else {
                  this.$message.error('增加失败')
                }
              })
              .catch((err) => {
                this.$message.error(err)
              })
          } else {
            const data = {
              id: this.edieId,
              instrumentId: this.dialogForm.coin,
              maxAmt: this.dialogForm.topLimit,
              minAmt: this.dialogForm.lowLimit,
              maxDayAmt: this.num2,
              minDayAmt: this.num1,
              minTime: this.dialogForm.lowInterval,
              maxTime: this.dialogForm.topInterval,
              alarmTime: this.dialogForm.time,
              quantifyState: this.dialogForm.robotStatus
            }
            updateLog(data).then(res => {
              if (res.code === 200) {
                this.$message({
                  message: '修改成功',
                  type: 'success'
                })
                this.getTableData()
                this.dialogFormVisible = false
                this.resetDialogForm()
              } else {
                this.$message.error('修改失败')
              }
            }).catch(err => {
              this.$message.error(err)
            })
          }
        }
      })
    },
    resetDialogForm() {
      this.dialogForm = {
        coin: '', // 当前币对
        robotStatus: 2, // 刷量状态
        lowLimit: '', // 下单下限
        topLimit: '', // 下单上限
        topInterval: '', // 刷量上限
        lowInterval: '', // 刷量下限
        num1: 0, // 24h下
        num2: 0, // 24h 上
        time: '' // 报警时间间隔
      }
    },
    // 修改
    edie(row, type) {
      this.dialogType = type
      this.edieId = row.id
      this.dialogForm = {
        coin: row.instrumentId, // 当前币对
        robotStatus: row.quantifyState, // 刷量状态
        lowLimit: row.minAmt, // 下单下限
        topLimit: row.maxAmt, // 下单上限
        topInterval: row.maxTime, // 刷量上限
        lowInterval: row.minTime, // 刷量下限
        time: row.alarmTime // 报警时间间隔
      }
      this.dialogFormVisible = true
    },
    handleSizeChange(val) {
      this.currentPage = 1
      this.pageSize = val
      this.getTableData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getTableData()
    }
  }
}
</script>

<style lang="scss" scoped>
.cmsRobot {
  padding: 20px;
  .addSetting {
    padding-bottom: 20px;
  }
  .pageNationBox {
    margin-top: 20px;
  }
  .flex-box {
    display: flex;
    ::v-deep .el-form-item {
      &:nth-child(2) {
        // margin-left: 20px;
      }
    }
  }
  .flex-box1 {
    display: flex;
    align-items: center;
  }
  .timeInput {
    width: 180px;
  }
  .timeInput1 {
    width: 180px;
  }
  .timeInput2 {
    width: 190px;
  }
  .leftTip {
    margin-left: 30px;
    color: #909399;
  }
  .mr95 {
    margin-left: 95px;
  }
  .mr97 {
    margin-left: 98px;
  }
  .mr10 {
    margin-left: 10px;
  }
}
</style>
