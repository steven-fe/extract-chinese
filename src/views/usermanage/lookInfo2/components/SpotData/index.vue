<template>
  <div class="spotdata-container">
    <el-tabs
      v-model="activeName"
    >
      <el-tab-pane
        v-for="item in tabPaneList"
        :key="item.id"
        :label="item.label"
        :name="item.name"
      >
        <component
          :is="item.component"
          v-if="activeName === item.name"
          :msg="userId"
          :user-id="userId"
          :uid="uid"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import DealList from './components/DealList'
import OrderList from './components/OrderList'
export default {
  name: 'SpotData',
  components: {
    DealList,
    OrderList
  },
  props: {
    msg: {
      type: [String, Number],
      default: ''
    },
    userId: {
      type: [String, Number],
      default: ''
    },
    uid: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      activeName: 'DealList',
      tabPaneList: [
        {
          id: 0,
          label: '现货成交记录',
          name: 'DealList',
          component: 'DealList'
        },
        {
          id: 1,
          label: '现货委托记录',
          name: 'OrderList',
          component: 'OrderList'
        }
      ]
    }
  },
  mounted() {

  },
  methods: {

  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped lang="scss">
.spotdata-container {
  >>> .el-tabs__nav-wrap::after {
    background-color: transparent;
  }
}
</style>
