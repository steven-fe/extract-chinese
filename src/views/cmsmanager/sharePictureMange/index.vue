<template>
  <div class="sharePictureMange">
    <div class="search">
      <span class="lable">功能</span>
      <el-select v-model="value" :placeholder="$t('common.pleaseChoose')">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <div class="btn-group">
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="primary" @click="add">新增</el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="tableData" border style="width: 100%">
      <el-table-column fixed="left" :label="$t('common.operation')" width="220px">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleClick(scope.row)"
          >修改</el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleClickCancel(scope.row)"
          >删除</el-button>
          <el-button
            :type="handButtonState(scope.row.state)"
            size="small"
            @click="handleClickUpdate(scope.row)"
          >{{ scope.row.state ? '下线' : '上线' }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="url" label="图片" width="100px">
        <template slot-scope="scope">
          <img style="width: 40px;height: 40px;" :src="scope.row.url" alt>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="功能">
        <template slot-scope="scope">
          <span>{{ hanldeType(scope.row.type) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="address" label="语言">
        <template slot-scope="scope">
          <span>{{ handleLan(scope.row.language) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="state" :label="$t('common.status')">
        <template slot-scope="scope">
          <span>{{ imgState[scope.row.state] }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" />
      <el-table-column prop="updated" label="最后修改时间" />
    </el-table>
    <div>
      <div class="pagination">
        <el-pagination
          class="sort-pageNation"
          :current-page="pageNum"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <el-dialog title="分享页图片管理" :visible.sync="dialogVisible" width="40%" :close-on-click-modal="false">
      <div class="dialog-content">
        <el-form ref="form" :model="form" :rules="rules">
          <el-form-item label="功能" label-width="50px" prop="type">
            <el-select v-model="form.type" placeholder="请选择功能" clearable>
              <el-option
                v-for="item in options.filter((item) => item.value !== 0)"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="图片" label-width="50px" prop="file">
            <input
              v-model="form.file"
              class="el-input__inner"
              clearable
              @click="addImg()"
            >
          </el-form-item>
          <el-form-item label="语言" label-width="50px" prop="language">
            <el-select
              v-model="form.language"
              placeholder="请选择语言"
              clearable
            >
              <el-option
                v-for="item in languageOptions"
                :key="item.key"
                :label="item.language"
                :value="item.key"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="排序" label-width="50px" prop="sort">
            <el-input v-model.number="form.sort" style="width:100px" />
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="uploadImage">{{$t('common.sure')}}</el-button>
      </span>
    </el-dialog>
    <input v-show="false" id="imgInput" type="file" @change="imgChange">
  </div>
</template>

<script>
import {
  getShareImgList,
  addPicture,
  fixPicture,
  cancelPicture,
  updatePicture
} from '@/api/shareImage/index.js'
import { listConfig } from '@/api/system/languageconfig'
export default {
  name: 'SharePictureMange',
  data() {
    return {
      tableData: [],
      languageOptions: [],
      options: [
        {
          label: this.$t('common.all'),
          value: 0
        },
        {
          label: 'web合伙人邀请页',
          value: 1
        },
        {
          label: 'web好友邀请页',
          value: 2
        },
        {
          label: 'app好友邀请页',
          value: 3
        }
      ],
      imgState: {
        0: '下线',
        1: '上线'
      },
      value: 0,
      dialogType: 'add', // add 新增 fix 修改
      dialogVisible: false,
      loading: false,
      currentPage: 1,
      pageSize: 10,
      pageNum: 1,
      total: 0,
      form: {
        id: '',
        type: '',
        file: '',
        language: '',
        sort: ''
      },
      rules: {
        type: [{ required: true, message: '请输入功能类型', trigger: 'blur' }],
        file: [{ required: true, message: '请选择图片', trigger: 'change' }],
        language: [
          {
            required: true,
            message: '请选择语言',
            trigger: 'change'
          }
        ],
        sort: [
          {
            required: true,
            message: '请输入排序数值',
            trigger: 'blur'
          },
          { type: 'number', message: '排序数值必须为数字', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getShareImgInfo()
    this.getLanguageselect()
  },
  methods: {
    getShareImgInfo() {
      const parmas = {
        pageSize: this.pageSize,
        pageNum: this.pageNum,
        type: this.value
      }
      this.loading = true
      getShareImgList(parmas)
        .then((res) => {
          this.loading = false
          if (res.code === 200) {
            this.tableData = res.rows
            this.total = res.total
          } else {
            this.tableData = []
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    getLanguageselect() {
      listConfig().then((response) => {
        this.languageOptions = response.rows
      })
    },
    uploadImage() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.dialogType === 'add') {
            const parmas = {
              ...this.form,
              file: document.getElementById('imgInput').files[0]
            }
            addPicture(parmas).then((res) => {
              if (res.code === 200) {
                this.dialogVisible = false
                this.getShareImgInfo()
              }
            })
          } else {
            const data = {
              ...this.form,
              file: document.getElementById('imgInput').files[0]
            }
            fixPicture(data).then((res) => {
              if (res.code === 200) {
                this.getShareImgInfo()
                this.dialogVisible = false
              } else {
                this.$message(res.msg)
              }
            })
          }
        }
      })
    },
    search() {
      this.getShareImgInfo()
    },
    resetDialogInfo() {
      this.form = {
        id: '',
        type: '',
        file: '',
        language: '',
        sort: ''
      }
    },
    handButtonState(state) {
      return state ? 'danger' : 'success'
    },
    add() {
      this.dialogType = 'add'
      this.resetDialogInfo()
      this.dialogVisible = true
    },
    handleClick(row) {
      document.getElementById('imgInput').value = ''
      this.form = {
        id: row.id,
        language: row.language,
        sort: row.sort,
        file: row.url,
        type: row.type
      }
      this.dialogType = 'fix'
      this.dialogVisible = true
    },
    handleClickCancel(row) {
      cancelPicture({ id: row.id }).then((res) => {
        if (res.code === 200) {
          this.getShareImgInfo()
          this.$message({
            message: this.$t('common.operationSucceed'),
            type: 'success'
          })
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    handleClickUpdate(row) {
      updatePicture({
        id: row.id,
        state: row.state === 0 ? 1 : 0
      }).then((res) => {
        if (res.code === 200) {
          this.getShareImgInfo()
          this.$message({
            message: this.$t('common.operationSucceed'),
            type: 'success'
          })
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    addImg() {
      document.getElementById('imgInput').click()
    },
    hanldeType(type) {
      const option = this.options.find((item) => item.value === type)
      return option && option.label
    },
    handleLan(key) {
      const option = this.languageOptions.find((item) => item.key === key)
      return option && option.language
    },
    imgChange() {
      const imgfile = document.getElementById('imgInput').files[0]
      if (imgfile.size > 1024 * 300) {
        this.$message.warning('图片最大限制300k')
        return
      }
      this.form.file = imgfile.name
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.getShareImgInfo()
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.getShareImgInfo()
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" scoped>
.sharePictureMange {
  padding: 20px;

  .search {
    display: flex;
    align-items: center;
    padding-bottom: 20px;

    .lable {
      margin-right: 20px;
    }

    .btn-group {
      margin-left: 20px;
    }
  }

  .pagination {
    margin-top: 30px;
  }
}
</style>
