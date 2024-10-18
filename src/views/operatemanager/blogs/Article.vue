<template>
  <!-- 大额充提提醒设置 -->
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="searchForm" label-width="80px">
      <el-form-item label="分组:" prop="groupId">
        <el-select v-model="searchForm.groupId" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in groupList"
            :key="item.id"
            :label="item.defaultName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="文章标题:" prop="title">
        <el-input v-model="searchForm.title" placeholder="" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="search">{{$t('common.search')}}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="add">添加</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="table" :data="tableData" border style="width: 100%" class="table cabin-table">
      <!--      abstractInfo: "文章"-->
      <!--      author: null-->
      <!--      baseId: 1-->
      <!--      content: null-->
      <!--      createdAt: null-->
      <!--      createdBy: null-->
      <!--      groupId: 1-->
      <!--      groupName: "one1"-->
      <!--      id: 1-->
      <!--      keyword: "文章"-->
      <!--      languageCode: "zh_CN"-->
      <!--      pageNum: null-->
      <!--      pageSize: null-->
      <!--      picked: null-->
      <!--      picture: "文章"-->
      <!--      publishAt: null-->
      <!--      state: null-->
      <!--      title: "好文章"-->
      <!--      updatedAt: null-->
      <!--      updatedBy: null-->
      <!--      viewCount: null-->
      <!--      weight: null-->
      <el-table-column prop="showPrecision" :label="$t('common.operation')" align="center" width="350">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="modify(scope.row)">修改</el-button>
          <el-button type="primary" size="mini" @click="publish(scope.row)">{{ scope.row.state === 1 ? '下线' : '发布' }}</el-button>
          <el-button type="primary" size="mini" @click="picked(scope.row)">{{ scope.row.picked === 1 ? '取消精选' : '精选' }}</el-button>
          <el-button type="primary" size="mini" @click="deleted(scope.row)">删除</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="序号" align="center" />
      <el-table-column prop="groupName" label="分组名称" align="center" />
      <el-table-column prop="picture" label="封面图" align="center" width="150">
        <template slot-scope="scope">
          <img :src="scope.row.picture" alt="" width="100">
        </template>
      </el-table-column>
      <el-table-column prop="title" label="文章标题" align="center" />
      <el-table-column prop="keyword" label="文章标签" align="center" />
      <el-table-column prop="abstractInfo" label="摘要" align="center" />
      <el-table-column prop="languageCode" label="语种" align="center" />
      <el-table-column prop="createdAt" label="文章创建时间" align="center">
        <template slot-scope="scope">{{ scope.row.createdAt | timeFormat }}</template>
      </el-table-column>
      <el-table-column prop="publishAt" label="文章发布时间" align="center">
        <template slot-scope="scope">{{ scope.row.publishAt | timeFormat }}</template>
      </el-table-column>
      <el-table-column prop="viewCount" label="总阅读量" align="center" />
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > searchForm.pageSize"
        :total="total"
        :page.sync="searchForm.pageNum"
        :limit.sync="searchForm.pageSize"
        @pagination="pageChange"
      />
    </div>
    <el-dialog :title="dialogTitle" :visible.sync="dialogStatus" width="1000px" :before-close="cancel" :close-on-click-modal="false">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        class="form-grid"
        label-width="100px"
      >
        <el-form-item class="grid-item" label="分组:" prop="groupId">
          <el-select v-model="digform.groupId" size="small" :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in groupList"
              :key="item.id"
              :label="item.defaultName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="grid-item" label="作者:" prop="author">
          <el-input v-model="digform.author" placeholder="" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="关键词:" prop="keyword">
          <el-input v-model="digform.keyword" placeholder="" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="封面:" prop="picture">
          <el-upload
            class="upload-demo"
            action="#"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
          >
            <el-input v-model="digform.picture" placeholder="点击上传封面" style="width: 600px" clearable />
          </el-upload>
        </el-form-item>
        <el-form-item class="grid-item" label="首页展示:" prop="indexShow">
          <el-select v-model="digform.indexShow" size="small" :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in isHomeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-tabs v-model="activeName">
          <el-tab-pane v-for="(item, index) of languageListSort" :key="index" :label="item.language" :name="item.key">
            <el-form-item class="grid-item" label="标题:" :prop="`title.${item.key}`">
              <el-input v-model="digform.title[item.key]" placeholder="" clearable />
            </el-form-item>
            <el-form-item class="grid-item" label="摘要:" :prop="`abstractInfo.${item.key}`">
              <el-input v-model="digform.abstractInfo[item.key]" placeholder="" clearable />
            </el-form-item>
            <el-form-item class="grid-item" label="正文:" :prop="`content.${item.key}`">
              <editor-bar v-model="digform.content[item.key]" />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button size="mini" type="primary" @click="save">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import * as API from '@/api/blogs'
import { listConfig } from '@/api/system/languageconfig'
import EditorBar from '@/components/wangEnduit'
import { upload } from '@/api/indexImg'

export default {
  name: 'LabelClass',
  components: {
    EditorBar
  },
  data() {
    return {
      activeName: 'en_US',
      disabledInput: false,
      total: 0,
      isHomeOptions: [
        { label: '否', value: 0 },
        { label: '是', value: 1 }
      ],
      searchForm: {
        groupId: undefined,
        title: undefined,
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      dialogStatus: false,
      dialogTitle: '',
      status: '', // addParentLabel新增，updateParentLabel修改, addLabel新增客户标签, updateLabel修改客户标签
      digform: {
        groupId: '',
        state: 2,
        author: '',
        keyword: '',
        picture: '',
        indexShow: 0,
        title: { en_US: '' },
        abstractInfo: { en_US: '' },
        content: { en_US: '' }
      },
      rules: {
        author: [
          { required: true, message: this.$t('frozen.notIsData'), trigger: 'blur' }
        ],
        keyword: [
          { required: true, message: this.$t('frozen.notIsData'), trigger: 'blur' }
        ],
        picture: [
          { required: true, message: this.$t('frozen.notIsData'), trigger: 'blur' }
        ],
        indexShow: [
          { required: true, message: this.$t('frozen.notIsData'), trigger: 'blur' }
        ],
        'title.en_US': [
          { required: true, message: this.$t('frozen.notIsData'), trigger: 'blur' }
        ],
        'abstractInfo.en_US': [
          { required: true, message: this.$t('frozen.notIsData'), trigger: 'blur' }
        ],
        'content.en_US': [
          { required: true, message: this.$t('frozen.notIsData'), trigger: 'blur' }
        ]
      },
      parentLabelData: [],
      labelName: '', // dialog名称
      groupList: [],
      languageOptions: []
    }
  },
  computed: {
    languageListSort() {
      const list = [...this.languageOptions]
      const index = list.findIndex(item => item.key === 'en_US')
      if (index > -1) {
        const obj = list.splice(index, 1)
        list.unshift(...obj)
      }
      return list
    }
  },
  mounted() {
    this.search()
    this.getGroupList()
    this.getLanguageselect()
  },
  methods: {
    /** 语言下拉结构 */
    getLanguageselect() {
      listConfig().then(response => {
        this.languageOptions = response.rows.filter(item => item.isOpen === 1)
      })
    },
    getGroupList() {
      API.getGroupList().then(res => {
        if (res.code === 200) {
          this.groupList = res.data
          this.digform.groupId = this.groupList[0].id
        }
      })
    },
    search() {
      Object.keys(this.searchForm).forEach(item => {
        if (!this.searchForm[item]) this.searchForm[item] = undefined
      })
      API.articleList(this.searchForm).then(res => {
        console.log('获取列表', res)
        if (res.code === 200) {
          this.tableData = res.rows
          this.total = res.total
        }
      })
    },
    pageChange(page) {
      console.log('当前页码', page)
      this.searchForm.pageNum = page.page
      this.search()
    },
    cancel() {
      this.dialogStatus = false
      this.$refs['digform'].resetFields()
    },
    modify(row) {
      this.dialogStatus = true
      this.dialogTitle = '修改'
      // 查询详情接口
      API.articleDetail({ baseId: row.baseId }).then(res => {
        if (res.code === 200) {
          this.digform = { ...res.data }
          res.data.contentList.forEach(item => {
            Object.keys(item).forEach(el => {
              // console.log('this.digform[el]', this.digform[el], item, el)
              if (el === 'title' || el === 'abstractInfo' || el === 'content' || el === 'id') {
                if (el === 'id') {
                  if (!this.digform.baseId) this.$set(this.digform, 'baseId', {})
                  this.$set(this.digform.baseId, item.languageCode, item[el])
                } else {
                  if (!this.digform[el]) this.$set(this.digform, el, {})
                  this.$set(this.digform[el], item.languageCode, item[el])
                }
              }
            })
          })
          Object.keys(this.digform).forEach(item => {
            if (!this.digform[item] && this.digform[item] !== 0) delete this.digform[item]
          })
          delete this.digform.contentList
        }
      })
    },
    add() {
      this.dialogStatus = true
      this.dialogTitle = '新增'
      // this.digform = this.$options.data().digform
    },
    save() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          const params = { contentList: [] }
          Object.keys(this.digform).forEach(item => {
            const obj = this.digform[item]
            if (typeof obj === 'object') {
              Object.keys(obj).forEach((el, index) => {
                if (params.contentList[index]) {
                  params.contentList[index][item === 'baseId' ? 'id' : item] = obj[el]
                } else {
                  let temp = { [item === 'baseId' ? 'id' : item]: obj[el], languageCode: el, groupId: this.digform.groupId }
                  temp = { ...temp, keyword: this.digform.keyword, picture: this.digform.picture, author: this.digform.author }
                  params.contentList.push(temp)
                }
              })
            } else {
              params[item] = obj
            }
          })
          params.languageCode = params.contentList.map(item => item.languageCode).join(',')
          params.contentList = params.contentList.filter(item => item.content)
          if (this.dialogTitle === '新增') {
            API.articleAdd(params).then(res => {
              if (res.code == 200) {
                this.msgSuccess('保存成功')
                this.cancel()
                this.search()
                this.dialogStatus = false
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            API.articleUpdate(params).then(res => {
              if (res.code == 200) {
                this.msgSuccess('保存成功')
                this.cancel()
                this.search()
                this.dialogStatus = false
              } else {
                this.msgError(response.msg)
              }
            })
          }
        } else {
          this.activeName = 'en_US'
        }
      })
    },
    deleted(row) {
      this.$confirm('确认删除？', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        API.articleDel({ id: row.baseId }).then(res => {
          if (res.code === 200) {
            this.msgSuccess('删除成功')
            this.search()
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消删除'
        })
      })
    },
    publish(row) {
      API.articlePublish({ id: row.baseId, state: row.state === 1 ? 2 : 1 }).then(res => {
        if (res.code === 200) {
          this.msgSuccess(row.state === 1 ? '下线成功' : '发布成功')
          this.search()
        }
      })
    },
    picked(row) {
      API.articleSetPicked({ id: row.baseId, picked: row.picked === 1 ? 0 : 1 }).then(res => {
        if (res.code === 200) {
          this.msgSuccess(row.picked === 1 ? '取消精选成功' : '设为精选成功')
          this.search()
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
          this.digform.picture = res.data.fullPath
          this.$message.success(this.$t('common.uploadSucceeded'))
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.table {
  margin-top: 20px;
}
.form-grid {
  //display: grid;
  //grid-template-columns: 50% 50%;
  //margin-left: 5%;
  //.grid-item {
  //  width: 90%;
  //}
}
.demo-ruleForm {
  .el-form-item {
    float: left;
  }
}
</style>
