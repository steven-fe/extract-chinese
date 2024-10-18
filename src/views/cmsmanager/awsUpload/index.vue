<template>
  <div class="app-container">
    <el-form ref="form" :model="form" label-width="100px">
      <el-form-item label="上传图片">
        <el-input v-show="false" id="imgInput" v-model="file" type="file" @change="imgChange" />
        <el-input v-model="fileName" size="mini" style="width: 75%" readonly />
        <el-button type="primary" size="mini" @click="addImg">浏 览</el-button>
      </el-form-item>
      <el-form-item label="指定文件名">
        <el-input v-model="newFileName" size="mini" style="width: 75%">
          <template slot="append">该参数可为空</template>
        </el-input>
      </el-form-item>
      <el-form-item label="访问路径">
        <el-input v-model="fullPath" size="mini" style="width: 75%" readonly />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" size="mini" @click="submitForm">{{$t('common.sure')}}</el-button>
      <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
    </div>
  </div>
</template>

<script>
import { filesUploadAws } from '@/api/upload/upload'

export default {
  name: 'FilesUpload',
  data() {
    return {
      // 遮罩层
      loading: true,
      file: '',
      fileName: '',
      fullPath: '',
      newFileName: '',
      // 表单参数
      form: {}
    }
  },
  methods: {
    addImg() {
      document.getElementById('imgInput').click()
    },
    imgChange() {
      this.fileName = document.getElementById('imgInput').files[0].name
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.resetForm('form')
      this.file = ''
      this.fileName = ''
      this.fullPath = ''
      this.newFileName = ''
    },
    /** 提交按钮 */
    submitForm: function() {
      if (this.fileName == undefined || this.fileName == null || this.fileName == '') {
        this.msgError('上传图片不能为空')
        return
      }
      const params = {
        file: document.getElementById('imgInput').files[0],
        newFileName: this.newFileName
      }
      filesUploadAws(params).then(response => {
        if (response.code === 200) {
          this.fullPath = response.data.fullPath
          this.open = false
        } else {
          this.msgError(response.msg)
        }
      })
    }
  }
}
</script>
