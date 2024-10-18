
<template>
  <div class="assetsdata-container">
    <el-tabs
      v-model="activeName"
    >
      <el-tab-pane
        v-for="item in tabPaneList"
        :key="item.id"
        lazy
        :label="item.label"
        :name="item.name"
      >
        <component
          :is="item.component"
          :msg="userId"
          :user-id="userId"
          :uid="uid"
          @toTab="$emit('toTab', $event)"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import UserAssets from './components/UserAssets'
import PayDetail from './components/PayDetail'
import ExtractDetail from './components/ExtractDetail'
import AccountChecking from './components/AccountChecking'
import Transfer from './components/Transfer'
import SpotFund from './components/SpotFund'
import PactFund from './components/PactFund'
import { mapActions } from 'vuex'
export default {
  name: 'AssetsData',
  components: {
    UserAssets,
    PayDetail,
    ExtractDetail,
    AccountChecking,
    Transfer,
    SpotFund,
    PactFund
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
      activeName: 'UserAssets',
      tabPaneList: [
        {
          id: 0,
          label: this.$t('userManager.userAssets'),
          name: 'UserAssets',
          component: 'UserAssets'
        },
        {
          id: 1,
          label: this.$t('userManager.payDetail'),
          name: 'PayDetail',
          component: 'PayDetail'
        },
        {
          id: 2,
          label: this.$t('userManager.extractDetail'),
          name: 'ExtractDetail',
          component: 'ExtractDetail'
        },
        {
          id: 3,
          label: this.$t('userManager.transfer'),
          name: 'Transfer',
          component: 'Transfer'
        },
        {
          id: 4,
          label: this.$t('userManager.spotFund'),
          name: 'SpotFund',
          component: 'SpotFund'
        },
        {
          id: 5,
          label: this.$t('userManager.pactFund'),
          name: 'PactFund',
          component: 'PactFund'
        },
        {
          id: 6,
          label: this.$t('userManager.accountChecking'),
          name: 'AccountChecking',
          component: 'AccountChecking'
        }
      ]
    }
  },
  created() {
    this.getCurrency()
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency'])
  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped lang="scss">
.assetsdata-container {
  >>> .el-tabs__nav-wrap::after {
    background-color: transparent;
  }
}

</style>
