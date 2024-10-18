
walletAddressWhiteList
<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <!-- <el-form-item label=序号 prop="id">
        <el-input v-model="queryParams.id" />
      </el-form-item> -->
      <el-form-item label="链名称" prop="chain">
        <el-input v-model="queryParams.chain" />
      </el-form-item>
      <el-form-item label="业务场景" prop="scene">
        <el-select v-model="queryParams.scene" placeholder="请选择业务场景">
          <el-option :label="$t('common.all')" value="" />
          <el-option label="归集" value="merge" />
          <el-option label="转冷" value="transfer_cold" />
          <el-option label="充错找回" value="recharge_back" />
          <el-option label="找零" value="small_change" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >{{$t('common.search')}}</el-button>
        <el-button
          icon="el-icon-refresh"
          size="mini"
          @click="resetQuery"
        >重置</el-button>
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >增加白名单地址</el-button>
        <!-- <el-button size="mini" @click="handleExport">{{$t('common.derive')}}</el-button> -->
      </el-form-item>
    </el-form>

    <el-table :data="checkList">
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column label="业务类型" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.scene == 'merge'">归集</span>
          <span v-if="scope.row.scene == 'transfer_cold'">转冷</span>
          <span v-if="scope.row.scene == 'recharge_back'">充错找回</span>
          <span v-if="scope.row.scene == 'small_change'">找零</span>
        </template>
      </el-table-column>
      <el-table-column label="链名称" align="center" prop="chain" />
      <el-table-column label="地址" align="center" prop="address" />
      <el-table-column label="有效期" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.type == '0'">长期有效</span>
          <span v-if="scope.row.type == '1'">
            {{ parseTime(scope.row.endTime) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="充错找回金额"
        align="center"
        prop="amount"
      />
      <el-table-column
        label="充错找回合约地址"
        align="center"
        prop="contractAddress"
      />
      <el-table-column
        label="充错找回合约精度"
        align="center"
        prop="contractPrecision"
      />

      <!-- <el-table-column label="充错找回状态" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.status == '0'">未处理</span>
          <span v-if="scope.row.scene == '1'">已处理</span>
        </template>
      </el-table-column>   -->
      <el-table-column
        :label="$t('common.operation')"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-if="scope.row.scene === 'recharge_back'"
            :disabled="!!scope.row.status"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdateStatus(scope.row)"
          >处理</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getWalletWhiteAddressList"
    />

    <!-- 添加或修改币种币对对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="500px"
      @close="cancel"
    >
      <el-form
        ref="form"
        :model="form"
        label-width="100px"
        style="margin-left: 7%"
      >
        <el-input v-model="form.id" style="display: none" />
        <el-form-item label="业务场景" prop="scene">
          <el-select
            v-model="form.scene"
            style="width: 40%"
            @change="changeLabel"
          >
            <el-option label="归集" value="merge" />
            <el-option label="转冷" value="transfer_cold" />
            <el-option label="充错找回" value="recharge_back" />
            <el-option label="找零" value="small_change" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!typeMerge" label="链名称" prop="chain">
          <el-input
            v-model="form.chain"
            placeholder="请输入链名称"
            style="width: 65%"
          />
        </el-form-item>
        <el-form-item v-if="!typeMerge" label="地址" prop="address">
          <el-input
            v-model="form.address"
            placeholder="请输入地址"
            style="width: 65%"
          />
        </el-form-item>
        <el-form-item v-if="typeMerge" label="充错找回链名称" prop="coinSymbol">
          <el-input
            v-model="form.chain"
            placeholder="请输入充错找回链名称"
            style="width: 65%"
          />
        </el-form-item>
        <el-form-item v-if="typeMerge" label="找回地址" prop="address">
          <el-input
            v-model="form.address"
            placeholder="请输入地址"
            style="width: 65%"
          />
        </el-form-item>
        <el-form-item
          v-if="typeMerge"
          label="充错找回合约地址"
          prop="contractAddress"
        >
          <el-input
            v-model="form.contractAddress"
            placeholder="合约地址（非必填）"
            style="width: 65%"
          />
        </el-form-item>
        <el-form-item
          v-if="typeMerge"
          label="充错找回合约精度"
          prop="contractPrecision"
        >
          <el-input
            v-model="form.contractPrecision"
            placeholder="请输入充错找回合约精度"
            style="width: 65%"
          />
        </el-form-item>
        <el-form-item v-if="typeMerge" label="充错找回金额" prop="amount">
          <el-input
            v-model="form.amount"
            placeholder="充错找回金额"
            style="width: 65%"
          />
        </el-form-item>
        <el-form-item v-if="typeMerge" label="地址到期时间" prop="endTime">
          <el-col :span="11">
            <el-date-picker
              v-model="form.endTime"
              type="datetime"
              placeholder="地址到期时间"
              style="width: 142%"
            />
          </el-col>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="submitForm">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>>
<script>
import {
  getWalletWhiteAddressList,
  exportWalletWhiteAddressList,
  walletWhiteAddressUpdate,
  walletWhiteAddressAdd,
  walletWhiteAddressUpdateStatus
} from '@/api/walletaddress'
// import mergeObj from "@/utils/mergeObj";

export default {
  name: 'WithdrawReconcile',
  data() {
    return {
      loading: true,
      total: 0,
      checkList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        sense: undefined,
        symbol: undefined,
        status: undefined
      },
      form: {
        id: null,
        sense: 'merge'
      },
      typeMerge: false,
      flag: false,
      title: '',
      open: false
    }
  },

  created() {
    this.getWalletWhiteAddressList()
  },
  methods: {
    /** 查询自动对账列表 */
    getWalletWhiteAddressList() {
      this.loading = true
      getWalletWhiteAddressList(this.queryParams).then((response) => {
        console.log('返回值', response)
        this.checkList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 表单重置 */
    reset() {
      this.form = {
        id: undefined,
        chain: undefined,
        address: undefined,
        coinSymbol: undefined,
        contractPrecision: undefined,
        contractAddress: undefined,
        amount: undefined,
        endTime: undefined,
        scene: 'merge'
      }
      this.resetForm('form')
    },

    /** 查询按钮操作 */
    handleQuery() {
      this.pageNum = 1
      this.getWalletWhiteAddressList()
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.beginTime = ''
      this.queryParams.endTime = ''
      this.resetForm('queryForm')
      this.handleQuery()
    },

    handleAdd() {
      this.reset()
      this.open = true
      this.flag = true
      this.typeMerge = false
      this.title = '添加地址'
    },

    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate((valid) => {
        if (valid && this.flag) {
          this.flag = false
          if (this.form.id != undefined) {
            walletWhiteAddressUpdate(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getWalletWhiteAddressList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            walletWhiteAddressAdd(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getWalletWhiteAddressList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },

    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有类型数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return withdrawReconcileExport(queryParams)
        })
        .then((response) => {
          this.download(response.msg)
        })
        .catch(function() {})
    },

    /** 点击查看详情跳转 */
    handleDetail(row) {
      console.log('查看提币详情：', row)
      this.$router.push({
        path: '/account/realtimecheck/CheckRealTimeWithdrawDetail',
        name: 'CheckRealTimeWithdrawDetail',
        query: {
          id: row.id
        }
      })
    },
    cancel() {
      this.open = false
      this.reset()
    },
    changeLabel(event, item) {
      if (event === 'recharge_back') {
        this.typeMerge = true
      } else {
        this.typeMerge = false
      }
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const obj = {
        id: undefined,
        chain: undefined,
        address: undefined,
        coinSymbol: undefined,
        contractPrecision: undefined,
        contractAddress: undefined,
        amount: undefined,
        endTime: undefined,
        scene: undefined
      }
      const arr = this.form
      for (const key in obj) {
        obj[key] = row[key]
      }
      // console.log(obj)
      if (row.scene === 'recharge_back') {
        this.typeMerge = true
      } else {
        this.typeMerge = false
      }
      this.form = obj
      this.open = true
      this.flag = true
      this.title = '修改数据'
    },
    handleUpdateStatus(row) {
      walletWhiteAddressUpdateStatus({ id: row.id }).then((response) => {
        this.getWalletWhiteAddressList()
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.el-button.is-disabled{
  color:#C0C4CC
}
</style>
