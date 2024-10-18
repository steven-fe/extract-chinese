<template>
  <div>
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="跟随信息" name="first">
        <GsList :msg="guideId" />
      </el-tab-pane>
      <el-tab-pane label="带单委托信息" name="second">
        <DdwtList :msg="guideId" />
      </el-tab-pane>
      <el-tab-pane label="带单盈利明细" name="third">
        <DdylList :msg="guideId" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import DdwtList from './components/ddwtList'
import DdylList from './components/ddylList'
import GsList from './components/gsList'
export default {
  components: {
    DdwtList,
    DdylList,
    GsList
  },
  data() {
    return {
      activeName: 'first',
      guideId: ''
    }
  },
  created() {
    if (this.$route.params.guideId) {
      this.guideId = this.$route.params.guideId
    } else {
      this.$store.state.tagsView.visitedViews.splice(
        this.$store.state.tagsView.visitedViews.findIndex(
          item => item.path === this.$route.path
        ),
        1
      )
      this.$router.go(-1)
    }
  },
  methods: {}
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped>
</style>
