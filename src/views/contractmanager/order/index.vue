<template>
  <div class="unusual app-container">
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
      <el-menu-item index="1">用户下单</el-menu-item>
      <el-menu-item index="2">计划委托</el-menu-item>
    </el-menu>
    <div class="map" />
    <order v-if="activeIndex === '1'" />
    <planord v-if="activeIndex === '2'" />
  </div>
</template>

<script>
import order from './order'
import planord from './planord'
export default {
  components: { order, planord },
  data() {
    return {
      activeIndex: '1'
    }
  },
  methods: {
    // 切换tab
    handleSelect(key) {
      this.activeIndex = key
    }
  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" scoped>
  .unusual{
    padding: 0 20px 20px;
    .map{
      height: 20px;
    }
  }
</style>
