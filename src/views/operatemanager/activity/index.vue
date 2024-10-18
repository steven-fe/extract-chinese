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
        <template slot-scope="scope">{{ scope.row.activityStartTime }}</template>
      </el-table-column>
      <el-table-column label="活动结束时间" align="center" width="180">
        <template slot-scope="scope">{{ scope.row.activityEndTime }}</template>
      </el-table-column>
      <el-table-column prop="level1RegisterReward" label="level注册奖励" align="center" width="160" />
      <el-table-column prop="level1KycReward" label="level1实名奖励" align="center" />
      <el-table-column prop="level2RegisterReward" label="level2注册奖励" align="center" />
      <el-table-column prop="level2KycReward" label="leve2实名奖励" align="center" />
      <el-table-column prop="rewardCurrency" label="奖励币种" align="center" />
      <el-table-column prop="rewardMax" label="奖励上限" align="center" />
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
                v-model="digform.activityStartTime"
                type="datetime"
                placeholder="选择日期时间"
                align="right"
                value-format="timestamp"
                :picker-options="pickerOptions"
              />
            </div>
          </div>
          <div v-else>
            <el-input v-model="digform.activityStartTime" disabled="disabled" clearable />
          </div>
        </el-form-item>
        <el-form-item class="grid-item" label="活动结束时间:" prop="activityEndTime">
          <div v-if="updateId ===''">
            <div style="float: left; width: 100%;">
              <el-date-picker
                v-model="digform.activityEndTime"
                type="datetime"
                placeholder="选择日期时间"
                align="right"
                value-format="timestamp"
                :picker-options="pickerOptions"
              />
            </div>
          </div>
          <div v-else>
            <el-input v-model="digform.activityEndTime" disabled="disabled" clearable />
          </div>
        </el-form-item>
        <el-form-item class="grid-item" label="币种名称:" prop="rewardCurrency">
          <div v-if="updateId ===''">
            <el-select v-model="digform.rewardCurrency" style="width: 100%" :placeholder="$t('common.pleaseChoose')" :disabled="updateId ? true : false" filterable>
              <el-option
                v-for="item in currencyOptions"
                :key="item.id"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </div>
          <div v-else>
            <el-input v-model="digform.rewardCurrency" disabled="disabled" clearable />
          </div>
        </el-form-item>
        <el-form-item class="grid-item" label="奖励上限:" prop="rewardMax">
          <el-input v-model="digform.rewardMax" placeholder="请输入奖励上限" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="Level1注册奖励:" prop="level1RegisterReward">
          <el-input v-model="digform.level1RegisterReward" placeholder="请输入数量" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="Level2注册奖励:" prop="level2RegisterReward">
          <el-input v-model="digform.level2RegisterReward" placeholder="请输入数量" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="Level实名奖励:" prop="level1KycReward">
          <el-input v-model="digform.level1KycReward" placeholder="请输入数量" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="Leve2实名奖励:" prop="level2KycReward">
          <el-input v-model="digform.level2KycReward" placeholder="请输入数量" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button size="mini" type="primary" @click="setConfig">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { pageList } from '@/api/operate/activity'
import { commonFilter } from '@/utils/filters'
import { date, time } from '@/utils/format'
import * as API from '@/api/operate/activity'
import { mapState } from 'vuex'

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
        activityStartTime: '',
        activityEndTime: '',
        rewardCurrency: '',
        rewardMax: '',
        level1RegisterReward: '',
        level2RegisterReward: '',
        level1KycReward: '',
        level2KycReward: ''
      },
      rules: {
        activityName: [
          { required: true, trigger: 'blur' }
        ],
        activityStartTime: [
          { required: true, trigger: 'blur' }
        ],
        activityEndTime: [
          { required: true, trigger: 'blur' }
        ],
        rewardCurrency: [
          { required: true, message: '请选择币种', trigger: 'change' }
        ],
        rewardMax: [
          { required: true, trigger: 'blur' }
        ],
        level1RegisterReward: [
          { required: true, trigger: 'blur' }
        ],
        level2RegisterReward: [
          { required: true, trigger: 'blur' }
        ],
        level1KycReward: [
          { required: true, trigger: 'blur' }
        ],
        level2KycReward: [
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
            API.update(this.digform).then(response => {
              if (response.code == 200) {
                this.msgSuccess('修改成功')
                this.getConfigList()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
            })
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
