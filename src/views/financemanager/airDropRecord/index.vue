<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="90px">
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList(true)">{{ $t('common.seek') }}</el-button>
      </el-form-item>

    </el-form>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column :label="$t('common.operation')" width="200px" align="center">

        <template slot-scope="scope">
          <div v-if="scope.row.state ===0 && scope.row.version >= 50">
            <el-button type="primary" size="mini" @click="updateVersion(scope.row)">{{ $t('financemanager.tryAgain') }}</el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="id" align="center" width="50" />
      <el-table-column prop="fromUserId" :label="$t('financemanager.depositor')" align="center" width="180" />
      <el-table-column prop="toUserId" :label="$t('financemanager.depositSubscriber')" align="center" width="180" />
      <el-table-column prop="currencyId" :label="$t('financemanager.currencyID')" align="center" width="180" />
      <el-table-column prop="amount" :label="$t('common.amount')" align="center" width="180" />
      <el-table-column :label="$t('financemanager.businessScenario')" align="center">
        <template slot-scope="scope">{{ typeLabel(typeOptions, scope.row.businessType) }}</template>
      </el-table-column>
      <el-table-column prop="businessId" :label="$t('financemanager.serviceId')" align="center" width="180" />
      <el-table-column :label="$t('common.createTime')" align="center" width="180">
        <template slot-scope="scope" type="form">{{ scope.row.ctime }}</template>
      </el-table-column>
      <el-table-column :label="$t('common.updateTime')" align="center" width="180">
        <template slot-scope="scope" type="form">{{ scope.row.utime }}</template>
      </el-table-column>
      <el-table-column :label="$t('common.status')" align="center">
        <template slot-scope="scope">{{ typeLabel(stateOptions, scope.row.state) }}</template>
      </el-table-column>
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
  </div>
</template>
<script>
import { pageList, updateVersion } from '@/api/finance/freecurrency'
import { date, time } from '@/utils/format'
import { mapState } from 'vuex'
import { commonFilter } from '@/utils/filters'

export default {
  name: 'AirDropRecordPageList',
  filters: {
    timeFilter(val) {
      if (Number(val) === 0) {
        return '- -'
      }
      return date(val) + ' ' + time(val)
    }
  },
  data() {
    return {
      pickerOptions: {
        disabledDate: (time) => {
          if (time) {
            return time.getTime() < new Date(new Date().toLocaleDateString()).getTime()
          }
          return true
        }
      },
      typeOptions: [
        { label: this.$t('financemanager.invitationToReturnCommission'), value: 1 },
        { label: this.$t('financemanager.paradrop'), value: 2 }
      ],
      stateOptions: [
        { label: this.$t('financemanager.toBeIssued'), value: 0 },
        { label: this.$t('financemanager.issued'), value: 1 }
      ],
      total: 0,
      configId: '',
      updateId: '',
      form: {
        pageNum: 1,
        pageSize: 10
      },
      date: '',
      tableData: [{}],
      open: false
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    currencyOptions() {
      return this.currencyList
    }
  },

  mounted() {
    this.getConfigList()
  },
  methods: {

    // 详情跳转
    toUserInfo(row) {
      // 后端返回数据 UID、 userId返回值相反，故存储取反纠正过来
      sessionStorage.setItem('uid', row.userId)
      sessionStorage.setItem('userId', row.uid)
      this.$router.push({ name: 'lookInfo2' })
    },
    // 币种类型过滤方法
    typeLabel(data, val) {
      return commonFilter(data, val)
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
      this.$refs['digform'].resetFields()
    },
    getConfigList(flag) {
      if (flag) {
        this.form.pageNum = 1
      }
      pageList(this.form).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
    },
    updateVersion(row) {
      const params = {
        id: row.id
      }
      updateVersion(params).then(res => {
        if (res.code === 200) {
          this.$message({
            type: 'success',
            message: this.$t('common.operationSucceed')
          })
          this.getConfigList()
        } else {
          this.$message({
            type: 'error',
            message: this.$t('financemanager.operationFailure')
          })
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
.upload-demo {
  float: left;
  width: 100%;
}
</style>
