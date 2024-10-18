<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['coinbull:configlanguage:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增配置</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="configList" border>
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="编码" align="center" prop="key" />
      <el-table-column label="语种" align="center" prop="language" />
      <el-table-column :label="$t('common.status')" align="center" prop="isOpen">
        <template slot-scope="scope">
          <span v-if="scope.row.isOpen == 1">启用</span>
          <span v-else>关闭</span>
        </template>
      </el-table-column>
      <el-table-column label="短信签名" align="center" prop="smsHead" />
      <el-table-column label="邮件签名" align="center" prop="emailHead" />
      <el-table-column :label="$t('common.operation')" align="center">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['coinbull:configlanguage:edit']"
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改语言配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="编码" prop="key">
          <el-input v-if="form.id == undefined" v-model="form.key" placeholder="请输入编码" clearable />
          <el-input v-else v-model="form.key" disabled placeholder="请输入编码" clearable />
        </el-form-item>
        <el-form-item label="语言" prop="language">
          <el-input v-if="form.id == undefined" v-model="form.language" placeholder="请输入语言" clearable />
          <el-input v-else v-model="form.language" disabled placeholder="请输入语言" clearable />
        </el-form-item>
        <el-form-item :label="$t('common.status')">
          <el-radio-group v-model="form.isOpen">
            <el-radio label="1">启用</el-radio>
            <el-radio label="0">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="短信签名" prop="smsHead">
          <el-input v-model="form.smsHead" placeholder="请输入签名" clearable />
        </el-form-item>
        <el-form-item label="邮件签名" prop="emailHead">
          <el-input v-model="form.emailHead" placeholder="请输入签名" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="submitForm">{{$t('common.sure')}}</el-button>
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listConfig, addConfig, updateConfig } from '@/api/system/languageconfig'

export default {
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 语言配置表格数据
      configList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        key: [{ required: true, message: '编码不能为空', trigger: 'blur' }],
        language: [{ required: true, message: '语言不能为空', trigger: 'blur' }],
        smsHead: [{ required: true, message: '短信签名不能为空', trigger: 'blur' }],
        emailHead: [{ required: true, message: '邮件签名不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询语言配置列表 */
    getList() {
      this.loading = true
      listConfig().then(response => {
        this.configList = response.rows
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
        key: undefined,
        language: undefined,
        isOpen: '1',
        smsHead: undefined,
        emailHead: undefined
      }
      this.resetForm('form')
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加语言配置'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.form = Object.assign({}, row)
      this.form.isOpen = this.form.isOpen + ''
      this.open = true
      this.title = '修改语言配置'
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateConfig(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addConfig(this.form).then(response => {
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
    }
  }
}
</script>
