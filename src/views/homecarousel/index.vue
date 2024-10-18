<template>
  <div class="app-container">
    <!--form-->
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="标题">
        <el-input v-model="queryParams.title" placeholder="请输入标题" size="small" clearable />
      </el-form-item>
      <el-form-item :label="$t('common.status')">
        <el-select v-model="queryParams.status" size="small" placeholder="请选择状态" clearable>
          <el-option :key="''" :label="$t('common.all')" value="" />
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="语言">
        <el-select v-model="queryParams.language" size="small" placeholder="请选择语言" clearable>
          <el-option :key="''" :label="$t('common.all')" value="" />
          <el-option v-for="[key, name] in languageMap" :key="key" :label="name" :value="key" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="small" @click="getList">查询</el-button>
        <el-button type="success" size="small" @click="handleAdd">新增</el-button>
      </el-form-item>
    </el-form>

    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%">
      <el-table-column :label="$t('common.operation')" width="230" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleEdit(scope.row.id)">修改</el-button>
          <el-button v-if="scope.row.status === 0" type="success" size="mini" @click="handleChangeStatus(1, scope.row.id)">上线</el-button>
          <el-button v-if="scope.row.status === 1" type="danger" size="mini" @click="handleChangeStatus(0, scope.row.id)">下线</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>

      <el-table-column prop="title" label="标题" width="150px" align="center" />

      <el-table-column prop="pictureUs" label="图片" align="center" width="150px">
        <template slot-scope="scope">
          <img style="width: 40px;height: 40px;" :src="scope.row.pictureUs" alt>
        </template>
      </el-table-column>

      <el-table-column prop="linkAddUs" label="跳转链接" width="150px" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.linkAddUs !== null">{{ scope.row.linkAddUs }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column prop="languageList" label="语言" width="200px" align="center" :formatter="formatLanguageInTable" />

      <el-table-column prop="status" :label="$t('common.status')" align="center" width="150px">
        <template slot-scope="scope">
          <span v-if="scope.row.status === 0">下线</span>
          <span v-if="scope.row.status === 1">上线</span>
        </template>
      </el-table-column>

      <el-table-column prop="weight" label="前端排序" width="150px" align="center" />

      <el-table-column prop="createTime" label="添加时间" width="160px" :formatter="({ createTime }) => timeFormat(createTime)" align="center" />
    </el-table>

    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList()"
      />
    </div>

    <el-dialog title="首页轮播管理" :visible.sync="dialogFormVisible" :close-on-click-modal="false" width="600px" @closed="formDialogClosed">
      <el-form ref="form" :model="form" :rules="rules">

        <el-form-item label="标题" prop="title" :label-width="formLabelWidth">
          <el-input v-model="form.title" clearable />
        </el-form-item>

        <el-form-item label="语言" :label-width="formLabelWidth">
          <el-checkbox-group v-model="selectedLanguageInForm">
            <el-checkbox v-for="[key, name] in languageMap" :key="key" :label="key" :disabled="form.defaultSelectedLanguage === key">{{ name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="跳转类型" :label-width="formLabelWidth">
          <el-radio-group v-model="form.linkType" @input="handleChangeLinkType">
            <el-radio :label="1">web内部链接</el-radio>
            <el-radio :label="0">无跳转</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="form.linkType === 1">
          <el-form-item v-for="(linkItem, index) in form.linkAddList" :key="linkItem.code" :label="`跳转地址-${languageMap.get(linkItem.code)}`" :prop="`linkAddList.${index}.value`" :rules="linkItem.code === 'en_US' ? rules.linkAddList : [{ required: false }]" :label-width="formLabelWidth">
            <el-input v-model="linkItem.value" :placeholder="linkItem.code === 'en_US' ? '' : '选填，没有输入跳转地址，在保存时会将英文跳转地址复用至此'" clearable />
          </el-form-item>
        </template>

        <el-form-item label="显示方式" :label-width="formLabelWidth">
          <el-radio v-model="form.showFlag" :label="2">登录显示</el-radio>
          <el-radio v-model="form.showFlag" :label="1">未登录显示</el-radio>
          <el-radio v-model="form.showFlag" :label="0">不限制</el-radio>
        </el-form-item>

        <el-form-item label="前端排序" :label-width="formLabelWidth" prop="weight">
          <el-input-number v-model="form.weight" :min="0" :max="99999999" />
        </el-form-item>

        <p class="dividing-line"><span>上传图片</span></p>

        <el-form-item v-for="(pictureItem, index) in form.pictureList" :key="index" :label="`Web图片-${languageMap.get(pictureItem.code)}`" :prop="`pictureList.${index}.value`" :rules="pictureItem.code === 'en_US' ? [{ required: true, message: '请上传图片', trigger: 'blur' }] : []" :label-width="formLabelWidth">
          <el-input v-model="pictureItem.value" :placeholder="pictureItem.code === 'en_US' ? '' : '选填，没有上传图片，在保存时会将英文图片复用至此'" clearable @click.native="addImg(pictureItem, 'value')" />
          <span style="color: red;">图片最大尺寸：540x420</span>
        </el-form-item>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="formDialogClosed">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" size="mini" @click="handleEditTure">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
    <el-dialog title="其他语种配置" :visible.sync="dialogLanguageVisible" width="500px">
      <span>将英文语种配置应用到其他语种上（保留其他语种已填写的配置）</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogLanguageVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="handleLanguageConfigureSure">{{$t('common.sure')}}</el-button>
      </span>
    </el-dialog>
    <input v-show="false" id="imgInput" type="file" @change="imgChange">
  </div>
</template>

<script>
import { getPageList, changeCarouselStatus, deleteCarousel, addCarousel, editCarousel, getCarouselDetail } from '@/api/homeCarousel'
import { listConfig } from '@/api/system/languageconfig'
import dayjs from 'dayjs'
import { filesUploadAws } from '@/api/upload/upload'

export default {
  data() {
    const initForm = () => ({
      id: '',
      title: '',
      defaultSelectedLanguage: 'en_US',
      languageList: [],
      pictureList: [{ code: 'en_US', value: '' }],
      linkType: 0,
      linkAddList: [{ code: 'en_US', value: '' }],
      showFlag: 0,
      weight: 0
    })
    return {
      statusOptions: [
        { value: 0, label: '下线' },
        { value: 1, label: '上线' }
      ],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        status: '',
        title: '',
        language: ''
      },
      initForm,
      form: initForm(),
      loading: true,
      total: 0,
      tableData: [],
      formLabelWidth: '130px',
      dialogFormVisible: false,
      dialogLanguageVisible: false,
      enPictureValue: '',
      enLinkValue: '',
      notFilledLink: [],
      rules: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        linkAddList: [{ required: true, message: '请填写跳转地址', trigger: 'blur' }],
        pictureList: [{ required: true, message: '请上传图片', trigger: 'blur' }]
      },
      /** Map([ ['en_US', '英语'], ... ]) */
      languageMap: new Map(),
      addImgInfoItem: null,
      addImgKey: null,
      addImgWidth: null,
      addImgHeight: null
    }
  },
  computed: {
    selectedLanguageInForm: {
      get() {
        return this.form.pictureList.map(({ code }) => code).filter(code => !!code)
      },
      set(languageList) {
        const pictureList = []
        const linkAddList = []

        const staticLanguageKeys = Array.from(this.languageMap.keys())
        const sortedLanguageList = Array.from(languageList)
          .sort((language1, language2) => staticLanguageKeys.indexOf(language1) - staticLanguageKeys.indexOf(language2))

        sortedLanguageList
          .forEach(code => {
            if (this.selectedLanguageInForm.includes(code)) {
              const pictureContent = this.form.pictureList.find(item => item.code === code)
              if (pictureContent) pictureList.push(pictureContent)
              const linkContent = this.form.linkAddList.find(item => item.code === code)
              if (linkContent) linkAddList.push(linkContent)
            } else {
              pictureList.push({ code: code, value: '' })
              linkAddList.push({ code: code, value: '' })
            }
          })

        this.form.pictureList = pictureList
        this.form.linkAddList = linkAddList
      }
    }
  },
  async created() {
    await this.getLanguageselect()
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      getPageList(this.queryParams).then(response => {
        if (+response.code === 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.tableData = []
          this.total = 0
          this.msgError(response.msg)
        }
        this.loading = false
      }).catch(error => {
        console.log(error)
      })
    },
    getLanguageselect() {
      return new Promise((resolve, reject) => {
        listConfig()
          .then((response) => {
            (response && response.rows || []).forEach(({ key, language }) => this.languageMap.set(key, language))
            resolve()
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    formatLanguageInTable({ languageList }) {
      const nameList = languageList
        .map(key => this.languageMap.get(key))
        .filter(name => !!name)
      return nameList.join('、')
    },
    handleDelete(id) {
      this.$confirm('此操作将永久删除, 是否继续?', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(() => {
          deleteCarousel(id)
            .then(response => {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.getList()
            })
            .catch(error => {
              console.log(error)
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    handleAdd() {
      this.dialogFormVisible = true
    },
    addImg(pictureItem, key) {
      this.addImgInfoItem = pictureItem
      this.addImgKey = key
      document.getElementById('imgInput').value = ''
      document.getElementById('imgInput').click()
    },
    imgChange() {
      const imgfile = document.getElementById('imgInput').files[0]
      if (imgfile.size > 1024 * 500) return this.$message.warning('图片最大限制500k')
      const params = { file: imgfile }

      filesUploadAws(params).then(response => {
        if (response.code === 200) {
          if (this.addImgInfoItem && this.addImgKey) this.addImgInfoItem[this.addImgKey] = response.data.fullPath
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 上线下线
    handleChangeStatus(state, id) {
      changeCarouselStatus({ status: state, id: id }).then(response => {
        if (+response.code === 200) {
          state === 1 ? this.msgSuccess('上线成功') : this.msgSuccess('下线成功')
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    handleLanguageConfigureSure() {
      this.form.pictureList.map(item => {
        if (item.code === 'en_US') {
          this.enPictureValue = item.value
        }
        if (item.code && item.value === '') {
          item.value = this.enPictureValue
        }
      })
      this.form.linkAddList.map(item => {
        if (item.code === 'en_US') {
          this.enLinkValue = item.value
        }
        if (item.code && item.value === '') {
          item.value = this.enLinkValue
        }
      })
      this.dialogLanguageVisible = false
    },
    async handleEdit(id) {
      const { data } = await getCarouselDetail(id)
      this.form = data
      this.form.id = data.id
      if (this.form.linkAddList === null) {
        this.form.linkAddList = []
        this.selectedLanguageInForm.map(item => {
          this.form.linkAddList.push({ code: item, value: '' })
        })
      }
      this.dialogFormVisible = true
    },
    handleEditTure() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.linkType === 1) {
            const linkAddList = this.form.linkAddList.filter(item => item.code !== 'en_US' && item.value === '')
            this.notFilledLink = linkAddList
            if (this.notFilledLink.length > 0) {
              this.dialogLanguageVisible = true
              return
            }
          }
          const pictureList = this.form.pictureList.filter(item => item.code !== 'en_US' && item.value === '')
          if (pictureList.length > 0) {
            this.dialogLanguageVisible = true
            return
          }
          if (!this.form.id) {
            const params = {
              title: this.form.title,
              pictureList: this.form.pictureList,
              linkType: this.form.linkType,
              linkAddList: this.form.linkAddList,
              showFlag: this.form.showFlag,
              weight: this.form.weight
            }
            addCarousel(params)
              .then(response => {
                this.$message({
                  showClose: true,
                  message: '添加成功',
                  type: 'success'
                })
                this.dialogFormVisible = false
                this.getList()
              })
              .catch(error => {
                console.log(error)
              })
          } else {
            const params = {
              id: this.form.id,
              title: this.form.title,
              pictureList: this.form.pictureList,
              linkType: this.form.linkType,
              linkAddList: this.form.linkAddList,
              showFlag: this.form.showFlag,
              weight: this.form.weight
            }
            editCarousel(params)
              .then(response => {
                this.$message({
                  showClose: true,
                  message: '修改成功',
                  type: 'success'
                })
                this.dialogFormVisible = false
                this.getList()
              })
              .catch(error => {
                console.log(error)
              })
          }
        }
      })
    },
    handleChangeLinkType() {
      if (this.form.linkAddList === null) {
        this.form.linkAddList = []
      }
      if (this.form.linkType === 0) {
        this.form.linkAddList.map(item => {
          item.value = ''
        })
      }
    },
    timeFormat(timeNum) {
      return dayjs(timeNum).format('YYYY-MM-DD HH:mm:ss')
    },
    formDialogClosed() {
      this.form = this.initForm()
      this.dialogFormVisible = false
      this.$refs['form'].resetFields()
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" scoped>
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}

.top {
  margin-top: 20px;
}

.dividing-line {
  position: relative;
  height: 30px;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 100%;
    border: 1px dashed #ccc;
    z-index: 3;
  }

  span {
    position: absolute;
    top: 50%;
    left: 50%;
    display: block;
    padding: 0 10px;
    background: #fff;
    transform: translate(-50%, -50%);
    z-index: 4;
  }
}

</style>
