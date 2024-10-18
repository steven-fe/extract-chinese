<template>
  <div class="app-container">
    <TableFilter :params="filterParams" :process-filter-params-for-api="processFilterParamsForApi" @change="changeFilterParams" @button-click-search="getList" />

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
import { getUnlockDetailList } from './api'
import TableFilter from './components/table-filter'
import Table from './components/table'

export default {
  name: 'UnlockFailRecord',
  components: {
    TableFilter,
    Table
  },
  data() {
    return {
      filterParams: {
        billId: null,
        uid: null,
        lockScene: null,
        currencyId: null,
        ruleId: null,
        execState: null,
        unlockTime: null
      },
      processFilterParamsForApi: Object.freeze((_filterParams) => {
        const startTime = Array.isArray(_filterParams.unlockTime) ? _filterParams.unlockTime[0] : null
        const endTime = Array.isArray(_filterParams.unlockTime) ? _filterParams.unlockTime[1] : null

        const filterParams = {
          ..._filterParams,
          startTime,
          endTime
        }

        delete filterParams.unlockTime

        return { ...filterParams, startTime, endTime }
      }),

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
      try {
        const { rows, total } = await getUnlockDetailList({
          ...this.processFilterParamsForApi(this.filterParams),
          ...this.pageParams
        })
        this.list = rows
        this.total = total
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>
