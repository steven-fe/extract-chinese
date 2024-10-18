<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="90px">
      <el-form-item label="保证金币种" prop="marginCoin">
        <el-select
          v-model="queryParams.marginCoin"
          clearable
          size="mini"
          placeholder="请选择保证金币种"
        >
          <el-option
            v-for="(item, index) in goodsMarginList"
            :key="index"
            :label="item.marginCoin"
            :value="item.marginCoin"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="周期" prop="period">
        <el-input
          v-model="queryParams.period"
          placeholder="请输入周期"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="交易额" prop="tradeVolume">
        <el-input
          v-model="queryParams.tradeVolume"
          placeholder="请输入交易额"
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
          v-hasPermi="['coinbull:partner:validuser:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="userList" border>
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="保证金币种" align="center" prop="marginCoin" />
      <el-table-column label="周期" align="center" prop="period">
        <template slot-scope="scope">
          <span v-if="scope.row.period != null">{{ scope.row.period }}</span>
          <span v-for="opt in periodUnitOptions" :key="opt.periodUnit">
            <span v-if="scope.row.periodUnit==opt.periodUnit">{{ opt.unitName }}<br></span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="交易额" align="center" prop="tradeVolume" />
      <el-table-column :label="$t('common.remarks')" align="center" prop="remark" />
      <el-table-column :label="$t('common.operation')" align="center" class-name="small-padding fixed-width" width="200px">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['coinbull:partner:validuser:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['coinbull:partner:validuser:remove']"
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

    <!-- 添加或修改有效用户判定配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="保证金币种" prop="marginCoin">
          <el-select
            v-model="form.marginCoin"
            clearable
            placeholder="请选择保证金币种"
          >
            <el-option
              v-for="(item, index) in goodsMarginList"
              :key="index"
              :label="item.marginCoin"
              :value="item.marginCoin"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="周期" prop="period">
          <el-input v-model="form.period" placeholder="请输入周期" style="width:200px" clearable />
        </el-form-item>
        <el-form-item label="周期单位" prop="periodUnit">
          <el-select v-model="form.periodUnit" placeholder="请选择周期单位" clearable>
            <el-option
              v-for="item in periodUnitOptions"
              :key="item.periodUnit"
              :label="item.unitName"
              :value="item.periodUnit"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="交易额" prop="tradeVolume">
          <el-input v-model="form.tradeVolume" placeholder="请输入交易额" style="width:200px" clearable />
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
import { listUser, getUser, delUser, addUser, updateUser, exportUser } from '@/api/invitation/validuser'
import { listCoinGoods } from '@/api/contract/coin'

export default {
  name: 'ValidUser',
  data() {
    return {
      // 币种列表
      goodsMarginList: [],
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      periodUnitOptions: [
        {
          periodUnit: 1,
          unitName: '天'
        }
      ],
      // 有效用户判定配置表格数据
      userList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        marginCoin: undefined,
        period: undefined,
        periodUnit: undefined,
        tradeVolume: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        marginCoin: [
          { required: true, message: '保证金币种不能为空', trigger: 'blur' }
        ],
        period: [
          { required: true, message: '周期不能为空', trigger: 'blur' },
          { pattern: /^([1-9]|[1-9]\d*)$/, message: '请输入大于0的正整数', trigger: 'blur' }
        ],
        periodUnit: [
          { required: true, message: '周期单位不能为空', trigger: 'blur' }
        ],
        tradeVolume: [
          { required: true, message: '交易额不能为空', trigger: 'blur' },
          { pattern: /^(([1-9]\d*)|([[1-9]\d*\.\d*)|(0\.(\d*[1-9])))$/, message: '请输入大于0的正整数或小数', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getListCoinGoodsList()
    this.getList()
  },
  methods: {
    // 商品id列表
    getListCoinGoodsList() {
      listCoinGoods().then((response) => {
        if (response.code == 200) {
          this.goodsMarginList = this.unique3(response.rows)
        }
      })
    },
    // 过滤
    unique3(arr) {
      const res = new Map()
      return arr.filter(
        (arr) => !res.has(arr.marginCoin) && res.set(arr.marginCoin, 1)
      )
    },
    /** 查询有效用户判定配置列表 */
    getList() {
      this.loading = true
      listUser(this.queryParams).then(response => {
        this.userList = response.rows
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
        marginCoin: undefined,
        period: undefined,
        periodUnit: undefined,
        tradeVolume: undefined,
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
      this.title = '添加有效用户判定配置'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getUser(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改有效用户判定配置'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateUser(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addUser(this.form).then(response => {
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
      this.$confirm('是否确认删除有效用户判定配置编号为"' + ids + '"的数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(function() {
        return delUser(ids)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    }
  }
}
</script>
