<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="90px">
      <el-form-item label="用户ID" prop="uid">
        <el-input
          v-model="queryParams.uid"
          placeholder="请输入用户ID"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item :label="$t('common.accountType')" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择账户类型" clearable size="mini">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="保证金币种" prop="marginCoin">
        <el-select v-model="queryParams.marginCoin" size="mini" placeholder="请选择保证金币种">
          <el-option
            v-for="(item, index) in marginList"
            :key="index"
            :label="item.marginCoin"
            :value="item.marginCoin"
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
        <el-button
          v-hasPermi="['coinbull:contract:accAdd']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="accountList" border>
      <el-table-column label="用户ID" align="center" prop="uid" />
      <el-table-column :label="$t('common.accountType')" align="center" prop="type">
        <template slot-scope="scope">
          <div v-for="(item, index, key) in typeOptions" :key="key">
            <span v-if="scope.row.type == item.value">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="保证金币种" align="center" prop="marginCoin" />
      <el-table-column label="添加时间" align="center" prop="ctime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="center" prop="mtime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.mtime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['coinbull:contract:accEdit']"
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
            v-hasPermi="['coinbull:contract:accRemove']"
          >删除</el-button>-->
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

    <!-- 添加或修改产品账户对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="用户ID" prop="uid">
          <el-input v-model="form.uid" placeholder="请输入用户ID" class="input-width" clearable />
        </el-form-item>
        <el-form-item :label="$t('common.accountType')" prop="type">
          <el-select v-model="form.type" placeholder="请选择账户类型" clearable>
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="保证金币种" prop="marginCoin">
          <el-select v-model="form.marginCoin" size="mini" placeholder="请选择保证金币种">
            <el-option
              v-for="(item, index) in marginList"
              :key="index"
              :label="item.marginCoin"
              :value="item.marginCoin"
            />
          </el-select>
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
  listAccount,
  getAccount,
  delAccount,
  addAccount,
  updateAccount
} from '@/api/contract/account'
import { listCoin } from '@/api/contract/margin'

export default {
  name: 'ContractAccount',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 产品账户表格数据
      accountList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      typeOptions: [
        {
          value: '1',
          label: '划转记账账户'
        },
        {
          value: '2',
          label: '平仓账户'
        },
        {
          value: '3',
          label: '手续费账户'
        },
        {
          value: '4',
          label: '资金费用账户'
        },
        {
          value: '5',
          label: '隔夜费账户'
        },
        {
          value: '6',
          label: '营销账户'
        },
        {
          value: '7',
          label: '相互保资金'
        },
        {
          value: '8',
          label: '相互保收益'
        },
        {
          value: '9',
          label: '返佣消耗'
        },
        {
          value: '10',
          label: '兑换账户'
        },
        {
          value: '11',
          label: '积分回购账户'
        }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        uid: undefined,
        type: undefined,
        marginCoin: undefined
      },
      // 表单参数
      form: {},
      marginList: [],
      // 表单校验
      rules: {
        uid: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
        type: [
          { required: true, message: '账户类型不能为空', trigger: 'blur' }
        ],
        marginCoin: [
          { required: true, message: '保证金币种不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getMarginList()
  },
  methods: {
    /** 查询产品账户列表 */
    getList() {
      this.loading = true
      listAccount(this.queryParams).then((response) => {
        this.accountList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    getMarginList() {
      this.loading = true
      listCoin().then((response) => {
        if (response.code == 200) {
          this.marginList = response.rows
          this.loading = false
        } else {
          this.msgError(response.msg)
        }
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
        uid: undefined,
        type: undefined,
        marginCoin: undefined
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
      this.title = '添加产品账户'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getAccount(id).then((response) => {
        this.form = response.data
        this.form.type = response.data.type + ''
        this.open = true
        this.title = '修改产品账户'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id != undefined) {
            updateAccount(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addAccount(this.form).then((response) => {
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
        '是否确认删除产品账户编号为"' + ids + '"的数据项?',
        this.$t('common.alert'),
        {
          confirmButtonText: this.$t('common.sure'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'warning'
        }
      )
        .then(function() {
          return delAccount(ids)
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
<style scoped>
.input-width {
  width: 200px;
}
</style>
