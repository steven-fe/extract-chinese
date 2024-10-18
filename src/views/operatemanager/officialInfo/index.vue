<template>
  <div class="cms-sort-container">
    <el-tabs
      v-model="activeName"
      @tab-click="handleClick"
    >
      <el-tab-pane
        label="人员信息"
        lazy
        name="staff"
      >
        <div class="serachBox">
          <el-input
            v-model="name"
            placeholder="姓名"
            clearable
            size="mini"
          />
          <el-select
            v-model="department"
            filterable
            placeholder="请选择部门"
            size="mini"
            clearable
          >
            <el-option
              v-for="item in departmentOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <div class="btn-group">
            <el-button
              type="primary"
              size="mini"
              @click="searchStaff"
            >查询</el-button>
            <el-button
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAddStaff"
            >新增</el-button>
          </div>
        </div>
        <SortTable
          :table-data="staffList"
          type="staff"
          @edit="handleEdit"
          @del="handleDel"
        />
        <el-pagination
          :current-page="currentPageStaff"
          :page-sizes="[10, 20]"
          :page-size="staffPageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalStaff"
          @size-change="handleSizeChangeStaff"
          @current-change="handleCurrentChangeStaff"
        />
      </el-tab-pane>
      <el-tab-pane
        label="官方社群"
        lazy
        name="media"
      >
        <div class="serachBox">
          <el-input
            v-model="mediaUrl"
            placeholder="URL"
            clearable
            size="mini"
          />
          <div class="btn-group">
            <el-button
              type="primary"
              size="mini"
              @click="searchMedia"
            >查询</el-button>
            <el-button
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAddMedia"
            >新增</el-button>
          </div>
        </div>
        <SortTable
          :table-data="dataList"
          type="media"
          @edit="handleEdit"
          @del="handleDel"
        />
        <el-pagination
          class="sort-pageNation"
          :current-page="currentPageMedia"
          :page-sizes="[10, 20]"
          :page-size="mediaPageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalMedia"
          @size-change="handleSizeChangeMedia"
          @current-change="handleCurrentChangeMedia"
        />
      </el-tab-pane>
      <el-tab-pane
        label="域名"
        lazy
        name="host"
      >
        <div class="serachBox">
          <el-input
            v-model="hostUrl"
            placeholder="URL"
            clearable
            size="mini"
          />
          <div class="btn-group">
            <el-button
              type="primary"
              size="mini"
              @click="searchHost"
            >查询</el-button>
            <el-button
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAddHost"
            >新增</el-button>
          </div>
        </div>
        <SortTable
          :table-data="dataList"
          type="host"
          @edit="handleEdit"
          @del="handleDel"
        />
        <el-pagination
          class="sort-pageNation"
          :current-page="currentPageMedia"
          :page-sizes="[10, 20]"
          :page-size="mediaPageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalMedia"
          @size-change="handleSizeChangeMedia"
          @current-change="handleCurrentChangeMedia"
        />
      </el-tab-pane>
    </el-tabs>
    <el-dialog
      :title="staffTitle"
      :visible.sync="staffDialogVisible"
      width="35%"
    >
      <div class="dialog-content">
        <el-form
          ref="digForm"
          :model="digForm"
          :rules="rules"
          class="form-grid"
        >
          <el-form-item
            label="部门"
            :label-width="formLabelWidth"
            prop="department"
          >
            <el-select
              v-model="digForm.department"
              placeholder="请选择部门"
              clearable
            >
              <el-option
                v-for="item in departmentOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="职位"
            :label-width="formLabelWidth"
            prop="position"
          >
            <el-input
              v-model="digForm.position"
              clearable
            />
          </el-form-item>
          <el-form-item
            label="姓名"
            :label-width="formLabelWidth"
            prop="name"
          >
            <el-input
              v-model="digForm.name"
              clearable
            />
          </el-form-item>
          <!-- <el-form-item label="职位"
                        :label-width="formLabelWidth"
                        prop="title">
            <el-input v-model="form.fName"
                      clearable></el-input>
          </el-form-item> -->
          <el-form-item
            label="头像"
            :label-width="formLabelWidth"
            prop="picture"
          >
            <!-- <el-input v-model="digForm.fPicture"
                      clearable></el-input> -->
            <input
              v-model="digForm.picture"
              class="el-input__inner"
              clearable
              @click="addImg()"
            >
          </el-form-item>
          <!-- <el-form-item class="grid-item"
                        label="头像:"
                        :label-width="formLabelWidth"
                        prop="fPicture">
            <el-upload ref="upload"
                       action="#"
                       list-type="picture-card"
                       :on-change="handleChange"
                       :show-file-list="isShowFileList"
                       :auto-upload="false"
                       :file-list="fileList"
                       :before-remove="removeFile"
                       class="upload-demo">
              <i class="el-icon-plus"></i>
            </el-upload>
          </el-form-item> -->
          <el-form-item
            label="邮箱"
            :label-width="formLabelWidth"
            prop="email"
          >
            <el-input
              v-model="digForm.email"
              clearable
            />
          </el-form-item>
          <el-form-item
            label="地区"
            :label-width="formLabelWidth"
            prop="region"
          >
            <el-select
              v-model="digForm.region"
              placeholder="请选择地区"
              clearable
            >
              <el-option
                v-for="item in regionOptions"
                :key="item.key"
                :label="item.name"
                :value="item.key"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="商务付款授权"
            :label-width="formLabelWidth"
            prop="grantPay"
          >
            <el-select
              v-model="digForm.grantPay"
              clearable
            >
              <el-option
                v-for="item in grantPayOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="telegram"
            :label-width="formLabelWidth"
            prop="telegram"
          >
            <el-input v-model="digForm.telegram" clearable placeholder="e.g: t.me/coinstore_english" />
          </el-form-item>
          <el-form-item
            label="linkedln"
            :label-width="formLabelWidth"
            prop="linkedln"
          >
            <el-input v-model="digForm.linkedln" clearable placeholder="e.g: www.linkedin.cn/incareer/company/coinstore" />
          </el-form-item>
          <el-form-item
            label="Twitter"
            :label-width="formLabelWidth"
            prop="twitter"
          >
            <el-input v-model="digForm.twitter" clearable placeholder="e.g: twitter.com/CoinstoreExc" />
          </el-form-item>
          <el-form-item
            label="排序"
            :label-width="formLabelWidth"
            prop="sort"
          >
            <el-input
              v-model="digForm.sort"
              clearable
            />
          </el-form-item>
        </el-form>
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="staffDialogVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button
          type="primary"
          @click="handleSave"
        >{{$t('common.sure')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="mediaTitle"
      :visible.sync="mediaDialogVisible"
      width="35%"
    >
      <div class="dialog-content">
        <el-form
          ref="mediaForm"
          :model="mediaForm"
          :rules="mediaRules"
          class="form-grid"
        >
          <el-form-item
            label="URL"
            :label-width="formLabelWidth"
            prop="content"
          >
            <el-input
              v-model="mediaForm.content"
              clearable
            />
          </el-form-item>
          <el-form-item
            :label="$t('common.remarks')"
            :label-width="formLabelWidth"
            prop="remark"
          >
            <el-input
              v-model="mediaForm.remark"
              clearable
            />
          </el-form-item>
        </el-form>
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="mediaDialogVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button
          type="primary"
          @click="handleMediaSave"
        >{{$t('common.sure')}}</el-button>
      </span>
    </el-dialog>
    <input
      v-show="false"
      id="imgInput"
      type="file"
      @change="imgChange"
    >
  </div>
</template>

<script>
import SortTable from './table.vue'
import { getStaffList, addStaff, editStaff, delStaff, getMediaOrHostList, addMediaOrHost, editMediaOrHost, delMediaOrHost, getRegions } from '@/api/officialVerify.js'
import { filesUploadAws } from '@/api/upload/upload'
export default {
  name: 'OfficialInfo',
  components: {
    SortTable
  },
  data() {
    return {
      activeName: 'staff',
      name: '',
      mediaUrl: '',
      hostUrl: '',
      department: '',
      spotValue: '',
      staffList: [], // 人员列表
      dataList: [],
      staffDialogVisible: false,
      mediaDialogVisible: false,
      formLabelWidth: '110px',
      currentWeight: '',
      currentPageMedia: 1,
      currentPageStaff: 1,
      dialogVisible: false,
      staffPageSize: 10,
      mediaPageSize: 10,
      departmentOptions: [
        {
          value: '1',
          label: 'Operations'
        },
        {
          value: '2',
          label: 'Marketing'
        },
        {
          value: '3',
          label: 'Business Development'
        }
      ],
      regionOptions: [],
      grantPayOptions: [
        {
          value: '0',
          label: '否'
        },
        {
          value: '1',
          label: '是'
        }
      ],
      totalMedia: 0,
      totalStaff: 0,
      dialogInfo: {},
      tableType: 'staff',
      form: {
        fName: undefined,
        fPicture: undefined,
        fDepartment: undefined,
        fEmail: undefined,
        fTelegram: undefined,
        fLinkedln: undefined,
        twitter: undefined,
        fSort: undefined
      },
      digForm: {
        id: '',
        department: '',
        position: '',
        name: '',
        picture: '',
        email: '',
        region: '',
        grantPay: '',
        telegram: '',
        linkedln: '',
        twitter: '',
        sort: ''
      },
      mediaForm: {
        id: '',
        type: 1,
        content: '',
        remark: ''
      },
      fileList: [],
      isShowFileList: false,
      rules: {
        department: [{ required: true, message: '部门不能为空', trigger: 'blur' }],
        position: [{ required: true, message: '职位不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
        picture: [{ required: true, message: '头像不能为空', trigger: 'blur' }],
        email: [{ required: true, message: '邮箱不能为空', trigger: 'blur' }],
        grantPay: [{ required: true, message: '商务付款授权不能为空', trigger: 'blur' }],
        telegram: [{ required: true, message: 'telegram不能为空', trigger: 'blur' }],
        linkedln: [{ required: true, message: 'linkedIn不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }]
      },
      mediaRules: {
        content: [{ required: true, message: 'URL不能为空', trigger: 'blur' }],
        remark: [{ required: true, message: this.$t('dwmanager.remarkCannotBeEmpty'), trigger: 'blur' }]
      },
      isEdit: false,
      staffTitle: '添加人员',
      mediaTitle: '添加社群'
    }
  },
  watch: {
    activeName(val) {
      if (val === 'staff') {
        this.getStaffListInfo()
      } else {
        this.getMediaListInfo()
      }
    }
  },
  created() {
    this.getStaffListInfo()
  },
  methods: {
    handleClick(tab, event) {
      // console.log(tab, event);
      this.dialogVisible = false
    },
    // 获取人员列表
    getMediaListInfo() {
      const data = {
        pageSize: this.mediaPageSize,
        pageNum: this.currentPageMedia
      }

      if (this.activeName === 'media') {
        data.type = 1
        if (this.mediaUrl) {
          data.url = this.mediaUrl
        }
      } else if (this.activeName === 'host') {
        data.type = 2
        if (this.hostUrl) {
          data.url = this.hostUrl
        }
      }
      getMediaOrHostList(data).then((res) => {
        if (res.code === 200) {
          this.dataList = res.rows
          this.totalMedia = res.total
        } else {
          this.totalMedia = 0
          this.dataList = []
        }
      })
    },
    // 获取社群、域名列表
    getStaffListInfo() {
      const data = {
        pageSize: this.staffPageSize,
        pageNum: this.currentPageStaff
      }
      if (this.name) {
        data.name = this.name
      }
      if (this.department) {
        data.department = this.department
      }
      getStaffList(data).then((res) => {
        if (res.code === 200) {
          this.staffList = res.rows
          this.totalStaff = res.total
        } else {
          this.staffList = []
          this.totalStaff = 0
        }
      })
    },
    searchStaff() {
      this.currentPageStaff = 1
      this.getStaffListInfo()
    },
    searchMedia() {
      this.currentPageMedia = 1
      this.getMediaListInfo()
    },
    searchHost() {
      this.currentPageMedia = 1
      this.getMediaListInfo()
    },
    handleSizeChangeStaff(val) {
      this.staffPageSize = val
      this.getStaffListInfo()
    },
    handleCurrentChangeStaff(val) {
      this.currentPageStaff = val
      this.getStaffListInfo()
    },
    // 编辑
    handleEdit(row, type) {
      if (type === 'staff') {
        this.staffTitle = '修改人员'
        this.digForm = {
          id: row.fid,
          department: row.fdepartment,
          position: row.fposition,
          name: row.fname,
          picture: row.fpicture,
          email: row.femail,
          region: row.fregion,
          grantPay: row.fgrantPay.toString(),
          telegram: row.ftelegram,
          linkedln: row.flinkedln,
          twitter: row.twitter,
          sort: row.fsort
        }
        this.staffDialogVisible = true
      }
      if (type === 'media') {
        this.mediaTitle = '修改社群'
        this.mediaForm = {
          id: row.fid,
          type: row.ftype,
          content: row.fcontent,
          remark: row.fremark
        }
        this.mediaDialogVisible = true
      }
      if (type === 'host') {
        this.mediaTitle = '修改域名'
        this.mediaForm = {
          id: row.fid,
          type: row.ftype,
          content: row.fcontent,
          remark: row.fremark
        }
        this.mediaDialogVisible = true
      }
    },
    // 删除
    handleDel(row, type) {
      this.$confirm('此操作将永久删除, 是否继续?', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(() => {
          if (type === 'staff') {
            delStaff({ id: row.fid })
              .then(response => {
                this.$message({
                  type: 'success',
                  message: '删除成功!'
                })
                this.getStaffListInfo()
              })
              .catch(error => {
                console.log(error)
              })
          }
          if (type === 'media') {
            delMediaOrHost({ id: row.fid })
              .then(response => {
                this.$message({
                  type: 'success',
                  message: '删除成功!'
                })
                this.getMediaListInfo()
              })
              .catch(error => {
                console.log(error)
              })
          }
          if (type === 'host') {
            delMediaOrHost({ id: row.fid })
              .then(response => {
                this.$message({
                  type: 'success',
                  message: '删除成功!'
                })
                this.getMediaListInfo()
              })
              .catch(error => {
                console.log(error)
              })
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // removeFile (file) {
    //   this.digForm.fPicture = ''
    // },
    // 图片上传尺寸大小检验
    // handleChange (file) {
    //   let _this = this
    //   let _URL = window.URL || window.webkitURL;
    //   let img = new Image();
    //   img.src = _URL.createObjectURL(file.raw);
    //   img.onload = function () {
    //     _this.isShowFileList = true
    //     const params = {
    //       file: file.raw,
    //       newFileName: file.name.split('.')[0]
    //     };
    //     filesUpload(params).then(response => {
    //       if (response.code === 200) {
    //         this.digForm.fPicture = response.data
    //       } else {
    //         this.msgError(response.msg);
    //       }
    //     });
    //   }
    // },
    addImg() {
      document.getElementById('imgInput').click()
    },
    imgChange() {
      const imgfile = document.getElementById('imgInput').files[0]
      // if (imgfile.size > 1024 * 500) {
      //   this.$message.warning('图片最大限制500k')
      //   return
      // }
      // if (imgfile.type !== 'image/jpeg' && imgfile.type !== 'image/jpg' && imgfile.type !== 'image/png') {
      //   this.$message.warning('图片格式只支持jpg/jpeg/png！')
      //   return
      // }
      console.log(imgfile)
      const params = { file: imgfile }
      filesUploadAws(params).then(response => {
        if (response.code === 200) {
          this.digForm.picture = response.data.fullPath
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 新增、修改人员
    handleSave() {
      this.$refs['digForm'].validate(valid => {
        if (valid) {
          if (this.digForm.id) {
            editStaff(this.digForm)
              .then(response => {
                this.$message({
                  showClose: true,
                  message: '修改成功',
                  type: 'success'
                })
                this.staffDialogVisible = false
                this.getStaffListInfo()
              })
              .catch(error => {
                console.log(error)
              })
          } else {
            delete this.digForm.id
            addStaff(this.digForm)
              .then(response => {
                this.$message({
                  showClose: true,
                  message: '添加成功',
                  type: 'success'
                })
                this.staffDialogVisible = false
                this.getStaffListInfo()
              })
              .catch(error => {
                console.log(error)
              })
          }
        }
      })
    },
    // 新增、修改社群或域名
    handleMediaSave() {
      this.$refs['mediaForm'].validate(valid => {
        if (valid) {
          if (this.mediaForm.id) {
            editMediaOrHost(this.mediaForm)
              .then(response => {
                this.$message({
                  showClose: true,
                  message: '修改成功',
                  type: 'success'
                })
                this.mediaDialogVisible = false
                this.getMediaListInfo()
              })
              .catch(error => {
                console.log(error)
              })
          } else {
            delete this.mediaForm.id
            addMediaOrHost(this.mediaForm)
              .then(response => {
                this.$message({
                  showClose: true,
                  message: '添加成功',
                  type: 'success'
                })
                this.mediaDialogVisible = false
                this.getMediaListInfo()
              })
              .catch(error => {
                console.log(error)
              })
          }
        }
      })
    },
    handleSizeChangeMedia(val) {
      // 每页显示多少条变化
      this.mediaPageSize = val
      this.getMediaListInfo()
    },
    handleCurrentChangeMedia(val) {
      // 当前页数的变化
      this.currentPageMedia = val
      this.getMediaListInfo()
    },
    handleAddStaff() {
      this.staffTitle = '新增人员'
      this.digForm = {
        id: '',
        department: '',
        position: '',
        name: '',
        picture: '',
        email: '',
        region: '',
        grantPay: '0',
        telegram: '',
        linkedln: '',
        twitter: '',
        sort: ''
      }
      this.staffDialogVisible = true
      getRegions().then(response => {
        if (response.code === 200) {
          this.regionOptions = response.rows
        }
      })
    },
    handleAddMedia() {
      this.mediaTitle = '新增社群'
      this.mediaForm = {
        id: '',
        type: 1,
        content: '',
        remark: ''
      }
      this.mediaDialogVisible = true
    },
    handleAddHost() {
      this.mediaTitle = '新增域名'
      this.mediaForm = {
        id: '',
        type: 2,
        content: '',
        remark: ''
      }
      this.mediaDialogVisible = true
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" scoped>
.cms-sort-container {
  padding: 20px;
  .serachBox {
    display: flex;
    align-items: center;
    padding-bottom: 20px;
    ::v-deep .el-input {
      width: 200px;
    }
  }

  .btn-group {
    margin-left: 20px;
  }
  .dialog-content {
    &-box {
      margin-top: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      ::v-deep .el-input {
        width: 100px;
      }
    }
    .upload-demo {
      width: 156px;
      height: 153px;
      overflow: hidden;
    }
  }
}
</style>
