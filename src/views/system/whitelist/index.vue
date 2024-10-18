<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="用户编号" prop="userNumber">
        <el-input v-model="queryParams.userNumber" size="mini" placeholder="请输入用户编号" clearable />
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="queryParams.userName" size="mini" placeholder="请输入用户名称" clearable />
      </el-form-item>
      <el-form-item label="白名单类型" prop="whitelistType">
        <el-select v-model="queryParams.whitelistType" clearable size="mini">
          <el-option :key="-1" :label="$t('common.all')" value="" />
          <el-option v-for="item in whitelistTypeOptions" :key="item.type" :label="item.desc" :value="item.type" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button type="primary" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" class="el-icon-plus" size="mini" @click="handleAdd">添加白名单</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border>
      <el-table-column :label="$t('common.operation')" align="center" width="200">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status === 1" size="mini" type="danger" @click="stateChange(scope.row.id, 0)">禁用</el-button>
          <el-button v-if="scope.row.status === 0" size="mini" type="success" @click="stateChange(scope.row.id, 1)">启用</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
      <el-table-column label="白名单类型" align="center" prop="whitelistName" />
      <el-table-column label="用户编号" align="center" prop="userNumber" />
      <el-table-column label="用户名称" align="center" prop="userName" />
      <el-table-column label="生效状态" align="center" prop="status">
        <template slot-scope="scope">
          <span v-if="scope.row.status === 0">已禁用</span>
          <span v-if="scope.row.status === 1">生效中</span>
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

    <el-dialog title="添加白名单" :visible.sync="dialogFormVisible" :close-on-click-modal="false" width="400px" @closed="formDialogClosed">
      <el-form ref="form" :model="form" label-position="top" :rules="rules">
        <el-form-item label="白名单类型" prop="whitelistType">
          <el-select v-model="form.whitelistType" placeholder="请选择白名单类型" clearable>
            <el-option v-for="item in whitelistTypeOptions" :key="item.type" :label="item.desc" :value="item.type" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户编号(同时添加多个，编号之间用英文逗号间隔;如果同时添加多个时有已存在的编号，则已存在的不会重复添加，剩余的可以正常添加)" prop="userNumbers">
          <el-input v-model="form.userNumbers" type="textarea" :rows="3" placeholder="请输入用户编号" onkeyup="this.value=this.value.replace(/[^\d\,]/g,'')" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="formDialogClosed">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" size="mini" @click="handleSure">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getWhiteList, createUserWhitelist, getWhiteTypeList, deleteWhitelist, updateState } from '@/api/system/whitelist'
export default {
  name: 'WhiteList',
  data() {
    return {
      total: 0,
      dataList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userNumber: '',
        userName: '',
        whitelistType: ''
      },
      whitelistTypeOptions: [],
      dialogFormVisible: false,
      form: {
        whitelistType: '',
        userNumbers: ''
      },
      rules: {
        whitelistType: [{ required: true, message: '请输入白名单类型', trigger: 'change' }],
        userNumbers: [{ required: true, message: '请输入用户编号', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getWhiteTypeList()
  },
  methods: {
    async getList() {
      const { rows, total } = await getWhiteList(this.queryParams)
      this.dataList = rows
      this.total = total
    },
    async getWhiteTypeList() {
      const { data } = await getWhiteTypeList()
      this.whitelistTypeOptions = data
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleAdd() {
      this.dialogFormVisible = true
    },
    handleDelete(id) {
      this.$confirm('确定删除, 是否继续?', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(() => {
          deleteWhitelist(id)
            .then(response => {
              this.$message({
                showClose: true,
                message: '删除成功',
                type: 'success'
              })
              this.getList()
            })
            .catch(_error => {
              this.$message({
                showClose: true,
                message: '删除失败',
                type: 'error'
              })
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    stateChange(id, state) {
      updateState(id, state).then(response => {
        if (+response.code === 200) {
          state === 1 ? this.msgSuccess('启用成功') : this.msgSuccess('禁用成功')
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    formDialogClosed() {
      this.$refs['form'].resetFields()
      this.dialogFormVisible = false
    },
    handleSure() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          createUserWhitelist(this.form).then(res => {
            if (res.code === 200) {
              this.msgSuccess('添加成功')
              this.dialogFormVisible = false
              this.getList()
            } else {
              this.msg(res.msg)
            }
          })
        }
      })
    }
  }
}
</script>
