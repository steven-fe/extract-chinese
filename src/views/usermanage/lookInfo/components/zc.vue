<template>
  <div class="app-container">
    <!--table-->
    <el-table
      v-loading="loading"
      border
      class="top"
      :data="tableData"
      style="width: 100%"
    >

      <el-table-column
        prop="usable_amount"
        label="可用"
      />
      <el-table-column
        prop="frost_amount"
        label="冻结"
      />
      <el-table-column
        prop="currency"
        :label="$t('common.coin')"
      />
      <el-table-column
        prop="platform"
        label="平台"
      />
    </el-table>
    <!--分页组件-->
  </div>
</template>

<script>
import { listWalletAccount } from '@/api/user'
export default {
  props: ['msg'],
  data() {
    return {
      loading: true,
      userId: this.msg,
      // 日期快捷选项
      currency: '',
      tableData: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    // 加载
    load() {
      this.loading = true
      const formData = {
        'userId': this.userId
      }
      if (!this.userId) {
        return
      }
      listWalletAccount(formData).then(response => {
        if (response.data) {
          this.tableData = response.data
        } else {
          this.tableData = []
        }
        this.loading = false
      }).catch(error => {
        console.log(error)
      })
    }
  }
}
</script>
<style scoped>
  .el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 100%;
  }

  .top {
    margin-top: 20px;
  }
</style>
