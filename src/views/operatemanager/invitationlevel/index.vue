<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="身份等级" prop="levelId">
        <el-select v-model="queryParams.levelId" size="mini" prop="levelId" placeholder="请选择邀请人级别">
          <el-option v-for="item in levelIds" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['coinbull:partner:level:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" border :data="levelList">
      <el-table-column label="身份等级" align="center" prop="levelId" />
      <el-table-column label="身份等级名称" align="center" prop="levelName" />
      <el-table-column label="返佣比例" align="center" prop="invitationRate">
        <template slot-scope="scope">
          <span>{{ scope.row.invitationRate*100 }}%</span>
        </template>
      </el-table-column>
      <el-table-column label="有效用户数" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.effectiveUserMin+"~"+scope.row.effectiveUserMax }}</span>
        </template>
      </el-table-column>
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
          <el-button
            v-hasPermi="['coinbull:partner:level:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['coinbull:partner:level:remove']"
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

    <!-- 添加或修改身份等级信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="身份等级" prop="levelId">
          <el-select v-model="form.levelId" :disabled="disabled" placeholder="请选择邀请人级别">
            <el-option v-for="item in levelIds" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="身份等级名称" prop="levelName">
          <el-input v-model="form.levelName" placeholder="请输入身份等级名称" />
        </el-form-item>
        <el-form-item label="返佣比例" prop="invitationRate">
          <el-input v-model="form.invitationRate" placeholder="请输入返佣比例">
            <template slot="append">%</template>
          </el-input>
        </el-form-item>
        <el-form-item label="有效用户数下限" prop="effectiveUserMin">
          <el-input v-model="form.effectiveUserMin" placeholder="请输入有效用户数下限" />
        </el-form-item>
        <el-form-item label="有效用户数上限" prop="effectiveUserMax">
          <el-input v-model="form.effectiveUserMax" placeholder="请输入有效用户数上限" />
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
  listLevel,
  getLevel,
  delLevel,
  addLevel,
  updateLevel
} from '@/api/invitation/invitationlevel'

export default {
  data() {
    var checkQuota = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('返佣比例不能为空!'))
      }
      if (String(value).includes(' ')) {
        callback(new Error(this.$t('frozen.cannotContainSpaces')))
      }
      if (!Number.isFinite(Number(value))) {
        callback(new Error('请输入数字值!'))
      } else {
        if (value <= 0 || value > 100) {
          callback(new Error('数值范围0-100'))
        } else {
          callback()
        }
      }
    }
    return {
      // 遮罩层
      loading: true,
      disabled: false,
      // 总条数
      total: 0,
      // 身份等级信息表格数据
      levelList: [],
      levelIds: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        levelId: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        levelId: [
          { required: true, message: '身份等级不能为空', trigger: 'blur' }
        ],
        levelName: [
          { required: true, message: '身份等级名称不能为空', trigger: 'blur' }
        ],
        effectiveUserMin: [
          { required: true, message: '有效用户数下限不能为空', trigger: 'blur' }
        ],
        effectiveUserMax: [
          { required: true, message: '有效用户数上限不能为空', trigger: 'blur' }
        ],
        invitationRate: [
          { validator: checkQuota, trigger: 'blur' },
          { required: true, message: '返佣比例不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    for (var i = 1; i <= 10; i++) this.levelIds.push(i)
  },
  methods: {
    /** 查询身份等级信息列表 */
    getList() {
      this.loading = true
      listLevel(this.queryParams).then(response => {
        this.levelList = response.rows
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
        levelId: undefined,
        levelName: undefined,
        invitationRate: undefined,
        effectiveUserMin: undefined,
        effectiveUserMax: undefined
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
      this.disabled = false
      this.open = true
      this.title = '添加身份等级信息'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.disabled = true
      const id = row.id || this.ids
      getLevel(id).then(response => {
        this.form = response.data
        this.form.invitationRate = this.form.invitationRate * 100
        this.open = true
        this.title = '修改身份等级信息'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const data = Object.assign({}, this.form)
          data.invitationRate = this.form.invitationRate / 100
          if (this.form.id != undefined) {
            updateLevel(data).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addLevel(data).then(response => {
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
      const levelName = row.levelName
      this.$confirm(
        '是否确认删除身份等级为"' + levelName + '"的数据项?',
        this.$t('common.alert'),
        {
          confirmButtonText: this.$t('common.sure'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'warning'
        }
      )
        .then(function() {
          return delLevel(ids)
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
