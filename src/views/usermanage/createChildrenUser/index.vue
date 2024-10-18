<template>
  <!-- 大额充提提醒设置 -->
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="searchForm" label-width="80px">
      <!--      <el-form-item prop="type">-->
      <!--        <el-select v-model="searchForm.type" size="mini" style="width: 100px">-->
      <!--          <el-option-->
      <!--            v-for="item in typeList"-->
      <!--            :key="item.value"-->
      <!--            :label="item.label"-->
      <!--            :value="item.value"-->
      <!--          />-->
      <!--        </el-select>-->
      <!--      </el-form-item>-->
      <el-form-item :label="$t('dwmanager.userUID')" prop="account">
        <el-input v-model="searchForm.account" placeholder="" clearable size="mini" />
      </el-form-item>
      <el-form-item label="权限状态:" prop="status">
        <el-select v-model="searchForm.status" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in states"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="权限添加时间:" prop="parentId" label-width="120px">
        <el-date-picker
          v-model="datePicker"
          size="mini"
          type="datetimerange"
          value-format="timestamp"
          :range-separator="$t('common.toTime')"
          :start-placeholder="$t('common.startTime')"
          :end-placeholder="$t('common.endTime')"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
      </el-form-item>
    </el-form>

    <el-button type="primary" size="mini" icon="el-icon-plus" @click="add('add', '添加创建子账号权限')">添加权限</el-button>

    <el-table ref="table" :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="userId" label="UserId" align="center" />
      <el-table-column prop="uid" :label="$t('dwmanager.userUID')" align="center" width="160" />
      <el-table-column prop="email" label="邮箱" align="center" width="160" />
      <el-table-column prop="phone" label="手机号" align="center" />
      <el-table-column prop="name" label="姓名" align="center" />
      <!--      0:做市商 1:机构 2:其他-->
      <el-table-column prop="type" label="开通原因" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.type === 0">做市商</span>
          <span v-if="scope.row.type === 1">机构</span>
          <span v-if="scope.row.type === 2">
            <el-tooltip class="item" effect="dark" :content="scope.row.reason" placement="top">
              <div class="icon-item">
                <span style="border-bottom: 1px dashed black;">其他</span>
              </div>
            </el-tooltip>
          </span>
        </template>
      </el-table-column>

      <el-table-column prop="createdSubUserCount" label="已创建子账号数" align="center" width="100" />
      <el-table-column prop="createdSubUserMaxCount" label="可创建子账号数" align="center" width="200">
        <template slot-scope="scope">
          <span v-if="!scope.row.isEdit">
            {{ scope.row.createdSubUserMaxCount }}
            <i class="el-icon-edit" style="cursor: pointer" @click="beforeUpdateCount(scope.row)" />
          </span>
          <span v-if="scope.row.isEdit">
            <el-input v-model="scope.row.count" placeholder="" style="width: 100px" />
            <i class="el-icon-check" style="cursor: pointer" @click="updateCount(scope.row)" />
          </span>
        </template>
      </el-table-column>
      <!--      0:关闭 1:正常-->
      <el-table-column prop="status" label="权限状态" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.status === 0 ? '已关闭' : '已开启' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="开通时间" align="center" width="160">
        <template slot-scope="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="createUserName" label="开通人员" align="center" />
      <el-table-column prop="showPrecision" :label="$t('common.operation')" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="updateStatus(scope.row)">{{ scope.row.status === 1 ? '关闭' : '开启' }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="searchForm.pageNum"
        :limit.sync="searchForm.pageSize"
        @pagination="search"
      />
    </div>
    <el-dialog :title="dialogTitle" :visible.sync="dialogStatus" width="600px" :close-on-click-modal="false" @closed="cancel">
      <el-radio-group v-model="radio" @input="handleSelsct">
        <el-radio-button :label="1">手动添加</el-radio-button>
        <el-radio-button :label="2">批量添加</el-radio-button>
      </el-radio-group>
      <div v-if="radio === 2" class="batch-freeze">
        <div class="title">批量导入用户: 一次性最多开通200个用户，每个用户100个子账号</div>
        <el-upload
          ref="upload"
          action="#"
          :on-change="handleChange"
          :show-file-list="false"
          accept=".xlsx"
          :auto-upload="false"
          class="upload-demo"
        >
          <el-button type="primary" @click="down">{{$t('frozen.downloadTemplate')}}</el-button>
          <el-button type="primary">{{$t('frozen.uploadExcel')}}Excel</el-button>
          <span style="font-size: 14px; color: #999; margin: 0 30px 0 10px;">{{ uploadParams.fileName }}</span>
        </el-upload>
        <div class="import">
          <el-button type="primary" @click="uploadfile">{{$t('financemanager.confirmImport')}}</el-button>
        </div>
      </div>
      <el-form v-if="radio === 1" ref="digform" :model="digform" :rules="rules" class="form-grid" label-width="140px" label-position="top">
        <el-form-item class="grid-item" label="开通用户:" prop="uid">
          <el-input v-model="digform.uid" placeholder="请输入uid，一次仅能开通一个" />
        </el-form-item>

        <el-form-item class="grid-item" label="可创建子账号数量:" prop="count">
          <span style="color: red">允许创建的子账号数量为1-100个</span>
          <el-input v-model="digform.count" placeholder="允许创建的子账号数量为1-100个" clearable />
        </el-form-item>

        <el-form-item class="grid-item" label="开通原因:" prop="type">
          <el-select v-model="digform.type" size="small" :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in userTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="digform.type === 2" class="grid-item" label="" prop="reason">
          <el-input v-model="digform.reason" maxlength="200" type="textarea" :rows="3" placeholder="请输入其他原因" clearable />
        </el-form-item>

      </el-form>
      <div v-if="radio === 1" slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button size="mini" type="primary" @click="save">保 存</el-button>
      </div>
    </el-dialog>
    <el-dialog title="上传结果" :visible.sync="visible" width="500px" top="5vh">
      <div> {{ `本次导入数据：${uploadResult.totalNum}条，成功${uploadResult.successNum}条，失败${uploadResult.failNum}条` }} </div>
      <div v-if="uploadResult.failNum > 0" class="exportdata" @click="download(uploadResult.failExcel)">导出本批次失败数据</div>
    </el-dialog>
  </div>
</template>
<script>
import * as API from '@/api/createChildrenUser'
// import {mapState, mapGetters, mapActions} from 'vuex'
// import { listCoinGoods } from '@/api/contract/coin'
var checkNum = (rule, value, callback) => {
  var reg = /^[1-9]\d*$/
  if (value) {
    if (!reg.test(value) || +value < 1 || +value > 100) {
      callback(new Error('必须是1-100正整数'))
    } else {
      callback()
    }
  }
}
export default {
  name: 'LabelClass',
  data() {
    return {
      total: 0,
      states: [
        { label: this.$t('common.all'), value: '' },
        { label: '已开启', value: 1 },
        { label: '已关闭', value: 0 }
      ],
      // typeList: [
      //   { value: 1, label: '用户UID' },
      //   { value: 2, label: 'userId' }
      // ],
      searchForm: {
        type: 1, // 1:用户uid  2:userId  默认1
        account: undefined, // 当 type为1 时表示 用户uid，当他type为2时，表示 邮箱，当type为3时，表示手机号
        status: '', // 主账户创建子账号权限状态 0:关闭 1:正常
        startTime: undefined,
        endTime: undefined,
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      dialogTitle: '',
      dialogStatus: false,
      status: '', // add新增，update修改
      radio: 1,
      userTypes: [
        { label: '做市商', value: 0 },
        { label: '机构用户', value: 1 },
        { label: '其他', value: 2 }
      ],
      digform: {
        uid: '',
        type: '', // 0:做市商 1:机构用户 2:其他
        reason: '', // 类型为 2其他时，此处不为空
        count: '' // 可创建子账号数量
      },
      uploadParams: {
        file: '',
        fileName: ''
      },
      visible: false,
      uploadResult: {
        totalNum: '',
        successNum: '',
        failNum: '',
        failExcel: ''
      },
      updateCountParams: {
        userId: '',
        count: '',
        isEdit: false
      }
    }
  },
  computed: {
    datePicker: {
      get() {
        return [this.searchForm.startTime, this.searchForm.endTime]
      },
      set(val) {
        this.searchForm.startTime = val ? val[0] : undefined
        this.searchForm.endTime = val ? val[1] : undefined
      }
    },
    rules() {
      const rule = {
        userId: [
          { required: true, message: '请输入用户UID', trigger: 'blur' }
        ],
        count: [
          { required: true, message: '请输入可创建子账号数量', trigger: 'blur' },
          { required: true, validator: checkNum, trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择开通原因', trigger: 'change' }
        ]
      }
      if (this.digform.type === 2) {
        rule.reason = [
          { required: true, message: this.$t('frozen.notIsData'), trigger: 'blur' }
        ]
      }
      return rule
    }
  },
  mounted() {
    this.search()
  },
  methods: {
    search() {
      API.list(this.searchForm).then(res => {
        this.tableData = res.rows
        this.total = res.total
      })
    },
    handleQuery() {
      this.searchForm.pageNum = 1
      this.search()
    },
    cancel() {
      if (this.radio === 1) {
        this.$refs['digform'].resetFields()
        this.digform.reason = ''
      } else {
        this.uploadParams.fileName = ''
        this.uploadParams.file = ''
      }
      this.dialogStatus = false
    },
    handleSelsct(val) {
      this.radio = val
      if (val === 1) {
        this.uploadParams.fileName = ''
        this.uploadParams.file = ''
      } else {
        this.digform.userId = ''
        this.digform.count = ''
        this.digform.type = ''
        this.digform.reason = ''
      }
    },
    down() {
      window.open('https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/batchOpenCreateSubUserTemplate.xlsx')
    },
    // 文件选择
    handleChange(file) {
      this.uploadParams.file = file.raw
      this.uploadParams.fileName = `${file.name}`
    },
    // 批量上传
    uploadfile() {
      if (!this.uploadParams.file) {
        this.$message({ type: 'error', message: '请上传批量添加文件' })
        return
      }
      this.$confirm('确定要导入吗?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        API.uploadfile(this.uploadParams).then(res => {
          this.uploadParams.file = ''
          this.uploadParams.fileName = this.$t('financemanager.unselectedFile')
          this.$message({ type: 'success', message: this.$t('common.uploadSucceeded') })
          this.dialogStatus = false
          this.visible = true
          this.uploadResult = res.data
        })
      }).catch(e => {
        this.$message({ type: 'info', message: '取消导入' })
      })
    },
    add(status, dialogTitle) {
      this.radio = 1
      this.dialogStatus = true
      this.status = status
      this.dialogTitle = dialogTitle
      this.disabledInput = false
    },
    modify(row, status, dialogTitle) {
      this.dialogStatus = true
      Object.keys(this.digform).forEach(item => {
        this.digform[item] = row[item]
      })
      console.log('编辑', this.digform, row)
      this.status = status
      this.dialogTitle = dialogTitle
      this.disabledInput = true
    },
    save() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          if (this.status === 'add') {
            API.add(this.digform).then(res => {
              this.msgSuccess('添加成功')
              this.cancel()
              this.search()
            })
          } else {
            API.update(this.digform).then(res => {
              this.msgSuccess('修改成功')
              this.cancel()
              this.search()
            })
          }
        }
      })
    },
    updateStatus(row) {
      this.$confirm(`确认${row.status === 1 ? '关闭' : '开启'}子账号权限? UID: ${row.uid}`, this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        API.updateStatus({ userId: row.userId, status: row.status === 1 ? 0 : 1 }).then(res => {
          this.$message({ type: 'success', message: '更新成功' })
          this.search()
        })
      }).catch(e => {
        this.$message({ type: 'info', message: '已取消' })
      })
    },
    beforeUpdateCount(row) {
      this.$set(row, 'isEdit', true)
      this.$set(row, 'count', row.createdSubUserMaxCount)
    },
    updateCount(row) {
      // [1,100], 不能低于已创建
      var reg = /^[1-9]\d*$/
      if (row.count && !reg.test(row.count) || +row.count < 1 || +row.count > 100) {
        this.$message({ type: 'warning', message: '数值区间1~100' })
        return
      }
      if (row.count < row.createdSubUserCount) {
        this.$message({ type: 'warning', message: '不能低于已创建数量' })
        return
      }
      API.updateCount({ userId: row.userId, count: row.count }).then(res => {
        this.$message({ type: 'success', message: '更新成功' })
        row.isEdit = false
        this.search()
      })
    }
  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
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
  margin-top: 30px;
}
.demo-ruleForm {
  .el-form-item {
    //float: left;
  }
}
.batch-freeze {
  display: flex;
  flex-direction: column;
  margin-top: 30px;
  .title {
    margin-bottom: 20px;
    font-size: 16px;
  }
  .text {
    margin-left: 10px;
    margin-right: 30px;
  }
  .import {
    margin-top: 20px;
  }
}
.exportdata {
  margin-top: 20px;
  color: #1c84c6;
  cursor: pointer;
}
</style>
