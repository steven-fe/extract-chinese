<template>
  <div class="app-container">
    <el-card class="box-card">
      <h3>{{ UID }} 邀请列表</h3>
      <el-tabs v-if="UID" v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="一级邀请列表" name="name0">
          <recordlevel1 :uid="UID" />
        </el-tab-pane>
        <el-tab-pane label="二级邀请列表" name="name1">
          <recordlevel2 :uid="UID" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import recordlevel1 from './recordlevel1'
import recordlevel2 from './recordlevel2'

export default {
  name: 'Userinvitationlist',
  components: {
    recordlevel1,
    recordlevel2
  },
  data() {
    return {
      userId: undefined,
      activeName: 'name0',
      UID: ''
    }
  },
  mounted() {
    this.userId = sessionStorage.getItem('userId')
    this.UID = sessionStorage.getItem('uid')
  },
  methods: {
    handleClick(tab, event) {
      if (tab.name == 'name2') {
        this.$refs.cmsuserlog.load()
      }
    }
  }
}
</script>

<style scoped>
</style>
