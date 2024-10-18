<template>
  <el-dialog :title="$t('financemanager.airdropAccountBalance')" :visible.sync="show" width="800px" :close-on-click-modal="false">
    <div class="search">
      <el-form ref="form" :inline="true" :model="form" label-width="155px">
        <el-form-item :label="$t('financemanager.airdropLockedCoins')" prop="currencyId">
          <el-select v-model="form.currencyId" filterable clearable :placeholder="$t('financemanager.pleaseSelectAirdropLockUpCurrency')">
            <el-option
              v-for="item in codeOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="initData">{{ $t('common.search') }}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column type="index" :label="$t('common.orderNumber')" align="center" width="200px" />
      <el-table-column prop="currencyCode" :label="$t('common.coin')" align="center" />
      <el-table-column prop="spotAvailableBalance" :label="$t('financemanager.balance')" align="center" />
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > form.pageSize"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="pagination"
      />
    </div>
  </el-dialog>
</template>

<script>
import { operateUserAccount } from '@/api/operate/lock'
import { mapState } from 'vuex'

export default {
  name: 'OperateUserAccount',
  data() {
    return {
      show: false,
      form: {
        currencyId: '',
        pageNum: 0,
        pageSize: 10
      },
      tableData: [],
      total: 0
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList', 'protocolList']),
    codeOptions() {
      return this.currencyList
    }
  },
  methods: {
    init() {
      this.show = true
      this.initData()
    },
    initData() {
      operateUserAccount(this.form).then(res => {
        console.log('返回的数据', res)
        if (res.code === 200) {
          this.tableData = res.rows
          this.total = res.total
        }
      })
    },
    // 翻页
    pagination(pageData) {
      this.form.pageNum = pageData.page
      this.initData()
    }
  }
}
</script>

<style lang="scss" scoped>
.search {
  border-bottom: 2px solid #dfe4ed;
  padding: 20px 0;
}
</style>
