<template>
  <div :class="$style.iDialog">
    <el-dialog
      :title="title"
      :visible.sync="visible"
      :width="width"
      :top="top"
      :before-close="handleClose"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="showClose"
    >
      <template
        v-for="(index, name) in $slots"
        :slot="name"
      >
        <slot :name="name" />
      </template>
      <div
        v-if="showFooter"
        slot="footer"
      >
        <el-button
          v-show="showCancel"
          size="mini"
          @click="onCancel"
        >
          {{ cancelText }}
        </el-button>
        <el-button
          v-show="showSubmit"
          type="primary"
          size="mini"
          @click="onSubmit"
        >
          {{ submitText }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: '标题'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    submitText: {
      type: String,
      default: '确定'
    },
    visible: {
      type: Boolean,
      default: false
    },
    showCancel: {
      type: Boolean,
      default: true
    },
    showSubmit: {
      type: Boolean,
      default: true
    },
    width: {
      type: String,
      default: '550px'
    },
    top: {
      type: String,
      default: '10% !important'
    },
    showClose: {
      type: Boolean,
      default: false
    }

  },
  computed: {
    showFooter() {
      return !this.$slots.hasOwnProperty('footer')
    }
  },
  methods: {
    onCancel() {
      this.$emit('cancel')
    },
    onSubmit() {
      this.$emit('submit')
    },
    handleClose() {
      this.$emit('handleClose')
    }
  }
}
</script>
<style lang="scss" module>
.iDialog {

  :global(.el-dialog) {
    // border-radius: 5px;
  }

  :global(.el-dialog__header) {
    width: 100%;
    height: 40px;
    line-height: 44px;
    // border-bottom: 1px solid #f6f7f9;
    box-sizing: border-box;
    padding: 0 20px;
    font-size: 14px;
  }

  :global(.el-dialog__headerbtn) {
    top: 11px;
    right: 13px;
  }

  :global(.el-dialog__footer) {
    width: 100%;
    height: 40px;
    display: flex;
    padding-top: 10px;
    align-items: center;
    justify-content: flex-end;
    // border-top: 1px solid #f6f7f9;
  }

}
</style>
