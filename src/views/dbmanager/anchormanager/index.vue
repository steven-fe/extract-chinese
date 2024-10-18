<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="主播昵称" prop="nickname">
        <el-input v-model="queryParams.nickname" size="mini" clearable />
      </el-form-item>
      <el-form-item label="UID" prop="uid">
        <el-input v-model="queryParams.uid" size="mini" clearable />
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="state">
        <el-select v-model="queryParams.state" clearable size="mini">
          <el-option :key="-1" :label="$t('common.all')" value="" />
          <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >查询</el-button>
        <el-button
          type="primary"
          size="mini"
          @click="handleAdd"
        >添加</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      :data="dataList"
      border
    >
      <el-table-column
        :label="$t('common.operation')"
        align="center"
        width="400"
      >
        <template slot-scope="scope">
          <el-button v-if="scope.row.state === 1" size="mini" type="danger" @click="handleState(scope.row)">禁用</el-button>
          <el-button v-if="scope.row.state === 0" size="mini" type="success" @click="handleState(scope.row)">启用</el-button>
          <el-button size="mini" type="primary" @click="handleEdit(scope.row)">修改</el-button>
          <el-button size="mini" type="primary" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="UID"
        align="center"
        prop="strUid"
      />
      <el-table-column
        label="昵称"
        align="center"
        prop="nikeName"
      />
      <el-table-column
        label="头像"
        align="center"
        prop="headerUrl"
      >
        <template slot-scope="scope">
          <img :src="scope.row.headerUrl" alt="" style="width:100px">
        </template>
      </el-table-column>
      <el-table-column
        label="当前状态"
        align="center"
        prop="state"
        width="150"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.state === 0">禁用中</span>
          <span v-if="scope.row.state === 1">启用中</span>
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

    <!-- 修改主播弹窗 -->
    <el-dialog
      title="主播信息"
      :visible.sync="open"
      :close-on-click-modal="false"
      width="550px"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="主播UID:">
          <el-input v-model="editForm.strUid" clearable placeholder="请输入主播UID" :disabled="disabledInput" />
        </el-form-item>
        <el-form-item label="主播昵称:">
          <el-input v-model="editForm.nikeName" clearable placeholder="请输入主播昵称" />
        </el-form-item>
        <el-form-item label="主播头像:">
          <el-upload
            class="upload-demo"
            action="#"
            :data="{property: `editForm.headerUrl`}"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
          >
            <el-input v-model="editForm.headerUrl" placeholder="点击上传主播头像" style="width: 405px" clearable />
          </el-upload>
          <span style="color:red">头像尺寸 100*100</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open=false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="handleSubmit">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
    <!-- 新增主播 -->
    <el-dialog
      title="主播信息"
      :visible.sync="open1"
      :close-on-click-modal="false"
      width="550px"
    >
      <el-form
        ref="editForm1"
        :model="editForm1"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="主播UID:">
          <el-input v-model="editForm1.uid" clearable placeholder="请输入主播UID" :disabled="disabledInput" />
        </el-form-item>
        <el-form-item label="主播昵称:">
          <el-input v-model="editForm1.nikeName" clearable placeholder="请输入主播昵称" />
        </el-form-item>
        <el-form-item label="主播头像:">
          <el-upload
            class="upload-demo"
            action="#"
            :data="{property: `editForm1.headerUrl`}"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload1"
          >
            <el-input v-model="editForm1.headerUrl" placeholder="点击上传主播头像" style="width: 405px" clearable />
          </el-upload>
          <span style="color:red">头像尺寸 100*100</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open1=false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="handleSubmit1">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { anchorList, Delete, operation, addAnchor, modifyAnchor } from '@/api/broadcast/anchor'
import { upload } from '@/api/indexImg'
export default {
  name: 'Anchormanager',
  data() {
    return {
      value: true,
      // 遮罩层
      loading: true,
      time: '',
      // 总条数
      total: 0,
      // 直播列表
      dataList: [],
      checkList1: [],
      checkList: ['en'],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        nickname: '',
        state: '',
        uid: ''
      },
      // 弹窗
      open: false,
      open1: false,
      disabledInput: false,
      status: '', // add 新增，update 修改
      editForm: {
        uid: '',
        nikeName: '',
        headerUrl: '',
        state: ''
      },
      editForm1: {
        uid: '',
        nikeName: '',
        headerUrl: '',
        state: ''
      },
      stateOptions: [
        {
          value: '0',
          label: '禁用中'
        },
        {
          value: '1',
          label: '启用中'
        }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 主播列表 */
    getList() {
      anchorList(this.queryParams).then(response => {
        this.dataList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 添加主播
    handleAdd() {
      this.open1 = true
      this.editForm1.uid = ''
      this.editForm1.nikeName = ''
      this.editForm1.headerUrl = ''
      this.editForm1.state = ''
      this.disabledInput = false
    },

    handleSubmit1() {
      const data = {
        uid: this.editForm1.uid,
        nikeName: this.editForm1.nikeName,
        headerUrl: this.editForm1.headerUrl,
        state: 1
      }
      addAnchor(data).then(response => {
        if (response.code === 200) {
          this.loading = true
          this.getList()
          this.msgSuccess('添加成功')
          this.open1 = false
          this.loading = false
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 修改
    handleEdit(row) {
      this.open = true
      this.editForm = Object.assign({}, row)
      this.disabledInput = true
    },
    handleSubmit() {
      const params = {
        id: this.editForm.id,
        nikeName: this.editForm.nikeName,
        headerUrl: this.editForm.headerUrl
      }
      modifyAnchor(params).then(response => {
        if (response.code === 200) {
          this.loading = true
          this.getList()
          this.msgSuccess('修改成功')
          this.open = false
          this.loading = false
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 图片上传
    upload(data) {
      if (data.file.size > 500 * 1024) {
        this.$message.warning('图片大小不能超过500k')
        return
      }
      upload({ file: data.file }).then(res => {
        if (res.code === 200) {
          this.editForm.headerUrl = res.data.fullPath
          this.$message.success(this.$t('common.uploadSucceeded'))
        }
      })
    },
    upload1(data) {
      if (data.file.size > 500 * 1024) {
        this.$message.warning('图片大小不能超过500k')
        return
      }
      upload({ file: data.file }).then(res => {
        if (res.code === 200) {
          this.editForm1.headerUrl = res.data.fullPath
          this.$message.success(this.$t('common.uploadSucceeded'))
        }
      })
    },
    // 删除主播
    handleDelete(row) {
      Delete({ id: row.id }).then(response => {
        if (response.code === 200) {
          this.msgSuccess('删除成功')
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 主播禁用/启用
    handleState(row) {
      operation({ id: row.id, state: row.state === 0 ? 1 : 0 }).then(response => {
        if (response.code === 200) {
          this.msgSuccess(this.$t('common.operationSucceed'))
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    }
  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" scoped>
.modify {
 ::v-deep .el-form-item__error {
  left: 110px;
 }
}
::v-deep {
  .el-button + .el-button {
    margin-left: 10px;
  }
  .el-dialog {
    display: flex;
    flex-direction: column;
    margin:0 !important;
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    .el-col {
      margin-right: 10px;
    }
    .el-form-item--medium .el-form-item__label {
      padding: 0;
    }
  }
  .el-form-item {
    margin: 0 15px 20px 0;
    .modify{
      font-size: 30px;
      font-weight: bold;
      text-align: center;
      display: block;
    }
  }
  .el-form-item__content {
    line-height: 30px;
  }
  .el-icon-circle-plus-outline{
    font-size: 50px;
    margin-top: 20px;
  }
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
