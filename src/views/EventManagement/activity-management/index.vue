<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="活动名称">
        <el-input v-model="queryParams.name" size="mini" clearable />
      </el-form-item>

      <el-form-item :label="$t('common.status')">
        <el-select v-model="queryParams.online" size="mini" clearable>
          <el-option :key="-1" :label="$t('common.all')" value="" />
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="活动开始时间">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :range-separator="$t('common.toTime')"
          :start-placeholder="$t('common.startDate')"
          :end-placeholder="$t('common.endTime')"
          value-format="timestamp"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" size="mini" @click="handleQuery">查询</el-button>
        <el-button type="primary" size="mini" class="el-icon-plus" @click="handleAdd">新增</el-button>
        <el-button type="primary" size="mini" @click="handleActivityType">活动类型</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border>
      <el-table-column :label="$t('common.operation')" width="300" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleEdit(scope.row.id)">修改</el-button>
          <el-button v-if="scope.row.online === 0" type="success" size="mini" @click="handleChangeOnline(1, scope.row.id)">上线</el-button>
          <el-button v-if="scope.row.online === 1" type="danger" size="mini" @click="handleChangeOnline(0, scope.row.id)">下线</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>

      <el-table-column label="活动名称" prop="name" align="center" width="180" />

      <el-table-column label="是否首页展示" prop="homeFlag" align="center" width="180">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.homeFlag"
            :active-value="1"
            :inactive-value="0"
            @change="handleChangeHomeFlag(scope.row)"
          />
        </template>
      </el-table-column>

      <el-table-column label="活动封面" prop="cover" align="center" width="180">
        <template slot-scope="scope">
          <img class="logo" :src="scope.row.cover" alt="">
        </template>
      </el-table-column>

      <el-table-column label="活动简介" prop="introduction" align="center" width="180" :show-overflow-tooltip="true" />

      <el-table-column label="活动开始时间" prop="activityTs" align="center" width="260">
        <template slot-scope="scope">
          {{ parseTime(scope.row.activityTs) }}
        </template>
      </el-table-column>

      <el-table-column label="地点" prop="location" align="center" width="180" />

      <el-table-column label="跳转链接" prop="jumpUrl" align="center" width="260" />

      <el-table-column label="活动类型" prop="type" align="center" width="180" />

      <el-table-column label="话题标签" prop="label" align="center" width="240">
        <template slot-scope="scope">
          <span v-if="scope.row.label !== ''">
            <ul v-for="(item, index) in scope.row.label.split('、')" :key="index" style="list-style:none;padding:0;display:inline-flex;flex-wrap:wrap;margin:0 5px 0 0;">
              <li>
                <el-tag>{{ item }}</el-tag>
              </li>
            </ul>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('common.status')" prop="online" align="center" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.online === 1">上线</span>
          <span v-if="scope.row.online === 0">下线</span>
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

    <!-- 活动类型 -->
    <el-dialog
      title="活动类型"
      :visible.sync="activityTypeDialogVisible"
      :close-on-click-modal="false"
      width="500px"
    >
      <div v-for="(item, index) in typeList" :key="index" style="display: flex;">
        <div class="input">{{ item.typeName }}</div>
        <i class="el-icon-close" @click="deleteAcType(item.id)" />
      </div>
      <el-button type="primary" size="mini" class="el-icon-plus" @click="handleAddActivityType">添加</el-button>
    </el-dialog>

    <!-- 新增活动类型 -->
    <el-dialog
      title="新增活动类型"
      :visible.sync="addActivityTypeDialogVisible"
      :close-on-click-modal="false"
      width="400px"
      :before-close="cancel"
    >
      <el-form
        ref="activityTypeForm"
        :model="activityTypeForm"
        label-width="80px"
      >
        <el-form-item label="活动类型">
          <el-input v-model="activityTypeForm.typeName" size="mini" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" size="mini" @click="handleSure">{{$t('common.sure')}}</el-button>
      </span>
    </el-dialog>

    <!-- 新增/修改活动 -->
    <el-dialog
      :title="title"
      :visible.sync="activityDialogVisible"
      :close-on-click-modal="false"
      width="500px"
      :before-close="handleCancel"
    >
      <el-form
        ref="activityForm"
        :model="activityForm"
        label-width="80px"
        :rules="rules"
      >
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="activityForm.name" maxlength="50" show-word-limit clearable />
        </el-form-item>

        <el-form-item label="活动简介" prop="introduction">
          <el-input v-model="activityForm.introduction" type="textarea" :rows="4" maxlength="200" show-word-limit clearable />
        </el-form-item>

        <el-form-item label="活动封面" prop="cover">
          <el-upload
            class="upload-demo"
            action="#"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
          >
            <el-input v-model="activityForm.cover" placeholder="点击上传活动封面" style="width: 380px" clearable />
          </el-upload>
          <div style="color: red;">图片尺寸：480*270</div>
        </el-form-item>
        <el-form-item label="活动时间" prop="activityTs">
          <el-date-picker
            v-model="activityForm.activityTs"
            type="datetime"
            value-format="timestamp"
            clearable
          />
          <div style="color: red;">按照东八区时间设置</div>
        </el-form-item>

        <el-form-item label="活动地点" prop="location">
          <el-input v-model="activityForm.location" maxlength="50" show-word-limit clearable />
        </el-form-item>

        <el-form-item label="跳转链接" prop="jumpUrl">
          <el-input v-model="activityForm.jumpUrl" clearable />
        </el-form-item>

        <el-form-item label="活动类型" prop="type">
          <el-select v-model="activityForm.type" clearable>
            <el-option v-for="item in activityTypeOptions" :key="item.id" :label="item.typeName" :value="item.typeName" />
          </el-select>
        </el-form-item>

        <el-form-item label="首页展示" prop="homeFlag">
          <el-select v-model="activityForm.homeFlag" clearable>
            <el-option v-for="item in homeFlagOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="话题标签" prop="label">
          <el-tag
            v-for="tag in activityForm.label"
            :key="tag"
            closable
            :disable-transitions="false"
            @close="handleClose(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="saveTagInput"
            v-model="inputValue"
            class="input-new-tag"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="handleCancel">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" size="mini" @click="handleSubmit">{{$t('common.sure')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { upload } from '@/api/indexImg'
import { getActivityList, addActivity, modifyActivity, getActivityDetail, changeActivityStatus, deleteActivity, addActivityType, getActivityTypeList, deleteActivityType, changeHomeFlag } from '@/api/EventManagement'
export default {
  data() {
    // const validateTags = (rule, value, callback) => {
    //   if (value.length <= 0) {
    //     return callback(new Error('至少添加一个标签'))
    //   } else {
    //     callback()
    //   }
    // }
    return {
      targetDate: '',
      time: '',
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: '',
        online: '',
        activityStartTs: '',
        activityEndTs: ''
      },
      statusOptions: [
        { value: '0', label: '下线' },
        { value: '1', label: '上线' }
      ],
      activityTypeOptions: [],
      homeFlagOptions: [
        { value: 0, label: '否' },
        { value: 1, label: '是' }
      ],
      dataList: [],
      labelList: [],
      activityTypeDialogVisible: false,
      activityDialogVisible: false,
      addActivityTypeDialogVisible: false,
      title: '',
      activityTypeForm: {
        typeName: ''
      },
      state: '', // 1新增 2修改
      activityForm: {
        id: '',
        name: '',
        introduction: '',
        cover: '',
        activityTs: '',
        location: '',
        jumpUrl: '',
        homeFlag: 0,
        type: '',
        label: []
      },
      inputVisible: false,
      inputValue: '',
      flag: '',
      typeList: [],
      rules: {
        name: [{ required: true, message: '活动名称不能为空', trigger: 'blur' }],
        introduction: [{ required: true, message: '活动简介不能为空', trigger: 'blur' }],
        cover: [{ required: true, message: '活动封面不能为空', trigger: 'blur' }],
        activityTs: [{ required: true, message: '活动时间不能为空', trigger: 'blur' }],
        location: [{ required: true, message: '活动地点不能为空', trigger: 'blur' }],
        jumpUrl: [{ required: true, message: '跳转链接不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '活动类型不能为空', trigger: 'blur' }]
        // label: [{ required: true, validator: validateTags, trigger: 'blur' }]
      }
    }
  },

  created() {
    this.getList()
    this.getActivityType()
  },
  methods: {
    getList() {
      this.queryParams.activityStartTs = (this.time && this.time[0]) || ''
      this.queryParams.activityEndTs = (this.time && this.time[1]) || ''
      getActivityList(this.queryParams).then(res => {
        if (res.code === 200) {
          this.dataList = res.rows
          this.total = res.total
        }
      })
    },
    getActivityType() {
      getActivityTypeList().then(res => {
        if (res.code === 200) {
          this.activityTypeOptions = res.rows
          this.typeList = res.rows
        }
      })
    },
    handleChangeOnline(status, id) {
      changeActivityStatus(id, status).then(res => {
        if (res.code === 200) {
          status === 0 ? this.msgSuccess('下线成功') : this.msgSuccess('上线成功')
          this.getList()
        }
      })
    },
    handleDelete(id) {
      deleteActivity(id).then(res => {
        if (res.code === 200) {
          this.msgSuccess('删除成功')
          this.getList()
        }
      })
    },
    cancel() {
      this.addActivityTypeDialogVisible = false
      this.activityTypeForm.typeName = ''
    },
    handleActivityType() {
      this.activityTypeDialogVisible = true
    },
    handleCancel() {
      this.activityDialogVisible = false
      this.$refs['activityForm'].resetFields()
    },
    handleAdd() {
      this.state = 1
      this.title = '新增'
      this.activityDialogVisible = true
    },
    handleEdit(id) {
      this.title = '修改'
      this.state = 2
      this.flag = id
      this.activityDialogVisible = true
      getActivityDetail(id).then(res => {
        if (res.code === 200) {
          this.activityForm = res.data
          if (res.data.label !== '') {
            this.activityForm.label = res.data.label.split('、')
          } else {
            this.activityForm.label = []
          }
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
          this.activityForm.cover = res.data.fullPath
          this.$message.success(this.$t('common.uploadSucceeded'))
        }
      })
    },
    handleSubmit() {
      this.$refs['activityForm'].validate((valid) => {
        if (valid) {
          if (this.state === 1) {
            const params = {
              name: this.activityForm.name,
              introduction: this.activityForm.introduction,
              cover: this.activityForm.cover,
              activityTs: this.activityForm.activityTs,
              location: this.activityForm.location,
              jumpUrl: this.activityForm.jumpUrl,
              type: this.activityForm.type,
              homeFlag: this.activityForm.homeFlag,
              label: this.activityForm.label.join('、')
            }
            addActivity(params).then(res => {
              if (res.code === 200) {
                this.msgSuccess('添加成功')
                this.activityDialogVisible = false
                this.getList()
                this.handleCancel()
              }
            })
          } else {
            const params = {
              id: this.flag,
              name: this.activityForm.name,
              introduction: this.activityForm.introduction,
              cover: this.activityForm.cover,
              activityTs: this.activityForm.activityTs,
              location: this.activityForm.location,
              jumpUrl: this.activityForm.jumpUrl,
              type: this.activityForm.type,
              homeFlag: this.activityForm.homeFlag,
              label: this.activityForm.label.join('、')
            }
            modifyActivity(params).then(res => {
              if (res.code === 200) {
                this.msgSuccess('修改成功')
                this.getList()
                this.handleCancel()
              }
            })
          }
        }
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    handleAddActivityType() {
      this.addActivityTypeDialogVisible = true
      this.activityTypeDialogVisible = false
    },
    handleClose(tag) {
      this.activityForm.label.splice(this.activityForm.label.indexOf(tag), 1)
    },
    deleteAcType(id) {
      this.$confirm('确认删除该活动类型？', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        deleteActivityType(id).then(res => {
          if (res.code === 200) {
            this.msgSuccess('删除成功')
            this.activityTypeDialogVisible = false
            this.getActivityType()
            this.getList()
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消删除'
        })
      })
    },
    showInput() {
      if (this.activityForm.label.length < 3) {
        this.inputVisible = true
        this.$nextTick(_ => {
          this.$refs['saveTagInput'].$refs.input.focus()
        })
      } else {
        this.inputVisible = false
        this.msgError('最多添加三个标签')
      }
    },
    handleInputConfirm() {
      this.$refs['activityForm'].validateField('label')
      const inputValue = this.inputValue
      if (inputValue) {
        if (this.activityForm.label.indexOf(inputValue) === -1) {
          this.activityForm.label.push(inputValue)
        }
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    handleSure() {
      addActivityType({ typeName: this.activityTypeForm.typeName }).then(res => {
        if (res.code === 200) {
          this.msgSuccess(this.$t('common.operationSucceed'))
          this.addActivityTypeDialogVisible = false
          this.getActivityType()
          this.activityTypeForm.typeName = ''
        }
      })
    },
    async handleChangeHomeFlag(row) {
      try {
        const params = {
          id: row.id,
          homeFlag: row.homeFlag
        }
        await changeHomeFlag(params)
      } catch (e) {
        console.error(e)
      } finally {
        this.getList()
      }
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped lang="scss">
.logo {
  width: 80px;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
.input {
  width: 400px;
  height: 25px;
  line-height: 25px;
  border-radius: 5px;
  padding-left: 5px;
  margin-bottom: 20px;
  border: 1px solid rgb(209, 207, 207);
}
.el-icon-close {
  font-size: 25px;
  margin-left: 10px;
}
</style>
