<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="评定项" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入评定项"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" border :data="setList">
      <el-table-column label="评定项" align="center" prop="title" />
      <el-table-column label="键" align="center" prop="configKey" />
      <el-table-column label="值" align="center" prop="value" />
      <el-table-column label="更新操作员id" align="center" prop="cuser" />
      <el-table-column label="更新时间" align="center" prop="mtime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.mtime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
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

    <!-- 添加或修改等级评定信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="评定项" prop="title">
          <el-input v-model="form.title" :disabled="true" placeholder="请输入评定项" />
        </el-form-item>
        <el-form-item label="键" prop="configKey">
          <el-input v-model="form.configKey" :disabled="true" placeholder="请输入唯一键" />
        </el-form-item>
        <el-form-item label="值" prop="value">
          <el-input v-model="form.value" placeholder="请输入配置值" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{$t('common.sure')}}</el-button>
        <el-button @click="cancel">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listSet,
  getSet,
  updateSet
} from '@/api/invitation/invitationEvaluateSet'

export default {
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 等级评定信息表格数据
      setList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        value: [{ required: true, message: '配置值不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询等级评定信息列表 */
    getList() {
      this.loading = true
      listSet(this.queryParams).then(response => {
        this.setList = response.rows
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
        configKey: undefined,
        value: undefined,
        title: undefined,
        mtime: undefined,
        ctime: undefined,
        cuser: undefined
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
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getSet(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改等级评定信息'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateSet(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    }
  }
}
</script>
