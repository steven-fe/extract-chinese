<template>
  <div>
    <div class="search">
      <el-form ref="form" :inline="true" :model="form" label-width="155px">
        <el-form-item :label="$t('financemanager.airdropLockedCoins')" prop="coin">
          <el-select v-model="form.coin" filterable clearable :placeholder="$t('financemanager.pleaseSelectAirdropLockUpCurrency')">
            <el-option
              v-for="item in codeOptions"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('financemanager.binUID')" prop="uid">
          <el-input v-model="form.uid" />
        </el-form-item>
        <el-form-item :label="$t('financemanager.lockupRemarks')" prop="remark">
          <el-input v-model="form.remark" />
        </el-form-item>
        <el-form-item :label="$t('financemanager.lockupTime')" prop="time">
          <el-date-picker
            v-model="form.time"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            :range-separator="$t('common.toTime')"
            :start-placeholder="$t('common.startTime')"
            :end-placeholder="$t('common.endTime')"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="initTableData">{{ $t('common.search') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="exportData(1)">{{ $t('common.derive') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="exportData(2)">{{ $t('financemanager.exportAll') }}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="create">
      <el-button type="success" size="mini" @click="operateUserAccount">{{ $t('financemanager.airdropAccountBalance') }}</el-button>
      <el-button type="success" size="mini" icon="el-icon-plus" @click="importData">{{ $t('financemanager.airdropLockUpTokens') }}</el-button>
    </div>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table" @selection-change="selectionChange">
      <el-table-column type="selection" :label="$t('usermanage.checkAll')" label-class-name="mySelection" width="100" align="center" />
      <el-table-column prop="id" :label="$t('financemanager.airdropID')" align="center" />
      <el-table-column prop="uid" label="UID" align="center" />
      <el-table-column prop="coin" :label="$t('financemanager.airdropCoins')" align="center" />
      <el-table-column prop="amount" :label="$t('financemanager.airdropQuantity')" align="center" />
      <el-table-column prop="ctime" :label="$t('financemanager.airdropTime')" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="adminUid" :label="$t('financemanager.administratorNumber')" align="center" />
      <el-table-column prop="remark" :label="$t('financemanager.airdropRemarks')" align="center" />
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > form.pageSize"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="pagination"
      />
    </div>
    <import-data ref="importData" :title="$t('financemanager.airdropLockUpTokens')" :type="1" :close-on-click-modal="false" @success="initTableData">
      <div class="tips">
        <div>{{ $t('financemanager.attention') }}</div>
        <div>1. {{ $t('financemanager.importDataIncrementally') }}</div>
        <div>2. {{ $t('financemanager.editToMakeSureYouFillInAValidUID') }}</div>
        <div>3. {{ $t('financemanager.numberOfLockUpReleasesMustBePositive') }}</div>
      </div>
    </import-data>
    <operate-user-account ref="operateUserAccount" :close-on-click-modal="false" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { lockList, lockExport } from '@/api/operate/lock'
import ImportData from './ImportData.vue'
import OperateUserAccount from './OperateUserAccount.vue'

export default {
  name: 'LockSymbol',
  components: {
    ImportData,
    OperateUserAccount
  },
  data() {
    return {
      selectData: [],
      form: {
        coin: '', // 币种
        uid: '', // integer
        startTime: '',
        endTime: '',
        time: [],
        remark: '',
        type: 1, // 0 余额锁仓  1 空投锁仓
        pageNum: 0,
        pageSize: 10
      },
      total: 0,
      tableData: []
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList', 'protocolList']),
    codeOptions() {
      return this.currencyList
    }
  },
  mounted() {
    this.initTableData()
  },
  methods: {
    selectionChange(arrRow) {
      this.selectData = arrRow.map(item => item.id)
      console.log('选择的数据', this.selectData)
    },
    initTableData() {
      console.log('上传参数', this.form)
      this.form.startTime = this.form.time && this.form.time.length > 0 ? this.form.time[0] : ''
      this.form.endTime = this.form.time && this.form.time.length > 0 ? this.form.time[1] : ''
      const param = JSON.parse(JSON.stringify(this.form))
      param.time = undefined
      console.log('上传参数', param)
      lockList(param).then(res => {
        console.log('res', res)
        if (res.code === 200) {
          this.tableData = res.rows
          this.total = res.total
        }
      })
    },
    // 翻页
    pagination(pageData) {
      this.form.pageNum = pageData.page
      this.initTableData()
    },
    importData() {
      this.$refs.importData.init()
    },
    exportData(flag) {
      if (flag === 1) {
        // lockExport
        if (this.selectData.length === 0) {
          this.$message.warning(this.$t('financemanager.pleaseSelectData'))
          return
        }
        const ids = this.selectData.join(',')
        lockExport({ ids, type: 1 }).then(res => {
          if (res.code === 200) {
            this.download(res.msg)
          }
        })
      }
      // 全部导出
      if (flag === 2) {
        this.form.startTime = this.form.time && this.form.time.length > 0 ? this.form.time[0] : ''
        this.form.endTime = this.form.time && this.form.time.length > 0 ? this.form.time[1] : ''
        const param = JSON.parse(JSON.stringify(this.form))
        param.time = undefined
        lockExport(param).then(res => {
          if (res.code === 200) {
            this.download(res.msg)
          }
        })
      }
    },
    operateUserAccount() {
      this.$refs.operateUserAccount.init()
    }
  }
}
</script>

<style lang="scss" scoped>
.search {
  border-bottom: 2px solid #dfe4ed;
  padding: 20px 0;
}
.create {
  text-align: right;
  padding: 20px 0;
}
.table ::v-deep .mySelection .cell:after {
  content: "Check All";
  margin-left: 10px;
}
.tips {
    margin-top: 30px;
    div{
        padding: 10px 0;
    }
}
</style>
