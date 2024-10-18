<template>
  <!-- 手续费变现 -->
  <div class="app-container">
    <el-form ref="queryForm" :inline="true" :model="queryParams">
      <el-form-item :label="$t('common.accountType')" prop="type">
        <el-select v-model="queryParams.type" filterable clearable size="mini" :placeholder="$t('common.all')">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.coin')" prop="currencyId">
        <el-select v-model="queryParams.currencyId" filterable clearable size="mini" :placeholder="$t('common.selectCurrency')">
          <el-option
            v-for="item in codeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="openState">
        <el-select v-model="queryParams.openState" filterable clearable size="mini" :placeholder="$t('common.all')">
          <el-option
            v-for="item in stateOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('common.query') }}</el-button>
      </el-form-item>
    </el-form>
    <!-- <el-button type="primary" size="mini" @click="transfer">手续费划转</el-button> -->
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="addCurrency">{{ $t('otc.text150') }}</el-button>
    <el-table
      ref="table"
      :data="dataList"
      border
    >
      <el-table-column
        :label="$t('common.operation')"
        align="center"
        width="400px"
      >
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.row)">{{ $t('common.modify') }}</el-button>
          <el-button v-if="scope.row.openState === 0" size="mini" type="success" @click="updateStatus(scope.row)">{{ $t('systemsetting.open') }}</el-button>
          <el-button v-else size="mini" type="danger" @click="updateStatus(scope.row)">{{ $t('usermanage.close') }}</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleted(scope.row)">{{ $t('common.delete') }}</el-button>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.coin')" align="center" prop="currencyName">
        <template slot-scope="scope">
          <span>{{ scope.row.currencyName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.status')" align="center" prop="openState">
        <template slot-scope="scope">
          {{ scope.row.openState ===0 ? $t('otc.text151') : $t('otc.text152') }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.accountType')" align="center" prop="type" width="200px">
        <template slot-scope="scope">
          <span v-if="scope.row.type === 1">{{ $t('financemanager.transactionFeeRealizationAccount') }}</span>
          <span v-if="(scope.row.type === 2)">{{ $t('financemanager.withdrawalFeeRealizationAccount') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.realizeTheAccountBalance')" align="center" prop="balance">
        <template slot-scope="scope">
          <span>{{ scope.row.balance }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.pendingOrderStrategy')" align="center" width="300">
        <template slot-scope="scope">
          <span>{{ $t('financemanager.pendingOrderStrategy',{tradeLevel: scope.row.tradeLevel, tradeRatio: scope.row.tradeRatio}) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.stopExecutionPolicy')" align="center" prop="tradeLimit" width="200px">
        <template slot-scope="scope">
          <span>{{ $t('financemanager.dropMoreThan') }} {{ scope.row.tradeLimit }} %</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.executedTimes')" align="center" prop="execTimes">
        <template slot-scope="scope">
          <span>{{ scope.row.execTimes }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.cumulativeAmountOfRealization')" align="center" prop="qty">
        <template slot-scope="scope">
          <span>{{ scope.row.qty }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('financemanager.cumulativeAmountOfRealization1')" align="center" prop="amt">
        <template slot-scope="scope">
          <span>{{ scope.row.amt }}</span>
        </template>
      </el-table-column>
    </el-table>

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
    <!-- 手续费划转弹窗 -->
    <el-dialog
      :title="$t('financemanager.commissionTransfer')"
      :visible.sync="open"
      width="50%"
    >
      <span>{{ $t('financemanager.AccountBalance101') }}</span>
      <div class="search" style=" margin-top:20px; ">
        <el-form ref="form" :inline="true" :model="forms" label-width="300px">
          <el-form-item>
            <el-button type="primary" size="mini" icon="el-icon-plus" @click="transferEdit(1)">{{ $t('financemanager.fullTransfer') }}</el-button>
          </el-form-item>
          <el-form-item label="">
            <el-input v-model="forms.currencyName" size="mini" :placeholder="$t('financemanager.pleaseEnterTheCurrency')" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList">{{ $t('common.seek') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table border style="width: 100%; margin-bottom:20px;" height="300" class="table cabin-table" :data="dialogTableData" @selection-change="handleSelectionChange">
        <el-table-column type="selection" :label="$t('usermanage.checkAll')" label-class-name="mySelection" width="100" align="center" />
        <el-table-column prop="currencyName" :label="$t('common.coin')" align="center" />
        <el-table-column prop="balance" :label="$t('financemanager.balance')" align="center" />
        <el-table-column :label="$t('common.operation')" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="transferEdit(2, scope.row.currencyId , scope.row.currencyName)">划转</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <!-- 添加变现币种弹窗 -->
    <el-dialog
      :title="$t('otc.text150')"
      :visible.sync="add"
      width="50%"
    >
      <el-tabs v-model="type" @tab-click="handleClick">
        <el-tab-pane
          :label="$t('financemanager.transactionFeeRealizationAccount')"
          name="1"
        >
          <div class="search">
            <el-form ref="form" :inline="true" :model="form">
              <el-form-item label="">
                <el-input v-model="form.currencyName" size="mini" :placeholder="$t('financemanager.pleaseEnterTheCurrency')" clearable />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="mini" icon="el-icon-search" @click="search">{{ $t('common.seek') }}</el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-table border style="width: 100%; margin-bottom:20px;" height="300" class="table cabin-table" :data="dialogData" @selection-change="handleSelectionChange">
            <el-table-column type="selection" :label="$t('usermanage.checkAll')" label-class-name="mySelection" width="100" align="center" />
            <el-table-column prop="currencyName" :label="$t('common.coin')" align="center" />
            <el-table-column prop="balance" :label="$t('financemanager.balance')" align="center" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane
          :label="$t('financemanager.withdrawalFeeRealizationAccount')"
          name="2"
        >
          <div class="search">
            <el-form ref="form" :inline="true" :model="form">
              <el-form-item label="">
                <el-input v-model="form.currencyName" size="mini" :placeholder="$t('financemanager.pleaseEnterTheCurrency')" clearable />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="mini" icon="el-icon-search" @click="search">{{ $t('common.seek') }}</el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-table border style="width: 100%; margin-bottom:20px;" height="300" class="table cabin-table" :data="dialogData" @selection-change="handleSelectionChange">
            <el-table-column type="selection" :label="$t('usermanage.checkAll')" label-class-name="mySelection" width="100" align="center" />
            <el-table-column prop="currencyName" :label="$t('common.coin')" align="center" />
            <el-table-column prop="balance" :label="$t('financemanager.balance')" align="center" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <div>
        <el-form ref="form" :inline="true" :model="form">
          <p>{{ $t('financemanager.liquidationStrategy') }}</p>
          <p>{{ $t('financemanager.marketOrderIsTheBest') }}
            <el-form-item>
              <el-input v-model="form.tradeLevel" clearable style="width:130px; top: -10px;" size="mini" />
            </el-form-item>
            {{ $t('financemanager.sumOfAllPendingOrdersInFile') }}
            <el-form-item>
              <el-input v-model="form.tradeRatio" clearable style="width:100px; top: -10px;" size="mini" />
            </el-form-item>
            %
          </p>
          <p>{{ $t('financemanager.dropMoreThan') }}
            <el-form-item>
              <el-input v-model="form.tradeLimit" clearable style="width:100px; top: -10px;" size="mini" />
            </el-form-item>
            % {{ $t('financemanager.stayOfExecution') }}
          </p>
        </el-form>
      </div>
      <div style="text-align: center;">
        <span
          slot="footer"
          class="dialog-footer"
          center:true
        >
          <el-button @click="add = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleAdd">{{ $t('common.Confirm') }}</el-button>
        </span>
      </div>
    </el-dialog>
    <!-- 修改按钮弹窗 -->
    <el-dialog
      :title="$t('financemanager.modifyTheLiquidationPolicy')"
      :visible.sync="appear"
      width="50%"
    >
      <div>
        <el-form ref="editForm" :inline="true" :model="editForms">
          <p>{{ $t('financemanager.marketOrderIsTheBest') }}
            <el-form-item>
              <el-input v-model="editForms.tradeLevel" clearable style="width:130px; top: -10px;" size="mini" />
            </el-form-item>
            {{ $t('financemanager.sumOfAllPendingOrdersInFile') }}
            <el-form-item>
              <el-input v-model="editForms.tradeRatio" clearable style="width:100px; top: -10px;" size="mini" />
            </el-form-item>
            %
          </p>
          <p>{{ $t('financemanager.dropMoreThan') }}
            <el-form-item>
              <el-input v-model="editForms.tradeLimit" clearable style="width:100px; top: -10px;" size="mini" />
            </el-form-item>
            % {{ $t('financemanager.stayOfExecution') }}
          </p>
        </el-form>
      </div>
      <div style="text-align: center;">
        <span
          slot="footer"
          class="dialog-footer"
          center:true
        >
          <el-button @click="appear = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleEditCurrency">{{ $t('common.Confirm') }}</el-button>
        </span>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { addTradeCurrency, queryConfigCurrency, getTransfer, transferEdit, getNotConfigCurrency, getSelectCurrency, editTradeState, removeConfig, editTradeCurrency } from '@/api/finance/freecurrency'

export default {
  name: 'Realization',
  data() {
    return {
      // 是否显示弹出层
      open: false,
      add: false,
      appear: false,
      // 总条数
      total: 0,
      // 手续费列表
      dataList: [],
      type: '1',
      // 手续费划转
      dialogTableData: [],
      // 添加币种变现
      dialogData: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        currencyId: undefined,
        openState: undefined,
        type: undefined
      },
      // 手续费划转弹窗查询列表
      forms: {
        // name: undefined,
      },
      // 添加变现币种
      form: {
        // name: undefined,
      },
      // 修改
      editForms: {},
      codeOptions: [],
      fixInfo: {
        id: ''
      },
      // 状态
      stateOptions: [
        { value: '', label: this.$t('common.all') },
        { value: '0', label: this.$t('otc.text151') },
        { value: '1', label: this.$t('otc.text152') }
      ],
      typeOptions: [
        { value: '1', label: this.$t('financemanager.transactionFeeRealizationAccount') },
        { value: '2', label: this.$t('financemanager.withdrawalFeeRealizationAccount') }
      ],
      labelName: '', // dialog名称
      selectArr: []
    }
  },
  computed: {

  },
  created() {
    this.getList()
    this.getCodeOptions()
  },
  methods: {
    /** 手续费变现列表 */
    async getList() {
      const { rows, total } = await queryConfigCurrency(this.queryParams)
      this.dataList = rows
      this.total = total
    },
    // 状态（开启/关闭）
    updateStatus(row) {
      editTradeState({ id: row.id, openState: row.openState === 1 ? 0 : 1 }).then(response => {
        if (response.code === 200) {
          row.openState === 1 ? this.msgSuccess(this.$t('common.operationSucceed')) : this.msgSuccess(this.$t('common.operationSucceed'))
          this.getList()
        }
      })
    },
    // 删除按钮
    deleted(row) {
      this.$confirm(this.$t('otc.text142'), this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        removeConfig({ id: row.id }).then(res => {
          if (res.code == 200) {
            this.msgSuccess(this.$t('common.deleteSuccess'))
            this.getList()
            this.getCodeOptions()
            // console.log('当前时间为：'+ Date());
          }
        }
        )
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('otc.cancelDelete')
        })
      })
    },
    // 修改按钮
    handleEdit(row) {
      const { tradeLevel, tradeRatio, tradeLimit } = row
      this.editForms = {
        tradeLevel,
        tradeRatio,
        tradeLimit
      }
      this.appear = true
      this.fixInfo.id = row.id
    },
    handleEditCurrency() {
      const datas = {
        id: this.fixInfo.id,
        tradeLevel: this.editForms.tradeLevel,
        tradeRatio: this.editForms.tradeRatio,
        tradeLimit: this.editForms.tradeLimit
      }
      editTradeCurrency(datas).then((response) => {
        if (response.code == 200) {
          this.dataList = response.data
          this.msgSuccess(this.$t('common.modifySuccess'))
          this.getList()
        }
        this.editForms = {}
        this.appear = false
      })
    },
    // 币种筛选框
    getCodeOptions() {
      getSelectCurrency({ type: '' }).then((response) => {
        if (response.code == 200) {
          this.codeOptions = response.data
        } else {
          this.msgError(response.msg)
        }
      })
    },
    /** 查询按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 手续费划转列表
    transfer() {
      this.open = true
      getTransfer().then(response => {
        this.dialogTableData = response.data
      })
      this.forms = {}
    },
    // 手续费划转弹窗搜索
    getConfigList() {
      const param = {
        name: this.forms.currencyName
      }
      getTransfer(param).then(response => {
        this.dialogTableData = response.data
      })
    },
    handleClick(tab, event) {
      if (tab.name == '2') {
        this.type = '2'
        const type = this.type
        getNotConfigCurrency({ type: type }).then(response => {
          this.dialogData = response.data
        })
      }
      if (tab.name == '1') {
        this.type = '1'
        const type = this.type
        getNotConfigCurrency({ type: type }).then(response => {
          this.dialogData = response.data
        })
      }
    },
    // 添加变现币种列表
    addCurrency() {
      this.add = true
      getNotConfigCurrency({ type: this.type }).then(response => {
        this.dialogData = response.data
      })
      this.form = {}
    },
    // 添加变现币种查找
    search() {
      const params = {
        name: this.form.currencyName,
        type: this.type
      }
      getNotConfigCurrency(params).then(response => {
        this.dialogData = response.data
      })
    },
    // 表格复选框选中方法
    handleSelectionChange(val) {
      this.selectArr = [],
      val.forEach(el => {
        const item = {
          'currencyId': el.currencyId,
          'currencyName': el.currencyName
        }
        this.selectArr.push(item)
      })
      // alert(JSON.stringify(this.selectArr))
    },
    // 手续费划转（可单、可批量）
    transferEdit(flag, currencyId, currencyName) {
      const params = { transferList: [] }
      if (flag === 1) {
        params.transferList = this.selectArr
        if (this.selectArr.length === 0) {
          this.$message({
            type: 'info',
            message: this.$t('financemanager.pleaseSelectTheTransferItem')
          })
          return
        }
      } else {
        params.transferList =
            [
              {
                currencyId: currencyId,
                currencyName: currencyName
              }
            ]
      }
      this.$confirm(this.$t('financemanager.whetherToTransferTheItem'), this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        transferEdit(params).then(res => {
          if (res.code === 200) {
            this.$message({
              type: 'success',
              message: this.$t('financemanager.successfulTransfer')
            })
            this.transfer()
            // setTimeout(this.transfer,2000);
            this.open = false
            // console.log('当前时间为：'+ Date());
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('financemanager.transferCancellation')
        })
      })
    },
    // 添加变现币种配置
    handleAdd() {
      const params = {
        type: Number(this.type),
        tradeLevel: this.form.tradeLevel,
        tradeRatio: this.form.tradeRatio,
        tradeLimit: this.form.tradeLimit,
        currencyList: []
      }
      addTradeCurrency(params, params.currencyList = this.selectArr).then(response => {
        this.dataList = response.data
        this.msgSuccess(this.$t('common.addSuccess'))
        this.getList()
        this.getCodeOptions()
        this.add = false
      })
    }
  }
}
</script>

  <style scoped lang="scss">
  .table {
    margin-top: 20px;
  }
  .el-table{
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
  .table ::v-deep .mySelection .cell:after {
    content: "Check All";
    margin-left: 10px;
  }
  .upload-demo {
    float: left;
    width: 100%;
  }
  </style>
