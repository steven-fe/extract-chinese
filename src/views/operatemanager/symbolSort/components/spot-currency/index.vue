<template>
  <div>
    <el-tabs v-model="activeName">
      <el-tab-pane
        v-for="item in tabPaneList"
        :key="item.id"
        lazy
        :label="item.label"
        :name="item.name"
      >
        <component
          :is="item.component"
          v-if="activeName === item.name"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Rate from './components/rate.vue'
import HotCurrency from './components/hot-currency.vue'
import Prime from './components/prime.vue'
import Popular from './components/popular.vue'
import TradeMarket from './components/trade-market.vue'
export default {
  name: 'SpotCurrency',
  components: {
    Rate,
    HotCurrency,
    Prime,
    Popular,
    TradeMarket
  },
  props: {

  },
  data() {
    return {
      activeName: 'Rate',
      tabPaneList: [
        {
          id: 0,
          label: this.$t('symbolSort.priceIncrease'),
          name: 'Rate',
          component: 'Rate'
        },
        {
          id: 1,
          label: this.$t('symbolSort.hotCoin'),
          name: 'HotCurrency',
          component: 'HotCurrency'
        },
        {
          id: 2,
          label: 'Prime',
          name: 'Prime',
          component: 'Prime'
        },
        {
          id: 3,
          label: 'Popular',
          name: 'Popular',
          component: 'Popular'
        },
        {
          id: 4,
          label: this.$t('symbolSort.tradingPageSort'),
          name: 'TradeMarket',
          component: 'TradeMarket'
        }
      ]
    }
  }
}
</script>
