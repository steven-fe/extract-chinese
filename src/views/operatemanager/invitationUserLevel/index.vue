<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="身份等级" prop="levelId">
        <el-select v-model="queryParams.levelId" size="mini" clearable placeholder="请选择身份等级">
          <el-option
            v-for="item in selectList"
            :key="item.levelId"
            :label="item.levelName"
            :value="item.levelId"
          />
        </el-select>
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

    <el-table v-loading="loading" border :data="levelList">
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="身份等级" align="center" prop="levelId">
        <template slot-scope="scope">
          <span v-for="(item,key) in selectList" :key="key">
            <span v-if="item.levelId==scope.row.levelId">{{ item.levelName }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="评定类型" align="center" prop="evaluateType">
        <template slot-scope="scope">
          <span v-for="(item,key) in evaluateTypes" :key="key">
            <span v-if="item.value==scope.row.evaluateType">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="连续未达标次数 " align="center" prop="noConformanceNum" />
      <el-table-column label="创建时间" align="center" prop="ctime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="mtime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.mtime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
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

    <!-- 添加或修改用户身份等级信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="form.userId" :disabled="disabled" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="身份等级" prop="levelId">
          <el-select v-model="form.levelId" size="mini" clearable placeholder="请选择状态">
            <el-option
              v-for="item in selectList"
              :key="item.levelId"
              :label="item.levelName"
              :value="item.levelId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="评定类型" prop="evaluateType">
          <el-select v-model="form.evaluateType" placeholder="请选择评定类型">
            <el-option
              v-for="item in evaluateTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
  listUserLevel,
  getLevel,
  addLevel,
  updateLevel
} from '@/api//invitation/invitationuserlevel'
import { listLevel } from '@/api//invitation/invitationlevel'
export default {
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 用户身份等级信息表格数据
      levelList: [],
      // 弹出层标题
      title: '',
      selectList: [],
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: undefined,
        levelId: undefined
      },
      disabled: false,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        userId: [
          { required: true, message: '用户ID不能为空', trigger: 'blur' }
        ],
        levelId: [
          { required: true, message: '身份等级不能为空', trigger: 'blur' }
        ],
        evaluateType: [
          { required: true, message: '评定类型不能为空', trigger: 'blur' }
        ]
      },
      evaluateTypes: [
        {
          value: 1,
          label: '系统评定'
        },
        {
          value: 2,
          label: '操作员评定'
        },
        {
          value: 3,
          label: '用户消耗升级'
        },
        {
          value: 4,
          label: '用户抵押升级'
        }
      ]
    }
  },
  created() {
    this.getList()
    this.getSelect()
  },
  methods: {
    /** 查询用户身份等级信息列表 */
    getList() {
      this.loading = true
      listUserLevel(this.queryParams).then((response) => {
        this.levelList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    getSelect() {
      this.loading = true
      listLevel().then((response) => {
        this.selectList = response.rows
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
        evaluateType: undefined,
        noConformanceNum: undefined,
        levelId: undefined,
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
      this.disabled = false
      this.title = '添加用户身份等级信息'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.disabled = true
      const id = row.id || this.ids
      getLevel(id).then((response) => {
        this.form = response.data
        this.open = true
        this.title = '修改用户身份等级信息'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id != undefined) {
            updateLevel(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addLevel(this.form).then((response) => {
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
