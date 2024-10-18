<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="100px">
      <el-form-item label="" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="模糊查询"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="被邀请人Id" prop="beuserId">
        <el-input
          v-model="queryParams.beuserId"
          placeholder="请输入被邀请人Id"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="邀请人级别" prop="invitationLevel">
        <el-select v-model="queryParams.invitationLevel" size="mini" placeholder="请选择邀请人级别">
          <el-option v-for="item in invitationLevels" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="detailList" border>
      <el-table-column label="邀请人Id" align="center" prop="userId" />
      <el-table-column label="邀请人账号" align="center" prop="userAccount" />
      <el-table-column label="被邀请人Id" align="center" prop="beuserId" />
      <el-table-column label="被邀请人账号" align="center" prop="beuserAccount" />
      <el-table-column label="邀请人级别" align="center" prop="invitationLevel" />
      <el-table-column label="邀请时间" align="center" prop="rewardTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.rewardTime) }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="累计返佣数额" align="center" prop="totalInvitationBack" /> -->
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listDetail } from '@/api/invitation/invitationDetail'

export default {
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 邀请明细表格数据
      detailList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      invitationLevels: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: undefined,
        beuserId: undefined,
        invitationLevel: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        exchId: [
          { required: true, message: '交易所代码不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    for (var i = 1; i <= 20; i++) this.invitationLevels.push(i)
  },
  methods: {
    /** 查询邀请明细列表 */
    getList() {
      this.loading = true
      listDetail(this.queryParams).then(response => {
        this.detailList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        exchId: undefined,
        userId: undefined,
        beuserId: undefined,
        invitationLevel: undefined,
        rewardTime: undefined
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加邀请明细'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getDetail(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改邀请明细'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateDetail(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addDetail(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$confirm(
        '是否确认删除邀请明细编号为"' + ids + '"的数据项?',
        this.$t('common.alert'),
        {
          confirmButtonText: this.$t('common.sure'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'warning'
        }
      )
        .then(function() {
          return delDetail(ids)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
        .catch(function() {})
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有邀请明细数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return exportDetail(queryParams)
        })
        .then(response => {
          this.download(response.msg)
        })
        .catch(function() {})
    }
  }
}
</script>
