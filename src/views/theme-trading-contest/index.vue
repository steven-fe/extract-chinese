<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="交易赛主题:" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入交易赛主题" size="mini" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="handleQuery">查找</el-button>
        <el-button type="primary" size="mini" @click="handleCreate">创建</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="dataList" border>
      <el-table-column fixed :label="$t('common.operation')" align="center" min-width="300">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleJumpTransactionData(scope.row)">查看交易数据</el-button>
          <el-button size="mini" type="primary" @click="handleView(scope.row)">查看</el-button>
          <el-button size="mini" type="primary" :disabled="scope.row.competitionState !== 0" @click="handleEdit(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
      <el-table-column label="交易赛主题" align="center" prop="competitionName" min-width="150" />
      <el-table-column label="交易赛链接" align="center" prop="competitionUrl" min-width="200" />
      <el-table-column label="现货有效币对" align="center" prop="instrumentList	" min-width="150">
        <template slot-scope="scope">
          <span v-if="scope.row.instrumentList && scope.row.instrumentList.length <= 1">{{ scope.row.instrumentList.join(',') }}</span>
          <span v-if="scope.row.instrumentList && scope.row.instrumentList.length > 1">
            <el-popover
              placement="top-start"
              width="150"
              trigger="hover"
            >
              <ul v-for="(item, index) in scope.row.instrumentList" :key="index">
                <li>{{ item }}</li>
              </ul>
              <el-button slot="reference" size="mini">{{ scope.row.instrumentList.length }}</el-button>
            </el-popover>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="合约有效币对" align="center" prop="contractList" min-width="150">
        <template slot-scope="scope">
          <span v-if="scope.row.contractList && scope.row.contractList.length <= 1">{{ scope.row.contractList.join(',') }}</span>
          <span v-if="scope.row.contractList && scope.row.contractList.length > 1">
            <el-popover
              placement="top-start"
              width="150"
              trigger="hover"
            >
              <ul v-for="(item, index) in scope.row.contractList" :key="index">
                <li>{{ item }}</li>
              </ul>
              <el-button slot="reference" size="mini">{{ scope.row.contractList.length }}</el-button>
            </el-popover>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="当前状态" align="center" prop="competitionState" min-width="150">
        <template slot-scope="scope">
          <span v-for="item in competitionStateOptions" :key="item.value">
            <span v-if="scope.row.competitionState === item.value">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog :title="dialogTitle" :visible.sync="open" :close-on-click-modal="false" width="560px" @closed="handleDialogClosed">
      <el-form ref="form" :model="form" label-position="left" label-width="120px" :disabled="isDisabled" :rules="rules">
        <el-form-item label="交易赛主题" prop="competitionName">
          <el-input v-model="form.competitionName" type="text" maxlength="20" show-word-limit clearable placeholder="请输入交易赛主题,最大20个字符" />
        </el-form-item>
        <el-form-item label="现货有效币对" prop="instrumentNameList">
          <el-select v-model="form.instrumentNameList" filterable style="display:block;" multiple :placeholder="$t('common.pleaseChoose')" @change="handleSelectSpotSymbol">
            <div style="padding: 0 20px;line-height:34px" :class="$style.option">
              <el-checkbox v-model="checkAll" @change="handleSpotCheckAll">全部</el-checkbox>
              <el-tooltip effect="dark" content="现货和合约有效交易币对，一共只能选择一个默认跳转币对。" placement="top">
                <span :class="$style.jumpText">默认跳转 <i class="el-icon-info" /></span>
              </el-tooltip>
            </div>
            <el-option v-for="item in spotSymbolList" :key="item.instrumentId" :label="item.name" :value="item.name" :class="$style.option">
              <el-checkbox-group v-model="form.instrumentNameList">
                <el-checkbox style="pointer-events: none;" :label="item.name" />
              </el-checkbox-group>
              <span v-if="form.instrumentNameList && form.instrumentNameList.includes(item.name)">
                <div style="padding:0 20px;color:#606266;event-pointer:cursor;" @click="handleSelectDefaultSymbol(item.name)">
                  <span v-if="form.defaultSymbolType === 'spot' && form.defaultSymbol === item.name"><i class="el-icon-star-on" /></span>
                  <span v-else><i class="el-icon-star-off" /></span>
                </div>
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="合约有效币对" prop="contractNameList">
          <el-select v-model="form.contractNameList" filterable style="display:block;" multiple :placeholder="$t('common.pleaseChoose')" @change="handleSelectContractSymbol">
            <div style="padding: 0 20px;line-height:34px" :class="$style.option">
              <el-checkbox v-model="checkContractAll" @change="handleContractCheckAll">全部</el-checkbox>
              <el-tooltip effect="dark" content="现货和合约有效交易币对，一共只能选择一个默认跳转币对。" placement="top">
                <span :class="$style.jumpText">默认跳转 <i class="el-icon-info" /></span>
              </el-tooltip>
            </div>
            <el-option v-for="item in contractSymbolList" :key="item.contractId" :label="item.name" :value="item.name" :class="$style.option">
              <el-checkbox-group v-model="form.contractNameList">
                <el-checkbox style="pointer-events: none" :label="item.name" />
              </el-checkbox-group>
              <span v-if="form.contractNameList && form.contractNameList.includes(item.name)">
                <div style="padding:0 20px;color:#606266;event-pointer:cursor;" @click="handleSelectDefaultContractSymbol(item.name)">
                  <span v-if="form.defaultSymbolType === 'contract' && form.defaultSymbol === item.name"><i class="el-icon-star-on" /></span>
                  <span v-else><i class="el-icon-star-off" /></span>
                </div>
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.defaultSymbol" label="默认跳转币对">{{ form.defaultSymbol }} ({{ form.defaultSymbolType }})</el-form-item>
        <el-form-item label="预热期" prop="preheatTime">
          <el-date-picker
            v-model="form.preheatTime"
            clearable
            format="yyyy-MM-dd HH:mm:ss"
            type="datetimerange"
            :start-placeholder="$t('common.startDate')"
            :range-separator="$t('common.toTime')"
            :end-placeholder="$t('common.endTime')"
            value-format="timestamp"
          />
        </el-form-item>
        <el-form-item label="交易期" prop="transactionTime">
          <el-date-picker
            v-model="form.transactionTime"
            clearable
            format="yyyy-MM-dd HH:mm:ss"
            type="datetimerange"
            :start-placeholder="$t('common.startDate')"
            :range-separator="$t('common.toTime')"
            :end-placeholder="$t('common.endTime')"
            value-format="timestamp"
          />
        </el-form-item>
        <el-form-item label="获奖用户审核期" prop="examineTime">
          <el-date-picker
            v-model="form.examineTime"
            clearable
            format="yyyy-MM-dd HH:mm:ss"
            type="datetimerange"
            :start-placeholder="$t('common.startDate')"
            :range-separator="$t('common.toTime')"
            :end-placeholder="$t('common.endTime')"
            value-format="timestamp"
          />
        </el-form-item>
        <el-form-item label="发奖期" prop="sendAwardTime">
          <el-date-picker
            v-model="form.sendAwardTime"
            clearable
            format="yyyy-MM-dd HH:mm:ss"
            type="datetimerange"
            :start-placeholder="$t('common.startDate')"
            :range-separator="$t('common.toTime')"
            :end-placeholder="$t('common.endTime')"
            value-format="timestamp"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">{{$t('common.cancel')}}</el-button>
        <el-button v-if="dialogType !== 'view'" type="primary" @click="handleSubmit">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { addTradingContest, editTradingContest, getTradingContestDetail, getTradingContestList } from '@/api/theme-trading-contest'
import { getSpotSymbolList, getContactSymbolList } from '@/api/trading-contest'
export default {
  name: 'ThemeTradingContest',
  data() {
    const checkPreheatTime = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请选择日期时间'))
      } else {
        if (value[0] < new Date().getTime()) {
          return callback(new Error('预热期的开始时间不能早于当前时间'))
        }
        if (this.form.transactionTime) {
          if (value[1] >= this.form.transactionTime[0]) {
            return callback(new Error('预热期的结束时间需小于交易期的开始时间'))
          } else {
            return callback()
          }
        }
      }
    }
    const checkTransactionTime = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请选择日期时间'))
      } else {
        if (this.form.preheatTime) {
          if (value[0] <= this.form.preheatTime[1]) {
            return callback(new Error('交易期的开始时间需大于预热期的结束时间'))
          }
        }
        if (this.form.examineTime) {
          if (value[1] >= this.form.examineTime[0]) {
            return callback(new Error('交易期的结束时间需小于获奖用户审核期的开始时间'))
          } else {
            return callback()
          }
        }
      }
    }
    const checkExamineTime = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请选择日期时间'))
      } else {
        if (this.form.transactionTime) {
          if (value[0] <= this.form.transactionTime[1]) {
            return callback(new Error('获奖用户审核期的开始时间需大于交易期的结束时间'))
          }
        }
        if (this.form.sendAwardTime) {
          if (value[1] >= this.form.sendAwardTime[0]) {
            return callback(new Error('获奖用户审核期的结束时间需小于发奖期的开始时间'))
          } else {
            return callback()
          }
        }
      }
    }
    const checkSendAwardTime = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请选择日期时间'))
      } else {
        if (this.form.examineTime) {
          if (value[0] <= this.form.examineTime[1]) {
            return callback(new Error('发奖期的开始时间需大于获奖用户审核期的结束时间'))
          } else {
            return callback()
          }
        }
      }
    }
    return {
      id: '',
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      dataList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: ''
      },
      dialogTitle: '',
      form: {
        competitionName: '',
        defaultSymbol: '',
        defaultSymbolType: '', // 默认跳转币对类型 1 现货 2 合约
        instrumentNameList: [],
        contractNameList: [],
        preheatTime: [], // 预热期
        transactionTime: [], // 交易期
        examineTime: [], // 获奖用户审核期
        sendAwardTime: [] // 发奖期
      },
      competitionStateOptions: [
        { value: 0, label: this.$t('earn.unStart') },
        { value: 1, label: '预热期' },
        { value: 2, label: '交易期' },
        { value: 3, label: '审核期' },
        { value: 4, label: '发奖期' },
        { value: 5, label: '已结束' }
      ],
      open: false,
      spotSymbolList: [],
      contractSymbolList: [],
      symbolType: '',
      checkAll: false,
      checkContractAll: false,
      contractSymbolNameList: [],
      spotIdsList: [],
      instrumentIdList: [],
      tradingId: '',
      contractIdList: [],
      isDisabled: false,
      dialogType: '', // create 创建， edit 修改， view 查看
      rules: {
        competitionName: [{ required: true, message: '请输入交易赛主题', trigger: 'blur' }],
        instrumentNameList: [{ required: true, message: '请选择现货有效币对', trigger: 'change' }],
        contractNameList: [{ required: true, message: '请选择合约有效币对', trigger: 'change' }],
        preheatTime: [
          { required: true, validator: checkPreheatTime, trigger: 'blur' },
          { required: true, message: '请选择日期时间', trigger: 'blur' }
        ],
        transactionTime: [
          { required: true, validator: checkTransactionTime, trigger: 'blur' },
          { required: true, message: '请选择日期时间', trigger: 'blur' }
        ],
        examineTime: [
          { required: true, validator: checkExamineTime, trigger: 'blur' },
          { required: true, message: '请选择日期时间', trigger: 'blur' }
        ],
        sendAwardTime: [
          { required: true, validator: checkSendAwardTime, trigger: 'blur' },
          { required: true, message: '请选择日期时间', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.loading = true
      const { rows, total } = await getTradingContestList(this.queryParams)
      this.dataList = rows
      this.total = total
      this.loading = false
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    async getTradingCompetitionDetail() {
      await getTradingContestDetail({ id: this.id }).then(res => {
        if (res.code === 200) {
          this.tradingId = res.data.id
          this.form = res.data
          if (this.form.contractNameList.length === this.contractSymbolList.length) {
            this.checkContractAll = true
          }
          if (res.data.defaultSymbolType === 1) {
            this.form.defaultSymbolType = 'spot'
          }
          if (res.data.defaultSymbolType === 2) {
            this.form.defaultSymbolType = 'contract'
          }
          this.$set(this.form, 'preheatTime', [res.data.preStart, res.data.preEnd])
          this.$set(this.form, 'transactionTime', [res.data.tradeStart, res.data.tradeEnd])
          this.$set(this.form, 'examineTime', [res.data.authStart, res.data.authEnd])
          this.$set(this.form, 'sendAwardTime', [res.data.rewardStart, res.data.rewardEnd])
        }
      })
    },
    handleCreate() {
      this.isDisabled = false
      this.dialogType = 'create'
      this.dialogTitle = '添加交易赛'
      this.open = true
      this.getSpotSymbolList()
      this.getContactSymbolList()
    },
    handleView(row) {
      this.getSpotSymbolList()
      this.getContactSymbolList()
      this.id = row.id
      this.isDisabled = true
      this.dialogType = 'view'
      this.open = true
      this.getTradingCompetitionDetail()
      this.dialogTitle = '查看交易赛'
    },
    async getSpotSymbolList() {
      const { data } = await getSpotSymbolList()
      const symbolList = data.filter(({ name: symbol }) => /usdt$/i.test(symbol))
      this.spotSymbolList = symbolList
      const ids = []
      this.spotSymbolList.map(item => {
        ids.push(item.instrumentId)
      })
      this.spotIdsList = ids
    },
    async getContactSymbolList() {
      const { rows } = await getContactSymbolList()
      const data = rows
      const symbolList = data.filter(({ name: symbol }) => /usdt$/i.test(symbol))
      this.contractSymbolList = symbolList
    },
    getDefaultSymbol() {
      if (!this.form.defaultSymbol) {
        if (this.form.instrumentNameList.length) {
          const selectSpotSymbol = []
          this.spotSymbolList.map(item => {
            if (this.form.instrumentNameList.includes(item.name)) {
              selectSpotSymbol.push(item)
            }
          })
          const sortedSpotEffectiveSymbols = [...selectSpotSymbol].sort((symbol1, symbol2) => (this.spotIdsList.indexOf(symbol1) - this.spotIdsList.indexOf(symbol2)))
          this.form.defaultSymbol = sortedSpotEffectiveSymbols[0].name
          this.form.defaultSymbolType = 'spot'
        }
      }
    },
    handleSelectSpotSymbol(value) {
      if (this.form.defaultSymbolType === 'spot' && !value.includes(this.form.defaultSymbol)) {
        this.form.defaultSymbol = ''
        this.form.defaultSymbolType = ''
      }

      const checkedCount = value.length
      this.checkAll = checkedCount === this.spotSymbolList.length
    },
    handleSelectDefaultSymbol(spotName) {
      event.stopPropagation()
      if (this.form.defaultSymbol === '') {
        this.form.defaultSymbol = spotName
        this.form.defaultSymbolType = 'spot'
      } else {
        if (this.form.defaultSymbol !== spotName) {
          this.form.defaultSymbol = spotName
          this.form.defaultSymbolType = 'spot'
        } else {
          this.form.defaultSymbol = ''
          this.form.defaultSymbolType = ''
        }
      }
    },
    handleSelectDefaultContractSymbol(contractName) {
      event.stopPropagation()
      if (this.form.defaultSymbol === '') {
        this.form.defaultSymbol = contractName
        this.form.defaultSymbolType = 'contract'
      } else {
        if (this.form.defaultSymbol !== contractName) {
          this.form.defaultSymbol = contractName
          this.form.defaultSymbolType = 'contract'
        } else {
          this.form.defaultSymbol = ''
          this.form.defaultSymbolType = ''
        }
      }
    },
    handleSelectContractSymbol(value) {
      if (this.form.defaultSymbolType === 'contract' && !value.includes(this.form.defaultSymbol)) {
        this.form.defaultSymbol = ''
        this.form.defaultSymbolType = ''
      }
      const checkedCount = value.length
      this.checkContractAll = checkedCount === this.contractSymbolList.length
    },
    handleSpotCheckAll(val) {
      const data = this.spotSymbolList.map(item => {
        return item.name
      })
      this.form.instrumentNameList = val ? data : []
    },
    handleDialogClosed() {
      this.form.defaultSymbol = ''
      this.checkContractAll = false
      this.spotSymbolList = []
      this.contractSymbolList = []
      this.$refs['form'].resetFields()
      this.open = false
    },
    handleContractCheckAll(val) {
      const data = this.contractSymbolList.map(item => {
        return item.name
      })
      this.form.contractNameList = val ? data : []
    },
    handleJumpTransactionData(row) {
      this.$router.push({ name: 'transactionData', query: { id: row.id }})
    },
    handleEdit(row) {
      this.getSpotSymbolList()
      this.getContactSymbolList()
      this.id = row.id
      this.isDisabled = false
      this.dialogType = 'edit'
      this.dialogTitle = '编辑交易赛'
      this.open = true
      this.getTradingCompetitionDetail()
    },
    handleSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.getDefaultSymbol()
          if (this.form.defaultSymbolType === 'spot') {
            this.symbolType = 1
          }
          if (this.form.defaultSymbolType === 'contract') {
            this.symbolType = 2
          }
          const contractSymbolList = []
          this.contractSymbolList.map(item => {
            if (this.form.contractNameList.includes(item.name)) {
              contractSymbolList.push(item.name)
            }
          })
          this.contractSymbolNameList = contractSymbolList
          if (this.dialogType === 'create') {
            const params = {
              competitionName: this.form.competitionName,
              preStart: this.form.preheatTime[0],
              preEnd: this.form.preheatTime[1],
              tradeStart: this.form.transactionTime[0],
              tradeEnd: this.form.transactionTime[1],
              authStart: this.form.examineTime[0],
              authEnd: this.form.examineTime[1],
              rewardStart: this.form.sendAwardTime[0],
              rewardEnd: this.form.sendAwardTime[1],
              defaultSymbol: this.form.defaultSymbol,
              defaultSymbolType: this.symbolType,
              instrumentNameList: this.form.instrumentNameList,
              contractNameList: this.contractSymbolNameList
            }
            addTradingContest(params).then(res => {
              if (res.code === 200) {
                this.getList()
                this.handleDialogClosed()
                this.msgSuccess('添加成功')
              } else {
                this.msgError(res.msg)
              }
            })
          } else {
            const params = {
              competitionName: this.form.competitionName,
              preStart: this.form.preheatTime[0],
              preEnd: this.form.preheatTime[1],
              tradeStart: this.form.transactionTime[0],
              tradeEnd: this.form.transactionTime[1],
              authStart: this.form.examineTime[0],
              authEnd: this.form.examineTime[1],
              rewardStart: this.form.sendAwardTime[0],
              rewardEnd: this.form.sendAwardTime[1],
              defaultSymbol: this.form.defaultSymbol,
              defaultSymbolType: this.symbolType,
              instrumentNameList: this.form.instrumentNameList,
              contractNameList: this.contractSymbolNameList,
              id: this.tradingId
            }
            editTradingContest(params).then(res => {
              if (res.code === 200) {
                this.getList()
                this.handleDialogClosed()
                this.msgSuccess('修改成功')
              } else {
                this.msgError(res.msg)
              }
            })
          }
        }
      })
    }
  }
}
</script>
<style lang="scss" module>
.option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  &:after {
    display: none;
  }
}
.jumpText {
  font-size: 14px;
  color: #606266;
}
</style>
