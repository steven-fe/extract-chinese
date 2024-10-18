<template>
  <div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="当前委托" name="first">
        <current-order-list :user-id="this.msg" />
      </el-tab-pane>
      <el-tab-pane label="历史委托" name="second">
        <history-order-list :user-id="this.msg" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import HistoryOrderList from './history-order-list'
import CurrentOrderList from './current-order-list'

export default {
  name: 'OrderList',
  components: {
    HistoryOrderList,
    CurrentOrderList
  },
  props: ['msg'],
  data() {
    return {
      activeName: 'first'
    }
  }
}
</script>
