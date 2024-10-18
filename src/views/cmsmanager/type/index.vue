<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="语言">
        <el-select v-model="queryParams.lang" placeholder="请选择语言" size="mini" clearable>
          <el-option
            v-for="item in languageOptions"
            :key="item.key"
            :label="item.language"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['coinbull:articleType:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="typeList" border>
      <el-table-column label="分类ID" align="center" prop="id" />
      <el-table-column label="上级分类" align="center" prop="parentName">
        <template slot-scope="scope">
          <span v-if="!scope.row.parentName">主类目</span>
          <span v-else>{{ scope.row.parentName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分类名称" align="center" prop="articleTypeName" />
      <el-table-column label="排序" align="center" prop="sortId" />
      <el-table-column :label="$t('common.operation')" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['coinbull:articleType:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['coinbull:articleType:remove']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
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

    <!-- 添加或修改CMS文章类别对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="articleTypeName">
          <el-input v-model="form.articleTypeName" placeholder="请输入分类名称" clearable />
        </el-form-item>
        <el-form-item label="排序序号" prop="sortId">
          <el-input v-model.number="form.sortId" placeholder="请输入排序序号" clearable />
        </el-form-item>
        <el-form-item label="语言" prop="lang">
          <el-select v-model="form.lang" placeholder="请选择语言" clearable @change="selectChanged">
            <el-option
              v-for="item in languageOptions"
              :key="item.key"
              :label="item.language"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="上级分类" prop="parentId">
          <treeselect
            v-model="form.parentId"
            :options="typeOptions"
            :show-count="true"
            placeholder="选择上级分类"
            clearable
          />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型" clearable>
            <el-option label="header" :value="1" />
            <el-option label="footer" :value="2" />
          </el-select>
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
  listType,
  getType,
  delType,
  addType,
  updateType,
  treeselect
} from '@/api/article/type'
import { listConfig } from '@/api/system/languageconfig'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import IconSelect from '@/components/IconSelect'

export default {
  name: 'Type',
  components: { Treeselect, IconSelect },
  data() {
    return {
      // 语言选项
      languageOptions: [],
      // 分类树选项
      typeOptions: [],
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // CMS文章类别表格数据
      typeList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        lang: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        articleTypeName: [
          { required: true, message: '分类名称不能为空', trigger: 'blur' }
        ],
        sortId: [
          { required: true, message: '排序序号不能为空', trigger: 'blur' },
          { type: 'number', message: '排序必须为数字' }
        ],
        lang: [{ required: true, message: '语言不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '类型不能为空', trigger: 'blur' }],
        parentId: [
          { required: true, message: '上级分类不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getLanguageselect()
  },
  methods: {
    /** 语言下拉结构 */
    getLanguageselect() {
      listConfig().then(response => {
        this.languageOptions = response.rows
      })
    },
    selectChanged: function() {
      const params = {
        lang: this.form.lang
      }
      /** 查询菜单下拉树结构 */
      treeselect(params).then(response => {
        this.typeOptions = []
        const type = { id: 0, label: '主类目', children: [] }
        type.children = response.data
        this.typeOptions.push(type)
      })
    },
    /** 查询CMS文章类别列表 */
    getList() {
      this.loading = true
      listType(this.queryParams).then(response => {
        this.typeList = response.rows
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
        parentId: undefined,
        articleTypeName: undefined,
        sortId: undefined,
        lang: undefined,
        type: undefined
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
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        lang: undefined
      }
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.typeOptions = []
      this.open = true
      this.title = '添加CMS文章类别'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getType(id).then(response => {
        this.form = response.data
        this.selectChanged()
        this.open = true
        this.title = '修改CMS文章类别'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateType(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addType(this.form).then(response => {
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
      this.$confirm(
        '是否确认删除CMS文章类别编号为"' + ids + '"的数据项?',
        this.$t('common.alert'),
        {
          confirmButtonText: this.$t('common.sure'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'warning'
        }
      )
        .then(function() {
          return delType(ids)
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
