<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="基础币种" prop="baseSymbol">
        <el-input
          v-model="queryParams.baseSymbol"
          placeholder="请输入基础币种"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="折算币种" prop="quoteSymbol">
        <el-input
          v-model="queryParams.quoteSymbol"
          placeholder="请输入折算币种"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="后台添加" prop="cmsAdd" label-width="180">
        <el-select
          v-model="queryParams.cmsAdd"
          size="mini"
          filterable
          clearable
          placeholder="请选择类型"
        >
          <el-option key="1" label="是" value="1" />
          <el-option key="0" label="不是" value="0" />
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

    <el-table v-loading="loading" border :data="rateList">
      <el-table-column label="基础币种" align="center" prop="baseSymbol" />
      <el-table-column label="折算币种" align="center" prop="quoteSymbol" />
      <el-table-column label="汇率" align="center" prop="rate" />
      <el-table-column label="数据是否来自后台添加" align="center" prop="cmsAdd">
        <template slot-scope="scope">
          <span v-if="scope.row.cmsAdd==0">不是</span>
          <span v-if="scope.row.cmsAdd==1">是</span>
        </template>
      </el-table-column>
      <el-table-column label="创建日期" align="center" prop="ctime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
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

    <!-- 添加或修改汇率记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="基础币种" prop="baseSymbol">
          <el-input v-model="form.baseSymbol" :disabled="isDisabled" placeholder="请输入基础币种" />
        </el-form-item>
        <el-form-item label="折算币种" prop="quoteSymbol">
          <el-select
            v-model="form.quoteSymbol"
            size="mini"
            filterable
            clearable
            :disabled="isDisabled"
            placeholder="请选择折算币种"
          >
            <el-option key="BTC" label="BTC" value="BTC" />
            <el-option key="USDT" label="USDT" value="USDT" />
            <el-option key="ETH" label="ETH" value="ETH" />
          </el-select>
        </el-form-item>
        <el-form-item label="汇率" prop="rate">
          <el-input v-model="form.rate" placeholder="请输入汇率" />
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
  listRate,
  getRate,
  addRate,
  updateRate
} from '@/api/system/symbolRate'

export default {
  data() {
    var checkQuota = (rule, value, callback) => {
      const reg = /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g
      if (!reg.test(value)) {
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
      isDisabled: false,
      // 汇率记录表格数据
      rateList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        baseSymbol: undefined,
        quoteSymbol: undefined,
        cmsAdd: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        baseSymbol: [
          { required: true, message: '基础币种不能为空', trigger: 'blur' }
        ],
        quoteSymbol: [
          { required: true, message: '折算币种不能为空', trigger: 'blur' }
        ],
        rate: [
          { required: true, message: '汇率不能为空', trigger: 'blur' },
          { validator: checkQuota, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询汇率记录列表 */
    getList() {
      this.loading = true
      listRate(this.queryParams).then(response => {
        this.rateList = response.rows
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
        baseSymbol: undefined,
        quoteSymbol: undefined,
        rate: undefined
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
      this.isDisabled = false
      this.open = true
      this.title = '添加汇率记录'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.isDisabled = true
      const id = row.id || this.ids
      getRate(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改汇率记录'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateRate(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addRate(this.form).then(response => {
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
