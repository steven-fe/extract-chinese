<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="添加时间:">
        <el-date-picker
          v-model="queryParams.time"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('common.startDate')"
          :range-separator="$t('common.toTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>

      <el-form-item label="标题:">
        <el-input v-model="queryParams.title" placeholder="请输入标题" clearable size="mini" />
      </el-form-item>

      <el-form-item :label="$t('common.status')">
        <el-select v-model="queryParams.state" size="mini" clearable :placeholder="$t('common.all')">
          <el-option v-for="[value, name] in stateOptions" :key="`state${value}`" :label="name" :value="value" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">查询</el-button>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="dataList" border>
      <el-table-column :label="$t('common.operation')" align="center" width="270" class-name>
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.row)">修改</el-button>
          <el-button size="mini" :type="scope.row.state ? 'danger' : 'success'" @click="updateState(scope.row)">{{ scope.row.state ? '下线' : '上线' }}</el-button>
          <el-button size="mini" type="warning" @click="deleteBanner(scope.row)">删除</el-button>
        </template>
      </el-table-column>

      <el-table-column label="标题" align="center" prop="title" />

      <el-table-column prop="pictures" label="图片" align="center">
        <template slot-scope="scope">
          <img style="width: 40px;height: 40px;" :src="scope.row.contents[0].ieoBannerUrl.webUrl" alt>
          <img style="width: 40px;height: 40px;" :src="scope.row.contents[0].ieoBannerUrl.h5Url" alt>
        </template>
      </el-table-column>

      <el-table-column label="活动状态" align="center" prop="state">
        <template slot-scope="scope">{{ stateOptions.get(scope.row.state) }}</template>
      </el-table-column>

      <el-table-column label="前端排序" align="center" prop="sort" />

      <el-table-column label="添加时间" align="center" prop="createTs">
        <template slot-scope="scope">{{ parseTime(scope.row.createTs) }}</template>
      </el-table-column>
    </el-table>

    <el-dialog title="Banner管理" :visible.sync="dialogFormVisible" @closed="formDialogClosed">
      <el-form ref="form" :model="form" :rules="rules" class="demo-form-inline">

        <el-form-item label="标题" :label-width="formLabelWidth" prop="title">
          <el-input v-model="form.title" clearable />
        </el-form-item>

        <el-form-item label="语言" :label-width="formLabelWidth">
          <el-checkbox-group v-model="selectedLanguageInForm">
            <el-checkbox v-for="[key, name] in languageMap" :key="key" :label="key" :disabled="form.defaultSelectedLanguage === key">{{ name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="前端排序" :label-width="formLabelWidth" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="99999999" />
        </el-form-item>

        <p class="dividing-line"><span>上传图片</span></p>

        <template v-for="(content, index) in form.contents">
          <el-form-item v-for="clientType in ['web', 'h5']" :key="`${clientType}_${content.language}_upload_img`" :label="`${clientType}图片-${languageMap.get(content.language)}`" :label-width="formLabelWidth" :prop="`contents.${index}.${clientType}Url`" :rules="rules.image">
            <input class="el-input__inner" :value="content[`${clientType}Url`]" readonly @click="addImg(content, `${clientType}Url`, clientType === 'web' ? 1920 : 750, clientType === 'web' ? 350 : 600)">
            <span class="upload-img-tips">图片尺寸：{{ clientType === 'web' ? '1920*350' : '750*600' }}</span>
          </el-form-item>
        </template>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" size="mini" @click="handleEditTure">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>

    <input v-show="false" id="imgInput" type="file" @change="imgChange">
  </div>
</template>

<script>
import { filesUploadAws } from '@/api/upload/upload'
import { bannerList, deleteBanner, updateBannerState, addBanner, getBannerInfo, editBanner } from '@/api/launchpad'
import { listConfig } from '@/api/system/languageconfig'

const getImageFileUrl = (imgFile) => new Promise((resolve) => {
  const render = new FileReader()
  render.onload = (e) => resolve(e.target.result)
  render.readAsDataURL(imgFile)
})

const getImageSize = (src) => new Promise((resolve) => {
  const image = new Image()
  image.onload = () => resolve([image.width, image.height])
  image.src = src
})

export default {
  name: 'BannerConfiguration',
  data() {
    const initForm = () => ({
      id: null,
      title: '',
      sort: 0,

      defaultSelectedLanguage: 'en_US',
      initContent: () => ({ language: 'en_US', webUrl: '', h5Url: '' }),
      contents: [{ language: 'en_US', webUrl: '', h5Url: '' }]
    })

    return {
      loading: true,
      dataList: [],
      queryParams: {
        time: '',
        startTs: null,
        endTs: null,
        title: '',
        state: '',
        pageNum: 1,
        pageSize: 99999
      },
      formLabelWidth: '110px',
      /** Map([ ['en_US', '英语'], ... ]) */
      languageMap: new Map(),
      stateOptions: new Map([
        ['', '全部'],
        [0, '下线'],
        [1, '上线']
      ]),

      dialogFormVisible: false,
      initForm,
      form: initForm(),
      addImgInfoItem: null,
      addImgKey: null,
      addImgWidth: null,
      addImgHeight: null,
      rules: {
        title: [
          { required: true, message: '标题不能为空', trigger: 'blur' },
          { pattern: /^.{1,20}$/, message: '最大支持输入20个字符', trigger: 'blur' }
        ],
        image: [{ required: true, message: '请上传图片', trigger: 'blur' }]
      }
    }
  },
  computed: {
    selectedLanguageInForm: {
      get() {
        return this.form.contents.map(({ language }) => language).filter(language => !!language)
      },
      set(languageList) {
        const contents = []

        const staticLanguageKeys = Array.from(this.languageMap.keys())
        const sortedLanguageList = Array.from(languageList)
          .sort((language1, language2) => staticLanguageKeys.indexOf(language1) - staticLanguageKeys.indexOf(language2))

        sortedLanguageList
          .forEach(language => {
            if (this.selectedLanguageInForm.includes(language)) {
              /** existing content */
              const content = this.form.contents.find(content => content.language === language)
              if (content) contents.push(content)
            } else {
              /** new content */
              contents.push({ ...this.form.initContent(), language })
            }
          })

        this.form.contents = contents
      }
    }
  },
  async created() {
    await this.getLanguageSelect()
    await this.getList()
  },
  methods: {
    /**
     * 语言下拉结构
     * When use async-await for getLanguageSelect, get next error:
     *   [Vue warn]: Error in created hook (Promise/async): "TypeError: Object(...)(...) is not a function"
     * So, use Promise
     *
     *
     *
     * async getLanguageSelect () {
     *   const response = await listConfig()
     *   (response && response.rows || []).forEach(({ key, language }) => this.languageMap.set(key, language))
     * },
     *
     */
    getLanguageSelect() {
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
    async getList() {
      try {
        this.loading = true
        const res = await bannerList(this.queryParams)
        this.dataList = res.rows
      } finally {
        this.loading = false
      }
    },
    async handleQuery() {
      this.queryParams.startTs = this.queryParams.time && this.queryParams.time[0] ? new Date(this.queryParams.time[0]).getTime() : null
      this.queryParams.endTs = this.queryParams.time && this.queryParams.time[1] ? new Date(this.queryParams.time[1]).getTime() : null
      await this.getList()
    },
    async deleteBanner({ id }) {
      await deleteBanner({ id })
      await this.getList()
    },

    async updateState({ id, state }) {
      await updateBannerState({ id, state: +!state })
      await this.getList()
    },

    formDialogClosed() {
      this.form = this.initForm()
    },
    addImg(infoItem, key, width, height) {
      this.addImgInfoItem = infoItem
      this.addImgKey = key
      this.addImgWidth = width
      this.addImgHeight = height

      document.getElementById('imgInput').value = ''
      document.getElementById('imgInput').click()
    },
    async imgChange() {
      const imgfile = document.getElementById('imgInput').files[0]

      const localImgUrl = await getImageFileUrl(imgfile)
      const [imgWidth, imgHeight] = await getImageSize(localImgUrl)

      if (imgWidth !== this.addImgWidth && imgHeight !== this.addImgHeight) return this.$message.warning('请上传指定尺寸的图片')

      const params = { file: imgfile }

      filesUploadAws(params).then(response => {
        if (response.code === 200) {
          if (this.addImgInfoItem && this.addImgKey) this.addImgInfoItem[this.addImgKey] = response.data.fullPath
        } else {
          this.msgError(response.msg)
        }
      })
    },
    handleAdd() {
      this.dialogFormVisible = true
    },
    async handleEdit({ id }) {
      const { code, data } = await getBannerInfo({ id })
      if (+code !== 0 && +code !== 200) return

      for (const key in this.form) {
        if (!data.hasOwnProperty(key)) continue

        if (key === 'contents') this.form[key] = data[key].map(content => ({ language: content.language, ...content.ieoBannerUrl }))
        else this.form[key] = data[key]
      }

      /** wait for set data */
      setTimeout(() => (this.dialogFormVisible = true), 0)
    },
    handleEditTure() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (!this.form.id) {
            addBanner(this.form)
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
            editBanner(this.form)
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
    }
  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" scoped>
::v-deep {
  .el-button + .el-button {
    margin-left: 10px;
  }
  .el-dialog {
    .title {
      width: 100%;
      font-size: 20px;
      color: #000;
      margin: 0 0 30px;
      overflow: hidden;
    }

    .el-col {
      margin-right: 10px;
    }
    .el-form-item {
      margin: 0 0 20px;
    }
    .el-form-item--medium .el-form-item__label {
      padding: 0;
      text-align: left;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 50% 50%;
      margin-left: 5%;
      .grid-item {
        width: 90%;
      }
    }
    .divide {
      width: 100%;
      overflow: hidden;
      border-top: 1px solid #ccc;
    }
    .el-dialog__footer {
      clear: both;
    }
    .tip {
      width: 100%;
      padding: 0 0 0 120px;
      margin-bottom: 20px;
      overflow: hidden;
    }
  }
  .el-form-item {
    margin: 0 0 15px;
  }
  .el-form-item__content {
    line-height: 30px;
  }
}

.form-title {
  display: flex;
  justify-content: space-between;
  margin-top: 7px;
  align-items: center;

  .add-btn {
    color: green;
    font-weight: bold;
    font-size: 24px;
    cursor: pointer;
  }
}

.upload-img-tips {
  color: #ccc;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
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
