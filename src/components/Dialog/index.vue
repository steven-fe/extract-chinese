<template>
  <div class="popup">
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :width="popupWidth"
      :before-close="handleClose"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <slot>
        <p>弹框自定义的内容</p>
      </slot>
      <div slot="footer">
        <el-button v-show="isShowCancel" @click="Cancel">
          {{ cancel }}
        </el-button>
        <el-button v-show="isShowSub" type="primary" @click="Save">
          {{ submit }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  props: {
    dialogTitle: {
      type: String,
      default: '标题'
    },
    cancel: {
      typeof: String,
      default: '取消'
    },
    submit: {
      typeof: String,
      default: '确定'
    },
    visible: {
      typeof: Boolean,
      default: false
    },
    isShowCancel: {
      typeof: Boolean,
      default: true
    },
    isShowSub: {
      typeof: Boolean,
      default: true
    },
    popupWidth: {
      typeof: String,
      default: '550px'
    },
    dialogFooter: {
      typeof: Boolean,
      default: true
    }

  },
  data() {
    return {
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      }
    }
  },
  methods: {
    Cancel() {
      this.$emit('resetPopupData')
    },
    Save() {
      this.$emit('submitPopupData')
    },
    handleClose() {
      this.$emit('handleClose')
    }
  }

}
</script>
<style lang="scss" scopde>
.popup {
  width: 550px;
  .el-dialog {
    z-index: 9;
    background-color: #fff;
    border-radius: 5px;
    margin-top: 10% !important;
  }

  .el-dialog__header {
    width: 100%;
    height: 40px;
    line-height: 38px;
    border-bottom: 1px solid #f6f7f9;
    box-sizing: border-box;
    padding: 0 20px;
    font-size: 16px;
  }

  .el-dialog__close.el-icon.el-icon-close {
    font-size: 20px;
    width: 17px;
    height: 17px;
  }

  .el-button.el-button--default {
    width: 88px;
    color: #1182fb;
    border: 1px solid #1182fb;
  }

  .el-button.el-button--primary {
    // width: 88px;
  }

  .el-dialog__body {
    padding: 24px 32px;
    box-sizing: border-box;
  }

  .el-dialog__headerbtn {
    top: 9px;
  }

  .el-dialog__title {
    color: #3c4354;
    font-size: 16px;
    line-height: 16px;
  }
  .el-dialog__footer {
    text-align: right;
  }
}
</style>
