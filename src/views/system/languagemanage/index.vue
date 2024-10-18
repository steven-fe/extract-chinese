<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="配置key" prop="configKey">
        <el-input
          v-model="queryParams.configKey"
          placeholder="请输入配置key"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="语言key" prop="langKey">
        <el-select v-model="queryParams.langKey" :placeholder="$t('common.pleaseChoose')" size="mini" clearable>
          <el-option
            v-for="item in langKeyList"
            :key="item.key"
            :label="item.language"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <el-input
          v-model="queryParams.content"
          placeholder="请输入内容"
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['coinbull:language:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增配置</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="languageList" border>
      <el-table-column label="配置key" align="center" prop="configKey" />
      <el-table-column label="语言key" align="center" prop="langKey" />
      <el-table-column label="内容" align="center" prop="content" />
      <el-table-column label="描述" align="center" prop="meta" />
      <el-table-column :label="$t('common.operation')" align="center">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['coinbull:language:edit']"
            size="mini"
            icon="el-icon-edit"
            type="primary"
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

    <!-- 添加或修改多语言配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="配置key" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入配置key" clearable />
        </el-form-item>
        <el-form-item label="语言key" prop="langKey">
          <el-input v-model="form.langKey" placeholder="请输入语言key" clearable />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" rows="10" placeholder="请输入内容" clearable />
        </el-form-item>
        <el-form-item label="描述" prop="meta">
          <el-input v-model="form.meta" placeholder="请输入描述" clearable />
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
import {
  listLanguage,
  getLanguage,
  addLanguage,
  updateLanguage
} from '@/api/system/languagemanage'
import { listConfig } from '@/api/system/languageconfig'
export default {
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 多语言配置表格数据
      languageList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      langKeyList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        configKey: undefined,
        langKey: undefined,
        content: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        configKey: [
          { required: true, message: '配置key不能为空', trigger: 'blur' }
        ],
        langKey: [
          { required: true, message: '语言key不能为空', trigger: 'blur' }
        ],
        content: [{ required: true, message: '内容不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getKeyList()
  },
  methods: {
    /** 查询多语言配置列表 */
    getKeyList() {
      this.loading = true
      listConfig().then(response => {
        this.langKeyList = response.rows
        this.loading = false
      })
    },
    getList() {
      this.loading = true
      listLanguage(this.queryParams).then(response => {
        this.languageList = response.rows
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
        configKey: undefined,
        langKey: undefined,
        content: undefined
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加多语言配置'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.form = Object.assign({}, row)
      this.open = true
      this.title = '修改多语言配置'
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateLanguage(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addLanguage(this.form).then(response => {
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
