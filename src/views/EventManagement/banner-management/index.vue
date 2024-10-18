<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="标题">
        <el-input v-model="queryParams.title" size="mini" clearable />
      </el-form-item>

      <el-form-item :label="$t('common.status')">
        <el-select v-model="queryParams.online" size="mini" clearable>
          <el-option :key="-1" :label="$t('common.all')" value="" />
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" size="mini" @click="handleQuery">查询</el-button>
        <el-button type="primary" size="mini" class="el-icon-plus" @click="handleAdd">新增</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border>
      <el-table-column :label="$t('common.operation')" width="300" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleEdit(scope.row.id)">修改</el-button>
          <el-button v-if="scope.row.online === 0" type="success" size="mini" @click="handleChangeOnline(1, scope.row.id)">上线</el-button>
          <el-button v-if="scope.row.online === 1" type="danger" size="mini" @click="handleChangeOnline(0, scope.row.id)">下线</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>

      <el-table-column label="标题" prop="title" align="center" width="180" />

      <el-table-column label="图片" prop="pictureUrl" align="center" width="180">
        <template slot-scope="scope">
          <img class="logo" :src="scope.row.pictureUrl" alt="">
        </template>
      </el-table-column>

      <el-table-column label="跳转类型" prop="jumpType" align="center" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.jumpType === 1">外部跳转</span>
          <span v-if="scope.row.jumpType === 0">无跳转</span>
        </template>
      </el-table-column>

      <el-table-column label="跳转链接" prop="jumpUrl" align="center" width="260">
        <template slot-scope="scope">
          <span v-if="scope.row.jumpUrl === ''"> -- </span>
          <span v-else>{{ scope.row.jumpUrl }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('common.status')" prop="online" align="center" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.online === 1">上线</span>
          <span v-if="scope.row.online === 0">下线</span>
        </template>
      </el-table-column>

      <el-table-column label="前端排序" prop="sort" align="center" width="180" />
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 新增/修改banner -->
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="500px"
      :before-close="handleCancel"
    >
      <el-form
        ref="dialogForm"
        :model="dialogForm"
        label-width="80px"
        :rules="rules"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="dialogForm.title" clearable />
        </el-form-item>

        <el-form-item label="跳转类型" prop="jumpType">
          <el-radio-group v-model="dialogForm.jumpType" @input="handleChangeRadio">
            <el-radio :label="1">外部链接</el-radio>
            <el-radio :label="0">无跳转</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="dialogForm.jumpType === 1" label="跳转链接" prop="jumpUrl">
          <el-input v-model="dialogForm.jumpUrl" clearable />
        </el-form-item>

        <el-form-item label="图片" prop="pictureUrl">
          <el-upload
            class="upload-demo"
            action="#"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
          >
            <el-input v-model="dialogForm.pictureUrl" placeholder="点击上传banner图片" style="width: 380px" clearable />
          </el-upload>
          <div style="color: red;">图片尺寸：1920*350</div>
        </el-form-item>

        <el-form-item label="前端排序" prop="sort">
          <el-input v-model="dialogForm.sort" clearable />
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="handleCancel">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" size="mini" @click="handleSubmit">{{$t('common.sure')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { upload } from '@/api/indexImg'
import { getPageList, addBanner, editBanner, getBannerDetail, getOnlineOffline, deleteBanner } from '@/api/EventManagement'
export default {
  data() {
    return {
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: '',
        online: ''
      },
      statusOptions: [
        { value: '0', label: '下线' },
        { value: '1', label: '上线' }
      ],
      dataList: [],
      dialogVisible: false,
      title: '',
      state: '', // 1新增 2修改
      dialogForm: {
        title: '',
        jumpType: 1,
        jumpUrl: '',
        pictureUrl: '',
        sort: ''
      },
      flag: '',
      rules: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        jumpType: [{ required: true, message: '跳转类型不能为空', trigger: 'blur' }],
        jumpUrl: [{ required: true, message: '跳转链接不能为空', trigger: 'blur' }],
        pictureUrl: [{ required: true, message: '图片不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '前端排序不能为空', trigger: 'blur' }]
      }
    }
  },

  created() {
    this.getList()
  },
  methods: {
    getList() {
      getPageList(this.queryParams).then(res => {
        if (res.code === 200) {
          this.dataList = res.rows
          this.total = res.total
        }
      })
    },
    handleChangeOnline(status, id) {
      getOnlineOffline(id, status).then(res => {
        if (res.code === 200) {
          status === 0 ? this.msgSuccess('下线成功') : this.msgSuccess('上线成功')
          this.getList()
        }
      })
    },
    handleDelete(id) {
      deleteBanner(id).then(res => {
        if (res.code === 200) {
          this.msgSuccess('删除成功')
          this.getList()
        }
      })
    },
    handleChangeRadio() {
      if (this.dialogForm.jumpType === 0) {
        this.dialogForm.jumpUrl = ''
      }
    },
    handleCancel() {
      this.dialogVisible = false
      this.$refs['dialogForm'].resetFields()
    },
    handleAdd() {
      this.state = 1
      this.title = '新增'
      this.dialogVisible = true
    },
    handleEdit(id) {
      this.title = '修改'
      this.state = 2
      this.flag = id
      this.dialogVisible = true
      getBannerDetail(id).then(res => {
        if (res.code === 200) {
          this.dialogForm = res.data
        }
      })
    },
    // 图片上传
    upload(data) {
      // if (data.file.size > 500 * 1024) {
      //   this.$message.warning('图片大小不能超过500k')
      //   return
      // }
      upload({ file: data.file }).then(res => {
        if (res.code === 200) {
          this.dialogForm.pictureUrl = res.data.fullPath
          this.$message.success(this.$t('common.uploadSucceeded'))
        }
      })
    },
    handleSubmit() {
      this.$refs['dialogForm'].validate((valid) => {
        if (valid) {
          if (this.state === 1) {
            const params = {
              title: this.dialogForm.title,
              jumpType: this.dialogForm.jumpType,
              jumpUrl: this.dialogForm.jumpUrl,
              pictureUrl: this.dialogForm.pictureUrl,
              sort: this.dialogForm.sort
            }
            addBanner(params).then(res => {
              if (res.code === 200) {
                this.msgSuccess('添加成功')
                this.handleCancel()
                this.getList()
              }
            })
          } else {
            const params = {
              id: this.flag,
              title: this.dialogForm.title,
              jumpType: this.dialogForm.jumpType,
              jumpUrl: this.dialogForm.jumpUrl,
              pictureUrl: this.dialogForm.pictureUrl,
              sort: this.dialogForm.sort
            }
            editBanner(params).then(res => {
              if (res.code === 200) {
                this.msgSuccess('修改成功')
                this.getList()
                this.handleCancel()
              }
            })
          }
        }
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped lang="scss">
.logo {
  width: 80px;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
.input {
  width: 200px;
  height: 25px;
  line-height: 25px;
  border-radius: 5px;
  padding-left: 5px;
  margin-bottom: 20px;
  border: 1px solid rgb(209, 207, 207);
}
.el-icon-close {
  font-size: 25px;
  margin-left: 10px;
}
</style>
