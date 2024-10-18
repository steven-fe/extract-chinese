<template>
  <div>
    <index v-if="checkPermi(['coinbull:home:page','*:*:*'])" />
  </div>
</template>
<script>
import index from './index/index'
import checkPermi from '@/utils/permission' // 权限判断函数
export default {
  components: { index },
  methods: { checkPermi }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}
::v-deep .el-message-box__message {
  margin-bottom: 100px;
}
@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
