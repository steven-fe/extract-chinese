<template>
  <div class="app-container">
    <div class="search">
      <el-form ref="form" :inline="true" :model="searchForm">
        <el-form-item :label="$t('frozen.frozenCurrency')" prop="titles">
          <el-select v-model="searchForm.currencyCode" :placeholder="$t('financemanager.currencyCode1')" clearable filterable>
            <el-option
              v-for="(item) in codeOptions"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="UID:" prop="titles">
          <el-input v-model="searchForm.uid" clearable />
        </el-form-item>
        <el-form-item :label="$t('common.status')" prop="status">
          <el-select v-model="searchForm.status" filterable clearable size="small">
            <el-option
              v-for="item in statusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('frozen.initiatingFreezeDate')" prop="titles">
          <el-date-picker
            v-model="frozenTime"
            size="mini"
            type="datetimerange"
            value-format="timestamp"
            :range-separator="$t('common.toTime')"
            :start-placeholder="$t('common.startTime')"
            :end-placeholder="$t('common.endTime')"
          />
        </el-form-item>
        <el-form-item :label="$t('frozen.freezingOperationCompletionTime')" prop="titles">
          <el-date-picker
            v-model="completeFrozenTime"
            size="mini"
            type="datetimerange"
            value-format="timestamp"
            :range-separator="$t('common.toTime')"
            :start-placeholder="$t('common.startTime')"
            :end-placeholder="$t('common.endTime')"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="search">{{$t('common.search')}}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" icon="el-icon-plus" @click="exportExcel">{{$t('common.derive')}}</el-button>
        </el-form-item>
      </el-form>
      <div class="explain">
        <div>{{$t('frozen.frozenRecordsInclude')}}</div>
        <div>1、{{$t('frozen.singleFreezeRecord')}}；</div>
        <div>2、{{$t('frozen.batchFreezingRecord')}}；</div>
        <div>3、{{$t('frozen.recordsFrozenByUserDetails')}}；</div>
      </div>
    </div>
    <el-table ref="table" :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="userUidStr" label="UID" align="center" />
      <el-table-column prop="currencyCode" :label="$t('frozen.frozenCurrency')" align="center" />
      <el-table-column prop="amountStr" :label="$t('frozen.frozenQuantity')" align="center" />
      <el-table-column prop="createTime" :label="$t('frozen.initiatingFreezeTime')" align="center">
        <template slot-scope="scope">
          {{ scope.row.createTime | dateFilter }}
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" :label="$t('frozen.freezingOperationCompletionTime')" align="center">
        <template slot-scope="scope">
          {{ scope.row.updateTime | dateFilter }}
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('common.status')" align="center">
        <!--        0:初始化 1:冻结成功 2:冻结失败-->
        <template slot-scope="scope">
          <span v-if="scope.row.status === 0">{{$t('dwmanager.beingProcessed')}}</span>
          <span v-if="scope.row.status === 1">{{$t('financemanager.freezingSuccess')}}</span>
          <span v-if="scope.row.status === 2">{{$t('frozen.freezeFailure')}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="errorMsg" :label="$t('financemanager.causeOfFailure')" align="center" />
      <el-table-column prop="remark" :label="$t('common.remarks')" align="center" />
      <el-table-column prop="operatorName" :label="$t('financemanager.operator')" align="center" />
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > searchForm.pageSize"
        :total="total"
        :page.sync="searchForm.pageNum"
        :limit.sync="searchForm.pageSize"
        @pagination="pageChange"
      />
    </div>
  </div>
</template>
<script>
import { frozenRecordPageList, exportFrozenRecord } from '@/api/finance/freecurrency'
import dayjs from 'dayjs'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'BignumRemind',
  filters: {
    dateFilter(time) {
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  data() {
    return {
      disabledInput: false,
      statusList: [
        { label: this.$t('common.all'), value: -1 },
        { label: this.$t('dwmanager.beingProcessed'), value: 0 },
        { label: this.$t('financemanager.freezingSuccess'), value: 1 },
        { label: this.$t('frozen.freezeFailure'), value: 2 }
      ],
      total: 0,
      searchForm: {
        currencyCode: undefined,
        uid: undefined,
        startFrozenTime: undefined,
        endFrozenTime: undefined,
        status: -1, // 0:初始化 1:冻结成功 2:冻结失败  不传:全部
        startCompleteFrozenTime: undefined,
        endCompleteFrozenTime: undefined,
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      dialogStatus: false,
      status: '', // add新增，update修改
      digform: {
        titles: '',
        contents: '',
        picture: '',
        newsUrl: '',
        sort: '',
        id: undefined
      },
      rules: {
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    codeOptions() {
      return this.currencyList
    },
    frozenTime: {
      get() {
        return [this.searchForm.startFrozenTime, this.searchForm.endFrozenTime]
      },
      set(val) {
        this.searchForm.startFrozenTime = val ? val[0] : undefined
        this.searchForm.endFrozenTime = val ? val[1] : undefined
      }
    },
    completeFrozenTime: {
      get() {
        return [this.searchForm.startCompleteFrozenTime, this.searchForm.endCompleteFrozenTime]
      },
      set(val) {
        this.searchForm.startCompleteFrozenTime = val ? val[0] : undefined
        this.searchForm.endCompleteFrozenTime = val ? val[1] : undefined
      }
    }
  },
  created() {
    this.search()
    this.getCurrency()
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    search() {
      const params = { ...this.searchForm, status: this.searchForm.status === -1 ? undefined : this.searchForm.status }
      frozenRecordPageList(params).then(res => {
        this.tableData = res.rows
        this.total = res.total
      })
    },
    pageChange(page) {
      this.searchForm.pageNum = page.page
      this.search()
    },
    exportExcel() {
      const params = { ...this.searchForm, status: this.searchForm.status === -1 ? undefined : this.searchForm.status }
      exportFrozenRecord(params).then(res => {
        this.download(res.data.fileName)
      })
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped lang="scss">
::v-deep .uploadInput{
  width: 250px;
}
::v-deep .upload-demo {
  display: inline-block;
  margin-left: 10px;
  .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
}
.table {
  margin-top: 20px;
}
.form-grid {
  //display: grid;
  //grid-template-columns: 50% 50%;
  //margin-left: 5%;
  //.grid-item {
  //  width: 90%;
  //}
}
.demo-ruleForm {
  .el-form-item {
    //float: left;
  }
}
.search {
  display: flex;
  .explain {
    width: 450px;
    align-self: center;
    border: 1px solid #e4e1e1;
    color: #858181;
    padding: 10px;
  }
}

</style>
