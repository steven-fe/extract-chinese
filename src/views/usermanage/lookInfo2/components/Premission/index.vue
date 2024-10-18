
<template>
  <div class="premission-container">
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
          :user-id="userId"
          :uid="uid"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import TradingPremission from './components/TradingPremission'
export default {
  name: 'Premission',
  components: {
    TradingPremission
  },
  props: {
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
      activeName: 'TradingPremission',
      tabPaneList: [
        {
          id: 0,
          label: '交易权限',
          name: 'TradingPremission',
          component: 'TradingPremission'
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
.premission-container {
  >>> .el-tabs__nav-wrap::after {
    background-color: transparent;
  }
}
</style>
