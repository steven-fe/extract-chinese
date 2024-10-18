<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="90px"
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
      <el-form-item label="保证金币种" prop="marginCoin">
        <el-select
          v-model="queryParams.marginCoin"
          size="mini"
          placeholder="请选择保证金币种"
        >
          <el-option
            v-for="(item, index) in marginList"
            :key="index"
            :label="item.marginCoin"
            :value="item.marginCoin"
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

    <el-table v-loading="loading" :data="coinList" border>
      <el-table-column
        type="index"
        align="center"
        label="序号"
        :index="indexMethod"
      />
      <el-table-column
        label="商品ID"
        align="center"
        prop="goodsId"
        width="100px"
      />
      <el-table-column
        label="保证金币种"
        align="center"
        prop="marginCoin"
        width="100px"
      />
      <el-table-column
        label="单日保证金上限"
        align="center"
        prop="marginMaxDay"
        width="100px"
      />
      <el-table-column
        label="开多点差率"
        align="center"
        prop="openBuySpreadRate"
        width="100px"
      />
      <el-table-column
        label="开空点差率"
        align="center"
        prop="openSellSpreadRate"
        width="100px"
      />
      <el-table-column
        label="平多点差率"
        align="center"
        prop="closeBuySpreadRate"
        width="100px"
      />
      <el-table-column
        label="平空点差率"
        align="center"
        prop="closeSellSpreadRate"
        width="100px"
      />
      <el-table-column
        label="最大持单数"
        align="center"
        prop="maxOrders"
        width="100px"
      />
      <el-table-column
        label="开仓手续费率"
        align="center"
        prop="openRate"
        width="100px"
      />
      <el-table-column
        label="平仓手续费率"
        align="center"
        prop="closeRate"
        width="100px"
      />
      <el-table-column
        label="隔夜手续费率"
        align="center"
        prop="stayNightRate"
        width="100px"
      />
      <el-table-column
        label="最大持仓额"
        align="center"
        prop="allMarginAmount"
        width="100px"
      />
      <el-table-column
        label="总持仓量"
        align="center"
        prop="allOrderMax"
        width="100px"
      />
      <el-table-column
        label="单笔持仓"
        align="center"
        prop="singleOrderMax"
        width="100px"
      />
      <el-table-column
        label="最大止盈比例"
        align="center"
        prop="profitRatio"
        width="100px"
      />
      <el-table-column
        label="单笔最小开仓额"
        align="center"
        prop="minAmount"
        width="100px"
      />
      <el-table-column
        label="单笔最大开仓额"
        align="center"
        prop="maxAmount"
        width="100px"
      />
      <el-table-column label="操作时间" align="center" prop="ctime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.mtime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.operation')"
        align="center"
        class-name="small-padding fixed-width"
        fixed="right"
        width="100"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
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

    <!-- 添加或修改产品支持的保证金币种对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品ID" prop="goodsId">
              <el-select
                v-model="form.goodsId"
                disabled
                size="mini"
                style="width: 100%"
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
            <el-form-item label="开多点差率" prop="openBuySpreadRate">
              <el-input
                v-model="form.openBuySpreadRate"
                placeholder="请输入开多点差率"
                clearable
              />
            </el-form-item>
            <el-form-item label="平多点差率" prop="closeBuySpreadRate">
              <el-input
                v-model="form.closeBuySpreadRate"
                placeholder="请输入平多点差率"
                clearable
              />
            </el-form-item>

            <el-form-item label="开仓手续费率" prop="openRate">
              <el-input
                v-model="form.openRate"
                placeholder="请输入开仓手续费率"
                clearable
              />
            </el-form-item>
            <el-form-item label="隔夜手续费率" prop="stayNightRate">
              <el-input
                v-model="form.stayNightRate"
                placeholder="请输入隔夜手续费率"
                clearable
              />
            </el-form-item>
            <el-form-item label="总持仓量" prop="allOrderMax">
              <el-input
                v-model="form.allOrderMax"
                placeholder="请输入总持仓量"
                clearable
              />
            </el-form-item>
            <el-form-item label="最大止盈比例" prop="profitRatio">
              <el-input
                v-model="form.profitRatio"
                placeholder="请输入最大止盈比例"
                clearable
              />
            </el-form-item>
            <el-form-item label="单笔最大开仓额" prop="maxAmount">
              <el-input
                v-model="form.maxAmount"
                placeholder="请输入单笔最大开仓额"
                clearable
              />
            </el-form-item>
            <el-form-item label="单日保证金上限" prop="marginMaxDay">
              <el-input
                v-model="form.marginMaxDay"
                placeholder="请输入单日保证金上限"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保证金币种" prop="marginCoin">
              <el-select
                v-model="form.marginCoin"
                disabled
                style="width: 100%"
                size="mini"
                placeholder="请选择保证金币种"
              >
                <el-option
                  v-for="(item, index) in marginList"
                  :key="index"
                  :label="item.marginCoin"
                  :value="item.marginCoin"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="开空点差率" prop="openSellSpreadRate">
              <el-input
                v-model="form.openSellSpreadRate"
                placeholder="请输入开空点差率"
                clearable
              />
            </el-form-item>
            <el-form-item label="平空点差率" prop="closeSellSpreadRate">
              <el-input
                v-model="form.closeSellSpreadRate"
                placeholder="请输入平空点差率"
                clearable
              />
            </el-form-item>
            <el-form-item label="最大持单数" prop="maxOrders">
              <el-input
                v-model="form.maxOrders"
                placeholder="请输入最大持单数"
                clearable
              />
            </el-form-item>
            <el-form-item label="平仓手续费率" prop="closeRate">
              <el-input
                v-model="form.closeRate"
                placeholder="请输入平仓手续费率"
                clearable
              />
            </el-form-item>
            <el-form-item label="最大持仓额" prop="allMarginAmount">
              <el-input
                v-model="form.allMarginAmount"
                placeholder="请输入最大持仓额"
                clearable
              />
            </el-form-item>
            <el-form-item label="单笔持仓" prop="singleOrderMax">
              <el-input
                v-model="form.singleOrderMax"
                placeholder="请输入单笔持仓"
                clearable
              />
            </el-form-item>
            <el-form-item label="单笔最小开仓额" prop="minAmount">
              <el-input
                v-model="form.minAmount"
                placeholder="请输入单笔最小开仓额"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
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
  listCoinConfig as listCoin,
  getCoinConfig as getCoin,
  updateCoinConfig as updateCoin
} from '@/api/contract/coinconfig'
import { listGoods } from '@/api/contract/goods'
import { listCoin as listMargin } from '@/api/contract/margin'
export default {
  name: 'ContractCoin',
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
      } else {
        callback()
      }
    }
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 产品支持的保证金币种表格数据
      coinList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        goodsId: undefined,
        marginCoin: undefined
      },
      // 表单参数
      form: {},
      marginList: [],
      goodsList: [],
      // 表单校验
      rules: {
        goodsId: [
          { required: true, message: '商品ID不能为空', trigger: 'blur' }
        ],
        marginCoin: [
          { required: true, message: '保证金币种不能为空', trigger: 'blur' }
        ],
        openBuySpreadRate: [
          { validator: checkQuota, trigger: 'blur' },
          { required: true, message: '开多点差率不能为空', trigger: 'blur' }
        ],
        openSellSpreadRate: [
          { validator: checkQuota, trigger: 'blur' },
          { required: true, message: '开空点差率不能为空', trigger: 'blur' }
        ],
        closeBuySpreadRate: [
          { validator: checkQuota, trigger: 'blur' },
          { required: true, message: '平多点差率不能为空', trigger: 'blur' }
        ],
        closeSellSpreadRate: [
          { validator: checkQuota, trigger: 'blur' },
          { required: true, message: '平空点差率不能为空', trigger: 'blur' }
        ],
        marginMaxDay: [
          { validator: checkQuota, trigger: 'blur' },
          { required: true, message: '单日保证金上限', trigger: 'blur' }
        ],
        maxOrders: [
          { validator: checkQuota, trigger: 'blur' },
          { required: true, message: '最大持单数不能为空', trigger: 'blur' }
        ],
        openRate: [
          { validator: checkQuota, trigger: 'blur' },
          { required: true, message: '开仓手续费率不能为空', trigger: 'blur' }
        ],
        closeRate: [
          { validator: checkQuota, trigger: 'blur' },
          { required: true, message: '平仓手续费率不能为空', trigger: 'blur' }
        ],
        stayNightRate: [
          { validator: checkQuota, trigger: 'blur' },
          { required: true, message: '隔夜手续费率不能为空', trigger: 'blur' }
        ],
        allMarginAmount: [
          { validator: checkQuota, trigger: 'blur' },
          { required: true, message: '总持仓额不能为空', trigger: 'blur' }
        ],
        allOrderMax: [
          { validator: checkQuota, trigger: 'blur' },
          { required: true, message: '总持仓量不能为空', trigger: 'blur' }
        ],
        singleOrderMax: [
          { validator: checkQuota, trigger: 'blur' },
          { required: true, message: '单笔持仓不能为空', trigger: 'blur' }
        ],
        profitRatio: [
          { validator: checkQuota, trigger: 'blur' },
          { required: true, message: '止盈比例不能为空', trigger: 'blur' }
        ],
        minAmount: [
          { validator: checkQuota, trigger: 'blur' },
          { required: true, message: '最少开仓保证金不能为空', trigger: 'blur' }
        ],
        maxAmount: [
          { validator: checkQuota, trigger: 'blur' },
          { required: true, message: '最大开仓保证金不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getGoodsList()
    this.getMarginList()
  },
  methods: {
    /** 查询产品支持的保证金币种列表 */
    getList() {
      this.loading = true
      listCoin(this.queryParams).then((response) => {
        this.coinList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    getGoodsList() {
      this.loading = true
      listGoods().then((response) => {
        if (response.code == 200) {
          this.goodsList = response.rows
          this.loading = false
        } else {
          this.msgError(response.msg)
        }
      })
    },
    getMarginList() {
      this.loading = true
      listMargin().then((response) => {
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
        goodsId: undefined,
        marginCoin: undefined,
        openBuySpreadRate: undefined,
        closeBuySpreadRate: undefined,
        openSellSpreadRate: undefined,
        closeSellSpreadRate: undefined,
        marginMaxDay: undefined
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
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getCoin(id).then((response) => {
        this.form = response.data
        this.form.status = response.data.status + ''
        this.open = true
        this.title = '修改产品支持的保证金币种'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id != undefined) {
            updateCoin(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
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
    // 索引值
    indexMethod(index) {
      return (
        index + (this.queryParams.pageNum - 1) * this.queryParams.pageSize + 1
      )
    }
  }
}
</script>
<style scoped>
.input-width {
  width: 300px;
}
</style>
