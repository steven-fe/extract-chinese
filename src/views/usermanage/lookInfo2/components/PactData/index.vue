<template>
  <div class="pactdata-container">
    <el-tabs v-model="activeName">
      <el-tab-pane
        v-for="item in tabPaneList"
        :key="item.id"
        :label="item.label"
        :name="item.name"
      >
        <component
          :is="item.component"
          :msg="userId"
          :user-id="userId"
          :uid="uid"
          :contract-options="contractOptions"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import ContractRecord from './components/ContractRecord'
import EntrustmentRecord from './components/EntrustmentRecord'
import ContractPosition from './components/ContractPosition'
import ContractProfltLoss from './components/ContractProfltLoss'
import ContractClosePosition from './components/ContractClosePosition'
import { getContractList } from '@/api/cmsSymbolSort.js'
export default {
  name: 'PactData',
  components: {
    ContractRecord,
    EntrustmentRecord,
    ContractPosition,
    ContractProfltLoss,
    ContractClosePosition
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
      activeName: 'ContractRecord',
      tabPaneList: [
        {
          id: 0,
          label: '合约成交记录',
          name: 'ContractRecord',
          component: 'ContractRecord'
        },
        {
          id: 1,
          label: '合约委托记录',
          name: 'EntrustmentRecord',
          component: 'EntrustmentRecord'
        },
        {
          id: 2,
          label: '合约持仓',
          name: 'ContractPosition',
          component: 'ContractPosition'
        },
        {
          id: 3,
          label: this.$t('userManager.pactTab1'),
          name: 'ContractProfltLoss',
          component: 'ContractProfltLoss'
        },
        {
          id: 4,
          label: this.$t('userManager.pactTab2'),
          name: 'ContractClosePosition',
          component: 'ContractClosePosition'
        }
      ],
      contractOptions: []
    }
  },
  mounted() {
    getContractList().then((res) => {
      if (res.code === 200) {
        this.contractOptions = res.rows
      }
    })
  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped lang="scss">
.pactdata-container {
  >>> .el-tabs__nav-wrap::after {
    background-color: transparent;
  }
}
</style>
