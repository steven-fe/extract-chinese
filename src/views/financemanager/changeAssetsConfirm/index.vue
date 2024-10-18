<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="申请类型" prop="transferType">
        <el-select
          v-model="queryParams.transferType"
          clearable
          size="mini"
          placeholder="请选择申请类型"
        >
          <el-option
            v-for="(item, index) in transferTypeList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="变更账户" prop="uid">
        <el-select
          v-model="queryParams.uid"
          clearable
          size="mini"
          placeholder="请选择变更账户"
        >
          <el-option
            v-for="(item, index) in typeList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.coin')" prop="currency">
        <el-select
          v-model="queryParams.currency"
          clearable
          size="mini"
          placeholder="请选择币种"
        >
          <el-option
            v-for="(item, index) in marList"
            :key="index"
            :label="item.label"
            :value="item.marginCoin"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="申请时间" prop="time">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('common.startTime')"
          :range-separator="$t('common.toTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
        />
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
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="tableList" border>
      <el-table-column label="申请时间" align="center" prop="ctime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.mtime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请类型" align="center">
        <template slot-scope="scope">
          <span v-for="(item, index) in transferTypeList" :key="index">
            <span v-if="item.value == scope.row.transferType">{{
              item.label
            }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="变更账户" align="center">
        <template slot-scope="scope">
          <span v-for="(item, index) in typeList" :key="index">
            <span v-if="item.value == scope.row.sysAcct">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.coin')" align="center" prop="currency" />
      <el-table-column label="变更金额" align="center" prop="amount" />
      <el-table-column label="提取至/资金来源" align="center" prop="uid" />
      <el-table-column label="申请人" align="center" prop="applier" />
      <el-table-column label="申请备注" align="center">
        <template slot-scope="scope">
          <span>{{ parseStr(scope.row.applyRemark) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核人" align="center">
        <template slot-scope="scope">
          <span>{{ parseStr(scope.row.operator) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核备注" align="center">
        <template slot-scope="scope">
          <span>{{ parseStr(scope.row.confirmRemark) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.status')" align="center">
        <template slot-scope="scope">
          <span
            v-if="scope.row.status == 0"
          ><el-button
            type="text"
            @click="handleConfirm(scope.row)"
          >审核</el-button></span>
          <span v-if="scope.row.status == 1">审核通过</span>
          <span v-if="scope.row.status == 9">审核不通过</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="load"
    />
    <el-dialog
      :title="title"
      :visible.sync="open"
      :close-on-click-modal="false"
      width="600px"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="申请类型" prop="transferType">
          <el-select v-model="form.transferType" style="width: 100%" disabled>
            <el-option
              v-for="(item, index) in transferTypeList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.accountType')" prop="sysAcct">
          <el-select v-model="form.sysAcct" disabled style="width: 100%">
            <el-option
              v-for="(item, index) in typeList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.coin')" prop="currency">
          <el-select v-model="form.currency" disabled style="width: 100%">
            <el-option
              v-for="(item, index) in marList"
              :key="index"
              :label="item.marginCoin"
              :value="item.marginCoin"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="fromTitle" prop="amount">
          <el-input v-model="form.amount" disabled />
        </el-form-item>
        <el-form-item :label="toTitle" prop="uid">
          <el-input v-model="form.uid" disabled />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="form.newStatus" style="width: 100%">
            <el-option label="审核通过" :value="1" />
            <el-option label="审核不通过" :value="9" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作备注">
          <el-input
            v-model="form.confirmRemark"
            type="textarea"
            :rows="4"
            maxlength="100"
            show-word-limit
            placeholder="请输入操作备注"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button
          type="primary"
          size="mini"
          :disabled="unSubmit"
          @click="submitForm"
        >{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listCoinMar } from '@/api/contract/margin'
import { list, exportList, confirm } from '@/api/contract/accountConfirm'
export default {
  name: '',

  data() {
    return {
      // 遮罩层
      loading: true,
      title: undefined,
      open: false,
      unSubmit: false,
      form: {},
      total: 0,
      // 总条数
      tableList: [],
      fromTitle: undefined,
      toTitle: undefined,
      marList: [],
      time: undefined,
      // 查询参数
      queryParams: {
        uid: undefined,
        currency: undefined,
        beginTime: undefined,
        endTime: undefined,
        pageNum: 1,
        pageSize: 10
      },
      rules: {},
      typeList: [
        { value: undefined, label: this.$t('common.all') },
        { value: 1, label: '划转记账账户' },
        { value: 2, label: '平仓账户' },
        { value: 3, label: '手续费账户' },
        { value: 4, label: '资金费用账户' },
        { value: 5, label: '隔夜费账户' },
        { value: 6, label: '营销账户' },
        { value: 7, label: '相互保资金' },
        { value: 8, label: '相互保收益' },
        { value: 9, label: '返佣消耗' },
        { value: 10, label: '兑换账户' },
        { value: 11, label: '回购账户' }
      ],
      transferTypeList: [
        { value: undefined, label: this.$t('common.all') },
        { value: 1, label: '提取利润' },
        { value: 2, label: '增加余额' }
      ]
    }
  },
  created() {
    this.load()
    this.getMarList()
  },
  methods: {
    load() {
      this.loading = true
      this.queryParams.beginTime = this.time ? this.time[0] : undefined
      this.queryParams.endTime = this.time ? this.time[1] : undefined
      list(this.queryParams).then((response) => {
        this.tableList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 保证金币种
    getMarList() {
      listCoinMar().then((response) => {
        if (response.code == 200) {
          if (this.marList) {
            const list = response.rows
            list.forEach((element) => {
              this.$set(element, 'label', element.marginCoin)
            })
            this.marList = [{ label: this.$t('common.all'), marginCoin: undefined }, ...list]
          }
        } else {
          this.msgError(response.msg)
        }
      })
    },
    reset() {
      this.form = {}
      this.resetForm('form')
    },
    cancel() {
      this.open = false
      this.reset()
    },
    submitForm() {
      this.unSubmit = true
      const data = {
        confirmId: this.form.id,
        status: this.form.newStatus,
        confirmRemark: this.form.confirmRemark
      }
      confirm(data)
        .then((response) => {
          if (response.code === 200) {
            this.msgSuccess('审核成功')
            this.open = false
            this.load()
          } else {
            this.msgError(response.msg)
          }
          this.unSubmit = false
        })
        .catch((e) => {
          this.unSubmit = false
          console.log(e)
        })
    },
    handleQuery() {
      this.load()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.time = undefined
      this.load()
    },
    handleConfirm(row) {
      this.title = '审核资产变更'
      if (row.transferType == 1) {
        this.fromTitle = '提取金额'
        this.toTitle = '提取至'
      } else {
        this.fromTitle = '增加金额'
        this.toTitle = '资金来源'
      }
      this.open = true
      this.form = Object.assign({}, row)
      this.$set(this.form, 'newStatus', 1)
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出资产变更审核记录数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return exportList(queryParams)
        })
        .then((response) => {
          this.download(response.msg)
        })
        .catch(function(error) {})
    }
  }
}
</script>

<style scoped>
</style>
