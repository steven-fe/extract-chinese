<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="60px">
      <el-form-item label="币对:" prop="symbolId">
        <el-select v-model="form.symbolId" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in currencyOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList">查找</el-button>
      </el-form-item>
    </el-form>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="addConfig">添加配置</el-button>

    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column :label="$t('common.operation')" width="150" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="queryConfig(scope.row.id)">编辑</el-button>
          <el-button type="danger" size="mini" @click="goDetail(scope.row.id)">详情</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="symbol" label="币对" align="center" />
      <el-table-column label="下单涨跌幅限制" align="center">
        <template slot-scope="scope">{{ scope.row.isPlaceLimit === 1 ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column label="下单涨跌幅限制到期日" align="center">
        <template slot-scope="scope">{{ scope.row.placeLimitEndTime | timeFilter }}</template>
      </el-table-column>
      <el-table-column label="日涨跌幅限制" align="center">
        <template slot-scope="scope">{{ scope.row.isDayLimit === 1 ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column label="日涨跌幅限制到期日" align="center">
        <template slot-scope="scope">{{ scope.row.dayLimitEndTime | timeFilter }}</template>
      </el-table-column>
      <el-table-column label="币价限制" align="center">
        <template slot-scope="scope">{{ scope.row.isPriceOffsetLimit === 1 ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column label="币价限制到期日" align="center">
        <template slot-scope="scope">{{ scope.row.priceOffsetEndTime | timeFilter }}</template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="getConfigList"
      />
    </div>
    <el-dialog :title="$t('systemsetting.addApplication')" :visible.sync="open" width="1000px" :before-close="cancel" :close-on-click-modal="false">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
      >
        <div class="form-grid">
          <el-form-item class="grid-item" label="币对:" prop="symbolId">
            <el-select v-model="digform.symbolId" style="width: 100%" :disabled="isDetail" :placeholder="$t('common.pleaseChoose')" filterable>
              <el-option
                v-for="item in currencyOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="grid-item" />
          <el-form-item class="grid-item" label="下单涨跌幅限制（相对于最新成交价）:" prop="placeLimitEndTime">
            <div style="float: left; width: 100%;">
              <el-checkbox v-model="isPlaceLimit" style="margin-right: 10px;" :disabled="isDetail" :true-label="1" :false-label="2">开启至</el-checkbox>
              <el-date-picker
                v-model="digform.placeLimitEndTime"
                :disabled="isPlaceLimit === 2 || isDetail"
                type="datetime"
                placeholder="选择日期时间"
                align="right"
                value-format="timestamp"
                :picker-options="pickerOptions"
              />
            </div>
          </el-form-item>
          <div class="grid-item">
            <el-form-item class="grid-item-inner" label="涨幅限制:" prop="placeLimitUp">
              <el-input v-model="digform.placeLimitUp" :disabled="isPlaceLimit === 2 || isDetail" style="width: 90%" placeholder="请输入大于0的数字" clearable />%
            </el-form-item>
            <el-form-item class="grid-item-inner-last" label="跌幅限制:" prop="fallLimit">
              <el-input v-model="digform.placeLimitDown" :disabled="isPlaceLimit === 2 || isDetail" style="width: 90%" placeholder="请输入大于0的数字" clearable />%
            </el-form-item>
          </div>
          <el-form-item class="grid-item" label="日涨跌幅限制（相对于昨收盘价）:" prop="dayLimitEndTime">
            <div style="float: left; width: 100%;">
              <el-checkbox v-model="isDayLimit" style="margin-right: 10px;" :disabled="isDetail" :true-label="1" :false-label="2">开启至</el-checkbox>
              <el-date-picker
                v-model="digform.dayLimitEndTime"
                :disabled="isDayLimit === 2 || isDetail"
                type="datetime"
                placeholder="选择日期时间"
                align="right"
                value-format="timestamp"
                :picker-options="pickerOptions"
              />
            </div>
          </el-form-item>
          <div class="grid-item">
            <el-form-item class="grid-item-inner" label="涨幅限制:" prop="dayLimitUp">
              <el-input v-model="digform.dayLimitUp" :disabled="isDayLimit === 2 || isDetail" style="width: 90%" placeholder="请输入大于0的数字" clearable />%
            </el-form-item>
            <el-form-item class="grid-item-inner-last" label="跌幅限制:" prop="dayLimitDown">
              <el-input v-model="digform.dayLimitDown" :disabled="isDayLimit === 2 || isDetail" style="width: 90%" placeholder="请输入大于0的数字" clearable />%
            </el-form-item>
          </div>
          <el-form-item class="grid-item" label="币价偏移限制（相对于开盘价）:" prop="priceOffsetEndTime">
            <div style="float: left; width: 100%;">
              <el-checkbox v-model="isPriceOffsetLimit" style="margin-right: 10px;" :disabled="isDetail" :true-label="1" :false-label="2">开启至</el-checkbox>
              <el-date-picker
                v-model="digform.priceOffsetEndTime"
                :disabled="isPriceOffsetLimit === 2 || isDetail"
                type="datetime"
                placeholder="选择日期时间"
                align="right"
                value-format="timestamp"
                :picker-options="pickerOptions"
              />
            </div>
          </el-form-item>
          <div class="grid-item">
            <el-form-item class="grid-item-inner" label="涨幅限制:" prop="priceOffsetUp">
              <el-input v-model="digform.priceOffsetUp" :disabled="isPriceOffsetLimit === 2 || isDetail" style="width: 90%" placeholder="请输入大于0的数字" clearable />%
            </el-form-item>
            <el-form-item class="grid-item-inner-last" label="跌幅限制:" prop="priceOffsetDown">
              <el-input v-model="digform.priceOffsetDown" :disabled="isPriceOffsetLimit === 2 || isDetail" style="width: 90%" placeholder="请输入大于0的数字" clearable />%
            </el-form-item>
          </div>
          <el-form-item class="grid-item" label="基准币价:" prop="standardPrice">
            <el-input v-model="digform.standardPrice" :disabled="isDetail" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" />
          <el-form-item class="grid-item" label="市价限制:" prop="marketPriceEndTime">
            <div style="float: left; width: 100%;">
              <el-checkbox v-model="isMarketPriceLimit" style="margin-right: 10px;" :disabled="isDetail" :true-label="1" :false-label="2">开启至</el-checkbox>
              <el-date-picker
                v-model="digform.marketPriceEndTime"
                :disabled="isMarketPriceLimit === 2 || isDetail"
                type="datetime"
                placeholder="选择日期时间"
                align="right"
                value-format="timestamp"
                :picker-options="pickerOptions"
              />
            </div>
          </el-form-item>
        </div>
      </el-form>
      <div v-if="isDetail" slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="cancel">{{$t('common.sure')}}</el-button>
      </div>
      <div v-else slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button size="mini" type="primary" @click="setConfig">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import * as API from '@/api/systemsetting/smashlimit'
import { date, time } from '@/utils/format'

export default {
  name: 'Smashlimits',
  filters: {
    timeFilter(val) {
      if (Number(val) === 0) {
        return '- -'
      }
      return date(val) + ' ' + time(val)
    }
  },
  data() {
    var checkCurrencyId = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('币种代码无效'))
      }
      var reg = /[^\w]/g
      if (value) {
        if (reg.test(value) || value.length > 8) {
          return callback(new Error('币种代码无效'))
        } else {
          callback()
        }
      }
    }
    var checkNumber = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入正确数字'))
      }
      callback()
    }
    return {
      pickerOptions: {
        disabledDate: (time) => {
          if (time) {
            return time.getTime() < new Date(new Date().toLocaleDateString()).getTime()
          }
          return true
        }
      },
      typeOptions: [
        { value: 'ERC20', label: 'ERC20' },
        { value: 'TRC20', label: 'TRC20' },
        { value: 'OMNI', label: 'OMNI' }
      ],
      pageShow: true,
      total: 0,
      configId: '',
      isPlaceLimit: 2,
      isDayLimit: 2,
      isPriceOffsetLimit: 2,
      isMarketPriceLimit: 2,
      form: {
        symbolId: '',
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      open: false,
      isDetail: false,
      digform: {
        symbolId: '',
        isPlaceLimit: 2,
        placeLimitEndTime: '',
        placeLimitUp: '',
        placeLimitDown: '',
        isDayLimit: 2,
        dayLimitUp: '',
        dayLimitDown: '',
        dayLimitEndTime: '',
        isPriceOffsetLimit: 2,
        priceOffsetUp: '',
        priceOffsetDown: '',
        priceOffsetEndTime: '',
        standardPrice: '',
        isMarketPriceLimit: 2,
        marketPriceEndTime: ''
      },
      rules: {
        symbolId: [
          { required: true, message: '请选择币对', trigger: 'change' }
        ]
        //,
        // placeLimitUp: [
        //   { validator: checkNumber, trigger: "blur" }
        // ],
        // placeLimitDown: [
        //   { validator: checkNumber, trigger: "blur" }
        // ],
        // dayLimitUp: [
        //   { validator: checkNumber, trigger: "blur" }
        // ],
        // dayLimitDown: [
        //   { validator: checkNumber, trigger: "blur" }
        // ],
        // priceOffsetUp: [
        //   { validator: checkNumber, trigger: "blur" }
        // ],
        // priceOffsetDown: [
        //   { validator: checkNumber, trigger: "blur" }
        // ],
        // standardPrice: [
        //   { validator: checkNumber, trigger: "blur" }
        // ]
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['pairList']),
    currencyOptions() {
      return this.pairList
    },
    openOptions() {
      return [
        { label: '开启', value: 0 },
        { label: '关闭', value: 1 }
      ]
    }
  },
  mounted() {
    this.getPair()
    this.getConfigList()
  },
  methods: {
    ...mapActions('systemsetting', ['getPair']),
    cancel() {
      this.isDetail = false
      this.isPlaceLimit = 2
      this.isDayLimit = 2
      this.isPriceOffsetLimit = 2
      this.isMarketPriceLimit = 2
      this.$refs['digform'].resetFields()
      this.open = false
    },
    getConfigList() {
      API.getList(this.form).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
          this.tableData.forEach(element => {
          })
        } else {
          this.msgError(response.msg)
        }
      })
    },
    setConfig() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          this.digform.isPlaceLimit = this.isPlaceLimit
          this.digform.isDayLimit = this.isDayLimit
          this.digform.isPriceOffsetLimit = this.isPriceOffsetLimit
          this.digform.isMarketPriceLimit = this.isMarketPriceLimit
          if (this.configId == '') {
            API.addSmash(this.digform).then(response => {
              if (response.code == 200) {
                this.msgSuccess('添加成功')
                this.getConfigList()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            API.updateSmash(this.digform).then(response => {
              if (response.code == 200) {
                this.msgSuccess('修改成功')
                this.getConfigList()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
              this.open = false
            })
          }
        }
      })
    },
    queryConfig(id) {
      API.getInfo(id).then(response => {
        if (response.code == 200) {
          this.digform = response.data
          this.isPlaceLimit = this.digform.isPlaceLimit
          this.isDayLimit = this.digform.isDayLimit
          this.isPriceOffsetLimit = this.digform.isPriceOffsetLimit
          this.isMarketPriceLimit = this.digform.isMarketPriceLimit
          this.configId = id
          this.open = true
        } else {
          this.msgError(response.msg)
        }
      })
    },
    addConfig(row) {
      this.open = true
      this.digform = {}
      this.configId = ''
    },
    goDetail(id) {
      API.getInfo(id).then(response => {
        if (response.code == 200) {
          this.digform = response.data
          this.isPlaceLimit = this.digform.isPlaceLimit
          this.isDayLimit = this.digform.isDayLimit
          this.isPriceOffsetLimit = this.digform.isPriceOffsetLimit
          this.isMarketPriceLimit = this.digform.isMarketPriceLimit
          this.isDetail = true
          this.open = true
        } else {
          this.msgError(response.msg)
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.table {
  margin-top: 20px;
}
.form-grid {
  display: grid;
  grid-template-columns: 50% 50%;
  margin-left: 5%;
  .grid-item {
    width: 90%;
    .grid-item-inner {
      float: left;
      width: 45%;
    }
    .grid-item-inner-last {
      float: left;
      margin-left: 10%;
      width: 45%;
    }
  }
}
</style>
