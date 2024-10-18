<template>
  <div class="app-container">

    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="id" label="ID" align="center" />
      <el-table-column prop="projectName" label="Project Name" align="center" />
      <el-table-column prop="coinName" label="Token/Coin Full Name" align="center" />
      <el-table-column prop="coinSymbol" label="Token/Coin Symbol" align="center" />
      <el-table-column prop="existCountry" label="Project location country" align="center" />
      <el-table-column prop="dockingEmail" width="120" label="Docking Email" align="center" />
      <el-table-column prop="offeringPrice" label="Offering Price" align="center" />
      <el-table-column prop="officialWebsite" width="120" label="Official Website" align="center" />
      <el-table-column label="Initial Offering" align="center">
        <template slot-scope="scope">{{ typeLabel(initialOfferingOptions, scope.row.initialOffering) }}</template>
      </el-table-column>
      <el-table-column prop="totalSupply" label="Total Supply" align="center" />
      <el-table-column prop="totalCirculation" label="Total Circulation" align="center" />
      <el-table-column prop="blockchainBrowser" label="Blockchain Browser" align="center" />
      <el-table-column prop="contractAddress" label="Contract Address" align="center" />
      <el-table-column prop="contractInformation" label="Contact Information" align="center" />
      <el-table-column prop="expectedDate" label="Expected Listing Date" align="center" />
      <el-table-column prop="submitDate" label="Submit Date" align="center" />
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
  </div>
</template>
<script>
import * as API from '@/api/systemsetting/currencyapply'
import { commonFilter } from '@/utils/filters'

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
        orderByColumn: 'id',
        isAsc: 'desc'
      },
      tableData: [],
      open: false
    }
  },
  computed: {

  },
  mounted() {
    this.getConfigList()
  },
  methods: {
    getConfigList() {
      API.getApplyDataList(this.form).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
    },
    typeLabel(data, val) {
      return commonFilter(data, val)
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
