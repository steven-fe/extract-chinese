<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="审核状态" prop="itemStatus">
        <el-select v-model="queryParams.itemStatus" placeholder="请选择状态" size="mini">
          <el-option :label="$t('common.all')" :value="undefined" />
          <el-option label="待审核" :value="1" />
          <el-option label="审核通过" :value="2" />
          <el-option label="审核拒绝" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="申请类型" prop="itemType">
        <el-select v-model="queryParams.itemType" placeholder="请选择申请类型" size="mini">
          <el-option :label="$t('common.all')" :value="undefined" />
          <el-option label="修改手机号" :value="1" />
          <el-option label="修改邮箱" :value="2" />
          <el-option label="解绑手机号" :value="5" />
          <el-option label="解绑邮箱" :value="7" />
          <el-option label="绑定手机号" :value="4" />
          <el-option label="绑定邮箱" :value="6" />
          <el-option label="谷歌验证" :value="3" />
        </el-select>
      </el-form-item>

      <el-form-item label="申请时间" prop="time">
        <el-date-picker
          v-model="time"
          size="mini"
          type="datetimerange"
          :range-separator="$t('common.toTime')"
          :start-placeholder="$t('common.startTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item label="用户账号" prop="uid">
        <el-input
          v-model="queryParams.uid"
          placeholder="请输入用户账号"
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

    <el-table v-loading="loading" :data="userCheckList" border>
      <el-table-column :label="$t('common.operation')" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.itemStatus===1"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >审核</el-button>
          <span v-if="scope.row.itemStatus === 2 || scope.row.itemStatus === 3">已审核</span>
        </template>
      </el-table-column>
      <el-table-column type="index" label="序号" :index="indexMethod" />
      <el-table-column label="申请时间" align="center" prop="created" />
      <el-table-column label="申请类型" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.itemType == 1">修改手机号</span>
          <span v-if="scope.row.itemType == 2">修改邮箱</span>
          <span v-if="scope.row.itemType == 3">重置谷歌认证</span>
          <span v-if="scope.row.itemType == 4">绑定手机号</span>
          <span v-if="scope.row.itemType == 5">解绑手机号</span>
          <span v-if="scope.row.itemType == 6">绑定邮箱</span>
          <span v-if="scope.row.itemType == 7">解绑邮箱</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('dwmanager.userUID')">
        <template slot-scope="scope">
          <span v-if="scope.row.uid">
            <el-link
              type="primary"
              :underline="false"
              @click="toUserInfo(scope.row)"
            >{{ scope.row.uid }}</el-link>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="原内容" align="center" prop="oldItem">
        <template slot-scope="scope">
          <span>{{ parseStr(scope.row.oldItem) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="新内容" align="center">
        <template slot-scope="scope">
          <span>{{ parseStr(scope.row.newItem) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请人" align="center" prop="applyUid" />
      <el-table-column label="申请备注" align="center">
        <template slot-scope="scope">
          <span>{{ parseStr(scope.row.applyRemark) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核人" align="center">
        <template slot-scope="scope">
          <span>{{ parseStr(scope.row.approveUid) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核备注" align="center">
        <template slot-scope="scope">
          <span>{{ parseStr(scope.row.approveRemark) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.status')" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.itemStatus == 1">待审核</span>
          <span v-if="scope.row.itemStatus == 2">审核通过</span>
          <span v-if="scope.row.itemStatus == 3">审核拒绝</span>
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

    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog title="审核" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户ID" prop="uid">
          <el-input v-model="form.uid" disabled placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="原内容" prop="oldItem">
          <el-input v-model="form.oldItem" disabled placeholder="请输入原内容" />
        </el-form-item>
        <el-form-item label="新内容" prop="newItem">
          <el-input v-model="form.newItem" disabled placeholder="请输入新内容" />
        </el-form-item>
        <el-form-item label="审核状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%;">
            <el-option label="审核通过" :value="2" />
            <el-option label="审核拒绝" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作备注" prop="approveRemark">
          <el-input v-model="form.approveRemark" type="textarea" :rows="5" placeholder="请输入操作备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :disabled="disabledSubmit" @click="submitForm">{{$t('common.sure')}}</el-button>
        <el-button @click="cancel">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listUserCheck,
  getUserCheck,
  approveUserCheck,
  exportUserCheck
} from '@/api/usercheck'
import { userInfo } from '@/api/user'

export default {
  name: 'User',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      disabledSubmit: false,
      // 【请填写功能名称】表格数据
      userCheckList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      time: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        uid: undefined,
        itemType: undefined,
        itemStatus: 1,
        beginTime: undefined,
        endTime: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        userId: [
          { required: true, message: '用户ID不能为空', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '审核状态不能为空', trigger: 'blur' }
        ],
        itemStatus: [
          {
            required: true,
            message: '审核状态不能为空',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询【请填写功能名称】列表 */
    getList() {
      this.loading = true
      this.queryParams.beginTime = (this.time && this.time[0]) || undefined
      this.queryParams.endTime = (this.time && this.time[1]) || undefined
      listUserCheck(this.queryParams).then((response) => {
        this.userCheckList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 详情跳转
    toUserInfo(row) {
      // 后端返回数据 UID、 userId返回值相反，故存储取反纠正过来
      sessionStorage.setItem('uid', row.uid)
      sessionStorage.setItem('userId', row.userId)
      this.$router.push({ name: 'lookInfo2' })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.time = undefined
      this.form = {
        id: undefined,
        userId: undefined,
        applyUid: undefined,
        approveUid: undefined,
        itemType: undefined,
        newItem: undefined,
        oldItem: undefined,
        itemStatus: undefined,
        applyRemark: undefined,
        approveRemark: undefined,
        created: undefined,
        updated: undefined,
        status: 2
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
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id
      this.disabledSubmit = false
      getUserCheck(id).then((response) => {
        this.open = true
        // this.form = response.data;
        this.form.status = 2
        this.form.uid = response.data.uid
        this.form.id = response.data.id
        this.form.oldItem = response.data.oldItem
        this.form.newItem = response.data.newItem
        this.form.userId = response.data.userId
        this.form.itemType = response.data.itemType
        this.form.approveRemark = response.data.approveRemark
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(async(valid) => {
        if (valid) {
          if (this.form.id != undefined) {
            const data = {
              id: this.form.id,
              userId: this.form.userId,
              itemType: this.form.itemType,
              itemStatus: this.form.status,
              oldItem: this.form.oldItem,
              newItem: this.form.newItem,
              approveRemark: this.form.approveRemark
            }
            this.disabledSubmit = true
            approveUserCheck(data).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.disabledSubmit = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    // 索引值
    indexMethod(index) {
      return (
        index + (this.queryParams.pageNum - 1) * this.queryParams.pageSize + 1
      )
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有【请填写功能名称】数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return exportUser(queryParams)
        })
        .then((response) => {
          this.download(response.msg)
        })
        .catch(function() {})
    }
  }
}
</script>
