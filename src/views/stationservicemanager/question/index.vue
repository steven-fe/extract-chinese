<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="问题编号" prop="id">
        <el-input
          v-model="queryParams.id"
          placeholder="请输入问题编号"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户编号" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户编号"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="问题类型" prop="rqType">
        <el-select v-model="queryParams.rqType" placeholder="请选择类型" clearable size="mini">
          <el-option
            v-for="item in typeOptions"
            :key="item.dictValue"
            :label="item.dictLabel"
            :value="item.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="问题状态" prop="rqStatus">
        <el-select v-model="queryParams.rqStatus" placeholder="请选择状态" clearable size="mini">
          <el-option
            v-for="item in statusOptions"
            :key="item.dictValue"
            :label="item.dictLabel"
            :value="item.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="提交时间">
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

    <el-table v-loading="loading" :data="questionList" border>
      <el-table-column label="问题编号" align="center" prop="id" />
      <el-table-column label="用户编号" align="center" prop="userId" />
      <el-table-column label="提交用户" align="center" prop="username" />
      <el-table-column label="问题类型" align="center" prop="rqType">
        <template slot-scope="scope">
          <div v-for="(item, index, key) in typeOptions" :key="key">
            <span v-if="scope.row.rqType == item.dictValue">{{ item.dictLabel }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="问题描述" align="center" prop="rqDescribe" />
      <el-table-column label="问题状态" align="center" prop="rqStatus">
        <template slot-scope="scope">
          <div v-for="(item, index, key) in statusOptions" :key="key">
            <span v-if="scope.row.rqStatus == item.dictValue">{{ item.dictLabel }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" align="center" prop="ctime" width="150">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="处理时间" align="center" prop="mtime" width="150">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.mtime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单编号" align="center" />
      <el-table-column :label="$t('common.operation')" align="center" class-name="small-padding fixed-width" width="150">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.rqStatus != 3"
            v-hasPermi="['coinbull:question:addReplay']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleReply(scope.row)"
          >回复</el-button>
          <el-button
            v-if="scope.row.rqStatus != 3"
            v-hasPermi="['coinbull:question:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >关闭</el-button>
          <el-button
            v-if="scope.row.rqStatus == 3"
            v-hasPermi="['coinbull:question:replay']"
            size="mini"
            type="text"
            icon="el-icon-search"
            @click="handleReply(scope.row)"
          >查看</el-button>
          <el-button
            v-hasPermi="['coinbull:question:remove']"
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

    <el-dialog :title="title" :visible.sync="dialogForm">
      <el-table :data="detialData" :show-header="false" border :span-method="arraySpanMethod">
        <el-table-column align="left">
          <el-table-column prop="colName1" align="colAlign" />
          <el-table-column prop="colValue1" align="left">
            <template slot-scope="scope">
              <div v-if="scope.row.convert1 == 0">
                <span v-if="scope.row.colImage1 != undefined && scope.row.colImage1 != ''"><el-button size="mini" @click="imageQuery(scope.$index, scope.row)">查看附件</el-button></span>
                <span else>{{ scope.row.colValue1 }}</span>
              </div>
              <div v-for="(item, index, key) in typeOptions" v-else :key="key">
                <span v-if="scope.row.colValue1 == item.dictValue">{{ item.dictLabel }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="colName2" align="center" />
          <el-table-column prop="colValue2" align="left">
            <template slot-scope="scope">
              <div v-if="scope.row.convert2 == 0">
                <span>{{ parseTime(scope.row.colValue2) }}</span>
              </div>
              <div v-for="(item, index, key) in statusOptions" v-else :key="key">
                <span v-if="scope.row.colValue2 == item.dictValue">{{ item.dictLabel }}</span>
              </div>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>
      <div v-for="(item,key) in replayList" :key="key" style="margin: 20px auto;">
        <div>
          <div style="float: left;"><span>{{ item.username }}回复：</span></div>
          <div style=""><span style="color: #5eb95e;">{{ item.replayContent }}</span></div>
        </div>
        <div>
          <div style="text-align: right;"><span style="color: #5eb95e;">{{ parseTime(item.ctime) }}</span></div>
        </div>
      </div>

      <el-form v-if="title == '回复问题'" ref="form" :model="form" :rules="rules" label-width="130px">
        <el-form-item label="回复内容：" prop="replayContent">
          <el-input v-model="form.replayContent" type="textarea" placeholder="请输入问题回复内容" />
        </el-form-item>
      </el-form>
      <div v-if="title == '回复问题'" slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="submitForm">回 复</el-button>
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
      </div>

      <div slot="footer" class="dialog-footer" />
    </el-dialog>
    <el-dialog title="查看附件" :visible.sync="dialogImageVisible">
      <div>
        <el-row :gutter="20" type="flex" style="flex-wrap: wrap;">
          <el-col
            v-for="(item, index) in imageUrlData"
            :key="index"
            :span="8"
            style="padding-bottom:20px;"
          >
            <el-card :body-style="{ padding: '0px' }">
              <img :src="item" class="image">
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { enumList, listInfo, updateInfo, delInfo, listReplay, addReplay } from '@/api/question/question'

export default {
  name: 'Info',
  data() {
    return {
      // 类型选项
      typeOptions: [],
      // 状态选项
      statusOptions: [],
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 问题工单表格数据
      questionList: [],
      time: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        beginTime: (this.time && this.time[0]) || '',
        endTime: (this.time && this.time[1]) || '',
        id: undefined,
        userId: undefined,
        rqType: undefined,
        rqStatus: undefined
      },
      dialogForm: false,
      // 弹框标题
      title: undefined,
      detialData: [],
      imageUrlData: [],
      dialogImageVisible: false,
      replayList: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        replayContent: [
          { required: true, message: '回复内容不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getTypeselect()
    this.getStatusselect()
    this.getList()
  },
  methods: {
    /** 渠道商下拉结构 */
    getTypeselect() {
      const params = {
        type: '1'
      }
      enumList(params).then(response => {
        this.typeOptions = response.data
      })
    },
    /** 渠道商下拉结构 */
    getStatusselect() {
      const params = {
        type: '2'
      }
      enumList(params).then(response => {
        this.statusOptions = response.data
      })
    },
    /** 查询问题工单列表 */
    getList() {
      this.loading = true
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      listInfo(this.queryParams).then(response => {
        this.questionList = response.rows
        this.total = response.total
        this.loading = false
      })
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
        id: undefined,
        userId: undefined,
        rqType: undefined,
        rqStatus: undefined
      }
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const id = row.id
      this.$confirm('是否确认关闭问题工单编号为"' + id + '"的数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(function() {
        return updateInfo(id)
      }).then(() => {
        this.getList()
        this.msgSuccess('关闭成功')
      }).catch(function() {})
    },
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      if (rowIndex == 0) {
        return [-1, 4]
      } else if (rowIndex > 2 && columnIndex > 0) {
        return [-1, 3]
      }
    },
    /** 回复、查看按钮操作 */
    handleReply(row) {
      this.title = row.rqStatus == 3 ? '问题详情' : '回复问题'
      this.detialData = [
        {
          colName1: '问题详情',
          colValue1: '',
          colImage1: '',
          colAlign: 'left',
          convert1: 0,
          colName2: '',
          colValue2: '',
          convert2: 0
        }, {
          colName1: '问题编号：',
          colValue1: row.id,
          colImage1: '',
          colAlign: 'center',
          convert1: 0,
          colName2: '问题状态：',
          colValue2: row.rqStatus,
          convert2: 1
        }, {
          colName1: '问题类型：',
          colValue1: row.rqType,
          colImage1: '',
          colAlign: 'center',
          convert1: 1,
          colName2: '提交时间：',
          colValue2: row.ctime,
          convert2: 0
        }, {
          colName1: '问题描述：',
          colValue1: row.rqDescribe,
          colImage1: '',
          colAlign: 'center',
          convert1: 0,
          colName2: '',
          colValue2: '',
          convert2: 0
        }, {
          colName1: '上传附件：',
          colValue1: '',
          colImage1: row.imgUrl,
          colAlign: 'center',
          convert1: 0,
          colName2: '',
          colValue2: '',
          convert2: 0
        }
      ]
      const params = {
        rqId: row.id
      }
      listReplay(params).then(response => {
        this.replayList = response.data
      })
      this.resetForm('form')
      this.form = {
        rqId: row.id,
        replayContent: undefined
      }
      this.dialogForm = true
    },
    imageQuery(row, index) {
      this.imageUrlData = index.colImage1.split(',')
      this.dialogImageVisible = true
    },
    // 取消按钮
    cancel() {
      this.dialogForm = false
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          addReplay(this.form).then(response => {
            if (response.code === 200) {
              this.msgSuccess('回复成功')
              this.dialogForm = false
              this.getList()
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$confirm('是否确认删除问题工单编号为"' + ids + '"的数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(function() {
        return delInfo(ids)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    }
  }
}
</script>
<style scoped>
.image {
  width: 100%;
  display: block;
}
</style>
