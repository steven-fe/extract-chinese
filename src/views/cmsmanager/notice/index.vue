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

      <el-form-item label="类型">
        <el-select v-model="queryParams.type" clearable placeholder="请选择类型" size="mini">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
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
          <el-button type="primary" size="mini" @click="handleEdit(scope.$index, scope.row)">修改</el-button>
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
          <el-button size="mini" type="danger" @click="del(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="id" width="50px" />
      <el-table-column prop="title" label="标题" />

      <el-table-column prop="contentType" label="内容类型" :formatter="({ contentType }) => contentTypeMap.get(contentType)" />

      <el-table-column prop="content" label="内容" :show-overflow-tooltip="true" width="300px" />
      <el-table-column prop="type" label="类型">
        <template slot-scope="scope">
          <span v-if="scope.row.type">首页公告</span>
          <span v-if="!scope.row.type">系统消息</span>
        </template>
      </el-table-column>

      <el-table-column prop="language" label="语言" :formatter="formatLanguageInTable" />

      <el-table-column prop="state" :label="$t('common.status')" align="center" :formatter="({ state }) => stateMap.get(String(state))" />

      <el-table-column prop="sortNum" label="前端排序" />
      <el-table-column prop="publisher" label="创建人" />
      <el-table-column prop="createTime" label="添加时间" :formatter="({ createTime }) => timeFormat(createTime)" />
      <el-table-column prop="updateTime" label="更新时间" :formatter="({ updateTime }) => timeFormat(updateTime)" />

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

    <el-dialog title="公告管理" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
      <el-form :model="form" class="demo-form-inline">
        <el-form-item label="语言" :label-width="formLabelWidth">
          <el-checkbox-group v-model="selectedLanguageInForm">
            <el-checkbox v-for="[key, name] in languageMap" :key="key" :label="key" :disabled="form.defaultSelectedLanguage === key">{{ name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <template v-for="infoItem in form.info">
          <el-form-item :required="infoItem.language === 'en_US'" :key="infoItem.language" :label="`${languageMap.get(infoItem.language)}标题`" :label-width="formLabelWidth">
            <el-input v-model="infoItem.title" size="mini" clearable />
          </el-form-item>
        </template>

        <el-form-item label="前端排序" :label-width="formLabelWidth" prop="sort_num">
          <el-input-number v-model="form.sort" :min="-99999" :max="99999" />
        </el-form-item>

        <el-form-item label="类型" :label-width="formLabelWidth">
          <el-radio v-for="status in typeOptions" :key="status.value" v-model="form.type" :label="+status.value">{{ status.label }}</el-radio>
        </el-form-item>


        <el-form-item label="内容类型" :label-width="formLabelWidth">
          <el-radio v-for="[key, name] in computedContentTypeMap" :key="key" v-model="form.contentType" :label="key">{{ name }}</el-radio>
        </el-form-item>

        <template v-for="infoItem in computedContent.infoList">
          <el-form-item :required="infoItem.language === 'en_US'" :key="`content_${infoItem.language}`" :label="`${computedContent.labelPrefix}${languageMap.get(infoItem.language)}`" :label-width="formLabelWidth">
            <editor-bar v-if="computedContent.component === 'editor'" v-model="infoItem.content" :is-clear="false" />
            <el-input v-else v-model="infoItem.content" size="mini" clearable />
          </el-form-item>
        </template>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" size="mini" @click="handleEditTure">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listNotice, addNotice, getNoticeDetail, updateNotice, delNotice, updateNoticeStatus } from '@/api/coin'
import { listConfig } from '@/api/system/languageconfig'
import EditorBar from '@/components/wangEnduit'
import dayjs from 'dayjs'
import {MessageBox} from "element-ui";

export default {
  components: { EditorBar },
  data() {
    const initForm = () => ({
      sort: 0,
      type: 1,
      contentType: 1,
      defaultSelectedLanguage: 'en_US',
      initInfoItem: () => ({ title: '', language: '', content: '' }),
      info: [{ title: '', language: 'en_US', content: '' }]
    })

    return {
      dialogFormVisible: false,
      radio: '1',

      initForm,
      form: initForm(),

      loading: true,
      pageShow: true,
      tableData: [],
      total: 0,
      formLabelWidth: '140px',

      typeOptions: [
        { value: '0', label: '系统消息' },
        { value: '1', label: '首页公告' }
      ],
      stateMap: new Map([
        ['1', '上线'],
        ['0', '下线']
      ]),
      contentTypeMap: new Map([
        [1, '跳转APP原生页'],
        [2, '跳转外部链接'],
        [3, '消息文本'],
        [4, '无跳转']
      ]),
      /** Map([ ['en_US', '英语'], ... ]) */
      languageMap: new Map(),

      queryParams: {
        time: '',
        title: '',
        type: '',
        state: '',
        language: '',
        pageNum: 1,
        pageSize: 10
      }
    }
  },
  computed: {
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
    computedContentTypeMap() {
      /**
       * 系统消息 - [消息文本]
       * 首页公告 - [跳转APP原生页, 跳转外部链接, 无跳转]
       */
      const typeToContentType = { 0: [3], 1: [1, 2, 4] }
      const contentTypeKeys = typeToContentType[this.form.type]

      return contentTypeKeys
        ? new Map(
          [...this.contentTypeMap].filter(([key]) => contentTypeKeys.includes(key))
        )
        : new Map()
    },
    computedContent() {
      /**
       * 跳转APP原生页, 跳转外部链接(1, 2) - 跳转地址-语言 - textInput
       * 消息文本(3) - 内容-语言 - editor-bar
       * 无跳转(4) - empty Array
       */
      const { contentType } = this.form

      if ([1, 2].includes(contentType)) {
        return { labelPrefix: '跳转地址-', infoList: this.form.info, component: 'input' }
      } else if (contentType === 3) {
        return { labelPrefix: '内容-', infoList: this.form.info, component: 'editor' }
      } else {
        return { infoList: [] }
      }
    }
  },
  watch: {},
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
            const res = response && response.rows || []
            const index = res.findIndex(el => el.key === 'en_US')
            const obj = res[index]
            res.splice(index, 1)
            res.unshift(obj)
            res.forEach(({ key, language }) => this.languageMap.set(key, language))
            resolve()
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    del(row, index) {
      this.$confirm('此操作将永久删除该, 是否继续?', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(() => {
          console.log(index)
          delNotice({ id: index.id })
            .then((response) => {
              this.$message({
                showClose: true,
                message: '删除成功',
                type: 'success'
              })
              this.load()
            })
            .catch((error) => {
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
    // 上线下线
    stateChange(state, id) {
      updateNoticeStatus({ state: state, id: id }).then(response => {
        if (response.code == 200) {
          state === 1 ? this.msgSuccess('上线成功') : this.msgSuccess('下线成功')
          this.load()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    add() {
      this.radio = 1
      this.form = this.initForm()

      /** wait for set data */
      setTimeout(() => this.dialogFormVisible = true, 0)
    },
    async handleEditTure() {
      if (this.form.info.some(infoItem => !infoItem.title && infoItem.language === 'en_US')) {
        this.$message({ showClose: true, message: '英文标题为必填项', type: 'error' })
        return
      }
      if (this.form.info.some(infoItem => [1, 2].includes(this.form.contentType) && !infoItem.content && infoItem.language === 'en_US')) {
        this.$message({ showClose: true, message: '英文跳转地址为必填项', type: 'error' })
        return
      }
      if (this.form.info.some(infoItem => this.form.contentType === 3 && !infoItem.content && infoItem.language === 'en_US')) {
        this.$message({ showClose: true, message: '英文内容为必填项', type: 'error' })
        return
      }
      if (
        this.form.info.some(infoItem => {
          if (!infoItem.title) return true
          if (infoItem => [1, 2].includes(this.form.contentType) && !infoItem.content) return true
          if (infoItem => this.form.contentType === 3 && !infoItem.content) return true
        }
      )) {
        await MessageBox.confirm('将英文语种配置复用至其他语种？（保留其他语种已填写的配置）', { type: 'warning' })
        const enUsInfo = this.form.info.find(el => el.language === 'en_US')
        this.form.info.forEach(item => {
          if (item.language !== 'en_US') {
            if (!item.title) {
              item.title = enUsInfo.title
            }
            if (!item.content) {
              item.content = enUsInfo.content
            }
          }
        })
      }

      // if (
      //   this.form.info.some(infoItem => {
      //     if (infoItem.title === '') return true
      //     /** When contentType isn`t 4, check if the content is empty */
      //     else if ([1, 2].includes(this.form.contentType) && !infoItem.content) return true
      //     /** When contentType is 3, check if the content is empty */
      //     else if (this.form.contentType === 3 && infoItem.language === 'en_US' && !infoItem.content) return true
      //   })
      // ) {
      //   this.$message({
      //     showClose: true,
      //     message: '请填写全部信息',
      //     type: 'error'
      //   })
      //   return
      // }

      this.form.languageList = this.form.info.map(el => el.language)
      if (this.radio == 1) {
        addNotice(this.form)
          .then((response) => {
            this.$message({
              showClose: true,
              message: '添加成功',
              type: 'success'
            })
            this.dialogFormVisible = false
            this.load()
          })
          .catch((error) => {
            console.log(error)
          })
      } else {
        updateNotice(this.form)
          .then((response) => {
            this.$message({
              showClose: true,
              message: '修改成功',
              type: 'success'
            })
            this.dialogFormVisible = false
            this.load()
          })
          .catch((error) => {
            console.log(error)
          })
      }
    },
    async handleEdit(_, { id }) {
      const { code, data } = await getNoticeDetail({ id })
      if (+code === 0 || +code === 200) {
        for (const key in data) {
          this.form[key] = data[key]
        }
        this.radio = 2

        /** wait for set data */
        setTimeout(() => this.dialogFormVisible = true, 0)
      }
    },
    // 加载
    load() {
      this.loading = true

      const { time } = this.queryParams
      const formData = { ...this.queryParams, time: undefined, startTime: time ? time[0] : '', endTime: time ? time[1] : '' }

      listNotice(formData)
        .then((response) => {
          if (response.code == 200) {
            this.tableData = response.rows
            this.total = response.total
          } else {
            this.tableData = []
            this.total = 0
            this.msgError(response.msg)
          }
          this.loading = false
        })
        .catch((error) => {
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
    watchForm() {
      this.$watch('form.type', (type) => {
        if (type === 0) this.form.contentType = 3
        else if (type === 1) this.form.contentType = 1
      })
      this.$watch('form.contentType', () => {
        if (this.dialogFormVisible) {
          this.form.info.forEach(infoItem => infoItem.content = '')
        }
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
