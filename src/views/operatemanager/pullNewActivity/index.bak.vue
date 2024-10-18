<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="90px">
      <el-form-item label="活动名称:" placeholder="活动名称">
        <el-input v-model="form.names" clearable />
      </el-form-item>
      <el-form-item label="活动起始时间：">
        <el-date-picker
          v-model="date"
          type="datetime"
          :start-placeholder="$t('common.startTime')"
          align="right"
          value-format="timestamp"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList(true)">查找</el-button>
      </el-form-item>
    </el-form>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="addActivity">添加活动</el-button>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column :label="$t('common.operation')" width="200px" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.status === 1">
            <el-button type="danger" size="mini" @click="updateStatus(2, scope.row)">下线</el-button>
            <el-button type="primary" size="mini" @click="update(scope.row.id)">修改活动</el-button>
          </div>
          <div v-else>
            <el-button type="primary" size="mini" @click="updateStatus(1, scope.row)">上线</el-button>
            <el-button type="primary" size="mini" @click="update(scope.row.id)">修改活动</el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="序号" align="center" />
      <el-table-column prop="activityName" label="活动名称" align="center" />
      <el-table-column label="活动开始时间" align="center" width="180">
        <template slot-scope="scope" type="form">{{ scope.row.stime }}</template>
      </el-table-column>
      <el-table-column label="活动结束时间" align="center" width="180">
        <template slot-scope="scope">{{ scope.row.etime }}</template>
      </el-table-column>
      <el-table-column prop="currency" label="奖励币种" align="center" />
      <el-table-column label="注册奖励状态" align="center">
        <template slot-scope="scope">{{ typeLabel(registerStateOptions, scope.row.registerStatus) }}</template>
      </el-table-column>
      <el-table-column label="注册奖励类型" align="center">
        <template slot-scope="scope">{{ typeLabel(registerTypeOptions, scope.row.registerType) }}</template>
      </el-table-column>
      <el-table-column prop="registerNumber" label="注册奖励数量" align="center" />
      <el-table-column label="实名奖励状态" align="center">
        <template slot-scope="scope">{{ typeLabel(kycStateOptions, scope.row.kycStatus) }}</template>
      </el-table-column>
      <el-table-column label="实名奖励类型" align="center">
        <template slot-scope="scope">{{ typeLabel(kycTypeOptions, scope.row.kycType) }}</template>
      </el-table-column>
      <el-table-column prop="kycNumber" label="实名奖励数量" align="center" />
      <el-table-column :label="$t('common.status')" align="center">
        <template slot-scope="scope">{{ typeLabel(stateOptions, scope.row.status) }}</template>
      </el-table-column>
      <el-table-column prop="operate" label="操作者" align="center" />

    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="pageChange"
      />
    </div>
    <el-dialog :title="updateId ? '修改活动' : '添加活动'" :visible.sync="open" width="1000px" :before-close="cancel">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        class="form-grid"
      >
        <el-form-item class="grid-item" label="活动名称:" prop="activityName">
          <div v-if="updateId ===''">
            <el-input v-model="digform.activityName" placeholder="请输入活动名称" clearable />
          </div>
          <div v-else>
            <el-input v-model="digform.activityName" disabled="disabled" clearable />
          </div>
        </el-form-item>
        <el-form-item class="grid-item" label="活动起始时间:" prop="activityStartTime">
          <div v-if="updateId ===''">
            <div style="float: left; width: 100%;">
              <el-date-picker
                v-model="digform.startTime"
                type="datetime"
                placeholder="选择日期时间"
                align="right"
                value-format="timestamp"
                :picker-options="pickerOptions"
              />
            </div>
          </div>
          <div v-else>
            <el-input v-model="digform.stime" disabled="disabled" clearable />
          </div>
        </el-form-item>
        <el-form-item class="grid-item" label="活动结束时间:" prop="activityEndTime">
          <div v-if="updateId ===''">
            <div style="float: left; width: 100%;">
              <el-date-picker
                v-model="digform.endTime"
                type="datetime"
                placeholder="选择日期时间"
                align="right"
                value-format="timestamp"
                :picker-options="pickerOptions"
              />
            </div>
          </div>
          <div v-else>
            <el-input v-model="digform.etime" disabled="disabled" clearable />
          </div>
        </el-form-item>
        <!--        <el-form-item class="grid-item" label="币种名称:" prop="rewardCurrency">-->
        <!--          <div v-if="updateId ===''">-->
        <!--            <el-input v-model="digform.rewardCurrency" placeholder="请输入币种" clearable></el-input>-->
        <!--          </div>-->
        <!--          -->
        <!--        </el-form-item>-->
        <el-form-item class="grid-item" label="币种名称:" prop="rewardCurrency">
          <div v-if="updateId ===''">
            <el-select v-model="digform.currency" style="width: 100%" :placeholder="$t('common.pleaseChoose')" :disabled="updateId ? true : false">
              <el-option
                v-for="item in currencyOptions"
                :key="item.id"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </div>
          <div v-else>
            <el-input v-model="digform.currency" disabled="disabled" clearable />
          </div>
        </el-form-item>

        <el-form-item class="grid-item" label="注册奖励:" label-width="auto" prop="registerStatus">
          <el-select v-model="digform.registerStatus" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in registerStateOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item class="grid-item" label="实名奖励:" label-width="auto" prop="kycStatus">
          <el-select v-model="digform.kycStatus" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in kycStateOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <div v-if="digform.registerStatus === 1">
          <el-form-item class="grid-item" label="注册奖励数量:" prop="registerNumber">
            <div v-if="updateId ===''">
              <el-input v-model="digform.registerNumber" placeholder="请输入活动名称" clearable />
            </div>
            <div v-else>
              <el-input v-model="digform.registerNumber" clearable />
            </div>
          </el-form-item>
        </div>

        <div v-if="digform.kycStatus === 1">
          <el-form-item class="grid-item" label="实名奖励数量:" prop="kycNumber">
            <div v-if="updateId ===''">
              <el-input v-model="digform.kycNumber" placeholder="实名奖励数量" clearable />
            </div>
            <div v-else>
              <el-input v-model="digform.kycNumber" clearable />
            </div>
          </el-form-item>
        </div>

        <div v-if="digform.registerStatus === 1">
          <el-form-item class="grid-item" label="注册奖励类型:" label-width="auto" prop="registerType">
            <el-select v-model="digform.registerType" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
              <el-option
                v-for="item in registerTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </div>
        <div v-if="digform.kycStatus === 1">
          <el-form-item class="grid-item" label="实名奖励类型:" label-width="auto" prop="kycType">
            <el-select v-model="digform.kycType" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
              <el-option
                v-for="item in kycTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button size="mini" type="primary" @click="setConfig">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { pageList } from '@/api/operate/pullNewActivity'
import { commonFilter } from '@/utils/filters'
import { date, time } from '@/utils/format'
import * as API from '@/api/operate/pullNewActivity'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'ActivityList',
  filters: {
    timeFilter(val) {
      if (Number(val) === 0) {
        return '- -'
      }
      return date(val) + ' ' + time(val)
    }
  },
  data() {
    return {
      pickerOptions: {
        disabledDate: (time) => {
          if (time) {
            return time.getTime() < new Date(new Date().toLocaleDateString()).getTime()
          }
          return true
        }
      },
      stateOptions: [
        { label: '上线', value: 1 },
        { label: '下线', value: 2 }
      ],
      registerTypeOptions: [
        { label: '空投', value: 1 },
        { label: '抵扣劵', value: 2 }
      ],
      registerStateOptions: [
        { label: '开启', value: 1 },
        { label: '关闭', value: 2 }
      ],
      kycTypeOptions: [
        { label: '空投', value: 1 },
        { label: '抵扣劵', value: 2 }
      ],
      kycStateOptions: [
        { label: '开启', value: 1 },
        { label: '关闭', value: 2 }
      ],
      total: 0,
      configId: '',
      updateId: '',
      form: {
        names: '',
        startTime: '',
        endTime: '',
        pageNum: 1,
        pageSize: 10
      },
      date: '',
      tableData: [{}],
      open: false,
      digform: {
        activityName: '',
        startTime: '',
        endTime: '',
        currency: '',
        registerStatus: '',
        registerType: '',
        registerNumber: '',
        kycStatus: '',
        kycType: '',
        kycNumber: '',
        stime: '',
        etime: ''
      },
      rules: {
        activityName: [
          { required: true, trigger: 'blur' }
        ],
        startTime: [
          { required: true, trigger: 'blur' }
        ],
        endTime: [
          { required: true, trigger: 'blur' }
        ],
        currency: [
          { required: true, message: '请选择币种', trigger: 'change' }
        ],
        registerStatus: [
          { required: true, trigger: 'blur' }
        ],
        registerType: [
          { required: true, trigger: 'blur' }
        ],
        registerNumber: [
          { required: true, trigger: 'blur' }
        ],
        kycStatus: [
          { required: true, trigger: 'blur' }
        ],
        kycType: [
          { required: true, trigger: 'blur' }
        ],
        kycNumber: [
          { required: true, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    currencyOptions() {
      return this.currencyList
    }
  },

  mounted() {
    this.getConfigList()
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    // 币种类型过滤方法
    typeLabel(data, val) {
      return commonFilter(data, val)
    },
    // 日期改变事件
    timeChange(val) {
      if (val) {
        this.form.startTime = val[0]
        this.form.endTime = val[0]
        return
      }
      this.form.startTime = ''
      this.form.endTime = ''
    },
    // 分页改变
    pageChange(val) {
      if (val) {
        this.pageNum = val.page
        this.pageSize = val.limit
        this.getConfigList()
      }
    },
    cancel() {
      this.open = false
      this.$refs['digform'].resetFields()
    },
    getConfigList(flag) {
      if (flag) {
        this.form.pageNum = 1
      }
      pageList(this.form).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
    },
    updateStatus(state, row) {
      const params = {
        id: row.id,
        state: state
      }
      API.updateStatus(params).then(res => {
        if (res.code === 200) {
          this.$message({
            type: 'success',
            message: this.$t('common.operationSucceed')
          })
          this.getConfigList()
        } else {
          this.$message({
            type: 'error',
            message: '操作失败'
          })
        }
      })
    },
    setConfig() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          if (this.updateId == '') {
            API.insert(this.digform).then(response => {
              if (response.code == 200) {
                this.msgSuccess('添加成功')
                this.getConfigList()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            // API.update(this.digform).then(response => {
            //   if (response.code == 200) {
            //     this.msgSuccess("修改成功");
            //     this.getConfigList();
            //     this.cancel()
            //   } else {
            //     this.msgError(response.msg);
            //   }
            // });
          }
        }
      })
    },

    update(id) {
      API.detail({ id: id }).then(response => {
        if (response.code == 200) {
          this.digform = response.data
          this.updateId = id
          this.open = true
        } else {
          this.msgError(response.msg)
        }
      })
    },
    /** 新增按钮操作 */
    addActivity() {
      this.open = true
      this.title = '添加活动信息'
      this.updateId = ''
      this.digform = {}
    }
  }
}
</script>

<style scoped lang="scss">
.table {
  margin-top: 20px;
}
.form-grid {
  display: grid;
  grid-template-columns: 50% 50%;
  margin-left: 5%;
  .grid-item {
    width: 90%;
  }
}
.upload-demo {
  float: left;
  width: 100%;
}
</style>
