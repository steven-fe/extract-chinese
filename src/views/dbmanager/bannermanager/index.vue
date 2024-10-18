<template>
  <div class="app-container">
    <!--form-->
    <el-form ref="queryForm" :model="queryParams" :inline="true">

      <el-form-item label="添加时间">
        <el-date-picker
          v-model="queryParams.time"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('common.startDate')"
          :range-separator="$t('common.toTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="timestamp"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>

      <el-form-item label="标题">
        <el-input v-model="queryParams.title" placeholder="请输入标题" size="mini" clearable />
      </el-form-item>

      <el-form-item :label="$t('common.status')">
        <el-select v-model="queryParams.state" size="small" placeholder="请选择状态">
          <el-option :key="''" :label="$t('common.all')" value="" />
          <el-option v-for="[key, name] in stateMap" :key="key" :label="name" :value="key" />
        </el-select>
      </el-form-item>

      <el-form-item label="语言">
        <el-select v-model="queryParams.langurageEnv" size="small" placeholder="请选择语言">
          <el-option :key="''" :label="$t('common.all')" value="" />
          <el-option v-for="[key, name] in languageMap" :key="key" :label="name" :value="key" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" size="mini" @click="load">查询</el-button>
        <el-button type="success" size="mini" @click="add">新增</el-button>
      </el-form-item>
    </el-form>

    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%">
      <el-table-column :label="$t('common.operation')" width="230" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleEdit('1', scope.row)">修改</el-button>
          <el-button
            v-if="scope.row.state != 1"
            type="success"
            size="mini"
            @click="stateChange(1, scope.row.id)"
          >上线</el-button>
          <el-button
            v-if="scope.row.state === 1"
            type="danger"
            size="mini"
            @click="stateChange(0,
                                scope.row.id)"
          >下线</el-button>
          <el-button type="danger" size="mini" @click="handleEdit('2', scope.row)">删除</el-button>
        </template>
      </el-table-column>

      <el-table-column prop="title" label="标题" width="150px" align="center" />

      <el-table-column prop="pictures" label="图片" align="center" width="150px">
        <template slot-scope="scope">
          <img style="width: 40px;height: 40px;" :src="scope.row.contents[0].ieoBannerUrl.webUrl" alt>
          <img style="width: 40px;height: 40px;" :src="scope.row.contents[0].ieoBannerUrl.h5Url" alt>
        </template>
      </el-table-column>

      <el-table-column prop="language" label="语言" width="150px" align="center">
        <template slot-scope="scope">
          {{ scope.row.contents.map(item => languageMap.get(item.language)).join(',') }}
        </template>
      </el-table-column>

      <el-table-column prop="state" :label="$t('common.status')" align="center" :formatter="({ state }) => stateMap.get(String(state))" width="150px" />

      <el-table-column prop="clientType" label="客户端类型" width="150px" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.clientType.indexOf('0')>-1">Android</div>
          <div v-if="scope.row.clientType.indexOf('1')>-1">IOS</div>
          <!-- <div v-if="scope.row.clientType.indexOf('2')>-1">H5</div> -->
          <div v-if="scope.row.clientType.indexOf('3')>-1">Web</div>
        </template>
      </el-table-column>

      <el-table-column prop="showWay" label="显示方式" width="150px" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.showWay == '0'">登录显示</span>
          <span v-if="scope.row.showWay == '1'">未登录显示</span>
          <span v-if="scope.row.showWay == '2'">不限制</span>
        </template>
      </el-table-column>

      <el-table-column prop="sort" label="前端排序" width="150px" align="center" />

      <el-table-column prop="createTs" label="添加时间" width="160px" :formatter="({ createTs }) => timeFormat(createTs)" align="center" />
    </el-table>

    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="load()"
      />
    </div>

    <el-dialog title="Banner管理" :visible.sync="dialogFormVisible" :close-on-click-modal="false" width="600px" @closed="formDialogClosed">
      <el-form ref="form" :model="form" :rules="rules" class="demo-form-inline">

        <el-form-item label="标题" :label-width="formLabelWidth" prop="title">
          <el-input v-model="form.title" clearable />
        </el-form-item>

        <el-form-item label="客户端类型" :label-width="formLabelWidth" prop="clientType">
          <el-checkbox-group v-model="selectedClientTypesInForm">
            <el-checkbox v-for="[key, name] in clientTypeMap" :key="key" :label="key" :disabled="computedClientTypeDisabled(key)">{{ name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="语言" :label-width="formLabelWidth">
          <el-checkbox-group v-model="selectedLanguageInForm">
            <el-checkbox v-for="[key, name] in languageMap" :key="key" :label="key" :disabled="form.defaultSelectedLanguage === key">{{ name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="显示方式" :label-width="formLabelWidth">
          <el-radio v-model="form.showWay" :label="0">登录显示</el-radio>
          <el-radio v-model="form.showWay" :label="1">未登录显示</el-radio>
          <el-radio v-model="form.showWay" :label="2">不限制</el-radio>
        </el-form-item>

        <el-form-item label="前端排序" :label-width="formLabelWidth" prop="sort">
          <el-input v-model="form.sort" />
        </el-form-item>

        <p class="dividing-line"><span>上传图片</span></p>

        <template v-for="(content, index) in form.contents">
          <el-form-item v-for="(_clientType) in uploadOptions" :key="`${_clientType}_${content.language}_upload_img`" :label="`${_clientType === 'h5' ? 'app' : _clientType}图片-${languageMap.get(content.language)}`" :label-width="formLabelWidth" :prop="`contents.${index}.${_clientType}Url`" :rules="rules.image">
            <input class="el-input__inner" :value="content[`${_clientType}Url`]" readonly @click="addImg(content, `${_clientType}Url`)">
            <span class="upload-img-tips">图片尺寸：{{ _clientType === 'web' ? '1920*350' : '375x200' }}</span>
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
import { bannerList, Delete, updateState, addBanner, modifyBanner, searchBanner } from '@/api/broadcast/banner'
import { listConfig } from '@/api/system/languageconfig'
import dayjs from 'dayjs'
import { filesUploadAws } from '@/api/upload/upload'

export default {
  data() {
    // const clientTypeMap = new Map([
    //   [ '0', 'Android' ],
    //   [ '1', 'IOS' ],
    //   // [ '2', 'H5' ],
    //   [ '3', 'Web' ],
    // ])
    const clientTypeMap = new Map([
      ['0', 'Android'],
      ['1', 'IOS'],
      ['3', 'Web']
    ])
    const initForm = () => ({
      id: null,
      title: '',
      sort: 0,
      clientType: Array.from(clientTypeMap.keys()).join(','),
      defaultSelectedLanguage: 'en_US',
      initContent: () => ({ language: 'en_US', webUrl: '', h5Url: '' }),
      contents: [{ language: 'en_US', webUrl: '', h5Url: '' }],
      showWay: ''
    })
    return {
      dialogFormVisible: false,
      // clientType:[{id:"0",name:'Android'},{id:"1",name:'IOS'},{id:"2",name:'H5'},{id:"3",name:'web'}],
      clientType: [{ id: '0', name: 'Android' }, { id: '1', name: 'IOS' }, { id: '3', name: 'web' }],
      initForm,
      form: initForm(),
      // form: {
      //   id: '',
      //   title: '',
      //   clientType: Array.from(clientTypeMap.keys()).join(','),
      //   defaultSelectedLanguage: 'en_US',
      //   initContent: () => ({ language: 'en_US', webUrl: '', h5Url: '' }),
      //   contents: [{ language: 'en_US', h5Url: '', webUrl: '' }],
      //   showWay: '',
      //   sort: 0,
      // },
      clientTypeMap,
      loading: true,

      total: 0,
      tableData: [],

      formLabelWidth: '140px',
      stateOptions: [
        { value: 1, label: '上线' },
        { value: 0, label: '下线' }
      ],

      stateMap: new Map([
        ['1', '上线'],
        ['0', '下线']
      ]),
      rules: {
        title: [
          { required: true, message: '标题不能为空', trigger: 'blur' },
          { pattern: /^.{1,20}$/, message: '最大支持输入20个字符', trigger: 'blur' }
        ],
        image: [{ required: true, message: '请上传图片', trigger: 'blur' }]
      },
      /** Map([ ['en_US', '英语'], ... ]) */
      languageMap: new Map(),
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        startTs: '',
        endTs: '',
        state: '',
        title: '',
        langurageEnv: ''
      },

      addImgInfoItem: null,
      addImgKey: null,
      addImgWidth: null,
      addImgHeight: null
    }
  },
  computed: {
    selectedClientTypesInForm: {
      get() {
        return this.form.clientType ? this.form.clientType.split(',') : []
        // return this.form.clientTypes.split(',')
      },
      set(clientTypeList) {
        console.log('clientTypeList', clientTypeList)
        this.form.clientType = clientTypeList.join(',')
      }
    },
    uploadOptions() {
      if (this.selectedClientTypesInForm.includes('3')) {
        if (this.selectedClientTypesInForm.length > 1) {
          return ['web', 'h5']
        }
        return ['web']
      }
      return ['h5']
    },
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
    // computedClientClassification() {
    //   const list = []

    // if (this.selectedClientTypesInForm.includes('0') || this.selectedClientTypesInForm.includes('1') || this.selectedClientTypesInForm.includes('2')) {
    //   list.push({ type: 'app', name: '手机' })
    // }
    // if (this.selectedClientTypesInForm.includes('3')) {
    //   list.push({ type: 'web', name: 'Web' })
    // }

    //   return list
    // }
  },
  async created() {
    await this.getLanguageselect()
    await this.load()
    this.watchForm()
  },
  methods: {
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
    // addImg(infoItem, key, width, height) {
    //   this.addImgInfoItem = infoItem
    //   this.addImgKey = key
    //   this.addImgWidth = width
    //   this.addImgHeight = height
    //   document.getElementById("imgInput").value = '';
    //   document.getElementById("imgInput").click();
    // },
    addImg(infoItem, key) {
      this.addImgInfoItem = infoItem
      this.addImgKey = key
      document.getElementById('imgInput').value = ''
      document.getElementById('imgInput').click()
    },
    async imgChange() {
      const imgfile = document.getElementById('imgInput').files[0]
      const params = { file: imgfile }

      filesUploadAws(params).then(response => {
        if (response.code === 200) {
          if (this.addImgInfoItem && this.addImgKey) this.addImgInfoItem[this.addImgKey] = response.data.fullPath
        } else {
          this.msgError(response.msg)
        }
      })
    },
    add() {
      this.dialogFormVisible = true
    },
    // 上线下线
    stateChange(state, id) {
      updateState({ state: state, id: id }).then(response => {
        if (+response.code === 200) {
          state === 1 ? this.msgSuccess('上线成功') : this.msgSuccess('下线成功')
          this.load()
        } else {
          this.msgError(response.msg)
        }
      })
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
                this.load()
              })
              .catch(error => {
                console.log(error)
              })
          } else {
            modifyBanner(this.form)
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
        }
      })
    },
    async handleEdit(index, { id }) {
      if (index === '1') {
        const { code, data } = await searchBanner({ id })
        if (+code !== 0 && +code !== 200) return

        for (const key in this.form) {
          if (!data.hasOwnProperty(key)) continue

          if (key === 'contents') this.form[key] = data[key].map(content => ({ language: content.language, ...content.ieoBannerUrl }))
          else this.form[key] = data[key]
        }
        console.log('this.form', this.form)
        /** wait for set data */
        setTimeout(() => (this.dialogFormVisible = true), 0)
      } else {
        this.$confirm('此操作将永久删除, 是否继续?', this.$t('common.prompt'), {
          confirmButtonText: this.$t('common.sure'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'warning'
        })
          .then(() => {
            Delete({ id })
              .then(response => {
                this.$message({
                  type: 'success',
                  message: '删除成功!'
                })
                this.load()
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
      }
    },
    load() {
      this.loading = true

      const { time } = this.queryParams
      const formData = { ...this.queryParams, time: undefined, startTs: time ? time[0] : '', endTs: time ? time[1] : '' }

      bannerList(formData)
        .then(response => {
          if (+response.code === 200) {
            this.tableData = response.rows
            this.total = response.total
          } else {
            this.tableData = []
            this.total = 0
            this.msgError(response.msg)
          }
          this.loading = false
        })
        .catch(error => {
          console.log(error)
        })
    },
    computedClientTypeDisabled(key) {
      console.log('this.selectedClientTypesInForm', this.selectedClientTypesInForm, key)
      return this.selectedClientTypesInForm.length < 2 && this.selectedClientTypesInForm.includes(key)
    },
    // formatLanguageInTable ({ language }) {
    //   const nameList = (language || '')
    //     .split(',')
    //     .map(key => this.languageMap.get(key))
    //     .filter(name => !!name)
    //   return nameList.join('、')
    // },
    timeFormat(timeNum) {
      return dayjs(timeNum).format('YYYY-MM-DD HH:mm:ss')
    },
    watchForm() {
      // this.$watch('form.type', (type) => {
      //   if (type === 5 && this.form && this.form.contents) {
      //     this.form.contents.forEach(item => item.url = '')
      //   }
      // }, { immediate: true })

      // this.$watch('computedClientClassification', (computedClientClassification, ) => {
      //   if (computedClientClassification.length < 2 && this.form && this.form.contents) {
      //     const existingKey = computedClientClassification.map(item => item.type)
      //     this.form.contents.forEach(item => {
      //       if (!existingKey.includes('app')) item.h5Url = ''
      //       if (!existingKey.includes('web')) item.webUrl = ''
      //     })
      //   }
      // }, { immediate: true })
    },
    formDialogClosed() {
      this.form = this.initForm()
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
