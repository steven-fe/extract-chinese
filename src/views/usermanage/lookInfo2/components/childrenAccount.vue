<template>
  <!-- 大额充提提醒设置 -->
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="searchForm" label-width="80px">
      <el-form-item prop="type">
        <el-select v-model="searchForm.type" size="mini" style="width: 100px">
          <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="account">
        <el-input v-model="searchForm.account" placeholder="" clearable size="mini" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="search">{{$t('common.search')}}</el-button>
      </el-form-item>
      <el-form-item label="" prop="account">
        创建子账号权限:
        <span v-if="createSubAccountStatus === 0" style="color: red">已关闭</span>
        <span v-if="createSubAccountStatus === 1" style="color: #1c84c6">已开启</span>
        <el-button plain size="mini" class="btn-primary" @click="changeStatus">
          {{ createSubAccountStatus === 0 ? '开启' : '关闭' }}
        </el-button>
      </el-form-item>
    </el-form>

    <el-table ref="table" :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="loginName" label="登录名" align="center" width="160" />
      <el-table-column prop="introduction" :label="$t('common.remarks')" align="center" width="160" />
      <el-table-column prop="createTime" label="创建时间" align="center" width="160">
        <template slot-scope="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <!--      0:关闭 1:正常-->
      <el-table-column prop="status" label="权限状态" align="center">
        <template slot-scope="scope">
          <!--          状态  1:正常、2:冻结、5:已删除-->
          <span v-if="scope.row.status === 1">使用中</span>
          <span v-if="scope.row.status === 2">已冻结</span>
          <span v-if="scope.row.status === 5">已删除</span>
        </template>
      </el-table-column>
      <el-table-column prop="showPrecision" :label="$t('common.operation')" align="center">
        <template slot-scope="scope">
          <span style="color: #1c84c6; cursor: pointer" @click="getAsset(scope.row)">资产</span> |
          <span style="color: #1c84c6; cursor: pointer" @click="getTradeAuth(scope.row)">交易权限</span> |
          <span style="color: #1c84c6; cursor: pointer" @click="toUserInfo(scope.row)">用户详情</span>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="searchForm.pageNum"
        :limit.sync="searchForm.pageSize"
        @pagination="pageChange"
      />
    </div>
    <el-dialog title="子账号资产" :visible.sync="visible" width="500px" style="margin-top: 20vh">
      <div>总资产折合(USDT)：{{ accountAsset.totalUsdtBalance }}</div>
      <br>
      <div>币币资产：{{ accountAsset.spotUsdtBalance }}</div>
      <br>
      <div>合约资产：{{ accountAsset.contractUsdtBalance }}</div>
      <br>
      <div>合约量化资产：{{ accountAsset.quantizationUsdtBalance }}</div>
      <!--      <div slot="footer" class="dialog-footer">-->
      <!--        <el-button type="primary" @click="visible = false">{{$t('common.sure')}}</el-button>-->
      <!--        <el-button @click="visible = false">{{$t('common.cancel')}}</el-button>-->
      <!--      </div>-->
    </el-dialog>
    <el-dialog title="子账号交易权限" :visible.sync="dialogStatus" width="500px" style="margin-top: 20vh" @closed="cancel">
      <el-tabs v-model="acitveName" tab-position="left">
        <el-tab-pane label="现货交易" name="1">
          <!--          0:开放全部交易对 1:禁止现货交易 2:允许部分交易对-->
          <div v-if="tradeAuth.userSpotTradeLimit === 1">禁止交易</div>
          <div v-if="tradeAuth.userSpotTradeLimit === 0">允许交易：全部币对</div>
          <div v-if="tradeAuth.userSpotTradeLimit === 2">
            允许交易：指定币对
          </div>
          <div v-if="tradeAuth.userSpotTradeLimit === 2" style="" class="symbollist">
            <div v-for="(item, index) of SpotPairList" :key="index" class="symbolitem">
              <span v-if="tradeAuth.userSpotTradePairsList.includes(item.instrumentId)">{{ item.showName }}</span>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="合约交易" name="2">
          <!--          0:开放全部交易对 1:禁止合约交易 2:允许部分交易对-->
          {{ tradeAuth.userSwapTradeLimit === 0 ? '允许交易' : '禁止交易' }}
        </el-tab-pane>
      </el-tabs>
      <!--      <div slot="footer" class="dialog-footer">-->
      <!--        <el-button type="primary" @click="dialogStatus = false">{{$t('common.sure')}}</el-button>-->
      <!--          </div>-->
    </el-dialog>
  </div>
</template>
<script>
import * as API from '@/api/childrenAccountInfo'
import { updateStatus } from '@/api/createChildrenUser'
// import { symbolList } from '@/api/pin'
import { getList } from '@/api/systemsetting/currencypairmanage'

export default {
  name: 'LabelClass',
  props: {
    msg: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      acitveName: '1',
      createSubAccountStatus: +sessionStorage.getItem('createSubAccountStatus'),
      total: 0,
      searchForm: {
        userId: this.msg,
        type: 1, // 1:子账号登录名  2:子账号备注
        account: undefined,
        pageNum: 1,
        pageSize: 10
      },
      SpotPairList: [],
      tableData: [],
      dialogTitle: '',
      dialogStatus: false,
      visible: false,
      accountAsset: {},
      tradeAuth: {
        userSpotTradeLimit: undefined,
        userSpotTradePairsList: [],
        userSwapTradeLimit: undefined,
        userSwapMarkets: []
      },
      // symbolList: [],
      typeList: [
        { value: 1, label: '登录名' },
        { value: 2, label: '备注' }
      ]
    }
  },
  mounted() {
    this.getSpotPairList()
    this.search()
    // symbolList().then(res => {
    //   this.symbolList = res.data
    // })
  },
  methods: {
    cancel() {
      this.acitveName = '1'
      this.dialogStatus = false
    },
    toUserInfo(row) {
      sessionStorage.setItem('uid', row.subUserUid)
      sessionStorage.setItem('userId', row.subUserId)
      this.$emit('updateLookInfo')
    },
    search() {
      this.searchForm.pageNum = 1
      this.pageChange()
    },
    getSpotPairList() {
      getList({ pageSize: 9999 }).then(res => {
        this.SpotPairList = res.rows
      })
    },
    pageChange() {
      API.list(this.searchForm).then(res => {
        this.tableData = res.rows
        this.total = res.total
      })
    },
    getTradeAuth(row) {
      API.tradePermission({ subUserId: row.subUserId }).then(res => {
        this.tradeAuth = res.data
        this.dialogStatus = true
      })
    },
    getAsset(row) {
      API.getAsset({ subUserId: row.subUserId }).then(res => {
        this.accountAsset = res.data
        this.visible = true
      })
    },
    changeStatus() {
      const title = `确认${this.createSubAccountStatus === 1 ? '关闭' : '开启'}创建子账号权限? `
      const msg = this.createSubAccountStatus === 1 ? '关闭后，母账号无法再创建新的子账号，现有子账号不受影响' : '重新开启后，母账号可以创建新的子账号'
      this.$confirm(msg, title, {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        updateStatus({ userId: this.msg, status: this.createSubAccountStatus === 1 ? 0 : 1 }).then(res => {
          this.$message({ type: 'success', message: '更新成功' })
          this.createSubAccountStatus = this.createSubAccountStatus === 1 ? 0 : 1
        })
      }).catch(e => {
        this.$message({ type: 'info', message: '已取消' })
      })
    }
  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped lang="scss">
.symbollist {
  height: 200px;
  overflow-y: auto;
  margin-top: 20px;
  .symbolitem {
    margin-top: 10px;
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
  margin-top: 30px;
}
.demo-ruleForm {
  .el-form-item {
    //float: left;
  }
}
.batch-freeze {
  display: flex;
  flex-direction: column;
  margin-top: 30px;
  .title {
    margin-bottom: 20px;
    font-size: 16px;
  }
  .text {
    margin-left: 10px;
    margin-right: 30px;
  }
  .import {
    margin-top: 20px;
  }
}
.exportdata {
  margin-top: 20px;
  color: #1c84c6;
  cursor: pointer;
}
</style>
