<template>
  <el-table :data="data" border>
    <el-table-column
      v-for="column in columns"
      :key="column.prop"
      :label="column.label"
      align="center"
      :fixed="column.fixed"
      :prop="column.prop"
      :min-width="column.minWidth"
    >
      <template slot-scope="scope">
        <Cell :scope="scope" :column="column" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import Cell from './cell'

export default {
  name: 'ListTable',
  components: {
    Cell
  },
  props: {
    data: {
      type: Array,
      required: true
    },
    columns: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
    }
  },
  created() {
  },
  methods: {
  }
}
</script>

<style lang="scss" module>
</style>
