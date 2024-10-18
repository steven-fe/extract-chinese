锁仓代币
<template>
  <div class="lock">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane :label="$t('common.airdropLockBin')" name="first">
        <lock-symbol />
      </el-tab-pane>
      <el-tab-pane :label="$t('common.balanceLock')" name="second">
        <lock-balance />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import LockSymbol from './LockSymbol.vue' // 空投锁仓
import LockBalance from './LockBalance.vue' // 余额锁仓

export default {
  name: 'Lock',
  components: {
    LockSymbol,
    LockBalance
  },
  data() {
    return {
      activeName: 'first',
      firstTotal: 0,
      firstTableData: [],
      firstForm: {
        pageNum: 0,
        pageSize: 10
      }
    }
  },
  methods: {
    // 初始化数据
    initFirstTableData() {},
    // 搜索
    search() {},
    // 选择导出
    // 全部导出
    exportData() {},
    // 翻页
    handleClick() {

    }
  }
}
</script>

<style lang="scss" scoped>
.lock {
  padding: 10px 20px;
}
</style>>
