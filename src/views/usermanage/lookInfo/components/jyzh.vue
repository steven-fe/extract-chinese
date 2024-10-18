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
        prop="usable_aitc"
        label="可用"
      />
      <el-table-column
        prop="frost_aitc"
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
import { listCtcAccount } from '@/api/user'
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
      listCtcAccount(formData).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
        } else {
          this.tableData = []
          this.msgError(response.msg)
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
