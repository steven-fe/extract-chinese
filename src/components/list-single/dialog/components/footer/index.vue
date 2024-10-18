<template>
  <div style="text-align: right;">
    <el-button @click="() => $emit('cancel')">{{$t('common.cancel')}}</el-button>
    <el-button type="primary" :loading="submitLoading" @click="() => $emit('submit')">{{$t('common.sure')}}</el-button>
  </div>
</template>

<script>

export default {
  name: 'Footer',
  props: {
    submitLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    }
  },
  methods: {
    changeRuleType(type) {
      this.ruleType = type
    }
  }
}
</script>
