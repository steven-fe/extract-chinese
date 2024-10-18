<template>
  <div class="app-container">
    <el-card :key="UID" class="box-card">
      <h3>{{ UID }} {{ $t('userManager.userDetail') }}</h3>
      <el-tabs v-if="userId" v-model="activeName">
        <template v-for="item in tabPanes">
          <el-tab-pane v-if="(item.name === 'childrenAccount' && accountType === 1) || item.name !== 'childrenAccount'" :key="item.id" :label="item.label" :name="item.name">
            <component
              :is="item.component"
              v-if="activeName === item.name"
              :msg="userId"
              :user-id="userId"
              :uid="UID"
              @goToPremission="activeName = 'Premission'"
              @toChildrenAccountTab="activeName = 'childrenAccount'"
              @updateLookInfo="updateLookInfo"
              @getAccountType="getAccountType"
              @toTab="toTab"
            />
          </el-tab-pane>
        </template>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import useroptlog from './components/useroptlog'
import useraccount from './components/useraccount'
import apiManagement from './components/apiManagement'
import AssetsData from './components/AssetsData/index'
import Premission from './components/Premission/index'
import SpotData from './components/SpotData/index'
import EarnData from './components/EarnData/index'
import PactData from './components/PactData/index'
import LaunchpadData from './components/LaunchpadData/index'
import childrenAccount from './components/childrenAccount'

export default {
  components: {
    useraccount,
    useroptlog,
    apiManagement,
    AssetsData,
    Premission,
    SpotData,
    EarnData,
    PactData,
    childrenAccount,
    LaunchpadData
  },
  data() {
    return {
      userId: undefined,
      activeName: 'Account',
      UID: '',
      accountType: undefined,
      tabPanes: [
        {
          id: 0,
          label: this.$t('userManager.account'),
          name: 'Account',
          component: 'useraccount'
        },
        {
          id: 1,
          label: this.$t('userManager.userlog'),
          name: 'Log',
          component: 'useroptlog'
        },
        {
          id: 2,
          label: this.$t('userManager.assetsData'),
          name: 'AssetsData',
          component: 'AssetsData'
        },
        {
          id: 3,
          label: this.$t('userManager.spotData'),
          name: 'SpotData',
          component: 'SpotData'
        },
        {
          id: 4,
          label: this.$t('userManager.earnData'),
          name: 'EarnData',
          component: 'EarnData'
        },
        {
          id: 5,
          label: this.$t('userManager.launchpadData'),
          name: 'LaunchpadData',
          component: 'LaunchpadData'
        },
        {
          id: 6,
          label: this.$t('userManager.pactData'),
          name: 'PactData',
          component: 'PactData'
        },
        {
          id: 7,
          label: this.$t('userManager.childrenAccount'),
          name: 'childrenAccount',
          component: 'childrenAccount'
        },
        {
          id: 8,
          label: this.$t('userManager.apiManage'),
          name: 'APImanagement',
          component: 'api-management'
        },
        {
          id: 9,
          label: this.$t('userManager.premission'),
          name: 'Premission',
          component: 'Premission'
        }
      ]
    }
  },
  created() {
    this.userId = sessionStorage.getItem('userId')
    this.UID = sessionStorage.getItem('uid')
    this.getAccountType()
  },
  methods: {
    updateLookInfo() {
      this.userId = sessionStorage.getItem('userId')
      this.UID = sessionStorage.getItem('uid')
      this.activeName = 'Account'
    },
    getAccountType(val) {
      this.accountType = val
    },
    toTab(val) {
      this.activeName = val
    }
  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped>
</style>
