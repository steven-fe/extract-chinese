<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item :label="$t('common.coin')" prop="symbol">
        <el-select v-model="queryParams.symbol" clearable size="mini" placeholder="请选择币种">
          <el-option
            v-for="(item, index) in coinList"
            :key="index"
            :label="item.currency"
            :value="item.currency"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="用户id" prop="uid">
        <el-input v-model="queryParams.uid" placeholder="请输入用户id" clearable size="mini" />
      </el-form-item>
      <el-form-item label="资产类型" prop="itemType">
        <el-select v-model="queryParams.itemType" clearable size="mini" placeholder="请选择资产类型">
          <el-option
            v-for="(item, index) in scenesList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="平账类型" prop="directType">
        <el-select v-model="queryParams.directType" clearable size="mini" placeholder="请选择平账类型">
          <el-option
            v-for="(item, index) in directTypeList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="flatStatus">
        <el-select v-model="queryParams.flatStatus" clearable size="mini" placeholder="请选择状态">
          <el-option
            v-for="(item, index) in statusList"
            :key="index"
            :label="item.label"
            :value="item.value"
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
          v-hasPermi="['coinbull:account:flat:bill:apply']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="flatList" border>
      <el-table-column :label="$t('common.coin')" align="center" prop="symbol" />
      <el-table-column label="用户id" align="center" prop="uid" />
      <el-table-column label="金额" align="center" prop="amount" />
      <el-table-column label="资产类型" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.itemType=='finance_flat_bill_scene'">钱包资产</span>
          <span v-if="scope.row.itemType=='contract_flat_bill_scene'">合约资产</span>
        </template>
      </el-table-column>
      <el-table-column label="平账类型" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.directType==1">用户支出</span>
          <span v-if="scope.row.directType==2">用户收入</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.status')" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.flatStatus==0">未审核</span>
          <span v-if="scope.row.flatStatus==1">审核通过</span>
          <span v-if="scope.row.flatStatus==2">审核拒绝</span>
        </template>
      </el-table-column>
      <el-table-column label="最后操作人" align="center" prop="opUid" />
      <el-table-column label="创建时间" align="center" prop="ctime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" align="center" width="260" class-name="small-padding fixed-width">
        <template v-if="scope.row.flatStatus==0" slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row,1)"
          >审核通过</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row,2)"
          >审核拒绝</el-button>
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['coinbull:contract:levRemove']"
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

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="$t('common.coin')" prop="symbol">
          <el-select v-model="form.symbol" size="mini" placeholder="请选择商品ID">
            <el-option
              v-for="(item, index) in coinList"
              :key="index"
              :label="item.currency"
              :value="item.currency"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用户id" prop="uid">
          <el-input
            v-model="form.uid"
            placeholder="请输入用户id"
            class="input-width"
            clearable
          />
        </el-form-item>
        <el-form-item label="资产类型" prop="itemType">
          <el-radio-group v-model="form.itemType" size="mini">
            <el-radio label="finance_flat_bill_scene">钱包资产</el-radio>
            <el-radio label="contract_flat_bill_scene">合约资产</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="平账类型" prop="directType">
          <el-radio-group v-model="form.directType" size="mini">
            <el-radio :label="1">用户支出</el-radio>
            <el-radio :label="2">用户收入</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input v-model="form.amount" placeholder="请输入金额" class="input-width" clearable />
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
  listFlatBill,
  applyFlatBill,
  editFlatBill,
  approveFlatBill
} from '@/api/finance/flat'
import { listSupportTokenByType } from '@/api/coin'

export default {
  data() {
    var checkQuota = (rule, value, callback) => {
      const reg = /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g
      if (value === '') {
        callback(new Error(this.$t('frozen.pleaseEnterContent')))
      } else if (!reg.test(value)) {
        callback(new Error(this.$t('frozen.pleaseEnterTheNumber')))
      }
      if (String(value).includes(' ')) {
        callback(new Error(this.$t('frozen.cannotContainSpaces')))
      }
      if (value <= 0) {
        callback(new Error(this.$t('frozen.theAmountMustBeGreaterThan0')))
      } else {
        callback()
      }
    }
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 平账表格数据
      flatList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        uid: undefined,
        symbol: undefined,
        itemType: undefined,
        directType: undefined,
        flatStatus: undefined
      },
      // 币种
      coinList: [],
      // 状态
      statusList: [
        { value: '0', label: '未审核' },
        { value: '1', label: '审核通过' },
        { value: '2', label: '审核拒绝' }
      ],
      // 平账类型
      directTypeList: [
        { value: 1, label: '用户支出' },
        { value: 2, label: '用户收入' }
      ],
      // 资产类型
      scenesList: [
        { value: 'finance_flat_bill_scene', label: '钱包资产' },
        { value: 'contract_flat_bill_scene', label: '合约资产' }
      ],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        symbol: [
          { required: true, message: '币种ID不能为空', trigger: 'blur' }
        ],
        uid: [{ required: true, message: '用户id不能为空', trigger: 'blur' }],
        itemType: [
          { required: true, message: '资产类型不能为空', trigger: 'blur' }
        ],
        directType: [
          { required: true, message: '平账类型不能为空', trigger: 'blur' }
        ],
        amount: [
          { required: true, message: this.$t('contractmanager.amountCannotBeEmpty'), trigger: 'blur' },
          { validator: checkQuota, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.SupportToken()
  },
  methods: {
    /** 查询产品杠杆配置列表 */
    getList() {
      this.loading = true
      listFlatBill(this.queryParams).then(response => {
        this.flatList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    SupportToken() {
      const data = {}
      listSupportTokenByType(data).then(response => {
        if (response.code == 200) {
          this.coinList = response.rows
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
        symbol: undefined,
        itemType: undefined,
        directType: undefined,
        flatStatus: undefined,
        amount: undefined
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
      this.title = '添加平账申请'
    },
    /** 修改按钮操作 */
    handleEdit(row) {
      this.reset()
      this.form = Object.assign({}, row)
      this.open = true
      this.title = '修改平账申请'
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            editFlatBill(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            applyFlatBill(this.form).then(response => {
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
    // 审核
    handleUpdate(row, index) {
      const str = index == 1 ? '通过' : '拒绝'
      this.$confirm('确定审核' + str + ', 是否继续?', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(() => {
          this.loading = true
          const param = {
            id: row.id,
            operate: index
          }
          approveFlatBill(param)
            .then(response => {
              this.$message({
                showClose: true,
                message: '审核 ' + str + ' 成功',
                type: 'success'
              })
              this.getList()
              this.loading = false
            })
            .catch(error => {
              this.$message({
                showClose: true,
                message: '审核 ' + str + ' 失败',
                type: 'error'
              })
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
    }
  }
}
</script>
<style scoped>
.input-width {
  width: 300px;
}
</style>
