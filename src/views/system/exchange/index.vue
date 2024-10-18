<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="100px">
      <el-form-item label="交易所编号" prop="exchId">
        <el-input
          v-model="queryParams.exchId"
          placeholder="请输入交易所编号"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="交易所名称" prop="nameEn">
        <el-input
          v-model="queryParams.nameEn"
          placeholder="请输入交易所名称"
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
          v-hasPermi="['system:exchange:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="infoList" border>
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column label="交易所编号" align="center" prop="exchId" />
      <el-table-column label="交易所名称(EN)" align="center" prop="nameEn" />
      <el-table-column label="交易所名称(CH)" align="center" prop="nameCh" />
      <el-table-column label="交易所状态" align="center" prop="exchStatus">
        <template slot-scope="scope">
          <div v-if="scope.row.exchStatus === 0">关闭</div>
          <div v-else-if="scope.row.exchStatus === 1">开启</div>
        </template>
      </el-table-column>
      <el-table-column label="交易所上市时间" align="center" prop="openDate" width="180">
        <template slot-scope="scope">
          <span>{{ getDateYMD(scope.row.openDate, '-') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="交易所补充信息" align="center" prop="exchDetail" />
      <el-table-column :label="$t('common.remarks')" align="center" prop="remark" />
      <el-table-column :label="$t('common.operation')" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['system:exchange:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['system:exchange:remove']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
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

    <!-- 添加或修改交易所信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="130px">
        <el-form-item label="交易所编号" prop="exchId">
          <div v-if="form.id === undefined"><el-input v-model="form.exchId" placeholder="请输入交易所编号" /></div>
          <div v-else>{{ form.exchId }}</div>
        </el-form-item>
        <el-form-item label="交易所名称(EN)" prop="nameEn">
          <el-input v-model="form.nameEn" placeholder="请输入交易所名称(EN)" clearable />
        </el-form-item>
        <el-form-item label="交易所名称(CH)" prop="nameCh">
          <el-input v-model="form.nameCh" placeholder="请输入交易所名称(CH)" clearable />
        </el-form-item>
        <el-form-item label="交易所状态">
          <el-radio-group v-model="form.exchStatus">
            <el-radio label="0">关闭</el-radio>
            <el-radio label="1">开启</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="交易所上市时间" prop="openDate">
          <el-date-picker
            v-model="form.openDate"
            clearable
            size="mini"
            style="width: 200px"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择交易所上市时间"
          />
        </el-form-item>
        <el-form-item label="交易所补充信息" prop="exchDetail">
          <el-input v-model="form.exchDetail" type="textarea" placeholder="请输入内容" clearable />
        </el-form-item>
        <el-form-item :label="$t('common.remarks')" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" clearable />
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
import { listInfo, getInfo, delInfo, addInfo, updateInfo } from '@/api/system/exchange'

export default {
  name: 'Info',
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
      // 交易所信息表格数据
      infoList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        exchId: undefined,
        nameEn: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        exchId: [
          { required: true, message: '交易所编号不能为空', trigger: 'blur' }
        ],
        nameEn: [
          { required: true, message: '交易所名称（英文）不能为空', trigger: 'blur' }
        ],
        nameCh: [
          { required: true, message: '交易所名称（中文）不能为空', trigger: 'blur' }
        ],
        openDate: [
          { required: true, message: '交易所上市时间不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询交易所信息列表 */
    getList() {
      this.loading = true
      listInfo(this.queryParams).then(response => {
        this.infoList = response.rows
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
        nameEn: undefined,
        nameCh: undefined,
        exchStatus: '1',
        openDate: undefined,
        exchDetail: undefined,
        remark: undefined
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
      this.title = '添加交易所信息'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getInfo(id).then(response => {
        this.form = response.data
        this.form.exchStatus = response.data.exchStatus + ''
        this.open = true
        this.title = '修改交易所信息'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateInfo(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addInfo(this.form).then(response => {
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
      this.$confirm('是否确认删除交易所信息编号为"' + ids + '"的数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(function() {
        return delInfo(ids)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    }
  }
}
</script>
