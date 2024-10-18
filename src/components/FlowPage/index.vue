<template>
  <div class="flow-page">
    <el-select v-model="curPageSize" size="mini" @change="$emit('sizesChange', curPageSize)">
      <el-option
        v-for="(item, index) in pageSizes"
        :key="index"
        :label="`${item}/${$t('userManager.page')}`"
        :value="item"
      />
    </el-select>
    <div class="page-handle">
      <i class="el-icon-arrow-left" :class="[isPrevPage ? 'disabled-page' : '']" @click="pageChange('prev')" />
      <i class="el-icon-arrow-right" :class="[!isNextPage ? 'disabled-page' : '']" @click="pageChange('next')" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    pageSizes: {
      type: Array,
      default: () => [10, 20, 50, 100]
    },
    pageSize: {
      type: Number,
      default: 10
    },
    // 是否第一页 =>
    isPrevPage: {
      type: Boolean,
      default: true
    },
    // 是否有下一页 => 返回列表长度 >= pageSize + 1
    isNextPage: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      curPageSize: 10
    }
  },
  watch: {
    pageSize: {
      handler() {
        this.curPageSize = this.pageSize
      },
      immediate: true
    }
  },
  methods: {
    pageChange(type) {
      if (type === 'next') {
        if (this.isNextPage) {
          this.$emit('pageChange', type)
        }
      }
      if (type === 'prev') {
        if (!this.isPrevPage) {
          this.$emit('pageChange', type)
        }
      }
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" scopde>
.flow-page {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  .el-select {
    width: 95px
  }
  .page-handle {
    width: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-left: 10px;
    i {
      cursor: pointer;
      color: #409EFF;
      font-size: 28x;
      font-weight: 600;
    }
    .disabled-page {
      color: #909399;
    }
  }
}
</style>
