<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="80px">
      <el-form-item label="链名称:" prop="symbol">
        <el-select v-model="form.name" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in currencyOptions"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="链协议:" prop="symbol">
        <el-select v-model="form.protocol" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in protocolOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList">查找</el-button>
      </el-form-item>
    </el-form>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="addConfig">添加链配置</el-button>

    <el-table :data="tableData" border class="table cabin-table">
      <el-table-column :label="$t('common.operation')" align="center" width="400">
        <template slot-scope="scope">
          <div>
            <el-button type="primary" size="mini" @click="update(scope.row.id)">修改链配置</el-button>
            <el-button v-if="scope.row.depositOpen == 0" size="mini" type="success" @click="handledepositOpen(scope.row, 1)">开启充币</el-button>
            <el-button v-if="scope.row.depositOpen == 1" size="mini" type="danger" @click="handledepositOpen(scope.row, 0)">关闭充币</el-button>
            <el-button v-if="scope.row.withdrawOpen == 0" size="mini" type="success" @click="handlewithdrawOpen(scope.row, 1)">开启提币</el-button>
            <el-button v-if="scope.row.withdrawOpen == 1" size="mini" type="danger" @click="handlewithdrawOpen(scope.row, 0)">关闭提币</el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="name" width="200" label="链名称" align="center" />
      <el-table-column prop="protocol" width="200" label="链协议" align="center" />
      <el-table-column prop="showName" width="200" label="链展示名" align="center">
        <template slot-scope="scope">{{ scope.row.showName || '--' }}</template>
      </el-table-column>
      <el-table-column label="标签类型" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.tagType == 0">
            关闭
          </div>
          <div v-if="scope.row.tagType == 1">
            必填
          </div>
          <div v-if="scope.row.tagType == 2">
            非必填
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="chainBrowserAddress" label="区块链浏览器-地址查询" align="center" width="300" />
      <el-table-column prop="chainBrowserTx" label="区块链浏览器-TX查询" align="center" width="300" />
      <el-table-column prop="depositOpen" width="100" label="是否开放充币" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.depositOpen === 0">未开放</span>
          <span v-if="scope.row.depositOpen === 1">开放</span>
        </template>
      </el-table-column>
      <el-table-column prop="withdrawOpen" width="100" :label="$t('systemsetting.whetherToOpenTheCoinWithdrawal')" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.withdrawOpen === 0">未开放</span>
          <span v-if="scope.row.withdrawOpen === 1">开放</span>
        </template>
      </el-table-column>
      <el-table-column prop="depositQuick" width="100" label="快速上账数" align="center" />
      <el-table-column prop="depositConfirm" width="100" label="安全上账数" align="center" />
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
    <el-dialog :title="addSet" :visible.sync="open" width="500px" :before-close="cancel" :close-on-click-modal="false">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        class="form-grid"
        label-width="200px"
      >
        <el-form-item class="grid-item" label="链名称:" prop="name">
          <el-input v-model="digform.name" placeholder="请输入字母或数字" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="链协议:" prop="protocol">
          <el-input v-model="digform.protocol" placeholder="请输入链协议" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="链展示名称:" prop="showName">
          <el-input v-model="digform.showName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="标签类型:" prop="tagType">
          <el-select v-model="digform.tagType" style="width: 100%" placeholder="请选择类型">
            <el-option
              v-for="item in tagTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="grid-item" label="区块链浏览器-地址查询:" prop="chainBrowserAddress">
          <el-input v-model="digform.chainBrowserAddress" placeholder="请输入区块链浏览器-地址" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="区块链浏览器-TX查询:" prop="chainBrowserTx">
          <el-input v-model="digform.chainBrowserTx" placeholder="请输入区块链浏览器-TX" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="是否开放充币:" prop="depositOpen">
          <el-select v-model="digform.depositOpen" clearable size="small" placeholder="请输入是否开放充币">
            <el-option
              v-for="item in depositOpenOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('systemsetting.whetherToOpenTheCoinWithdrawal')" prop="withdrawOpen">
          <el-select v-model="digform.withdrawOpen" clearable size="small" placeholder="请输入是否开放提币">
            <el-option
              v-for="item in withdrawOpenOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="grid-item" label="快速上账数:" prop="depositQuick">
          <el-input v-model="digform.depositQuick" placeholder="请输入数字" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="安全上账数:" prop="depositConfirm">
          <el-input v-model="digform.depositConfirm	" placeholder="请输入数字" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="是否为evm链:" prop="evmState">
          <el-select v-model="digform.evmState" size="small" placeholder="是否为evm链">
            <el-option
              v-for="item in evmList"
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
import * as API from '@/api/systemsetting/chainmanage'
import { commonFilter } from '@/utils/filters'

export default {
  name: 'Chain',
  data() {
    var checkdeposit = (rule, value, callback) => {
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
    // var checkdepositConfirm = (rule, value, callback) => {
    //   //正整数
    //   let reg = /^[+]{0,1}(\d+)$/g;
    //   if (value === "") {
    //     callback(new Error("请输入内容"));
    //   } else if (!reg.test(value)) {
    //     callback(new Error("请输入0及0以上的整数"));
    //   } else {
    //     callback();
    //   }
    // };
    const checkCode = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入字母或者数字'))
      }
      var reg = /[^\w]/g
      if (value) {
        if (reg.test(value)) {
          return callback(new Error('请输入字母或者数字'))
        } else {
          callback()
        }
      }
    }
    return {
      evmList: [
        { label: '否', value: 0 },
        { label: '是', value: 1 }
      ],
      depositOpenOptions: [
        { label: '未开放', value: 0 },
        { label: '开放', value: 1 }
      ],
      withdrawOpenOptions: [
        { label: '未开放', value: 0 },
        { label: '开放', value: 1 }
      ],
      total: 0,
      tagTypeOptions: [
        { label: '关闭', value: 0 },
        { label: '必填', value: 1 },
        { label: '非必填', value: 2 }
      ],
      protocolOptions: [],
      form: {
        name: '',
        protocol: '',
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      configId: '',
      open: false,
      addSet: '',
      digform: {
        name: '',
        showName: '',
        protocol: '',
        chainBrowserAddress: '',
        chainBrowserTx: '',
        depositOpen: '',
        withdrawOpen: '',
        depositConfirm: '',
        depositQuick: '',
        evmState: 0
      },
      rules: {
        name: [
          { required: true, validator: checkCode, trigger: 'blur' }
        ],
        protocol: [
          { required: true, message: '请输入链协议', trigger: 'blur' }
        ],
        chainBrowserAddress: [
          { required: true, message: '请输入地址', trigger: 'blur' }
        ],
        chainBrowserTx: [
          { required: true, message: '请输入地址', trigger: 'blur' }
        ],
        depositOpen: [
          { required: true, message: this.$t('common.pleaseChoose'), trigger: 'blur' }
        ],
        withdrawOpen: [
          { required: true, message: this.$t('common.pleaseChoose'), trigger: 'blur' }
        ],
        depositQuick: [
          { required: true, validator: checkdeposit, trigger: 'blur' }
        ],
        depositConfirm: [
          { required: true, validator: checkdeposit, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['chainList']),
    currencyOptions() {
      return this.chainList
    }
  },
  created() {
    this.getConfigList()
    API.protocolList().then((res) => {
      if (res.code === 200) {
        this.protocolOptions = res.data
      }
    })
  },
  mounted() {
    this.getChain()
    this.getConfigList()
  },
  methods: {
    getConfigList() {
      API.getList(this.form).then(response => {
        if (+response.code === 200) {
          this.tableData = response.rows
          this.total = response.total
          API.protocolList().then((res) => {
            if (res.code === 200) {
              this.protocolOptions = res.data
            }
          })
        } else {
          this.msgError(response.msg)
        }
      })
    },
    ...mapActions('systemsetting', ['getChain']),
    stateFilter(state) {
      return commonFilter(this.openOptions, state)
    },
    cancel() {
      this.open = false
      this.$refs['digform'].resetFields()
    },
    setConfig() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          if (this.configId) {
            API.updateData(this.digform).then(response => {
              if (+response.code === 200) {
                this.msgSuccess('修改成功')
                this.getConfigList()
                this.getChain()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
            })
            return
          }
          API.addChain(this.digform).then(response => {
            if (+response.code === 200) {
              this.msgSuccess('添加成功')
              this.getConfigList()
              this.getChain()
              this.cancel()
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    },
    // 充币
    handledepositOpen(row, depositOpen) {
      const params = {
        id: row.id,
        depositOpen: depositOpen
      }
      API.handlerDepositOpen(params).then(response => {
        if (response.code === 200) {
          this.$message({
            type: 'success',
            message: this.$t('common.operationSucceed')
          })
          this.getConfigList()
        } else {
          this.$message({
            type: 'error',
            message: '操作失败'
          })
        }
      })
    },
    // 提币
    handlewithdrawOpen(row, withdrawOpen) {
      const params = {
        id: row.id,
        withdrawOpen: withdrawOpen
      }
      API.handlerWithdrawOpen(params).then(response => {
        if (response.code === 200) {
          this.$message({
            type: 'success',
            message: this.$t('common.operationSucceed')
          })
          this.getConfigList()
        } else {
          this.$message({
            type: 'error',
            message: '操作失败'
          })
        }
      })
    },
    // stateChange(id, state) {
    //   API.updateChain({id, state}).then(response => {
    //     if (+response.code === 200) {
    //       state === 1 ? this.msgSuccess("开启成功") : this.msgSuccess('关闭成功')
    //       this.getConfigList();
    //     } else {
    //       this.msgError(response.msg);
    //     }
    //   });
    // },
    addConfig(row) {
      this.addSet = '添加链配置'
      this.open = true
      this.configId = ''
      this.digform = { evmState: 0 }
    },
    update(id) {
      this.addSet = '修改链配置'
      this.configId = id
      API.getInfo(id).then(res => {
        if (res.code === 200) {
          this.digform = res.data
          this.open = true
        } else {
          this.msgError(res.msg)
        }
      })
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped lang="scss">
.table {
  margin-top: 20px;
}
</style>
