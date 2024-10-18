<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="语言">
        <el-select
          v-model="queryParams.language"
          placeholder="请选择语言"
          size="mini"
          clearable
          @change="selectChanged"
        >
          <el-option
            v-for="item in languageOptions"
            :key="item.key"
            :label="item.language"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="文章分类">
        <el-select v-model="queryParams.articleTypeId" placeholder="请选择文章分类" size="mini" clearable>
          <el-option
            v-for="item in typeOptions"
            :key="item.id"
            :label="item.articleTypeName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="标题内容">
        <el-input v-model="queryParams.title" placeholder="请输入标题或内容" size="mini" clearable />
      </el-form-item>
      <el-form-item label="发布日期">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('common.startTime')"
          :range-separator="$t('common.toTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['coinbull:article:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['coinbull:article:remove']"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      :data="articleList"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="标题" align="center" prop="title" />
      <el-table-column label="分类" align="center" prop="articleTypeName" />
      <el-table-column label="发布者" align="center" prop="publisherId" />
      <el-table-column label="发布时间" align="center" prop="ctime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="排序" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.footerFlag=1">显示</span>
          <span v-if="scope.row.footerFlag=0">隐藏</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['coinbull:article:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改CMS文章对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" clearable />
        </el-form-item>
        <el-form-item label="URL名称" prop="fileName">
          <el-input v-model="form.fileName" placeholder="请输入URL名称" clearable />
        </el-form-item>
        <el-form-item label="语言" prop="lang">
          <el-select v-model="form.lang" placeholder="请选择语言" clearable @change="selSaveChanged">
            <el-option
              v-for="item in languageOptions"
              :key="item.key"
              :label="item.language"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model.number="form.sort" placeholder="请输入排序" clearable />
        </el-form-item>
        <el-form-item label="是否显示" prop="footerFlag">
          <el-radio v-model="form.footerFlag" :label="1">显示</el-radio>
          <el-radio v-model="form.footerFlag" :label="0">隐藏</el-radio>
        </el-form-item>
        <el-form-item label="文章分类" prop="articleTypeId">
          <treeselect
            v-model="form.articleTypeId"
            clearable
            :options="typeTreeOptions"
            :show-count="true"
            placeholder="请选择文章分类"
          />
        </el-form-item>
        <el-form-item label="文章内容" prop="content">
          <editor-bar v-model="form.content" :is-clear="isClear" />
        </el-form-item>
        <el-form-item label>
          <el-checkbox v-model="isNullContent">是否空内容</el-checkbox>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="submitForm">{{$t('common.sure')}}</el-button>
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listArticle,
  getArticle,
  delArticle,
  addArticle,
  updateArticle
} from '@/api/article/article'
import { listType, treeselect } from '@/api/article/type'
import { listConfig } from '@/api/system/languageconfig'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import IconSelect from '@/components/IconSelect'
import EditorBar from '@/components/wangEnduit'
export default {
  name: 'Article',
  components: { Treeselect, IconSelect, EditorBar },
  data() {
    var checkQuota = (rule, value, callback) => {
      if (value === 0) {
        callback(new Error('不能选择主目录'))
      } else {
        callback()
      }
    }
    return {
      // 语言选项
      languageOptions: [],
      // 文章分类选项
      typeOptions: [],
      // 分类树选项
      typeTreeOptions: [],
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      isNullContent: false,
      isClear: false,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // CMS文章表格数据
      articleList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      time: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        beginTime: (this.time && this.time[0]) || '',
        endTime: (this.time && this.time[1]) || '',
        articleTypeId: undefined,
        title: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        articleTypeId: [
          { required: true, message: '文章分类不能为空', trigger: 'blur' },
          { validator: checkQuota, trigger: 'blur' }
        ],
        title: [
          { required: true, message: '文章标题不能为空', trigger: 'blur' }
        ],
        footerFlag: [
          { required: true, message: '是否显示不能为空', trigger: 'blur' }
        ],
        // fileName: [
        //   { required: true, message: "URL名称不能为空", trigger: "blur" }
        // ],
        lang: [{ required: true, message: '语言不能为空', trigger: 'blur' }],
        sort: [
          { required: true, message: '排序不能为空', trigger: 'blur' },
          { type: 'number', message: '排序必须为数字' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getLanguageselect()
    this.getTypeselect()
  },
  methods: {
    /** 语言下拉结构 */
    getLanguageselect() {
      listConfig().then((response) => {
        this.languageOptions = response.rows
      })
    },
    selectChanged: function() {
      const params = {
        lang: this.queryParams.language
      }
      listType(params).then((response) => {
        this.typeOptions = response.rows
      })
    },
    selSaveChanged: function() {
      const params = {
        lang: this.form.lang
      }
      treeselect(params).then((response) => {
        this.typeTreeOptions = []
        const type = { id: 0, label: '主类目', children: [] }
        type.children = response.data
        this.typeTreeOptions.push(type)
      })
    },
    /** 文章分类下拉结构 */
    getTypeselect() {
      listType().then((response) => {
        this.typeOptions = response.rows
      })
    },
    /** 查询CMS文章列表 */
    getList() {
      this.loading = true
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      listArticle(this.queryParams).then((response) => {
        this.articleList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        articleTypeId: undefined,
        title: undefined,
        content: undefined,
        lang: undefined,
        fileName: undefined,
        sort: undefined,
        footerFlag: undefined
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.time = undefined
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        beginTime: (this.time && this.time[0]) || '',
        endTime: (this.time && this.time[1]) || '',
        language: undefined,
        articleTypeId: undefined,
        title: undefined
      }
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.isNullContent = false
      this.reset()
      this.typeTreeOptions = []
      this.open = true
      this.title = '添加CMS文章'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.isNullContent = false
      const id = row.id || this.ids
      getArticle(id).then((response) => {
        this.form = response.data
        this.selSaveChanged()
        this.open = true
        this.title = '修改CMS文章'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const data = { ...this.form }
          if (this.isNullContent) {
            data.content = ''
          }
          if (data.id != undefined) {
            updateArticle(data).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addArticle(data).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$confirm('是否确认删除CMS文章编号为"' + ids + '"的数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return delArticle(ids)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
        .catch(function() {})
    }
  }
}
</script>
