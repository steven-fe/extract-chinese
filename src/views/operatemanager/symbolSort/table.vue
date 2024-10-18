<template>
  <div class="sort-table">
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column prop="sort" label="排序" />
      <el-table-column prop="symbol" label="币对" />
      <el-table-column prop="weight" label="权重" />
      <el-table-column fixed="right" :label="$t('common.operation')">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click="handleClick(scope.row)"
          >修改权重</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'SortTable',
  props: {
    tableData: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: () => 'future'
    }

  },
  methods: {
    handleClick(row) {
      this.$emit('editor', row, this.type)
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" scoped>
.sort-table {
  width: 100%;
  padding-bottom: 20px;
}
</style>
