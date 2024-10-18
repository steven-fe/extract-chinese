<template>
  <div :class="$style.uploadFile">
    <el-button :class="$style.templateButton" type="primary" size="mini" @click="downloadTemplate">下载模板</el-button>

    <el-upload
      ref="upload"
      action="#"
      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      :limit="1"
      :file-list="initialFileList"
      :auto-upload="false"
      :on-change="handleChange"
      :on-remove="handleRemove"
    >
      <el-button slot="trigger" size="mini" type="primary">上传文件</el-button>
    </el-upload>
  </div>
</template>

<script>

export default {
  name: 'UploadFile',
  props: {
    templateUrl: {
      type: String,
      required: true
    },
    // eslint-disable-next-line vue/require-default-prop
    initialFilePath: {
      type: String
    }
  },
  data() {
    return {
      initialFileList: Object.freeze([])
    }
  },
  created() {
    this.setInitialFileList()
  },
  methods: {
    setInitialFileList() {
      if (this.initialFilePath) {
        this.initialFileList = Object.freeze([{ name: this.initialFilePath, url: this.initialFilePath }])
      }
    },
    downloadTemplate() {
      window.open(this.templateUrl)
    },
    handleChange({ raw: file }) {
      this.$emit('add', file)
    },
    handleRemove() {
      this.$emit('remove')
    }
  }
}
</script>

<style module lang="scss">
.uploadFile {
  display: flex;
  align-items: flex-start;
  line-height: initial;

  .templateButton {
    margin-right: 10px;
  }

  :global(.el-upload-list__item-name) {
    white-space: normal;
    text-overflow: clip;
    overflow: visible;
  }
}
</style>
