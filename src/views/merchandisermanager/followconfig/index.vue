<template>
  <div class="app-container">
    <el-table v-loading="loading" border :data="configList">
      <el-table-column label="配置Key" align="center" prop="configKey" />
      <el-table-column label="设置值" align="center" prop="value" />
      <el-table-column label="Key说明" align="center" prop="title" />
      <el-table-column label="创建时间" align="center" prop="ctime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="配置Key" prop="configKey">
          <el-input v-model="form.configKey" disabled />
        </el-form-item>
        <el-form-item label="设置值" prop="value">
          <el-input v-model="form.value" placeholder="请输入设置值" />
        </el-form-item>
        <el-form-item label="Key说明" prop="title">
          <el-input v-model="form.title" disabled />
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
import { findFollowConfig, updateFollowConfig } from '@/api/system/guides'

export default {
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 配置表格数据
      configList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        value: [{ required: true, message: '设置值不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询配置列表 */
    getList() {
      this.loading = true
      findFollowConfig().then(response => {
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
        value: undefined
      }
      this.resetForm('form')
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.form = Object.assign({}, row)
      this.open = true
      this.title = '修改配置'
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          updateFollowConfig(this.form).then(response => {
            if (response.code === 200) {
              this.msgSuccess('修改成功')
              this.open = false
              this.getList()
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    }
  }
}
</script>
