<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
    >
      <el-form-item
        :label="$t('common.coin')"
        prop="coin"
      >
        <el-select
          v-model="queryParams.coin"
          filterable
          clearable
          size="mini"
          placeholder="请选择币种"
        >
          <el-option
            v-for="item in codeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="法币"
        prop="payCoin"
      >
        <el-select
          v-model="queryParams.payCoin"
          size="mini"
          clearable
          filterable
          placeholder="请选择法币"
        >
          <el-option
            v-for="(item, index) in ctcList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >查找</el-button>
      </el-form-item>
    </el-form>
    <el-row
      :gutter="10"
      class="mb8"
    >
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>
    <el-table
      ref="table"
      v-loading="loading"
      :data="dataList"
      border
    >
      <el-table-column
        label="序号"
        align="center"
        prop="id"
      />
      <el-table-column
        :label="$t('common.coin')"
        align="center"
        prop="coin"
      >
        <template slot-scope="scope">
          <div
            v-for="(item, index, key) in codeOptions"
            :key="key"
          >
            <span v-if="scope.row.coin == item.value">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="货币类型"
        align="center"
        prop="payCoin"
      />
      <el-table-column
        label="商家卖出溢价比例"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.sellMin }} ~ {{ scope.row.sellMax }}
        </template>
      </el-table-column>
      <el-table-column
        label="商家买入溢价比例"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.buyMin }} ~ {{ scope.row.buyMax }}
        </template>
      </el-table-column>
      <el-table-column
        label="更新人"
        align="center"
        prop="updateBy"
      />
      <el-table-column
        label="最后更新时间"
        align="center"
        prop="updatedAt"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updatedAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.operation')"
        align="center"
        width="200"
        class-name
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="handleEdit(scope.$index, scope.row)"
          >修改
          </el-button>
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

    <!-- 添加修改价格比例对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="open"
      :close-on-click-modal="false"
      width="700px"
    >
      <el-form
        ref="dialogForm"
        :model="dialogForm"
        :rules="rules"
        label-width="150px"
        label-position="left"
      >
        <el-form-item
          :label="$t('common.coin')"
          prop="coin"
        >
          <el-select
            v-model="dialogForm.coin"
            :placeholder="$t('common.pleaseChoose')"
          >
            <el-option
              v-for="item in codeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="货币类型:"
          prop="payCoin"
        >
          <el-select
            v-model="dialogForm.payCoin"
            :placeholder="$t('common.pleaseChoose')"
          >
            <el-option
              v-for="item in ctcList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商家卖出溢价比例:">
          <el-col :span="7">
            <el-form-item prop="sellMin">
              <el-input
                v-model="dialogForm.sellMin"
                placeholder="最低"
              />
            </el-form-item>
          </el-col>
          <el-col :span="1">
            %
          </el-col>
          <el-col
            :span="1"
            style="text-align: center;"
          >
            --
          </el-col>
          <el-col :span="7">
            <el-form-item prop="sellMax">
              <el-input
                v-model="dialogForm.sellMax"
                placeholder="最高"
              />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            %
          </el-col>
        </el-form-item>
        <el-form-item label="商家买入溢价比例:">
          <el-col :span="7">
            <el-form-item prop="buyMin">
              <el-input
                v-model="dialogForm.buyMin"
                placeholder="最低"
              />
            </el-form-item>
          </el-col>
          <el-col :span="1">
            %
          </el-col>
          <el-col
            :span="1"
            style="text-align: center;"
          >
            --
          </el-col>
          <el-col :span="7">
            <el-form-item prop="buyMax">
              <el-input
                v-model="dialogForm.buyMax"
                placeholder="最高"
              />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            %
          </el-col>
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          @click="submitForm"
        >{{$t('common.sure')}}</el-button>
        <el-button @click="cancel">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { priceList, addPrice, editPrice } from '@/api/otcPriceFloat'
export default {
  name: 'PriceFloat',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 商户列表
      dataList: [],
      time: '',
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        coin: undefined,
        payCoin: undefined
      },
      // 是否显示弹出层
      open: false,
      dialogTitle: '',
      // 添加、修改弹窗表单参数
      dialogForm: {},
      operation: 1, // 1：添加， 2：修改
      // 申诉状态
      stateOptions: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: '1',
          label: '待处理'
        },
        {
          value: '2',
          label: '已处理'
        }
      ],
      // 表单校验
      rules: {
        coin: [
          { required: true, message: '请选择币种', trigger: 'blur' }
        ],
        payCoin: [
          { required: true, message: '请选择货币类型', trigger: 'blur' }
        ],
        sellMin: [
          { required: true, message: '请填写卖出溢价最低比例', trigger: 'blur' }
        ],
        sellMax: [
          { required: true, message: '请填写卖出溢价最高比例', trigger: 'blur' }
        ],
        buyMin: [
          { required: true, message: '请填写买入溢价最低比例', trigger: 'blur' }
        ],
        buyMax: [
          { required: true, message: '请填写买入溢价最高比例', trigger: 'blur' }
        ]
      },
      ctcList: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: 'INR',
          label: 'INR'
        },
        {
          value: 'VND',
          label: 'VND'
        }
      ],
      codeOptions: [
        {
          value: '',
          label: this.$t('common.all')
        },
        {
          value: 'USDT',
          label: 'USDT'
        }
      ]
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList'])
    // codeOptions () {
    //   return this.currencyList
    // }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 列表 */
    getList() {
      priceList(this.queryParams).then(response => {
        this.dataList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      if (!this.queryParams.coin) {
        this.queryParams.coin = undefined
      }
      if (!this.queryParams.payCoin) {
        this.queryParams.payCoin = undefined
      }
      this.getList()
    },
    handleEdit(index, row) {
      this.dialogForm = {
      }
      this.resetForm('dialogForm')
      this.operation = 2
      this.dialogTitle = '修改价格浮动比例'
      this.dialogForm.id = row.id
      this.dialogForm.coin = row.coin
      this.dialogForm.payCoin = row.payCoin
      this.dialogForm.sellMin = row.sellMin
      this.dialogForm.sellMax = row.sellMax
      this.dialogForm.buyMin = row.buyMin
      this.dialogForm.buyMax = row.buyMax
      this.dialogForm = Object.assign({}, this.dialogForm)
      this.open = true
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.dialogForm = {

      }
      this.resetForm('dialogForm')
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.operation = 1
      this.dialogTitle = '添加价格浮动比例'
      this.open = true
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['dialogForm'].validate(valid => {
        if (valid) {
          if (this.operation == 2) {
            editPrice(this.dialogForm).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addPrice(this.dialogForm).then(response => {
              if (response.code === 200) {
                this.msgSuccess('添加成功')
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
<style lang="scss" scoped>
::v-deep {
  .el-button + .el-button {
    margin-left: 10px;
  }
  .el-dialog {
    .el-col {
      margin-right: 10px;
    }
    .el-form-item--medium .el-form-item__label {
      padding: 0;
    }
  }
}
</style>
