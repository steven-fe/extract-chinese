<template>
  <div class="app-container">
    <!-- 币对管理index -->
    <el-form ref="form" :inline="true" :model="form" label-width="80px">
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
      <el-form-item label="是否开放交易:" label-width="101px" prop="isTrade">
        <el-select v-model="form.isTrade" size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in openOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="state">
        <el-select v-model="form.state" size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属板块:" prop="tagKey">
        <el-select v-model="form.tagKey" size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in symbolTags"
            :key="item.key"
            :label="item.zh_CN"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="分区:" prop="tagKey">
        <el-select v-model="form.region" size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in symbolRegions"
            :key="item.key"
            :label="item.zh_CN"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否限制非做市商API下单:" prop="orderPlaceFlag" label-width="180px">
        <el-select v-model="form.orderPlaceFlag" size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in orderPlaceFlagOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList">{{$t('common.search')}}</el-button>
      </el-form-item>
    </el-form>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="addConfig">添加币对</el-button>

    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column :label="$t('common.operation')" width="180" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="updatePair(scope.row.id)">修改</el-button>
          <el-button v-if="scope.row.state === 2" type="success" size="mini" @click="goOnline(scope.row.id, 1)">上线</el-button>
          <el-button v-else type="danger" size="mini" @click="goOnline(scope.row.id, 2)">下线</el-button>
          <!--          <el-button type="danger" size="mini">撤单</el-button>-->
        </template>
      </el-table-column>
      <el-table-column prop="instrumentId" label="币对id" align="center" />
      <el-table-column prop="symbol" label="币对代码" align="center" />
      <el-table-column prop="showName" label="币对别名" align="center" />
      <el-table-column prop="value" label="是否开放交易" align="center">
        <template slot-scope="scope">{{ scope.row.isTrade === 1 ? '开启' : '关闭' }}</template>
      </el-table-column>
      <el-table-column prop="openPrice" label="参考开盘价" align="center" />
      <el-table-column prop="pricePrecision" label="价格精度" align="center" />
      <el-table-column prop="amountPrecision" label="数量精度" align="center" />
      <el-table-column prop="makerFee" label="Maker手续费" align="center" />
      <el-table-column prop="takerFee" label="Taker手续费" align="center" />
      <el-table-column prop="meta" label="是否自动开盘价" align="center">
        <template slot-scope="scope">{{ scope.row.isAutoOpenPrice === 1 ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column prop="meta" :label="$t('common.status')" align="center">
        <template slot-scope="scope">{{ scope.row.state === 1 ? '上线' : '下线' }}</template>
      </el-table-column>
      <el-table-column prop="meta" label="是否可见" align="center">
        <template slot-scope="scope">{{ scope.row.visibleState === 1 ? '可见' : '隐藏' }}</template>
      </el-table-column>
      <el-table-column prop="meta" label="板块" align="center">
        <template slot-scope="scope">{{ typeLabelList(tagKeyOptions, scope.row.tagKey) }}</template>
      </el-table-column>
      <el-table-column prop="meta" label="分区" align="center">
        <template slot-scope="scope">{{ typeLabel(regionOptions, scope.row.region) }}</template>
      </el-table-column>
      <el-table-column label="限制非做市商API下单" prop="orderPlaceFlag" align="center" width="180">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.orderPlaceFlag"
            :active-value="1"
            :inactive-value="0"
            @change="changeOrderPlaceFlag(scope.row)"
          />
        </template>
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
    <el-dialog :title="configId ? '修改币对' : '添加币对'" :visible.sync="open" width="1000px" :before-close="cancel" :close-on-click-modal="false">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        class="form-grid"
      >
        <el-form-item class="grid-item" label="基准货币:" label-width="auto" prop="baseCurrencyId">
          <el-select v-model="digform.baseCurrencyId" filterable style="width: 100%" :placeholder="$t('common.pleaseChoose')" :disabled="configId ? true : false">
            <el-option
              v-for="item in baseOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="grid-item" label="计价货币:" label-width="auto" prop="quoteCurrencyId">
          <el-select v-model="digform.quoteCurrencyId" style="width: 100%" :placeholder="$t('common.pleaseChoose')" :disabled="configId ? true : false" filterable>
            <el-option
              v-for="item in quoteOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="grid-item" label="币对别名:" prop="showName">
          <el-input v-model="digform.showName" placeholder="大写字母，币对用/分隔" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="限价交易最小价:" prop="limitMinPrice">
          <el-input v-model="digform.limitMinPrice" placeholder="请输入大于0的数字" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="限价交易最小量:" prop="limitMinVolume">
          <el-input v-model="digform.limitMinVolume" placeholder="请输入大于0的数字" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="市价交易最小额:" prop="marketMinAmount">
          <el-input v-model="digform.marketMinAmount" placeholder="请输入大于0的数字" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="市价交易最小量:" prop="marketMinVolume">
          <el-input v-model="digform.marketMinVolume" placeholder="请输入大于0的数字" clearable />
        </el-form-item>
        <el-form-item class="grid-item" :class="$style.formItem" label="是否开放交易:" prop="isTrade">
          <el-select v-model="digform.isTrade" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in openOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span :class="$style.tips">*关闭交易后，所有下单将不能成交，如果需要在开盘前做市，需要提前开启交易</span>
        </el-form-item>
        <el-form-item class="grid-item" label="参考开盘价:" prop="openPrice">
          <el-input v-model="digform.openPrice" placeholder="请输入大于0的数字" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="价格精度:" prop="pricePrecision">
          <el-input v-model="digform.pricePrecision" placeholder="请输入大于等于0的整数" clearable />
          <span :class="$style.tips">*(0≤x≤12)</span>
        </el-form-item>
        <el-form-item class="grid-item" label="数量精度:" prop="amountPrecision">
          <el-input v-model="digform.amountPrecision" placeholder="请输入大于等于0的整数" clearable />
          <span :class="$style.tips">*(0≤x≤12)</span>
        </el-form-item>
        <!-- <el-form-item class="grid-item" label="排序:" prop="weight">
          <el-input v-model="digform.weight" placeholder="请输入大于0的整数" clearable></el-input>
        </el-form-item> -->
        <el-form-item class="grid-item" label="是否自动生成开盘价:" prop="isAutoOpenPrice">
          <el-select v-model="digform.isAutoOpenPrice" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in openOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span :class="$style.tips">*目前功能不可用，选择否即可</span>
        </el-form-item>
        <el-form-item v-if="digform.createOpen === 0" class="grid-item" label="摆盘买单最高价:" prop="buyMaxPrice">
          <el-input v-model="digform.buyMaxPrice" placeholder="请输入大于0的数字" clearable />
        </el-form-item>
        <el-form-item v-if="digform.createOpen === 0" class="grid-item" label="摆盘卖单最低价:" prop="sellMaxPrice">
          <el-input v-model="digform.sellMaxPrice" placeholder="请输入大于0的数字" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="Maker手续费:" prop="makerFee">
          <el-input v-model="digform.makerFee" placeholder="请输入大于0的数字" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="Taker手续费:" prop="takerFee">
          <el-input v-model="digform.takerFee" placeholder="请输入大于0的数字" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="所属板块:" prop="tagKey">
          <el-select
            v-model="selectOpTagKey"
            style="width: 100%"
            multiple
            filterable
            allow-create
            default-first-option
            :placeholder="$t('common.pleaseChoose')"
            @change="selectOpTagKeyChange()"
          >
            <el-option
              v-for="item in symbolTags"
              :key="item.key"
              :label="item.zh_CN"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="grid-item" label="分区:" prop="region">
          <el-select v-model="digform.region" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in regionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="grid-item" :class="$style.formItem" label="是否可见:" prop="visibleState">
          <el-select v-model="digform.visibleState" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in visibleStateSelectList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span :class="$style.tips">*如果设置不可见，非做市商和非白名单账号将无法通过API下单</span>
        </el-form-item>
        <el-form-item class="grid-item" :class="$style.formItem" label="可见白名单:" prop="visibleUserIdList">
          <el-input
            v-model="digform.visibleUserIdList"
            type="textarea"
            :rows="2"
            placeholder="输入用户长uid，多个用户用逗号隔开"
          />
          <span :class="$style.tips">*可见白名单能看见盘口，并且可以下单（包括通过API）</span>
        </el-form-item>
        <el-form-item class="grid-item" :class="$style.formItem" label="深度配置:" prop="steps">
          <el-input v-model="digform.steps" placeholder="1,0.1,0.0001(精度个位数，保留小数一位，保留小数四位)" clearable />
          <span :class="$style.tips">*盘口挡位之间的最小价格差，例如配置0.1，则盘口相邻两档的最小价格间隔就是0.1；下限不能超过币种的价格精度，例如币种价格精度设置为4，则聚合最小值就是0.0001；如果配置多档，则使用半角逗号进行分割</span>
        </el-form-item>
        <el-form-item class="grid-item" :class="$style.formItem" label="偏移百分比:" prop="rangeRate">
          <el-input v-model="digform.rangeRate" placeholder="0.01" clearable />
          <span :class="$style.tips">*目前功能不可用，输入默认值即可</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button size="mini" type="primary" @click="setConfig">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import * as API from '@/api/systemsetting/currencypairmanage'
import { queryInfo } from '@/api/configmanage'
import { commonFilter } from '@/utils/filters'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Currencyapply',
  data() {
    var checkNumber = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入正确数字'))
      }
      var reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,1}[0-9]{0,}$/
      if (value) {
        if (!reg.test(value)) {
          return callback(new Error('请输入正确数字'))
        } else {
          callback()
        }
      }
    }
    var checkNumber1 = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入正确数字'))
      }
      var reg = /^[0-9]\d*$/
      if (value) {
        if (!reg.test(value) || Number(value) <= 0) {
          return callback(new Error('请输入正确数字'))
        } else {
          callback()
        }
      }
    }
    var checkNumber2 = (rule, value, callback) => {
      if (Number.isNaN(+value) || +value < 0) {
        return callback(new Error('请输入大于等于0的整数'))
      } else {
        callback()
      }
    }
    // 价格精度校验方法
    var checkNumberPricePrecision = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入正确数字'))
      }
      callback()
    }
    // 数量精度校验方法
    const checkNumberPrecision = (rule, value, callback) => {
      if (Number.isNaN(+value)) {
        return callback(new Error('请输入正确数字'))
      }
      callback()
    }
    return {
      selectOpTagKey: '',
      visibleStateSelectList: [
        { value: 1, label: '是' },
        { value: 2, label: '否' }
      ],
      symbolTags: [],
      symbolRegions: [],
      openOptions: [
        { label: '开启', value: 1 },
        { label: '关闭', value: 2 }
      ],
      statusOptions: [
        { value: 1, label: '上线' },
        { value: 2, label: '下线' }
      ],
      orderPlaceFlagOptions: [
        {value: 1, label: '是'},
        {value: 0, label: '否'}
      ],
      tagKeyOptions: [],
      regionOptions: [],
      pageShow: true,
      total: 0,
      configId: '',
      form: {
        region: '',
        symbolId: '',
        isTrade: '',
        state: '',
        tagKey: '',
        orderPlaceFlag: '',
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      open: false,
      digform: {
        visibleUserIdList: '',
        baseCurrencyId: '',
        quoteCurrencyId: '',
        limitMinPrice: '',
        limitMinVolume: '',
        marketMinAmount: '',
        marketMinVolume: '',
        isTrade: '',
        openPrice: '',
        pricePrecision: '',
        amountPrecision: '',
        // weight: '',
        isAutoOpenPrice: '',
        buyMaxPrice: '',
        sellMaxPrice: '',
        makerFee: '',
        takerFee: '',
        tagKey: '',
        region: '',
        visibleState: ''
      },
      rules: {
        baseCurrencyId: [
          { required: true, message: '请选择基准币种', trigger: 'change' }
        ],
        quoteCurrencyId: [
          { required: true, message: '请选择计价货币', trigger: 'change' }
        ],
        isTrade: [
          { required: true, message: '请选择是否开放交易', trigger: 'change' }
        ],
        limitMinPrice: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        limitMinVolume: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        marketMinVolume: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        marketMinAmount: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        openPrice: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        pricePrecision: [
          { required: true, validator: checkNumber2, trigger: 'blur' }
        ],
        amountPrecision: [
          { required: true, validator: checkNumber2, trigger: 'blur' }
        ],
        // weight: [
        //   { required: true, validator: checkNumber1, trigger: "blur" }
        // ],
        isAutoOpenPrice: [
          { required: true, message: '请选择是否自动生成开盘价', trigger: 'change' }
        ],
        visibleState: [
          { required: true, message: '是否可见', trigger: 'change' }
        ],
        steps: [
          { required: true, trigger: 'blur' }
        ],
        showName: [
          { required: true, trigger: 'blur' }
        ],
        buyMaxPrice: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        sellMaxPrice: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        makerFee: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        takerFee: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList', 'quoteCurrency', 'pairList']),
    currencyOptions() {
      return this.pairList
    },
    baseOptions() {
      return this.currencyList
    },
    quoteOptions() {
      return this.quoteCurrency
    }
  },
  mounted() {
    this.getPair()
    this.getConfigList()
    this.getCurrency()
    this.getSymbolTags()
    this.getSymbolRegions()
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency', 'getPair']),
    // 选择框改变 复制给tagKey
    selectOpTagKeyChange() {
      this.digform.tagKey = this.getListToStr(this.selectOpTagKey)
    },
    getListToStr(list) {
      let str = ''
      for (let i = 0; i < list.length; i++) {
        if (i == 0) {
          str = str + list[i]
        } else {
          str = str + ',' + list[i]
        }
      }
      return str
    },
    // 索引值
    indexMethod(index) {
      return index + (this.form.pageNum - 1) * this.form.pageSize + 1
    },
    cancel() {
      this.open = false
      this.$refs['digform'].resetFields()
    },
    getConfigList() {
      API.getList(this.form).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
    },
    getSymbolTags() {
      queryInfo({ 'configKey': 'symbol_tags' }).then(response => {
        if (response.code == 200) {
          this.symbolTags = response.data.tags
          this.symbolTags.forEach(v => {
            this.tagKeyOptions.push({ label: v.zh_CN, value: v.key })
          })
        } else {
          this.msgError(response.msg)
        }
      })
    },
    getSymbolRegions() {
      queryInfo({ 'configKey': 'symbol_regions' }).then(response => {
        if (response.code == 200) {
          this.symbolRegions = response.data.regions
          this.symbolRegions.forEach(v => {
            this.regionOptions.push({ label: v.zh_CN, value: Number(v.key) })
          })
        } else {
          this.msgError(response.msg)
        }
      })
    },
    setConfig() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          if (this.configId == '') {
            API.addPair(this.digform).then(response => {
              if (response.code == 200) {
                this.msgSuccess('添加成功')
                this.getConfigList()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            API.updatePair(this.digform).then(response => {
              if (response.code == 200) {
                this.msgSuccess('修改成功')
                this.getConfigList()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    goOnline(id, state) {
      API.updatePairState({ id, state }).then(response => {
        if (response.code == 200) {
          state === 1 ? this.msgSuccess('上线成功') : this.msgSuccess('下线成功')
          this.getConfigList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    updatePair(id) {
      API.getInfo(id).then(response => {
        if (response.code == 200) {
          this.digform = response.data
          const tagKey = response.data.tagKey
          this.selectOpTagKey = ''
          if (tagKey) {
            this.selectOpTagKey = tagKey.split(',')
          }
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
      this.$refs['digform'].resetFields()
      this.configId = ''
      this.selectOpTagKey = ''
    },
    typeLabel(data, val) {
      return commonFilter(data, val)
    },
    typeLabelList(data, val) {
      if (val) {
        let str = ''
        const list = val.split(',')
        for (let i = 0; i < list.length; i++) {
          str = str + commonFilter(data, list[i])
        }
        return str
      }
      return ''
    },
    async changeOrderPlaceFlag(row) {
      try {
        const params = {
          id: row.id,
          orderPlaceFlag: row.orderPlaceFlag
        }
        await API.changeFlag(params)
      } catch (e) {
        console.error(e)
      } finally {
        this.getConfigList()
      }
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
  }
}
</style>
<style lang="scss" module>
.tips {
  display: block;
  margin-top: 5px;
  color: red;
  font-size: 13px;
}
.formItem {
  :global {
    .el-form-item__content {
      line-height: 18px;
    }
  }
}
</style>
