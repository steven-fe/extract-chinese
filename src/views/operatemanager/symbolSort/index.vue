<template>
  <div :class="$style.contentBox">
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
import SpotCurrency from './components/spot-currency/index.vue'
import FutureCurrency from './components/future-currency.vue'
export default {
  name: 'SymbolSort',
  components: {
    SpotCurrency,
    FutureCurrency
  },
  props: {

  },
  data() {
    return {
      activeName: 'SpotCurrency',
      tabPaneList: [
        {
          id: 0,
          label: this.$t('symbolSort.spot'),
          name: 'SpotCurrency',
          component: 'SpotCurrency'
        },
        {
          id: 1,
          label: this.$t('symbolSort.future'),
          name: 'FutureCurrency',
          component: 'FutureCurrency'
        }
      ]
    }
  }
}
</script>
<style lang="scss" module>
.contentBox {
  margin-left: 20px;
}
</style>
