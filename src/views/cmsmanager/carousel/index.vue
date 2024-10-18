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
        <el-select v-model="queryParams.language" size="small" placeholder="请选择语言">
          <el-option :key="''" :label="$t('common.all')" value="" />
          <el-option v-for="[key, name] in languageMap" :key="key" :label="name" :value="key" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" size="mini" @click="load">查询</el-button>
        <el-button type="success" size="mini" @click="add">添加</el-button>
      </el-form-item>
    </el-form>

    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%">
      <el-table-column :label="$t('common.operation')" width="230">
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

      <el-table-column prop="title" label="标题" width="150px" />

      <el-table-column prop="file" label="图片">
        <template slot-scope="scope">
          <img v-for="(pictureUrl, index) in (scope.row.picture || '').split(',')" :key="`${pictureUrl}_${index}`" style="width: 40px;height: 40px;" :src="pictureUrl" alt>
        </template>
      </el-table-column>

      <el-table-column prop="type" label="跳转类型" width="80px">
        <template slot-scope="scope">
          <span v-if="scope.row.type == 3">App原生页</span>
          <span v-if="scope.row.type == 4">外部链接</span>
          <span v-if="scope.row.type == 5">无跳转</span>
        </template>
      </el-table-column>

      <el-table-column prop="url" label="跳转链接" width="200px" />

      <el-table-column prop="language" label="语言" :formatter="formatLanguageInTable" width="70px" />

      <el-table-column prop="state" :label="$t('common.status')" align="center" :formatter="({ state }) => stateMap.get(String(state))" width="50px" />

      <el-table-column prop="clientTypes" label="客户端类型" width="120px">
        <template slot-scope="scope">
          <div v-if="scope.row.clientTypes.indexOf('1')>-1">Android</div>
          <div v-if="scope.row.clientTypes.indexOf('2')>-1">iOS</div>
          <div v-if="scope.row.clientTypes.indexOf('3')>-1">PC</div>
          <div v-if="scope.row.clientTypes.indexOf('4')>-1">H5</div>
        </template>
      </el-table-column>

      <el-table-column prop="showType" label="显示方式" width="120px">
        <template slot-scope="scope">
          <span v-if="scope.row.showType == '1'">登录显示</span>
          <span v-if="scope.row.showType == '2'">未登录显示</span>
          <span v-if="scope.row.showType == '3'">不限制</span>
        </template>
      </el-table-column>

      <el-table-column prop="sort" label="前端排序" width="50px" />

      <el-table-column prop="creationtime" label="添加时间" width="160px" :formatter="({ creationtime }) => timeFormat(creationtime)" />
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

    <el-dialog title="轮播管理" :visible.sync="dialogFormVisible" :close-on-click-modal="false" @closed="formDialogClosed">
      <el-form ref="form" :model="form" :rules="rules" class="demo-form-inline">

        <el-form-item label="标题" :label-width="formLabelWidth" prop="title">
          <el-input v-model="form.title" clearable />
        </el-form-item>

        <el-form-item label="客户端类型" :label-width="formLabelWidth" prop="clientTypes">
          <el-checkbox-group v-model="selectedClientTypesInForm">
            <el-checkbox v-for="[key, name] in clientTypeMap" :key="key" :label="key" :disabled="computedClientTypeDisabled(key)">{{ name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="语言" :label-width="formLabelWidth">
          <el-checkbox-group v-model="selectedLanguageInForm">
            <el-checkbox v-for="[key, name] in languageMap" :key="key" :label="key" :disabled="form.defaultSelectedLanguage === key">{{ name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="跳转类型" :label-width="formLabelWidth">
          <el-radio v-model="form.type" :label="3">App原生页</el-radio>
          <el-radio v-model="form.type" :label="4">外部链接</el-radio>
          <el-radio v-model="form.type" :label="5">无跳转</el-radio>
        </el-form-item>

        <template v-if="form.type !== 5">
          <el-form-item v-for="infoItem in form.info" :key="infoItem.language" :label="`跳转地址-${languageMap.get(infoItem.language)}`" :label-width="formLabelWidth">
            <el-input v-model="infoItem.url" size="mini" clearable />
          </el-form-item>
        </template>

        <el-form-item label="显示方式" :label-width="formLabelWidth">
          <el-radio v-model="form.showType" :label="1">登录显示</el-radio>
          <el-radio v-model="form.showType" :label="2">未登录显示</el-radio>
          <el-radio v-model="form.showType" :label="3">不限制</el-radio>
        </el-form-item>

        <el-form-item label="前端排序" :label-width="formLabelWidth" prop="sort">
          <el-input-number v-model="form.sort" :min="-99999" :max="99999" />
        </el-form-item>

        <p class="dividing-line"><span>上传图片</span></p>

        <template v-for="infoItem in form.info">
          <el-form-item v-for="classification in computedClientClassification" :key="`${classification.type}_${infoItem.language}_upload_img`" :label="`${classification.name}图片-${languageMap.get(infoItem.language)}`" :label-width="formLabelWidth">
            <input v-model="infoItem[`${classification.type}Picture`]" class="el-input__inner" clearable @click="addImg(infoItem, `${classification.type}Picture`)">
            {{ classification.size }}
          </el-form-item>
        </template>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" size="mini" @click="handleEditTure">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
    <input v-show="false" id="imgInput" type="file" @change="imgChange">

    <el-dialog :visible.sync="dialogCopyVisible" :close-on-click-modal="false" width="500px">
      <div>将英文语种配置复用至其他语种？（保留其他语种已填写的配置）</div>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" size="mini" @click="dialogCopyVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" size="mini" @click="handleCopeContent">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listLunbo, addLunbo, getLunboDetail, updateLunbo, delLunbo, updateLunboState } from '@/api/coin'
import { listConfig } from '@/api/system/languageconfig'
import dayjs from 'dayjs'
import { filesUploadAws } from '@/api/upload/upload'

export default {
  data() {
    const clientTypeMap = new Map([
      ['1', 'Android'],
      ['2', 'IOS'],
      ['4', 'H5'],
      ['3', 'Web']
    ])

    const initForm = () => ({
      id: '',
      title: '',
      clientTypes: Array.from(clientTypeMap.keys()).join(','),

      defaultSelectedLanguage: 'en_US',
      initInfoItem: () => ({ language: 'en_US', url: '', appPicture: '', webPicture: '', h5Picture: '' }),
      info: [{ language: 'en_US', url: '', appPicture: '', webPicture: '', h5Picture: '' }],

      type: 3,
      showType: 1,
      sort: 0
    })

    return {
      dialogCopyVisible: false,
      dialogFormVisible: false,

      // 语言选项
      languageOptions: [],

      clientType: [{ id: '1', name: 'Android' }, { id: '2', name: 'IOS' }, { id: '3', name: 'PC' }, { id: '4', name: 'H5' }],

      initForm,
      form: initForm(),

      loading: true,

      total: 0,
      tableData: [],

      formLabelWidth: '140px',
      stateOptions: [
        { value: 1, label: '上线' },
        { value: 0, label: '下线' }
      ],
      rules: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }]
      },

      stateMap: new Map([
        ['1', '上线'],
        ['0', '下线']
      ]),
      /** Map([ ['en_US', '英语'], ... ]) */
      languageMap: new Map(),
      clientTypeMap,

      queryParams: {
        time: '',
        title: '',
        state: '',
        language: '',
        pageNum: 1,
        pageSize: 10
      },

      addImgInfoItem: null,
      addImgKey: null
    }
  },
  computed: {
    selectedClientTypesInForm: {
      get() {
        return this.form.clientTypes.split(',')
      },
      set(clientTypeList) {
        this.form.clientTypes = clientTypeList.join(',')
      }
    },
    selectedLanguageInForm: {
      get() {
        return this.form.info.map(({ language }) => language).filter(language => !!language)
      },
      set(languageList) {
        const info = []

        const staticLanguageKeys = Array.from(this.languageMap.keys())
        const sortedLanguageList = Array.from(languageList)
          .sort((language1, language2) => staticLanguageKeys.indexOf(language1) - staticLanguageKeys.indexOf(language2))

        sortedLanguageList
          .forEach(language => {
            if (this.selectedLanguageInForm.includes(language)) {
              /** existing info item */
              const infoItem = this.form.info.find(infoItem => infoItem.language === language)
              if (infoItem) info.push(infoItem)
            } else {
              /** new info item */
              info.push({ ...this.form.initInfoItem(), language })
            }
          })

        this.form.info = info
      }
    },
    computedClientClassification() {
      const list = []

      if (this.selectedClientTypesInForm.includes('1') || this.selectedClientTypesInForm.includes('2')) {
        list.push({ type: 'app', name: '手机', size: '尺寸要求500x500' })
      }
      if (this.selectedClientTypesInForm.includes('4')) {
        list.push({ type: 'h5', name: 'H5', size: '尺寸要求258x160' })
      }
      if (this.selectedClientTypesInForm.includes('3')) {
        list.push({ type: 'web', name: 'Web', size: '尺寸要求258x160' })
      }
      return list
    }
  },
  async created() {
    await this.getLanguageselect()
    await this.load()
    this.watchForm()
  },
  methods: {
    /**
     * 语言下拉结构
     * When use async-await for getLanguageselect, get next error:
     *   [Vue warn]: Error in created hook (Promise/async): "TypeError: Object(...)(...) is not a function"
     * So, use Promise
     *
     *
     *
     * async getLanguageselect () {
     *   const response = await listConfig()
     *   (response && response.rows || []).forEach(({ key, language }) => this.languageMap.set(key, language))
     * },
     *
     */
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
    addImg(infoItem, key) {
      this.addImgInfoItem = infoItem
      this.addImgKey = key

      document.getElementById('imgInput').value = ''
      document.getElementById('imgInput').click()
    },
    imgChange() {
      const imgfile = document.getElementById('imgInput').files[0]

      if (imgfile.size > 1024 * 100) return this.$message.warning('图片最大限制100k')

      const params = { file: imgfile }

      filesUploadAws(params, '/coinbull/file/aws/upload/file/lunbo').then(response => {
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
      updateLunboState({ state: state, id: id }).then(response => {
        if (+response.code === 200) {
          state === 1 ? this.msgSuccess('上线成功') : this.msgSuccess('下线成功')
          this.load()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    async handleEditTure() {
      const valid = await this.$refs['form'].validate()
      if (!valid) return
      if (
        this.form.info.some(infoItem => {
          /** When type isn`t 5(no link), check if the url is empty */
          if (this.form.type !== 5 && infoItem.language === 'en_US' && infoItem.url === '') return true
          /** check if the [clientType]Picture is empty */
          else if (this.computedClientClassification.some(client => infoItem.language === 'en_US' && !infoItem[`${client.type}Picture`])) return true
        })
      ) {
        this.$message({
          showClose: true,
          message: '请填写英文语种信息',
          type: 'error'
        })
        return
      }
      if (
        this.form.info.some(infoItem => {
          /** When type isn`t 5(no link), check if the url is empty */
          if (this.form.type !== 5 && infoItem.url === '') return true
          /** check if the [clientType]Picture is empty */
          else if (this.computedClientClassification.some(client => !infoItem[`${client.type}Picture`])) return true
        })
      ) {
        this.dialogCopyVisible = true
        return
      }
      this.handleCopeContent()
    },
    handleCopeContent() {
      this.dialogCopyVisible = false
      if (this.form.id === '') {
        addLunbo(this.form)
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
        updateLunbo(this.form)
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
    async handleEdit(index, { id }) {
      if (index === '1') {
        const { code, data } = await getLunboDetail({ id })
        if (+code === 0 || +code === 200) {
          for (const key in data) {
            this.form[key] = data[key]
          }
          // 排序
          const index = this.form.info.findIndex(item => item.language === 'en_US')
          const arr = this.form.info.splice(index, 1)
          this.form.info.unshift(arr[0])
          /** wait for set data */
          setTimeout(() => (this.dialogFormVisible = true), 0)
        }
      } else {
        this.$confirm('此操作将永久删除, 是否继续?', this.$t('common.prompt'), {
          confirmButtonText: this.$t('common.sure'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'warning'
        })
          .then(() => {
            delLunbo({ id })
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
      const formData = { ...this.queryParams, time: undefined, startTime: time ? time[0] : '', endTime: time ? time[1] : '' }

      listLunbo(formData)
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
    formatLanguageInTable({ language }) {
      const nameList = (language || '')
        .split(',')
        .map(key => this.languageMap.get(key))
        .filter(name => !!name)
      return nameList.join('、')
    },
    timeFormat(timeNum) {
      return dayjs(timeNum).format('YYYY-MM-DD HH:mm:ss')
    },
    computedClientTypeDisabled(key) {
      return this.selectedClientTypesInForm.length < 2 && this.selectedClientTypesInForm.includes(key)
    },
    watchForm() {
      this.$watch('form.type', (type) => {
        if (type === 5 && this.form && this.form.info) {
          this.form.info.forEach(item => (item.url = ''))
        }
      }, { immediate: true })

      this.$watch('computedClientClassification', (computedClientClassification,) => {
        if (computedClientClassification.length < 2 && this.form && this.form.info) {
          const existingKey = computedClientClassification.map(item => item.type)
          this.form.info.forEach(item => {
            if (!existingKey.includes('app')) item.appPicture = ''
            if (!existingKey.includes('web')) item.webPicture = ''
            if (!existingKey.includes('h5')) item.webPicture = ''
          })
        }
      }, { immediate: true })
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
