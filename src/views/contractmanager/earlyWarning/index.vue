<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="85px">
      <el-form-item :label="$t('common.accountType')" prop="uid">
        <el-select v-model="queryParams.uid" clearable size="mini" placeholder="请选择账户类型">
          <el-option
            v-for="(item, index) in typeList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="保证金币种" prop="currency">
        <el-select v-model="queryParams.currency" clearable size="mini" placeholder="请选择保证金币种">
          <el-option
            v-for="(item, index) in marList"
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
    <el-table v-loading="loading" :data="tableList" border>
      <el-table-column label="账号ID" align="center" prop="uid" />
      <el-table-column label="账号类型" align="center">
        <template slot-scope="scope">
          <span v-for="(item, index) in typeList" :key="index">
            <span v-if="item.value==scope.row.uid">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="保证金币种" align="center" prop="currency" />
      <el-table-column label="可用余额" align="center" prop="balance" />
      <el-table-column label="余额预警值" align="center" prop="warningValue">
        <template slot-scope="scope">
          <span v-if="scope.row.warningValue==null">0</span>
          <span v-else>{{ scope.row.warningValue }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="load"
    />

    <!-- 修改余额预警值 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="$t('common.accountType')" prop="uid">
          <el-select v-model="form.uid" disabled size="mini" placeholder="请选择账户类型">
            <el-option
              v-for="(item, index) in typeList2"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="保证金币种" prop="currency">
          <el-select v-model="form.currency" disabled size="mini" placeholder="请选择保证金币种">
            <el-option
              v-for="(item, index) in marList"
              :key="index"
              :label="item.marginCoin"
              :value="item.marginCoin"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="余额预警值" prop="warningValue">
          <el-input v-model="form.warningValue" placeholder="请输入余额预警值" />
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
  accountWarningList as balanceOfSystemList,
  updateAccountWarning
} from '@/api/contract/accountwarning'
import { listCoinMar } from '@/api/contract/margin'
export default {
  name: '',

  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      tableList: [],
      marList: [],
      title: undefined,
      total: 0,
      open: false,
      // 查询参数
      queryParams: {
        uid: undefined,
        currency: undefined,
        pageNum: 1,
        pageSize: 20
      },
      form: {},
      typeList: [
        { value: 1, label: '划转记账账户' },
        { value: 2, label: '平仓账户' },
        { value: 3, label: '手续费账户' },
        { value: 4, label: '资金费用账户' },
        { value: 5, label: '隔夜费账户' },
        { value: 6, label: '营销账户' },
        { value: 7, label: '相互保资金' },
        { value: 8, label: '相互保收益' },
        { value: 9, label: '返佣消耗' },
        { value: 10, label: '兑换账户' },
        { value: 11, label: '回购账户' }
      ],
      typeList2: [
        { value: '1', label: '划转记账账户' },
        { value: '2', label: '平仓账户' },
        { value: '3', label: '手续费账户' },
        { value: '4', label: '资金费用账户' },
        { value: '5', label: '隔夜费账户' },
        { value: '6', label: '营销账户' },
        { value: '7', label: '相互保资金' },
        { value: '8', label: '相互保收益' },
        { value: '9', label: '返佣消耗' },
        { value: '10', label: '兑换账户' },
        { value: '11', label: '回购账户' }
      ],
      rules: {
        warningValue: [
          { required: true, message: '余额预警值不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.load()
    this.getMarList()
  },
  methods: {
    load() {
      this.loading = true
      balanceOfSystemList(this.queryParams).then((response) => {
        this.tableList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 保证金币种
    getMarList() {
      listCoinMar().then((response) => {
        if (response.code == 200) {
          if (this.marList) {
            this.marList = response.rows
          }
        } else {
          this.msgError(response.msg)
        }
      })
    },
    handleQuery() {
      this.load()
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        type: undefined,
        uid: undefined,
        warningValue: undefined,
        currency: undefined,
        exch_id: undefined,
        op_uid: undefined
      }
      this.resetForm('queryForm')
    },
    cancel() {
      this.open = false
      this.reset()
    },
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          updateAccountWarning(this.form).then((response) => {
            if (response.code === 200) {
              this.msgSuccess('修改成功')
              this.open = false
              this.load()
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.load()
    },
    handleUpdate(row) {
      this.reset()
      this.open = true
      this.form = Object.assign({}, row)
      this.title = '修改余额预警值'
    }
  }
}
</script>

<style scoped>
</style>
