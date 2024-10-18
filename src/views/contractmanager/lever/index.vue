<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="商品ID" prop="goodsId">
        <el-select v-model="queryParams.goodsId" size="mini" placeholder="请选择商品ID">
          <el-option
            v-for="(item, index) in goodsList"
            :key="index"
            :label="item.goodsId"
            :value="item.goodsId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="杠杆名称" prop="leverName">
        <el-input
          v-model="queryParams.leverName"
          placeholder="请输入杠杆名称"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="杠杆倍数" prop="lever">
        <el-input
          v-model="queryParams.lever"
          placeholder="请输入杠杆倍数"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
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
          v-hasPermi="['coinbull:contract:levAdd']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="leverList" border>
      <el-table-column label="商品ID" align="center" prop="goodsId" />
      <el-table-column label="杠杆名称" align="center" prop="leverName" />
      <el-table-column label="杠杆倍数" align="center" prop="lever" />
      <el-table-column label="开关" align="center" prop="status">
        <template slot-scope="scope">
          <span v-if="scope.row.status == 1">开</span>
          <span v-else>关</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="ctime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['coinbull:contract:levEdit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['coinbull:contract:levRemove']"
          >删除</el-button> -->
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

    <!-- 添加或修改产品杠杆配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="商品ID" prop="goodsId">
          <el-select v-model="form.goodsId" size="mini" placeholder="请选择商品ID">
            <el-option
              v-for="(item, index) in goodsList"
              :key="index"
              :label="item.goodsId"
              :value="item.goodsId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="杠杆名称" prop="leverName">
          <el-input v-model="form.leverName" placeholder="请输入杠杆名称" class="input-width" clearable />
        </el-form-item>
        <el-form-item label="杠杆倍数" prop="lever">
          <el-input v-model="form.lever" placeholder="请输入杠杆倍数" class="input-width" clearable />
        </el-form-item>
        <el-form-item label="开关">
          <el-radio-group v-model="form.status">
            <el-radio label="1">开</el-radio>
            <el-radio label="0">关</el-radio>
          </el-radio-group>
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
import { listLever, getLever, delLever, addLever, updateLever } from '@/api/contract/lever'
import { listGoods } from '@/api/contract/goods'

export default {
  name: 'ContractLever',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 产品杠杆配置表格数据
      leverList: [],
      // 弹出层标题
      title: '',
      goodsList: [],
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        goodsId: undefined,
        leverName: undefined,
        lever: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        goodsId: [
          { required: true, message: '商品ID不能为空', trigger: 'blur' }
        ],
        leverName: [
          { required: true, message: '杠杆名称不能为空', trigger: 'blur' }
        ],
        lever: [
          { required: true, message: '杠杆倍数不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getGoodsList()
  },
  methods: {
    /** 查询产品杠杆配置列表 */
    getList() {
      this.loading = true
      listLever(this.queryParams).then(response => {
        this.leverList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    getGoodsList() {
      this.loading = true
      listGoods().then(response => {
        if (response.code == 200) {
          this.goodsList = response.rows
          this.loading = false
        } else {
          this.msgError(response.msg)
        }
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
        goodsId: undefined,
        leverName: undefined,
        lever: undefined,
        status: '1'
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
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加产品杠杆配置'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getLever(id).then(response => {
        this.form = response.data
        this.form.status = response.data.status + ''
        this.open = true
        this.title = '修改产品杠杆配置'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateLever(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addLever(this.form).then(response => {
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
      this.$confirm('是否确认删除产品杠杆配置编号为"' + ids + '"的数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(function() {
        return delLever(ids)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    }
  }
}
</script>
<style scoped>
.input-width {
  width: 300px;
}
</style>
