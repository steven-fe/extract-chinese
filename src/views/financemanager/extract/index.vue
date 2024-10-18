<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="用户账号" prop="like">
        <el-input
          v-model="queryParams.like"
          placeholder="用户ID/手机/邮箱"
          clearable
          size="mini"
        />
      </el-form-item>
      <el-form-item label="做市商ID" prop="marketId">
        <el-input
          v-model="queryParams.marketId"
          placeholder="做市商ID"
          clearable
          size="mini"
        />
      </el-form-item>
      <el-form-item label="申请时间">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :range-separator="$t('common.toTime')"
          :start-placeholder="$t('common.startDate')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item label="审核状态" prop="status">
        <el-select v-model="queryParams.status" size="mini">
          <el-option :label="$t('common.all')" :value="undefined" />
          <el-option label="待审核" :value="0" />
          <el-option label="审核通过" :value="1" />
          <el-option label="审核拒绝" :value="9" />
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
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="tableList" border>
      <el-table-column label="申请时间" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="做市商ID" align="center">
        <template slot-scope="scope">
          <el-link
            type="primary"
            :underline="false"
            @click="toMarketInfo(scope.row)"
          >{{ scope.row.marketId }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="用户ID" prop="uid" align="center">
        <template slot-scope="scope">
          <el-link
            type="primary"
            :underline="false"
            @click="toUserInfo(scope.row)"
          >{{ scope.row.uid }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="做市商等级" prop="marketUserLevel" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.marketUserLevel">
            <span v-for="opt in levelIdOptions" :key="opt.levelId">
              <span v-if="scope.row.marketUserLevel == opt.levelId">{{
                opt.levelName + "做市商"
              }}</span>
            </span>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.coin')" prop="currency" align="center" />
      <el-table-column label="申请提取金额" prop="withdrawAmt" align="center" />
      <el-table-column label="审核备注" prop="remark" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.remark">{{ scope.row.remark }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.status')" prop="status" align="center">
        <template slot-scope="scope">
          <span
            v-if="scope.row.status == 0"
          >待审核
            <el-button
              size="mini"
              icon="el-icon-edit"
              type="text"
              style="margin-left: 10px"
              @click="handleEdit(scope.row)"
            >审核</el-button>
          </span>
          <span v-if="scope.row.status == 1">审核通过</span>
          <span v-if="scope.row.status == 9">审核拒绝</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <el-dialog
      title="提取审核"
      :visible.sync="open"
      :close-on-click-modal="false"
      width="550px"
    >
      <el-form ref="form" :model="form" label-width="100px">
        <el-form-item label="审核" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">同意</el-radio>
            <el-radio :label="9">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button
          type="primary"
          size="mini"
          :disabled="disabledSubmitForm"
          @click="submitForm"
        >{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { list, exportList, confirm } from '@/api/marketgrant/marketwithdraw'
import { levelList } from '@/api/marketgrant/marketLevel'
export default {
  name: '',

  data() {
    return {
      total: 0,
      loading: true,
      open: false,
      queryParams: {
        like: undefined,
        marketId: undefined,
        status: undefined,
        pageNum: 1,
        pageSize: 10,
        beginTime: undefined,
        endTime: undefined
      },
      time: undefined,
      levelIdOptions: [],
      tableList: [],
      form: {
        status: 1
      },
      disabledSubmitForm: false
    }
  },
  created() {
    this.getList()
    this.getMarLevelList()
  },
  methods: {
    // 获取列表数据
    getList() {
      this.loading = true
      this.queryParams.beginTime = this.time ? this.time[0] : undefined
      this.queryParams.endTime = this.time ? this.time[1] : undefined
      list(this.queryParams).then((res) => {
        this.loading = false
        this.tableList = res.rows
        this.total = res.total
      })
    },
    // 跳转做市商详情
    toMarketInfo(row) {
      this.$router.push({
        name: 'marketInfo',
        query: {
          uid: row.uid
        }
      })
    },
    // 做市等级列表
    getMarLevelList() {
      levelList().then((response) => {
        if (response.code == 200) {
          if (this.levelIdOptions) {
            this.levelIdOptions = response.rows
          }
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 跳转用户详情
    toUserInfo(row) {
      sessionStorage.setItem('uid', row.uid)
      this.$router.push({ name: 'lookInfo2' })
    },
    // 搜索按钮
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    cancel() {
      this.open = false
      this.disabledSubmitForm = false
      this.form = {
        status: 1,
        remark: undefined,
        withdrawId: undefined
      }
      this.resetForm('form')
      this.getList()
    },
    // 重置按钮操作
    resetQuery() {
      this.resetForm('queryForm')
      this.time = undefined
      this.handleQuery()
    },
    handleEdit(row) {
      this.open = true
      this.form.withdrawId = row.id
    },
    submitForm() {
      this.disabledSubmitForm = true
      confirm(this.form)
        .then((res) => {
          if (res.code == 200) {
            this.msgSuccess('审核成功！')
          } else {
            this.msgError(response.msg)
          }
          this.cancel()
        })
        .catch((error) => {
          this.disabledSubmitForm = false
          console.log(error)
        })
    },
    // 导出按钮操作
    handleExport() {
      this.queryParams.beginTime = this.time ? this.time[0] : undefined
      this.queryParams.endTime = this.time ? this.time[1] : undefined
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有做市商提取记录数据项?', this.$t('common.alert'), {
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
        .catch(function() {})
    }
  }
}
</script>

<style scoped>
</style>
