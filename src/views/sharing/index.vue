<template>
  <div class="app-container">
    <!--form-->
    <el-row :gutter="20">
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-button type="primary" @click="add()">添加</el-button>
        </div>
      </el-col>
    </el-row>
    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%">
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="content" label="分享内容" />
      <el-table-column prop="url" label="分享URL" />
      <el-table-column prop="reward" label="分享奖励平台币数量" />
      <el-table-column prop="download_url" label="下载链接" />

      <el-table-column prop="logo" label="logo图片">
        <template slot-scope="scope">
          <img style="width: 40px;height: 40px;" :src="scope.row.logo" alt>
        </template>
      </el-table-column>
      <el-table-column prop="qrcode_url" label="二维码图片">
        <template slot-scope="scope">
          <img style="width: 40px;height: 40px;" :src="scope.row.qrcode_url" alt>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" width="160">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="分享管理" :visible.sync="dialogFormVisible">
      <el-form :model="form" class="demo-form-inline">
        <el-form-item label="标题" :label-width="formLabelWidth">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="内容" :label-width="formLabelWidth">
          <el-input v-model="form.content" tpye="textarea" />
        </el-form-item>
        <el-form-item label="分享URL" :label-width="formLabelWidth">
          <el-input v-model="form.url" />
        </el-form-item>
        <el-form-item label="分享奖励平台币数量" :label-width="formLabelWidth">
          <el-input v-model="form.reward" />
        </el-form-item>
        <el-form-item label="下载链接" :label-width="formLabelWidth">
          <el-input v-model="form.download_url	" />
        </el-form-item>
        <el-form-item label="logo图片" :label-width="formLabelWidth">
          <input v-model="form.fileLogo" class="el-input__inner" @click="addImg()">
        </el-form-item>
        <el-form-item label="二维码图片" :label-width="formLabelWidth">
          <input v-model="form.fileQrcode" class="el-input__inner" @click="addImgs()">
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="handleEditTure">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
    <input v-show="false" id="imgInput" type="file" @change="imgChange">
    <input v-show="false" id="imgInputs" type="file" @change="imgChanges">
  </div>
</template>

<script>
import {
  getSharingSettings,
  addSharingSettings,
  updateSharingSettings
} from '@/api/coin'

export default {
  data() {
    return {
      dialogFormVisible: false,
      radio: '1',
      form: {
        title: '',
        content: '',
        url: '',
        reward: '',
        download_url: '',
        fileLogo: '',
        fileQrcode: '',
        id: ''
      },
      loading: true,
      pageShow: true,
      realName: '',
      tableData: [],
      formLabelWidth: '140px'
    }
  },
  watch: {},
  created() {
    this.load()
  },
  methods: {
    addImg() {
      document.getElementById('imgInput').click()
    },
    addImgs() {
      document.getElementById('imgInputs').click()
    },
    imgChange() {
      this.form.fileLogo = document.getElementById('imgInput').files[0].name
    },
    imgChanges() {
      this.form.fileQrcode = document.getElementById('imgInputs').files[0].name
    },
    add() {
      this.radio = 1
      document.getElementById('imgInput').value = ''
      document.getElementById('imgInputs').value = ''

      this.dialogFormVisible = true
      this.form = {
        title: '',
        content: '',
        url: '',
        reward: '',
        download_url: '',
        fileLogo: '',
        fileQrcode: ''
      }
    },
    handleEditTure() {
      if (this.radio == 1) {
        this.form = {
          fileLogo: document.getElementById('imgInput').files[0],
          fileQrcode: document.getElementById('imgInputs').files[0],
          title: this.form.title,
          content: this.form.content,
          url: this.form.url,
          reward: this.form.reward,
          download_url: this.form.download_url
        }
        for (const key in this.form) {
          if (this.form[key].length == 0) {
            this.$message({
              showClose: true,
              message: '请填写全部信息',
              type: 'error'
            })
            return
          }
        }
        addSharingSettings(this.form)
          .then(response => {
            this.$message({
              showClose: true,
              message: '添加成功',
              type: 'success'
            })
            this.dialogFormVisible = false
            this.load()
          })
          .catch(error => {
            console.log(error)
            this.load()
          })
      } else {
        if (document.getElementById('imgInput').files[0]) {
          this.form.fileLogo = document.getElementById('imgInput').files[0]
        } else {
          this.form.fileLogo = ''
        }
        if (document.getElementById('imgInputs').files[0]) {
          this.form.fileQrcode = document.getElementById('imgInputs').files[0]
        } else {
          this.form.fileQrcode = ''
        }
        updateSharingSettings(this.form)
          .then(response => {
            this.$message({
              showClose: true,
              message: '修改成功',
              type: 'success'
            })
            this.dialogFormVisible = false
            this.load()
          })
          .catch(error => {
            console.log(error)
          })
      }
    },
    handleEdit(row, index) {
      document.getElementById('imgInput').value = ''
      document.getElementById('imgInputs').value = ''

      this.form = {
        id: index.id + '',
        title: index.title + '',
        content: index.content + '',
        url: index.url + '',
        reward: index.reward + '',
        download_url: index.download_url + '',
        fileLogo: index.logo + '',
        fileQrcode: index.qrcode_url + ''
      }
      this.radio = 2
      this.dialogFormVisible = true
    },
    // 加载
    load() {
      this.loading = true
      const formData = {}
      getSharingSettings(formData)
        .then(response => {
          if (response.code == 200) {
            this.tableData = []
            this.tableData.push(response.data)
          } else {
            this.tableData = []
            this.msgError(response.msg)
          }
          this.loading = false
        })
        .catch(error => {
          console.log(error)
        })
    }
  }
}
</script>
<style scoped>
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}

.top {
  margin-top: 20px;
}
</style>
