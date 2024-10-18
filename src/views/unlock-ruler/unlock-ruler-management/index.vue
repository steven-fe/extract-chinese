<template>
  <div class="app-container">
    <TableFilter :params="filterParams" @change="changeFilterParams" @button-click-search="getList" />

    <Table :data="list" @updateList="getList" />

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="pageParams.pageNum"
      :limit.sync="pageParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { getUnlockRuleList } from './api'
import TableFilter from './components/table-filter'
import Table from './components/table'

export default {
  name: 'UnlockRulerManagement',
  components: {
    TableFilter,
    Table
  },
  data() {
    return {
      filterParams: {
        currencyId: null,
        lockScene: null,
        unlockWay: null,
        ruleState: null
      },

      pageParams: {
        pageNum: 1,
        pageSize: 10
      },

      total: 0,
      list: []
    }
  },
  async created() {
    await this.getList()
  },
  methods: {
    changeFilterParams(options) {
      for (const key in options) {
        this.filterParams[key] = options[key]
      }
    },
    async getList() {
      const { rows, total } = await getUnlockRuleList({ ...this.filterParams, ...this.pageParams })
      this.list = rows
      this.total = total
    }
  }
}
</script>
