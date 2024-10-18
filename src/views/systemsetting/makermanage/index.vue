<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="80px">
      <el-form-item label="币对:" label-width="50px" prop="symbolId">
        <el-select v-model="form.symbolId" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in currencyOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="做市状态:" prop="state">
        <el-select v-model="form.state" size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option :label="$t('common.all')" value="" />
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
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="addConfig">添加配置</el-button>

    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column :label="$t('common.operation')" align="center" width="180">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="queryConfig(scope.row.id)">修改</el-button>
          <el-button v-if="scope.row.state === 2" type="success" size="mini" @click="stateChange(scope.row.id, 1)">开启做市</el-button>
          <el-button v-else type="danger" size="mini" @click="stateChange(scope.row.id, 2)">关闭做市</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="symbol" width="100" label="做市交易对" align="center" />
      <el-table-column prop="uid" label="做市账户UID" align="center" />
      <el-table-column prop="makerFee" label="Maker手续费" align="center" />
      <el-table-column prop="takerFee" label="Taker手续费" align="center" />
      <el-table-column prop="minAmount" label="最小委托限额" align="center" />
      <el-table-column prop="maxAmount" label="最大委托限额" align="center" />
      <el-table-column prop="title" label="做市状态" align="center">
        <template slot-scope="scope">{{ scope.row.state === 1 ? '开启' : '关闭' }}</template>
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
    <el-dialog :title="configId ? '修改配置' : '添加配置'" :visible.sync="open" width="1000px" :before-close="cancel" :close-on-click-modal="false">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        class="form-grid"
      >
        <el-form-item class="grid-item" label="币对:" prop="symbolId">
          <el-select v-model="digform.symbolId" style="width: 100%;" :placeholder="$t('common.pleaseChoose')" filterable>
            <el-option
              v-for="item in currencyOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="做市账户UID:" prop="uid">
          <el-input v-model="digform.uid" type="textarea" placeholder="请输入以','分割的UID" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="Maker手续费:" prop="makerFee">
          <el-input v-model="digform.makerFee" placeholder="请输入数字" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="Taker手续费:" prop="takerFee">
          <el-input v-model="digform.takerFee" placeholder="请输入数字" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="最小委托限额:" prop="minAmount">
          <el-input v-model="digform.minAmount" placeholder="请输入大于0的数字" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="最大委托限额:" prop="maxAmount">
          <el-input v-model="digform.maxAmount" placeholder="请输入大于0的数字" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="做市状态:" prop="state">
          <el-select v-model="digform.state" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in openOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
import * as API from '@/api/systemsetting/makermanage'

export default {
  name: 'Makermanage',
  data() {
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
    var checkNumber1 = (rule, value, callback) => {
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
    var checkNumber = (rule, value, callback) => {
      var reg = /^[0-9]\d*$/
      if (!reg.test(value)) {
        return callback(new Error('请输入正确数字'))
      } else {
        callback()
      }
    }
    return {
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
        state: '',
        pageNum: 1,
        pageSize: 10,
        orderByColumn: 'id',
        isAsc: 'desc'

      },
      tableData: [],
      open: false,
      digform: {
        symbolId: '',
        uid: '',
        makerFee: '',
        takerFee: '',
        minAmount: '',
        maxAmount: '',
        state: ''
      },
      rules: {
        symbolId: [
          { required: true, message: '请选择币对', trigger: 'blur' }
        ],
        uid: [
          { required: true, validator: checkUid, trigger: 'blur' }
        ],
        makerFee: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        takerFee: [
          { required: true, validator: checkNumber, trigger: 'blur' }
        ],
        minAmount: [
          { required: true, validator: checkNumber1, trigger: 'blur' }
        ],
        maxAmount: [
          { required: true, validator: checkNumber1, trigger: 'blur' }
        ],
        state: [
          { required: true, message: '请选择做市状态', trigger: 'blur' }
        ]
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
        { label: '开启', value: 1 },
        { label: '关闭', value: 2 }
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
      this.open = false
      this.$refs['digform'].resetFields()
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
          if (this.configId == '') {
            API.addMaker(this.digform).then(response => {
              if (response.code == 200) {
                this.msgSuccess('添加成功')
                this.getConfigList()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            API.updateMaker(this.digform).then(response => {
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
    stateChange(id, state) {
      API.updateState({ id, state }).then(response => {
        if (response.code == 200) {
          state === 1 ? this.msgSuccess('开启成功') : this.msgSuccess('关闭成功')
          this.getConfigList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    queryConfig(id) {
      this.configId = id
      this.open = true
      API.getInfo(id).then(response => {
        if (response.code == 200) {
          this.digform = response.data
        } else {
          this.msgError(response.msg)
        }
      })
    },
    addConfig(row) {
      this.open = true
      this.digform = {}
      this.configId = ''
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
