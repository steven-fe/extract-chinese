<template>
  <div class="app-container">
    <TableFilter :params="filterParams" @change="changeFilterParams" @button-click-search="getList" />

    <Table :data="list" @updateList="getList" />

    <pagination v-show="total > 0" :total="total" :page.sync="pageParams.pageNum" :limit.sync="pageParams.pageSize"
      @pagination="getList" />
  </div>
</template>

<script>
import _ from 'lodash'
import * as api from './api'
import TableFilter from './components/table-filter'
import Table from './components/table'

export default {
  name: 'Popup',
  components: {
    TableFilter,
    Table
  },
  data() {
    return {
      filterParams: {
        title: null,
        language: null,
        status: null,
        createTime: null
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
      const filterParams = {
        ..._.omit(this.filterParams, 'createTime'),
        startTime: Array.isArray(this.filterParams.createTime) ? this.filterParams.createTime[0] : null,
        endTime: Array.isArray(this.filterParams.createTime) ? this.filterParams.createTime[1] : null,
      }

      const { rows, total } = await api.getList({ ...filterParams, ...this.pageParams })

      this.list = rows
      this.total = total
    }
  }
}
</script>
