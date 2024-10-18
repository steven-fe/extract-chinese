<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="80px">
      <el-form-item :label="$t('common.coin')" prop="currencyName">
        <el-select v-model="form.currencyName" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in codeOptions"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否可用:" prop="state">
        <el-select v-model="form.state" size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in stateOptions"
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
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="addConfig">添加币种</el-button>

    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="currencyName" label="红包币种" align="center" />
      <el-table-column prop="currencyMinVolume" label="币种最小数量" align="center" />
      <el-table-column prop="currencyMaxVolume" label="币种最大数量" align="center" />
      <el-table-column prop="redEnvelopeMax" label="红包上限" align="center" />
      <el-table-column label="创建时间" align="center" prop="createdDate">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt,"{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="meta" label="是否可用" align="center">
        <template slot-scope="scope">{{ scope.row.state === 1 ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="updatePair(scope.row.id)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > form.pageSize"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="getConfigList"
      />
    </div>
    <el-dialog :title="updateId ? '修改币种' : '添加币种'" :visible.sync="open" width="1000px" :before-close="cancel">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        class="form-grid"
      >
        <el-form-item class="grid-item" label="币种名称:" prop="currencyName">
          <el-select v-model="digform.currencyName" style="width: 100%" :placeholder="$t('common.pleaseChoose')" :disabled="updateId ? true : false" filterable>
            <el-option
              v-for="item in currencyOptions"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="grid-item" label="是否可用:" prop="state">
          <el-select v-model="digform.state" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="grid-item" label="币种最小数量:" prop="currencyMinVolume">
          <el-input v-model="digform.currencyMinVolume" placeholder="请输入大于0的数字" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="币种最大数量:" prop="currencyMaxVolume">
          <el-input v-model="digform.currencyMaxVolume" placeholder="请输入大于0的数字" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="红包上限:" prop="redEnvelopeMax">
          <el-input v-model="digform.redEnvelopeMax" placeholder="请输入大于0的整数" clearable />
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
import * as API from '@/api/redenvelope/redenvelopecurrency'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Redenvelopecurrency',
  data() {
    var checkNumber = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入正确数字'))
      }
      var reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/
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
    return {
      stateOptions: [
        { label: this.$t('common.all'), value: '' },
        { label: '可用', value: 1 },
        { label: '不可用', value: 0 }
      ],
      statusOptions: [
        { label: '可用', value: 1 },
        { label: '不可用', value: 0 }
      ],
      pageShow: true,
      total: 0,
      updateId: '',
      form: {
        currencyName: '',
        state: '',
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      open: false,
      digform: {
        currencyName: '',
        state: '',
        currencyMinVolume: '',
        currencyMaxVolume: '',
        redEnvelopeMax: ''
      },
      rules: {
        currencyName: [
          { required: true, message: '请选择币种名称', trigger: 'change' }
        ],
        state: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        currencyMinVolume: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        currencyMaxVolume: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        redEnvelopeMax: [
          { required: true, validator: checkNumber1, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState('redenvelope', ['redEnvelopeCurrencyList', 'currencyList']),
    codeOptions() {
      return this.redEnvelopeCurrencyList
    },
    currencyOptions() {
      return this.currencyList
    }
  },
  // 初始化
  mounted() {
    this.getCurrency()
    this.getRedEnvelopeCurrency()
    this.getConfigList()
  },
  methods: {
    ...mapActions('redenvelope', ['getCurrency', 'getRedEnvelopeCurrency']),
    // 币种类型过滤方法
    typeLabel(data, val) {
      return commonFilter(data, val)
    },
    resetQuery() {
      this.form.code = ''
      this.form.state = ''
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
    setConfig() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          if (this.updateId == '') {
            API.addRedCurrency(this.digform).then(response => {
              if (response.code == 200) {
                this.msgSuccess('添加成功')
                this.getConfigList()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            API.updateRedCurrency(this.digform).then(response => {
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
    updatePair(id) {
      API.getInfo(id).then(response => {
        if (response.code == 200) {
          this.digform = response.data
          this.updateId = id
          this.open = true
        } else {
          this.msgError(response.msg)
        }
      })
    },
    addConfig(row) {
      this.open = true
      this.digform = {}
      this.updateId = ''
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
