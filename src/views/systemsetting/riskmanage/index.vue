<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form">
      <el-form-item label="币对:" label-width="60px" prop="symbolId">
        <el-select v-model="form.symbolId" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in currencyOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="限价交易限制:" label-width="100px" prop="isLimitTrade">
        <el-select v-model="form.isLimitTrade" size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in openOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="市价交易限制:" label-width="100px" prop="isMarketTrade">
        <el-select v-model="form.isMarketTrade" size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in openOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="熔断限制:" label-width="100px" prop="isFuseLimit">
        <el-select v-model="form.isFuseLimit" size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option value="" :label="$t('common.all')" />
          <el-option
            v-for="item in openOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList">查找</el-button>
      </el-form-item>
    </el-form>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="addConfig">添加币种</el-button>

    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column :label="$t('common.operation')" width="150" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="queryConfig(scope.row.id)">修改</el-button>
          <el-button type="danger" size="mini" @click="del(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="symbol" width="100" label="币对" align="center" />
      <el-table-column width="100" label="限价交易限制" align="center">
        <template slot-scope="scope">{{ scope.row.isLimitTrade === 1 ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column width="100" label="市价交易限制" align="center">
        <template slot-scope="scope">{{ scope.row.isMarketTrade === 1 ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column prop="limitMaxPrice" width="100" label="限价买最高价" align="center" />
      <el-table-column prop="limitMinPrice" width="100" label="限价卖最低价" align="center" />
      <el-table-column prop="perMinTrade" width="100" label="单笔成交最小量" align="center" />
      <el-table-column prop="perMaxTrade" width="100" label="单笔成交最大量" align="center" />
      <el-table-column width="100" label="熔断限制" align="center">
        <template slot-scope="scope">{{ scope.row.isFuseLimit === 1 ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column prop="fuseMinPrice" width="100" label="价格高于熔断" align="center" />
      <el-table-column prop="fuseMinPrice" width="100" label="价格低于熔断" align="center" />
      <el-table-column prop="whitelist" label="白名单" align="center" />
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
          <el-form-item class="grid-item" label="币对:" prop="currency">
            <el-select v-model="digform.symbolId" style="width: 100%" :placeholder="$t('common.pleaseChoose')" filterable>
              <el-option
                v-for="item in currencyOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="grid-item" />
          <el-form-item class="grid-item" label="限价交易限制:" prop="isLimitTrade">
            <el-select v-model="digform.isLimitTrade" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
              <el-option
                v-for="item in openOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="grid-item" label="市价交易限制:" prop="isMarketTrade">
            <el-select v-model="digform.isMarketTrade" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
              <el-option
                v-for="item in openOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="digform.isLimitTrade === 1" class="grid-item" label="限价买最高价:" prop="limitMaxPrice">
            <el-input v-model="digform.limitMaxPrice" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item v-if="digform.isLimitTrade === 1" class="grid-item" label="限价卖最低价:" prop="limitMinPrice">
            <el-input v-model="digform.limitMinPrice" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item v-if="digform.isLimitTrade === 1 || digform.isMarketTrade === 1" class="grid-item" label="单笔交易最大量:" prop="perMaxTrade">
            <el-input v-model="digform.perMaxTrade" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item v-if="digform.isLimitTrade === 1 || digform.isMarketTrade === 1" class="grid-item" label="单笔交易最小量:" prop="perMinTrade">
            <el-input v-model="digform.perMinTrade" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="熔断限制:" prop="isFuseLimit">
            <el-select v-model="digform.isFuseLimit" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
              <el-option
                v-for="item in openOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="grid-item" />
          <el-form-item v-if="digform.isFuseLimit === 1" class="grid-item" label="价格高于:" prop="fuseMaxPrice">
            <el-input v-model="digform.fuseMaxPrice" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item v-if="digform.isFuseLimit === 1" class="grid-item" label="价格低于:" prop="fuseMinPrice">
            <el-input v-model="digform.fuseMinPrice" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
        </div>
        <el-form-item style="margin-left: 5%; width: 90%;" label="白名单配置:" prop="whitelist">
          <el-input v-model="digform.whitelist" type="textarea" placeholder="请输入以','分割的UID" clearable />
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
import { mapState, mapActions } from 'vuex'
import * as API from '@/api/systemsetting/riskmanage'

export default {
  name: 'Riskmanage',
  data() {
    var checkNumber = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入正确数字'))
      }
      var reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,1}[0-9]{0,}$/
      if (value) {
        if (!reg.test(value) || Number(value) <= 0) {
          return callback(new Error('请输入正确数字'))
        } else {
          callback()
        }
      }
    }
    var checkUid = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入正确数字'))
      }
      var reg = /^(\d+,?)+$/
      if (value) {
        if (!reg.test(value)) {
          return callback(new Error('请输入正确数字'))
        } else {
          callback()
        }
      }
    }
    return {
      openOptions: [
        { label: '开启', value: 1 },
        { label: '关闭', value: 2 }
      ],
      typeOptions: [
        { value: 'ERC20', label: 'ERC20' },
        { value: 'TRC20', label: 'TRC20' },
        { value: 'OMNI', label: 'OMNI' }
      ],
      pageShow: true,
      total: 0,
      configId: '',
      form: {
        symbolId: '',
        isLimitTrade: '',
        isMarketTrade: '',
        isFuseLimit: '',
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      open: false,
      digform: {
        symbolId: '',
        isLimitTrade: '',
        isMarketTrade: '',
        limitMaxPrice: '',
        limitMinPrice: '',
        perMaxTrade: '',
        perMinTrade: '',
        isFuseLimit: '',
        fuseMaxPrice: '',
        fuseMinPrice: '',
        whitelist: ''
      },
      rules: {
        symbolId: [
          { required: true, message: '请选择币对', trigger: 'change' }
        ],
        isLimitTrade: [
          { required: true, message: '请选择是否开启限价限制', trigger: 'change' }
        ],
        isMarketTrade: [
          { required: true, message: '请选择是否开启市价限制', trigger: 'change' }
        ],
        isFuseLimit: [
          { required: true, message: '请选择是否开启熔断限制', trigger: 'change' }
        ],
        limitMaxPrice: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        limitMinPrice: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        perMaxTrade: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        perMinTrade: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        fuseMaxPrice: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        fuseMinPrice: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        whitelist: [
          { validator: checkUid, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['pairList']),
    currencyOptions() {
      return this.pairList
    }
  },
  mounted() {
    this.getPair()
    this.getConfigList()
  },
  methods: {
    ...mapActions('systemsetting', ['getPair']),
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
    setConfig() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          if (this.configId == '') {
            API.addRisk(this.digform).then(response => {
              if (response.code == 200) {
                this.msgSuccess('添加成功')
                this.getConfigList()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
              this.open = false
            })
          } else {
            API.updateRisk(this.digform).then(response => {
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
          this.configId = id
          this.open = true
        } else {
          this.msgError(response.msg)
        }
      })
    },
    addConfig(row) {
      this.configId = ''
      this.open = true
    },
    del(id) {
      API.delRisk(id).then(response => {
        if (response.code == 200) {
          this.msgSuccess('删除成功')
          this.getConfigList()
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
  }
}
</style>
