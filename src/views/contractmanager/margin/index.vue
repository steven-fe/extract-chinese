<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="90px">
      <el-form-item label="保证金币种" prop="marginCoin">
        <el-select v-model="queryParams.marginCoin" size="mini" placeholder="请选择保证金币种">
          <el-option
            v-for="(item, index) in marginListSelect"
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
          v-hasPermi="['coinbull:contract:marAdd']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="marginList" border>
      <el-table-column label="序号" align="center" prop="sequence" />
      <el-table-column label="保证金币种" align="center" prop="marginCoin" />
      <el-table-column label="全仓维持保证金率" align="center" prop="marginRate" />
      <el-table-column label="逐仓维持保证金率" align="center" prop="byPositionMarginRate" />
      <!-- <el-table-column label="最少开仓保证金" align="center" prop="minAmount" /> -->
      <!-- <el-table-column label="最大开仓保证金" align="center" prop="maxAmount" /> -->
      <!-- <el-table-column label="总持仓量" align="center" prop="allOrderMax" /> -->
      <!-- <el-table-column label="单笔持仓" align="center" prop="singleOrderMax" /> -->
      <!-- <el-table-column label="止盈比例" align="center" prop="profitRatio" /> TODO-->
      <el-table-column label="币种精度" align="center" prop="showPrecision" />
      <el-table-column label="保证金类型" align="center" prop="marginType">
        <template slot-scope="scope">
          <span v-if="scope.row.marginType==1">原始保证金</span>
          <span v-if="scope.row.marginType==2">合成保证金</span>
        </template>
      </el-table-column>
      <el-table-column label="开关" align="center" prop="status">
        <template slot-scope="scope">
          <span v-if="scope.row.status == 1">开</span>
          <span v-else>关</span>
        </template>
      </el-table-column>
      <el-table-column label="跟单开关" align="center" prop="followOpen">
        <template slot-scope="scope">
          <span v-if="scope.row.followOpen == 1">开</span>
          <span v-else>关</span>
        </template>
      </el-table-column>
      <el-table-column label="默认跟单金额" align="center" prop="followDefaultValue" />
      <el-table-column :label="$t('common.operation')" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['coinbull:contract:marEdit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
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

    <!-- 添加或修改保证金配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px">
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="保证金币种" prop="marginCoin">
          <el-select
            v-model="form.marginCoin"
            filterable
            placeholder="请选择保证金币种"
            @change="selectMarginCoin"
          >
            <el-option
              v-for="(item,index) in cfdList"
              :key="index"
              :label="item.currency"
              :value="item.currency"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="保证金图标" prop="iconUrl">
          <el-input v-model="form.iconUrl" placeholder="请输入" class="input-width">
            <template slot="append">
              <img v-show="form.iconUrl" class="iconImg" :src="form.iconUrl">
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="全仓维持保证金率" prop="marginRate">
          <el-input
            v-model="form.marginRate"
            placeholder="请输入全仓维持保证金率"
            class="input-width"
            clearable
          />
        </el-form-item>
        <el-form-item label="逐仓维持保证金率" prop="byPositionMarginRate">
          <el-input
            v-model="form.byPositionMarginRate"
            placeholder="请输入逐仓维持保证金率"
            class="input-width"
            clearable
          />
        </el-form-item>
        <!-- <el-form-item label="最少开仓保证金" prop="minAmount">
          <el-input v-model="form.minAmount" placeholder="请输入最少开仓保证金" class="input-width" clearable />
        </el-form-item>
        <el-form-item label="最大开仓保证金" prop="maxAmount">
          <el-input v-model="form.maxAmount" placeholder="请输入最大开仓保证金" class="input-width" clearable />
        </el-form-item>
        <el-form-item label="总持仓量" prop="allOrderMax">
          <el-input v-model="form.allOrderMax" placeholder="请输入总持仓量" class="input-width" clearable />
        </el-form-item>
        <el-form-item label="单笔持仓" prop="singleOrderMax">
          <el-input
            v-model="form.singleOrderMax"
            placeholder="请输入单笔持仓"
            class="input-width"
            clearable
          />
        </el-form-item> -->
        <el-form-item label="币种精度" prop="showPrecision">
          <el-input
            v-model="form.showPrecision"
            placeholder="请输入币种精度"
            class="input-width"
            clearable
          />
        </el-form-item>
        <!-- <el-form-item label="止盈比例" prop="profitRatio">
          <el-input
            v-model="form.profitRatio"
            placeholder="请输入止盈比例"
            class="input-width"
            clearable
          />
        </el-form-item> -->
        <el-form-item label="开关">
          <el-radio-group v-model="form.status">
            <el-radio label="1">开</el-radio>
            <el-radio label="0">关</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="保证金类型">
          <el-radio-group v-model="form.marginType">
            <el-radio :label="1">原始保证金</el-radio>
            <el-radio :label="2">合成保证金</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="跟单开关">
          <el-radio-group v-model="form.followOpen">
            <el-radio label="1">开</el-radio>
            <el-radio label="0">关</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="默认跟单金额" prop="followDefaultValue">
          <el-input
            v-model="form.followDefaultValue"
            placeholder="请输入默认跟单金额"
            class="input-width"
            clearable
          />
        </el-form-item>

        <el-form-item label="排序" prop="sequence">
          <el-input v-model="form.sequence" placeholder="请输入序号" class="input-width" clearable />
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
  listCoin,
  getCoin,
  delCoin,
  addCoin,
  updateCoin
} from '@/api/contract/margin'
import { listSupportTokenByType } from '@/api/coin'

export default {
  name: 'ContractMargin',
  data() {
    var checkQuota = (rule, value, callback) => {
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
    var checkQuota2 = (rule, value, callback) => {
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
        callback(new Error('必须大于0'))
      } else {
        callback()
      }
    }
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 保证金配置表格数据
      marginList: [],
      marginListSelect: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        marginCoin: undefined
      },
      cfdList: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        marginCoin: [
          { required: true, message: '保证金币种不能为空', trigger: 'blur' }
        ],
        marginRate: [
          {
            required: true,
            message: '全仓维持保证金率不能为空',
            trigger: 'blur'
          }
        ],
        byPositionMarginRate: [
          {
            required: true,
            message: '逐仓维持保证金率不能为空',
            trigger: 'blur'
          }
        ],
        // allOrderMax: [
        //   { required: true, message: "总持仓量不能为空", trigger: "blur" }
        // ],
        // singleOrderMax: [
        //   { required: true, message: "单笔持仓不能为空", trigger: "blur" }
        // ],
        showPrecision: [
          { required: true, message: '币种精度不能为空', trigger: 'blur' }
        ],
        iconUrl: [
          { required: true, message: '币种图标不能为空', trigger: 'blur' }
        ],
        // profitRatio: [
        //   { required: true, message: "止盈比例不能为空", trigger: "blur" },
        //   { validator: checkQuota2, trigger: "blur" }
        // ],
        sequence: [
          { required: true, message: '序号不能为空', trigger: 'blur' },
          { validator: checkQuota, trigger: 'blur' }
        ]
        // minAmount: [
        //   { required: true, message: "最少开仓保证金", trigger: "blur" },
        //   { validator: checkQuota2, trigger: "blur" }
        // ],
        // maxAmount: [
        //   { required: true, message: "最大开仓保证金", trigger: "blur" },
        //   { validator: checkQuota2, trigger: "blur" }
        // ]
      }
    }
  },
  created() {
    this.getList()
    this.getMarginList()
    this.getCfdList()
  },
  methods: {
    /** 查询保证金配置列表 */
    getList() {
      this.loading = true
      listCoin(this.queryParams).then(response => {
        this.marginList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    getMarginList() {
      this.loading = true
      listCoin().then(response => {
        if (response.code == 200) {
          this.marginListSelect = response.rows
          this.loading = false
        } else {
          this.msgError(response.msg)
        }
      })
    },
    getCfdList() {
      const form = {
        is_support_cfd: 1
      }
      this.loading = true
      listSupportTokenByType(form).then(response => {
        if (response.code == 200) {
          this.cfdList = response.rows
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
        marginCoin: undefined,
        marginRate: undefined,
        byPositionMarginRate: undefined,
        // allOrderMax: undefined,
        // singleOrderMax: undefined,
        showPrecision: undefined,
        // profitRatio:undefined,
        // minAmount:undefined,
        // maxAmount:undefined,
        marginType: '1',
        followOpen: '0',
        followDefaultValue: undefined,
        status: '1'
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
      this.title = '添加保证金配置'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getCoin(id).then(response => {
        this.form = response.data
        if (!this.form.iconUrl) {
          this.cfdList.forEach(element => {
            if (element.currency == this.form.marginCoin) {
              this.form.iconUrl = element.coin_icon
            }
          })
        }
        this.form.status = response.data.status + ''
        this.form.followOpen = response.data.followOpen + ''
        this.open = true
        this.title = '修改保证金配置'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateCoin(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addCoin(this.form).then(response => {
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
    selectMarginCoin(val) {
      this.cfdList.forEach(element => {
        if (element.currency == val) {
          this.form.iconUrl = element.coin_icon
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$confirm(
        '是否确认删除保证金配置编号为"' + ids + '"的数据项?',
        this.$t('common.alert'),
        {
          confirmButtonText: this.$t('common.sure'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'warning'
        }
      )
        .then(function() {
          return delCoin(ids)
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
  width: 300px;
}
.iconImg {
  width: 30px;
  height: 30px;
  border-radius: 25px;
  border: 0;
}
</style>
<style>
.input-width .el-input-group__append {
  background-color: #fff;
  line-height: 1px;
}
</style>
