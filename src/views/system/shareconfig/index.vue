<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="分享标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入分享标题"
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
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="configList" border>
      <el-table-column label="分享标题" align="center" prop="title" />
      <el-table-column label="分享内容" align="center" prop="content" />
      <el-table-column :label="$t('common.coin')" align="center" prop="currency" />
      <el-table-column label="配置类" align="center" prop="configType">
        <template slot-scope="scope">
          <span v-for="(item, index) in configTypes" :key="index">
            <span v-if="scope.row.configType==item.value">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="分享奖励数量" align="center" prop="reward" />
      <el-table-column label="分享URL" align="center" prop="url" />
      <el-table-column label="分享logo" align="center" prop="logo" />
      <el-table-column label="下载链接" align="center" prop="downloadUrl" />
      <el-table-column label="二维码链接" align="center" prop="qrcodeUrl" />
      <el-table-column :label="$t('common.operation')" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button> -->
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

    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="分享标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入分享标题" />
        </el-form-item>
        <el-form-item label="分享内容" prop="content">
          <el-input v-model="form.content" placeholder="请输入分享内容" />
        </el-form-item>
        <el-form-item :label="$t('common.coin')" prop="currency">
          <el-input v-model="form.currency" placeholder="请输入币种" />
        </el-form-item>
        <el-form-item label="配置类" prop="configType">
          <el-select v-model="form.configType" placeholder="请选择配置类">
            <el-option
              v-for="item in configTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="奖励数量" prop="reward">
          <el-input v-model.number="form.reward" placeholder="请输入分享奖励数量" />
        </el-form-item>
        <el-form-item label="分享URL" prop="url">
          <el-input v-model="form.url" placeholder="请输入分享URL" />
        </el-form-item>
        <el-form-item label="分享logo" prop="logo">
          <el-input v-model="form.logo" placeholder="请输入分享logo" />
        </el-form-item>
        <el-form-item label="下载链接" prop="downloadUrl">
          <el-input v-model="form.downloadUrl" placeholder="请输入下载链接" />
        </el-form-item>
        <el-form-item label="二维码链接" prop="qrcodeUrl">
          <el-input v-model="form.qrcodeUrl" placeholder="请输入二维码下载链接" />
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
  listConfig,
  getConfig,
  delConfig,
  addConfig,
  updateConfig
} from '@/api/system/shareconfig'

export default {
  name: 'Config',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      total: 0,
      // 表格数据
      configList: [],
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
      configTypes: [
        {
          value: 1,
          label: '注册送币'
        },
        {
          value: 2,
          label: '分享返币'
        },
        {
          value: 3,
          label: '签到返币'
        }
      ],
      // 表单校验
      rules: {
        reward: [
          {
            required: true,
            message: '奖励数量不能为空',
            trigger: 'blur'
          },
          { type: 'number', message: '奖励数量必须为数字值' }
        ],
        title: [
          { required: true, message: '分享标题不能为空', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '分享内容不能为空', trigger: 'blur' }
        ],
        url: [{ required: true, message: '分享URL不能为空', trigger: 'blur' }],
        currency: [
          { required: true, message: this.$t('financemanager.currencyCannotBeEmpty'), trigger: 'blur' }
        ],
        configType: [
          { required: true, message: '配置类不能为空', trigger: 'blur' }
        ],
        logo: [
          { required: true, message: '分享logo不能为空', trigger: 'blur' }
        ],
        downloadUrl: [
          { required: true, message: '下载链接不能为空', trigger: 'blur' }
        ],
        qrcodeUrl: [
          { required: true, message: '二维码链接不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询【请填写功能名称】列表 */
    getList() {
      this.loading = true
      listConfig(this.queryParams).then(response => {
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
        id: undefined,
        exchId: undefined,
        configType: undefined,
        currency: undefined,
        reward: undefined,
        title: undefined,
        content: undefined,
        logo: undefined,
        url: undefined,
        downloadUrl: undefined,
        qrcodeUrl: undefined,
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加返币配置'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getConfig(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改返币配置'
      })
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
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return delConfig(ids)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
        .catch(function() {})
    }
  }
}
</script>
