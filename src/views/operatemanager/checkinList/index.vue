<template>
  <div class="app-container">
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane label="签到列表" name="one">
        <checkinList ref="checkinList" />
      </el-tab-pane>
      <el-tab-pane label="注册列表" name="two">
        <register ref="register" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import checkinList from './components/checkinList'
import register from './components/register'
export default {
  components: { checkinList, register },
  data() {
    return {
      activeName: 'one'
    }
  },
  methods: {
    handleClick(tab, event) {
      if (tab.name == 'one') {
        this.$refs.checkinList.load()
      } else {
        this.$refs.register.load()
      }
    }
  }
}
</script>
