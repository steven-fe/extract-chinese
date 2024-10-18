<template>
  <div class="app-container">
    <el-form :inline="true" :model="form" class="demo-form-inline">
      <el-form-item label="" prop="currencyCode">
        <el-select v-model="form.currencyCode" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in codeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getConfigList">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column type="index" label="排序" align="center" width="100" />
      <el-table-column prop="currencyCode" :label="$t('common.coin')" align="center" />
      <el-table-column prop="weight" label="权重" align="center" />
      <el-table-column prop="coinSymbol" :label="$t('common.operation')" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="modify(scope.row)">修改权重</el-button>
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
    <el-dialog title="修改" :visible.sync="open" width="300px" :before-close="cancel" :close-on-click-modal="false">
      权重：<el-input v-model="digForm.weight" placeholder="请输入大于等于0的整数" clearable />
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button size="mini" type="primary" @click="save">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import * as API from '@/api/systemsetting/currencyapply'
import { commonFilter } from '@/utils/filters'
import { mapState } from 'vuex'

export default {
  name: 'Currencyapply',
  data() {
    return {
      initialOfferingOptions: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ],
      pageShow: true,
      total: 0,
      form: {
        pageNum: 1,
        pageSize: 10,
        currencyCode: undefined
      },
      tableData: [],
      open: false,
      codeOptions: [],
      digForm: {
        currencyCode: '',
        weight: 0
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    coinList() {
      return this.currencyList
    }
  },
  mounted() {
    this.getConfigList()
    this.getCurrencyList()
  },
  methods: {
    modify(row) {
      this.open = true
      this.digForm.currencyCode = row.currencyCode
      this.digForm.weight = row.weight
    },
    getConfigList(obj) {
      this.form.pageNum = obj && obj.page ? obj.page : 1
      this.form.pageSize = obj && obj.limit ? obj.limit : 10
      API.currencyListByWeight(this.form).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
    },
    save() {
      if (Number.isNaN(+this.digForm.weight) || String(this.digForm.weight).indexOf('.') > -1 || +this.digForm.weight < 0) {
        this.msgError('请输入大于等于0的整数')
        return
      }
      API.upadtaWeight(this.digForm).then(res => {
        this.msgSuccess('修改成功')
        this.getConfigList()
        this.cancel()
      })
    },
    // 获取币种代码
    getCurrencyList() {
      API.getCurrencyList().then(res => {
        this.codeOptions = res.data
      })
    },
    cancel() {
      this.open = false
      // this.digForm.currencyCode = ''
      // this.digForm.weight = 0
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
