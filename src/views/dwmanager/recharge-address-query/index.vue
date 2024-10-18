<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="80px" :rules="rules">
      <el-form-item prop="type">
        <el-select v-model="queryParams.type" size="mini" style="width: 90px">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item ref="account" prop="account" :rules="rules.check">
        <el-input
          v-model.trim="queryParams.account"
          type="text"
          placeholder="请输入uid/邮箱/手机号"
          clearable
          size="mini"
        />
      </el-form-item>
      <el-form-item label="币种代码" prop="symbol" :rules="rules.symbol">
        <el-select
          v-model="queryParams.symbol"
          size="mini"
          filterable
          clearable
          placeholder="请选择币种"
        >
          <el-option
            v-for="(item,index) in coinList"
            :key="index"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('systemsetting.chainType')" prop="chainProtocol" :rules="rules.chainProtocol">
        <el-select
          v-model="queryParams.chainProtocol"
          size="mini"
          filterable
          clearable
          placeholder="请选择链类型"
        >
          <el-option
            v-for="item in chainProtocolOptions"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item ref="address" label="充币地址" prop="address" :rules="rules.check">
        <el-input
          v-model.trim="queryParams.address"
          type="text"
          placeholder="请输入充币地址"
          clearable
          size="mini"
        />
      </el-form-item>
      <el-form-item ref="tag" label="Tag" prop="tag" label-width="50px" :rules="rules.check">
        <el-input
          v-model.trim="queryParams.tag"
          type="text"
          placeholder="请输入Tag"
          clearable
          size="mini"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
      </el-form-item>
    </el-form>
    <div style="color: red; margin-bottom: 10px;">币种代码和链类型必选，用户信息，充币地址，Tag至少输入一个才能进行查询！</div>

    <el-table border :data="dataList">
      <el-table-column label="用户uid" align="center" prop="uid" />

      <el-table-column label="邮箱号" align="center" prop="email">
        <template slot-scope="scope">
          <span v-if="scope.row.email === ''">--</span>
          <span v-else>{{ scope.row.email }}</span>
        </template>
      </el-table-column>

      <el-table-column label="手机号" align="center" prop="phone">
        <template slot-scope="scope">
          <span v-if="scope.row.phone === ''">--</span>
          <span v-else>{{ scope.row.phone }}</span>
        </template>
      </el-table-column>

      <el-table-column label="币种代码" align="center" prop="symbol" />

      <el-table-column :label="$t('systemsetting.chainType')" align="center" prop="chainProtocol" />

      <el-table-column label="充币地址-1" align="center" prop="addressNow" />

      <el-table-column label="充币地址-2" align="center" prop="addressOld">
        <template slot-scope="scope">
          <span v-if="scope.row.addressOld === null">--</span>
          <span v-else>{{ scope.row.addressOld }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Tag" align="center" prop="tag">
        <template slot-scope="scope">
          <span v-if="scope.row.tag === ''">--</span>
          <span v-else>{{ scope.row.tag }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    /> -->
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { getRechargeAddressList } from '@/api/rechargeAddress'

export default {
  data() {
    var validateCheck = (rule, value, callback) => {
      if (!this.queryParams.account && !this.queryParams.address && !this.queryParams.tag) {
        callback(new Error('用户信息/充币地址/Tag至少填写一项'))
      } else {
        if (!this.queryParams.account || !this.queryParams.address || !this.queryParams.tag) {
          this.$refs.account.clearValidate()
          this.$refs.address.clearValidate()
          this.$refs.tag.clearValidate()
        }
        callback()
      }
    }
    return {
      // total: '',
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        type: '1',
        account: '',
        symbol: '',
        chainProtocol: '',
        address: '',
        tag: ''
      },
      typeOptions: [
        {
          value: '1',
          label: '用户uid'
        },
        {
          value: '2',
          label: '邮箱'
        },
        {
          value: '3',
          label: '手机号'
        }
      ],
      dataList: [],
      rules: {
        symbol: [{ required: true, message: '请选择币种', trigger: 'change' }],
        chainProtocol: [{ required: true, message: '请选择链类型', trigger: 'change' }],
        check: [{ validator: validateCheck, trigger: 'change' }]
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList', 'protocolList']),
    coinList() {
      return this.currencyList
    },
    chainProtocolOptions() {
      return this.protocolList
    }
  },
  created() {
    this.getCurrency(1)
    this.getProtocol()
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency', 'getProtocol']),
    getList() {
      console.log('this.queryParams', this.queryParams)
      getRechargeAddressList(this.queryParams).then(res => {
        if (res.code === 200) {
          this.dataList = res.rows
        } else {
          this.msgError(res.msg)
        }
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      if (this.queryParams.symbol === '') {
        this.msgError('币种代码不能为空')
        return
      }
      if (this.queryParams.chainProtocol === '') {
        this.msgError('链类型不能为空')
        return
      }
      if (this.queryParams.account === '' && this.queryParams.address === '' && this.queryParams.tag === '') {
        this.msgError('用户信息，充币地址，Tag至少输入一个才能进行查询')
        return
      }
      this.$refs['queryForm'].validate(valid => {
        if (valid) {
          this.queryParams.pageNum = 1
          this.getList()
        }
      })
    }
  }
}
</script>
