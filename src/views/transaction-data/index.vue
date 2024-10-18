<template>
  <div class="app-container">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="团队信息" name="first">
        <TeamMessage v-if="activeName == 'first'" :id="competitionId" />
      </el-tab-pane>
      <el-tab-pane label="个人信息" name="second">
        <PersonalMessage v-if="activeName == 'second'" :id="competitionId" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import TeamMessage from './components/team-message.vue'
import PersonalMessage from './components/personal-message.vue'
export default {
  name: 'TransactionData',
  components: {
    TeamMessage,
    PersonalMessage
  },
  data() {
    return {
      activeName: 'first',
      competitionId: Number(this.$route.query.id)
    }
  },
  methods: {
    handleClick(tab, event) {
      this.activeName = tab.name
    }
  }
}
</script>
