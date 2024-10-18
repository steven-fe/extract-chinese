<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="商品ID" prop="goodsId">
        <el-select
          v-model="queryParams.goodsId"
          size="mini"
          placeholder="请选择商品ID"
        >
          <el-option
            v-for="(item, index) in goodsList"
            :key="index"
            :label="item.goodsId"
            :value="item.goodsId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="商品名称" prop="goodsName">
        <el-input
          v-model="queryParams.goodsName"
          placeholder="请输入商品名"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品类型" prop="goodsType">
        <el-select
          v-model="queryParams.goodsType"
          placeholder="请选择商品类型"
          clearable
          size="mini"
        >
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="基础币种" prop="baseCoin">
        <el-select
          v-model="queryParams.baseCoin"
          size="mini"
          clearable
          filterable
          placeholder="请选择基础币种"
        >
          <el-option
            v-for="(item, index) in cfdList"
            :key="index"
            :label="item.currency"
            :value="item.currency"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="法币" prop="quoteCoin">
        <el-select
          v-model="queryParams.quoteCoin"
          size="mini"
          clearable
          filterable
          placeholder="请选择法币"
        >
          <el-option
            v-for="(item, index) in ctcList"
            :key="index"
            :label="item.currency"
            :value="item.currency"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >{{$t('common.search')}}</el-button>
        <el-button
          icon="el-icon-refresh"
          size="mini"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['coinbull:contract:gooAdd']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['coinbull:contract:createFile']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleCreate"
        >生成JSON文件（Kline）</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="goodsList" border>
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="商品ID" align="center" prop="goodsId" />
      <el-table-column label="商品名称" align="center" prop="goodsName" />
      <el-table-column label="商品类型" align="center" prop="goodsType">
        <template slot-scope="scope">
          <div v-for="(item, index, key) in typeOptions" :key="key">
            <span v-if="scope.row.goodsType == item.value">{{
              item.label
            }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="基础币种" align="center" prop="baseCoin" />
      <el-table-column label="法币" align="center" prop="quoteCoin" />
      <el-table-column label="最少买入数量" align="center" prop="minAmount" />
      <el-table-column label="最多买入数量" align="center" prop="maxAmount" />
      <el-table-column label="递增单位" align="center" prop="perStep" />
      <el-table-column
        label="保证金精度"
        align="center"
        prop="marginPrecision"
      />
      <el-table-column label="价格精度" align="center" prop="pricePrecision" />
      <!-- <el-table-column label="最大持单数" align="center" prop="maxOrders" /> -->
      <!-- <el-table-column label="开仓手续费率" align="center" prop="openRate" /> -->
      <!-- <el-table-column label="平仓手续费率" align="center" prop="closeRate" /> -->
      <!-- <el-table-column label="隔夜手续费率" align="center" prop="stayNightRate" /> -->
      <el-table-column label="预警保证金率" align="center" prop="warningRate" />
      <!-- <el-table-column label="最大支持保证金币种数量" align="center" prop="maxMarginCoin" /> -->
      <el-table-column label="添加日期" align="center" prop="ctime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改日期" align="center" prop="mtime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.mtime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.operation')"
        align="center"
        width="80"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['coinbull:contract:gooEdit']"
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
            v-hasPermi="['coinbull:contract:gooRemove']"
          >删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改产品配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px">
      <el-form ref="form" :model="form" :rules="rules" label-width="180px">
        <el-form-item label="商品ID" prop="goodsId">
          <el-input v-show="false" v-model="form.goodsId" />
          <el-tag>{{ form.baseCoin }}-{{ form.quoteCoin }}</el-tag>
        </el-form-item>
        <el-form-item label="商品名称" prop="goodsName">
          <el-input v-show="false" v-model="form.goodsName" />
          <el-tag>{{ form.baseCoin }}-{{ form.quoteCoin }}</el-tag>
        </el-form-item>
        <el-form-item label="商品类型" prop="goodsType">
          <el-select
            v-model="form.goodsType"
            placeholder="请选择商品类型"
            clearable
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="基础币种" prop="baseCoin">
          <el-select
            v-model="form.baseCoin"
            size="mini"
            clearable
            filterable
            placeholder="请选择基础币种"
          >
            <el-option
              v-for="(item, index) in cfdList"
              :key="index"
              :label="item.currency"
              :value="item.currency"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="法币" prop="quoteCoin">
          <el-select
            v-model="form.quoteCoin"
            size="mini"
            clearable
            filterable
            placeholder="请选择法币"
          >
            <el-option
              v-for="(item, index) in ctcList"
              :key="index"
              :label="item.currency"
              :value="item.currency"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="最少买入数量" prop="minAmount">
          <el-input
            v-model="form.minAmount"
            placeholder="请输入最少买入数量"
            class="input-width"
            clearable
          />
        </el-form-item>
        <el-form-item label="最多买入数量" prop="maxAmount">
          <el-input
            v-model="form.maxAmount"
            placeholder="请输入最多买入数量"
            class="input-width"
            clearable
          />
        </el-form-item>
        <el-form-item label="递增单位" prop="perStep">
          <el-input
            v-model="form.perStep"
            placeholder="请输入递增单位"
            class="input-width"
            clearable
          />
        </el-form-item>
        <el-form-item label="保证金精度" prop="marginPrecision">
          <el-input
            v-model="form.marginPrecision"
            placeholder="请输入保证金精度"
            class="input-width"
            clearable
          />
        </el-form-item>
        <el-form-item label="价格精度" prop="pricePrecision">
          <el-input
            v-model="form.pricePrecision"
            placeholder="请输入价格精度"
            class="input-width"
            clearable
          />
        </el-form-item>
        <!-- <el-form-item label="最大持单数" prop="maxOrders">
          <el-input v-model="form.maxOrders" placeholder="请输入最大持单数" class="input-width" clearable />
        </el-form-item> -->
        <!-- <el-form-item label="开仓手续费率" prop="openRate">
          <el-input v-model="form.openRate" placeholder="请输入开仓手续费率" class="input-width" clearable />
        </el-form-item> -->
        <!-- <el-form-item label="平仓手续费率" prop="closeRate">
          <el-input v-model="form.closeRate" placeholder="请输入平仓手续费率" class="input-width" clearable />
        </el-form-item> -->
        <!-- <el-form-item label="隔夜手续费率" prop="stayNightRate">
          <el-input
            v-model="form.stayNightRate"
            placeholder="请输入隔夜手续费率"
            class="input-width"
            clearable
          />
        </el-form-item> -->
        <el-form-item label="预警保证金率" prop="warningRate">
          <el-input
            v-model="form.warningRate"
            placeholder="请输入预警保证金率"
            class="input-width"
            clearable
          />
        </el-form-item>
        <!-- <el-form-item label="最大支持保证金币种数量" prop="maxMarginCoin">
          <el-input
            v-model="form.maxMarginCoin"
            placeholder="请输入最大支持保证金币种数量"
            class="input-width"
            clearable
          />
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          size="mini"
          @click="submitForm"
        >{{$t('common.sure')}}</el-button>
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  createFile,
  listGoods,
  getGoods,
  delGoods,
  addGoods,
  updateGoods
} from '@/api/contract/goods'
import { listSupportTokenByType } from '@/api/coin'
export default {
  name: 'ContractGoods',
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
        callback(new Error('该参数必须大于0'))
      } else {
        callback()
      }
    }
    var checkQuota2 = (rule, value, callback) => {
      // 正整数
      const reg = /^[+]{0,1}(\d+)$/g
      if (value === '') {
        callback(new Error(this.$t('frozen.pleaseEnterContent')))
      } else if (!reg.test(value)) {
        callback(new Error('请输入0及0以上的整数'))
      } else {
        callback()
      }
    }

    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 产品配置表格数据
      goodsList: [],
      goodsListSelect: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      cfdList: [],
      ctcList: [],
      formGoodsId: undefined,
      formGoodsName: undefined,
      typeOptions: [
        {
          value: '1',
          label: '虚拟货币'
        },
        {
          value: '2',
          label: '股指'
        },
        {
          value: '3',
          label: '原油贵金属'
        },
        {
          value: '4',
          label: '外汇'
        }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        goodsId: undefined,
        goodsName: undefined,
        goodsType: undefined,
        baseCoin: undefined,
        quoteCoin: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        goodsId: [
          { required: true, message: '商品ID不能为空', trigger: 'blur' }
        ],
        goodsName: [
          { required: true, message: '商品名称不能为空', trigger: 'blur' }
        ],
        goodsType: [
          { required: true, message: '商品类型不能为空', trigger: 'blur' }
        ],
        baseCoin: [
          { required: true, message: '基础币种不能为空', trigger: 'blur' }
        ],
        quoteCoin: [
          { required: true, message: '法币不能为空', trigger: 'blur' }
        ],
        minAmount: [
          { required: true, message: '最少买入数量不能为空', trigger: 'blur' },
          { validator: checkQuota, trigger: 'blur' }
        ],
        maxAmount: [
          { required: true, message: '最多买入数量不能为空', trigger: 'blur' },
          { validator: checkQuota, trigger: 'blur' }
        ],
        pricePrecision: [
          { required: true, message: '价格精度不能为空', trigger: 'blur' },
          { validator: checkQuota2, trigger: 'blur' }
        ],
        perStep: [
          { required: true, message: '递增单位不能为空', trigger: 'blur' }
        ],
        marginPrecision: [
          { required: true, message: '保证金精度不能为空', trigger: 'blur' }
        ],
        // maxOrders: [
        //   { required: true, message: "最大持单数不能为空", trigger: "blur" }
        // ],
        // openRate: [
        //   { required: true, message: "开仓手续费率不能为空", trigger: "blur" }
        // ],
        // closeRate: [
        //   { required: true, message: "平仓手续费率不能为空", trigger: "blur" }
        // ],
        // stayNightRate: [
        //   { required: true, message: "隔夜手续费率不能为空", trigger: "blur" }
        // ],
        warningRate: [
          { required: true, message: '预警保证金率不能为空', trigger: 'blur' }
        ]
        // maxMarginCoin: [
        //   {
        //     required: true,
        //     message: "最大支持保证金币种数量不能为空",
        //     trigger: "blur"
        //   }
        // ]
      }
    }
  },
  created() {
    this.getList()
    this.getListSelect()
    this.SupportToken('is_support_cfd')
    this.SupportToken('is_support_ctc')
  },
  methods: {
    /** 查询产品配置列表 */
    getList() {
      this.loading = true
      listGoods(this.queryParams).then((response) => {
        this.goodsList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    getListSelect() {
      this.loading = true
      listGoods().then((response) => {
        this.goodsListSelect = response.rows
        this.loading = false
      })
    },
    SupportToken(type) {
      const form = {}
      this.loading = true
      this.$set(form, type, 1)
      listSupportTokenByType(form).then((response) => {
        if (response.code == 200) {
          if (type == 'is_support_cfd') {
            this.cfdList = response.rows
            this.loading = false
          } else if (type == 'is_support_ctc') {
            this.ctcList = response.rows
            this.loading = false
          }
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
        goodsId: undefined,
        goodsName: undefined,
        goodsType: undefined,
        baseCoin: undefined,
        quoteCoin: undefined,
        minAmount: undefined,
        maxAmount: undefined,
        perStep: undefined,
        marginPrecision: undefined,
        pricePrecision: undefined,
        // maxOrders: undefined,
        // openRate: undefined,
        // closeRate: undefined,
        // stayNightRate: undefined,
        warningRate: undefined
        // maxMarginCoin: undefined
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
      this.title = '添加产品配置'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getGoods(id).then((response) => {
        this.form = response.data
        this.form.goodsType = response.data.goodsType + ''
        this.open = true
        this.title = '修改产品配置'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.form.goodsId = this.form.baseCoin + '-' + this.form.quoteCoin
      this.form.goodsName = this.form.baseCoin + '-' + this.form.quoteCoin
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id != undefined) {
            updateGoods(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addGoods(this.form).then((response) => {
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
        '是否确认删除产品配置编号为"' + ids + '"的数据项?',
        this.$t('common.alert'),
        {
          confirmButtonText: this.$t('common.sure'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'warning'
        }
      )
        .then(function() {
          return delGoods(ids)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
        .catch(function() {})
    },
    handleCreate() {
      this.$confirm('是否确认下载JSON文件?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return createFile()
        })
        .then((response) => {
          this.download(response.msg)
        })
        .catch(function() {})
    }
  }
}
</script>
<style scoped>
.input-width {
  width: 300px;
}
</style>
