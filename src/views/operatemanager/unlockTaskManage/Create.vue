<template>
  <el-dialog :title="$t('common.addingAnUnlockTask')" :visible.sync="show" width="30%">
    <el-form ref="createForm" :model="createForm" :rules="createRules">
      <el-form-item :label="$t('financemanager.taskName')" prop="jobName">
        <el-input v-model="createForm.jobName" />
      </el-form-item>
      <el-form-item :label="$t('financemanager.unlockCurrency')" prop="currencyId">
        <el-select v-model="createForm.currencyId" filterable clearable style="width: 100%" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in codeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('financemanager.unlockUID')" prop="userId">
        <el-input v-model="createForm.userId" :placeholder="$t('common.englishCommaSeparation')" />
      </el-form-item>
      <el-form-item :label="$t('common.unlockCycle')" prop="unlockCycle">
        <el-input v-model="createForm.unlockCycle" />
      </el-form-item>
      <el-form-item :label="$t('financemanager.unlockType')" prop="unlockType">
        <el-select v-model="createForm.unlockType" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in unlockTypeForm"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.amountUnlockedEachTime')" prop="unlockNum">
        <el-input v-model="createForm.unlockNum" />
      </el-form-item>
      <el-form-item :label="$t('common.unlockingTimes')" prop="unlockCount">
        <el-input v-model="createForm.unlockCount" />
      </el-form-item>
      <el-form-item :label="$t('common.firstUnlockTime')" prop="unlockFirstTime">
        <el-date-picker
          v-model="createForm.unlockFirstTime"
          style="width: 100%"
          format="yyyy-MM-dd HH"
          type="datetime"
          :picker-options="pickerOptions"
          value-format="yyyy-MM-dd HH:mm:ss"
          :placeholder="$t('financemanager.selectDateAndTime')"
          @change="changeDate"
        />
      </el-form-item>
    </el-form>
    <div class="tips">
      <div>{{ $t('financemanager.attention') }}</div>
      <div>1. {{ $t('common.tips1') }}</div>
      <div>2. {{ $t('common.tips2') }}</div>
      <div>3. {{ $t('common.tips3') }}</div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="show = false">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="jobAdd">{{ $t('common.sure') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { jobAdd } from '@/api/operate/lock'
import dayjs from 'dayjs'
import { mapState } from 'vuex'

export default {
  name: 'Create',
  data() {
    const checkCode = (rule, value, callback) => {
      if (Number.isNaN(+value)) {
        return callback(new Error(this.$t('common.onlyNumbers')))
      }
      callback()
    }
    const checkJobName = (rule, value, callback) => {
      if (!Number.isNaN(+value)) {
        return callback(new Error(this.$t('common.taskNameCannotBeAPureNumber')))
      }
      callback()
    }
    // const checkUserId = (rule, value, callback) => {
    //   const arr = value.split(',')
    //   for (const iterator of arr) {
    //     if () {}
    //   }
    //   if (!Number.isNaN(+value)) {
    //     return callback(new Error("任务名称不能为纯数字"));
    //   }
    //   callback();
    // };
    return {
      show: false,
      unlockTypeForm: [
        { id: 1, name: this.$t('common.fixedQuantity') },
        { id: 2, name: this.$t('common.fixedPercentage') },
        { id: 3, name: this.$t('common.percentageOfRechargeQuantity') },
        { id: 4, name: this.$t('common.percentageOfPreviousDaytransactions') },
        { id: 5, name: this.$t('common.percentageOfPreviousDaypurchases') }
      ],
      pickerOptions: {
        disabledDate: (time) => {
          if (time) {
            return time.getTime() < new Date(new Date().toLocaleDateString()).getTime()
          }
          return true
        }
      },
      createForm: {
        currencyId: '', // 币种id
        jobName: '', // 任务名
        unlockCount: '', // 解锁次数
        unlockCycle: '', // 解锁周期
        unlockFirstTime: '', // 首次解锁时间
        unlockNum: '', // 解锁量（个/%）
        unlockType: '', // 解锁类型1固定数量2固定百分比3充值百分比4交易量百分比5买入百分比
        userId: '' // 用户id 多用户以英文逗号隔开，输入#代表所有用户
      },
      createRules: {
        currencyId: [
          { required: true, message: this.$t('common.selectTheUnlockingCurrency'), trigger: 'change' }
        ],
        jobName: [
          { required: true, message: this.$t('common.theTaskNameCannotBeEmpty'), trigger: 'blur' },
          { required: true, validator: checkJobName, trigger: 'blur' }
        ],
        unlockCount: [
          { required: true, message: this.$t('common.theNumberOfUnlockTimesCannotBeEmpty'), trigger: 'blur' },
          { required: true, validator: checkCode, trigger: 'blur' }
        ],
        unlockCycle: [
          { required: true, message: this.$t('common.theUnlockingPeriodCannotBeEmpty'), trigger: 'blur' },
          { required: true, validator: checkCode, trigger: 'blur' }
        ],
        unlockFirstTime: [
          { required: true, message: this.$t('common.theFirstUnlockTimeCannotBeEmpty'), trigger: 'blur' }
        ],
        unlockNum: [
          { required: true, message: this.$t('common.eachUnlockingAmountCannotBeEmpty'), trigger: 'blur' },
          { required: true, validator: checkCode, trigger: 'blur' }
        ],
        unlockType: [
          { required: true, message: this.$t('common.theUnlockTypeCannotBeEmpty'), trigger: 'blur' }
        ],
        userId: [
          { required: true, message: this.$t('common.theUnlockUIDCannotBeEmpty'), trigger: 'blur' }
          // { required: true, validator: checkJobName, trigger: "blur" }
        ]
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList', 'protocolList']),
    codeOptions() {
      return this.currencyList
    }
  },
  methods: {
    init() {
      this.show = true
    },
    changeDate(time) {
      const minute = dayjs(time).minute()
      if (minute > 0) {
        time = dayjs(time).minute(60).format('YYYY-MM-DD HH:mm:ss')
      }
      this.createForm.unlockFirstTime = time
    },
    jobAdd() {
      this.$refs['createForm'].validate(valid => {
        if (valid) {
          console.log('提交参数', this.createForm)
          this.$confirm(this.$t('common.areYouSureAboutCreatingATokenUnlockTask'), this.$t('common.prompt'), {
            confirmButtonText: this.$t('common.sure'),
            cancelButtonText: this.$t('common.cancel'),
            type: 'warning'
          }).then(() => {
            jobAdd(this.createForm).then(res => {
              if (res.code === 200) {
                if (res.data.code === 1) { // 创建状态码 1全部失败 2部分失败 3全部成功
                  this.$alert(this.$t('common.taskCreationFailure'), this.$t('common.prompt'), {
                    confirmButtonText: this.$t('common.sure'),
                    callback: action => {
                    }
                  })
                }
                if (res.data.code === 2) { // 创建状态码 1全部失败 2部分失败 3全部成功
                  this.$alert(this.$t('common.tip', { failUser: res.data.failUser }), this.$t('common.prompt'), {
                    confirmButtonText: this.$t('common.sure'),
                    callback: action => {
                      this.$emit('success')
                    }
                  })
                }
                if (res.data.code === 3) { // 创建状态码 1全部失败 2部分失败 3全部成功
                  this.$alert(this.$t('common.creatTip', { successUserCount: res.data.successUserCount }), this.$t('common.prompt'), {
                    confirmButtonText: this.$t('common.sure'),
                    callback: action => {
                      this.show = false
                      this.$emit('success')
                    }
                  })
                }
              }
            })
          }).catch(() => {
            // this.show = false
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.tips {
    margin-top: 30px;
    div{
        padding: 10px 0;
    }
}
</style>
