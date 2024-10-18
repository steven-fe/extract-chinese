<template>
  <div class="app-container">
    <el-form
      ref="form"
      :inline="true"
      :model="form"
      label-width="90px"
      :rules="rules"
    >
      <el-form-item label="用户uid:" placeholder="活动名称" prop="uid">
        <el-input v-model.number="form.uid" clearable />
      </el-form-item>
      <el-form-item label="活动id" placeholder="活动id">
        <el-input v-model="form.activityId" clearable />
      </el-form-item>
      <el-form-item label="任务类型:">
        <el-select v-model="form.taskType" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          :disabled="!Boolean(form.uid)"
          @click="getConfigList"
        >查找</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      class="table cabin-table"
    >
      <el-table-column
        prop="activityId"
        label="活动id"
        align="center"
      />
      <el-table-column
        prop="uid"
        label="用户uid"
        align="center"
      />
      <el-table-column prop="time" label="报名时间" align="center">
        <template slot-scope="scope" type="form">{{
          scope.row.ctime | timeFilter
        }}</template>
      </el-table-column>
      <el-table-column prop="kycReceiveNumber" label="任务类型" align="center">
        <template slot-scope="scope" type="form">{{
          scope.row.taskType | computedtaskType
        }}</template>
      </el-table-column>
      <el-table-column
        prop="tradeNumber"
        label="完成情况"
        align="center"
      >
        <template slot-scope="scope" type="form">{{
          scope.row | computedtaskProcess
        }}</template>

      </el-table-column>
      <el-table-column prop="rechargeNumber" label="领取情况" align="center">
        <template slot-scope="scope" type="form">{{
          scope.row.rewardStatus === 1 ? '已领取' : '未领取'
        }}</template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { persionalActiRecord } from '@/api/operate/pullNewActivityCensus'
import { date, time } from '@/utils/format'

export default {
  name: 'PersionalActiRecord',
  filters: {
    timeFilter(val) {
      if (Number(val) === 0) {
        return '- -'
      }
      return date(val) + ' ' + time(val)
    },
    computedtaskType(val) {
      const obj = {
        1: '注册',
        2: '邀请注册',
        3: '邀请kyc',
        4: 'kyc',
        5: '充值'
      }
      return obj[val]
    },
    computedtaskProcess(item) {
      if (item && [2, 3, 5].includes(item.taskType)) {
        return `${item.count}/${item.taskFactor}`
      }
      return `--`
    }

  },
  data() {
    return {
      show: false,
      options: [
        {
          value: '1',
          label: '注册'
        },
        {
          value: '2',
          label: '邀请注册'
        },
        {
          value: '3',
          label: '邀请kyc'
        },
        {
          value: '4',
          label: 'kyc'
        },
        {
          value: '5',
          label: '充值'
        }
      ],
      form: {
        activityId: null,
        taskType: null,
        uid: null
      },
      date: '',
      tableData: [],
      open: false,
      rules: {
        uid: [
          { required: true, message: '请输入uid', trigger: 'blur' },
          { type: 'number', message: 'uid必须为数字值' }
        ]
      }
    }
  },
  methods: {
    getConfigList() {
      this.$refs['form'].validate((validate) => {
        if (validate) {
          Object.keys(this.form).forEach(item => {
            if (!this.form[item]) {
              this.form[item] = undefined
            }
          })
          persionalActiRecord(this.form).then((response) => {
            if (response.code == 200) {
              this.tableData = response.data
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
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
