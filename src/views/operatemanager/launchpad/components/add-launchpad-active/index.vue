<template>
  <div class="app-container">
    <el-form ref="dialogForm" :model="dialogForm" :rules="rules" label-position="right">
      <div :class="$style.title">{{ title }}</div>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基础信息" name="1">
          <el-row>
            <el-col :span="11">
              <el-form-item label="认购币种" :label-width="formLabelWidth" prop="currencyId">
                <el-select v-model="dialogForm.currencyId" :disabled="forbiddenModify" filterable placeholder="请选择币种" clearable>
                  <el-option v-for="item in currencyOptions" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="11">
              <el-form-item label="分配总量" :label-width="formLabelWidth" prop="totalQuota">
                <el-input v-model="dialogForm.totalQuota" type="number" :disabled="forbiddenModify" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="11">
              <el-form-item label="投入币种" :label-width="formLabelWidth" prop="subscriptionCurrencyId">
                <el-select v-model="dialogForm.subscriptionCurrencyId" filterable :disabled="forbiddenModify" placeholder="请选择币种" clearable>
                  <el-option v-for="item in currencyOptions" :key="item.id" :label="item.name" :disabled="item.id === dialogForm.currencyId" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="11">
              <el-form-item label="兑换汇率" :label-width="formLabelWidth" prop="subscriptionPrice">
                <el-input v-model="dialogForm.subscriptionPrice" :disabled="forbiddenModify" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="11">
              <el-form-item label="是否锁仓" :label-width="formLabelWidth" prop="isLock">
                <el-select v-model="dialogForm.isLock" filterable placeholder="是否锁仓" :disabled="forbiddenModify" clearable>
                  <el-option v-for="item in lockOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col v-if="dialogForm.isLock === 1" :span="11">
              <el-form-item label="锁仓比例" :label-width="formLabelWidth" prop="lockScale">
                <el-input v-model="dialogForm.lockScale" :disabled="forbiddenModify" clearable>
                  <template slot="append">%</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="11">
              <el-form-item label="投入总额" :label-width="formLabelWidth" prop="totalAmount">
                <el-input v-model="dialogForm.totalAmount" :disabled="forbiddenModify" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="11">
              <el-form-item label="活动海报" :label-width="formLabelWidth" prop="logo">
                <el-upload
                  class="upload-demo"
                  action="#"
                  :show-file-list="false"
                  accept=".jpg,.jpeg,.png"
                  :http-request="upload"
                >
                  <el-input v-model="dialogForm.logo" placeholder="点击上传图片" clearable />
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :span="11">
              <el-form-item label="活动标签" :label-width="formLabelWidth" prop="tags">
                <el-select v-model="dialogForm.tags" filterable placeholder="请选择活动标签" :disabled="forbiddenModify" clearable>
                  <el-option v-for="item in tagsOptions" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="11">
              <el-form-item label="排序权重" :label-width="formLabelWidth" prop="sorts">
                <el-input v-model="dialogForm.sorts" type="number" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="11">
              <el-form-item label="是否添加到日历:" :label-width="formLabelWidth" prop="calendarFlag">
                <el-tooltip effect="dark" content="将此活动添加到市场——日历" placement="top-start">
                  <i class="el-icon-question" />
                </el-tooltip>
                <el-radio-group v-model="dialogForm.calendarFlag">
                  <el-radio :label="1">是</el-radio>
                  <el-radio :label="0">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="11">
              <el-form-item label="活动开启时间" :label-width="formLabelWidth" prop="startTime">
                <el-date-picker v-model="dialogForm.startTime" value-format="timestamp" :disabled="forbiddenModify" type="datetime" placeholder="" @change="handleStartTime" />
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="认购开始时间" :label-width="formLabelWidth" prop="subscriptionStartTime">
                <el-date-picker v-model="dialogForm.subscriptionStartTime" type="datetime" value-format="timestamp" :disabled="forbiddenModify" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="11">
              <el-form-item label="认购结束时间" :label-width="formLabelWidth" prop="subscriptionEndTime">
                <el-date-picker v-model="dialogForm.subscriptionEndTime" type="datetime" value-format="timestamp" :disabled="forbiddenModify" placeholder="" />
              </el-form-item>
            </el-col>
            <el-col :span="11">
              <el-form-item label="分配结束时间" :label-width="formLabelWidth" prop="distributionEndTime">
                <el-date-picker v-model="dialogForm.distributionEndTime" type="datetime" value-format="timestamp" :disabled="forbiddenModify" placeholder="" />
              </el-form-item>
            </el-col>
          </el-row>
          <div :class="$style.divide" />
          <el-row>
            <el-col :span="11">
              <el-form-item label="官网（URL）" :label-width="formLabelWidth" prop="officialWebsite">
                <el-input v-model="dialogForm.officialWebsite" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="11">
              <el-form-item label="白皮书（URL）" :label-width="formLabelWidth" prop="whitePaper">
                <el-input v-model="dialogForm.whitePaper" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="文案语种：">
                <el-checkbox-group v-model="checkList">
                  <el-checkbox v-for="(item, index) of languageOptions" :key="index" :disabled="item.key === 'en_US'" :label="item.key">{{ item.language }}</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <template v-for="(item, index) of checkListLang">
              <el-col :key="index" :span="11">
                <el-form-item :label="`活动规则URL（${item.language}）`" label-width="192px" :prop="`rules.${item.key}`">
                  <el-input v-model="dialogForm.rules[item.key]" clearable />
                </el-form-item>
              </el-col>
              <el-col :key="`${item.key}${index}`" :span="11">
                <el-form-item :label="`活动简介（${item.language}）`" :label-width="formLabelWidth" :prop="`synopsiss.${item.key}`">
                  <el-input v-model="dialogForm.synopsiss[item.key]" maxlength="200" clearable />
                </el-form-item>
              </el-col>
              <el-col v-if="dialogForm.isLock === 1" :key="item.key" :span="11">
                <el-form-item :label="`解锁方式（${item.language}）`" :label-width="formLabelWidth" :prop="`unLockRules.${item.key}`">
                  <el-input v-model="dialogForm.unLockRules[item.key]" maxlength="200" clearable />
                </el-form-item>
              </el-col>
            </template>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="公开认购配置" name="2">
          <el-row>
            <el-col :span="11">
              <el-form-item label="用户基础认购额度" :label-width="formLabelWidth" prop="basicsQuota">
                <el-input v-model="dialogForm.basicsQuota" type="number" :disabled="forbiddenModify" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="11">
              <el-form-item label="单次最低投入数量" :label-width="formLabelWidth" prop="inputAmountMin">
                <el-input v-model="dialogForm.inputAmountMin" :disabled="forbiddenModify" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider>提额任务</el-divider>
          <el-form-item label="高级实名" :label-width="formLabelWidth" prop="UpAuth">
            <el-switch v-model="dialogForm.UpAuth" active-color="#13ce66" :disabled="forbiddenModify" inactive-color="#ccc" />
          </el-form-item>
          <el-col :span="10">
            <el-form-item label="提额数量" :label-width="formLabelWidth" prop="kycAmount">
              <el-input v-model="dialogForm.kycAmount" :disabled="forbiddenModify" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="任务结束统计时间" label-width="140px" prop="kycTime">
              <el-date-picker v-model="dialogForm.kycTime" type="datetime" value-format="timestamp" :disabled="forbiddenModify" placeholder="" />
            </el-form-item>
          </el-col>
          <div :class="$style.divide" />
          <el-form-item label="邀请好友" :label-width="formLabelWidth" prop="invite">
            <el-switch v-model="dialogForm.invite" active-color="#13ce66" :disabled="forbiddenModify" inactive-color="#ccc" />
          </el-form-item>
          <el-col :span="8">
            <el-form-item label="每邀请人数" :label-width="formLabelWidth" prop="inviteNum">
              <el-input v-model="dialogForm.inviteNum" :disabled="forbiddenModify" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="提额数量" :label-width="formLabelWidth" prop="inviteAmount">
              <el-input v-model="dialogForm.inviteAmount" :disabled="forbiddenModify" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="提额上限" :label-width="formLabelWidth" prop="inviteLimit">
              <el-input v-model="dialogForm.inviteLimit" :disabled="forbiddenModify" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="20">
            <el-form-item label="任务结束统计时间" label-width="140px" prop="inviteTime">
              <el-date-picker v-model="dialogForm.inviteTime" value-format="timestamp" :disabled="forbiddenModify" type="datetime" placeholder="" />
            </el-form-item>
          </el-col>
          <div :class="$style.divide" />
          <el-form-item label="入金" :label-width="formLabelWidth" prop="deposit">
            <el-switch v-model="dialogForm.deposit" :disabled="forbiddenModify" active-color="#13ce66" inactive-color="#ccc" />
          </el-form-item>
          <el-col :span="8">
            <el-form-item label="每充值币种" :label-width="formLabelWidth" prop="depositCurrency">
              <el-select v-model="dialogForm.depositCurrency" filterable :disabled="forbiddenModify" placeholder="请选择币种" clearable>
                <el-option v-for="item in currencyOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="数量" :label-width="formLabelWidth" prop="depositNum">
              <el-input v-model="dialogForm.depositNum" :disabled="forbiddenModify" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="提额数量" :label-width="formLabelWidth" prop="depositAmount">
              <el-input v-model="dialogForm.depositAmount" :disabled="forbiddenModify" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="提额上限" :label-width="formLabelWidth" prop="depositLimit">
              <el-input v-model="dialogForm.depositLimit" :disabled="forbiddenModify" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="任务结束统计时间" label-width="140px" prop="depositTime">
              <el-date-picker v-model="dialogForm.depositTime" value-format="timestamp" type="datetime" :disabled="forbiddenModify" placeholder="" />
            </el-form-item>
          </el-col>
          <div :class="$style.divide" />
          <el-form-item label="交易" :label-width="formLabelWidth" prop="exchange">
            <el-switch v-model="dialogForm.exchange" :disabled="forbiddenModify" active-color="#13ce66" inactive-color="#ccc" />
          </el-form-item>
          <el-col :span="8">
            <el-form-item label="每交易额度" :label-width="formLabelWidth" prop="exchangeNum">
              <el-input v-model="dialogForm.exchangeNum" :disabled="forbiddenModify" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="提额数量" :label-width="formLabelWidth" prop="exchangeAmount">
              <el-input v-model="dialogForm.exchangeAmount" :disabled="forbiddenModify" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="提额上限" :label-width="formLabelWidth" prop="exchangeLimit">
              <el-input v-model="dialogForm.exchangeLimit" :disabled="forbiddenModify" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="20">
            <el-form-item label="任务结束统计时间" label-width="140px" prop="exchangeTime">
              <el-date-picker v-model="dialogForm.exchangeTime" value-format="timestamp" :disabled="forbiddenModify" type="datetime" placeholder="" />
            </el-form-item>
          </el-col>

          <div :class="$style.divide" />

          <el-form-item label="持币" :label-width="formLabelWidth">
            <div :class="$style.holdCoin">
              <el-switch v-model="dialogForm.holdCoin" active-color="#13ce66" inactive-color="#ccc" :disabled="forbiddenModify" />
              <i class="el-icon-circle-plus-outline" :class="$style.addBtn" @click="() => forbiddenModify ? null : addHoldCoinTask()" />
            </div>
          </el-form-item>

          <div v-for="(holdCoin, index) in dialogForm.holdCoinList" :key="holdCoin.renderId" :class="$style.holdCoinSection">
            <el-col :span="8">
              <el-form-item label="每持有币种" :label-width="formLabelWidth" :prop="`holdCoinList.${index}.holdCoinCurrency`" :rules="rules.holdCoinCurrency">
                <el-select v-model="holdCoin.holdCoinCurrency" filterable placeholder="请选择币种" clearable :disabled="forbiddenModify">
                  <el-option v-for="item in currencyOptions" :key="item.id" :label="item.name" :value="item.id" :disabled="holdCoinCurrencyIsDisabled(item, index)" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="数量" :label-width="formLabelWidth" :prop="`holdCoinList.${index}.holdCoinCurrencyAmount`" :rules="rules.holdCoinCurrencyAmount">
                <el-input v-model="holdCoin.holdCoinCurrencyAmount" type="number" clearable :disabled="forbiddenModify" />
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="提额数量" :label-width="formLabelWidth" :prop="`holdCoinList.${index}.holdCoinAmount`" :rules="rules.holdCoinAmount">
                <el-input v-model="holdCoin.holdCoinAmount" type="number" clearable :disabled="forbiddenModify" />
              </el-form-item>
            </el-col>
            <el-col :span="11">
              <el-form-item label="提额上限" :label-width="formLabelWidth" :prop="`holdCoinList.${index}.holdCoinLimit`" :rules="rules.holdCoinLimit">
                <el-input v-model="holdCoin.holdCoinLimit" type="number" clearable :disabled="forbiddenModify" />
              </el-form-item>
            </el-col>
            <el-col :span="11">
              <el-form-item label="考核天数" :label-width="formLabelWidth" :prop="`holdCoinList.${index}.holdCoinDeadline`" :rules="rules.holdCoinDeadline">
                <el-input v-model="holdCoin.holdCoinDeadline" type="number" clearable :disabled="forbiddenModify" />
              </el-form-item>
            </el-col>

            <el-col :span="17">
              <el-form-item label="开始时间" :label-width="formLabelWidth" :prop="`holdCoinList.${index}.taskStartTime`" :rules="rules.holdCoinTaskStartTime">
                <el-date-picker v-model="holdCoin.taskStartTime" value-format="timestamp" :disabled="forbiddenModify" type="date" placeholder="" />
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <i class="el-icon-remove-outline" :class="$style.removeBtn" @click="() => forbiddenModify ? null : removeHoldCoinTask(index)" />
            </el-col>
          </div>
        </el-tab-pane>
        <el-tab-pane label="白名单认购配置" name="3">
          <el-form-item label="是否开启白名单认购" :label-width="formLabelWidth" prop="openState">
            <el-switch v-model="dialogForm.openState" active-color="#13ce66" inactive-color="#ccc" :active-value="1" :inactive-value="0" :disabled="forbiddenModify" />
          </el-form-item>
          <el-row>
            <el-col :span="11">
              <el-form-item label="白名单总签数" :label-width="formLabelWidth" prop="whiteListTotalQuota" :rules="dialogForm.openState === 1 ? rules.whiteListTotalQuota : [{ required: false }]">
                <el-input v-model="dialogForm.whiteListTotalQuota" placeholder="请输入正整数" clearable :disabled="forbiddenModify || dialogForm.openState === 0" @input="(value) => (dialogForm.whiteListTotalQuota = value.replace(/^(0+)|[^\d]+/g, ''))" />
              </el-form-item>
            </el-col>
            <el-col :span="11">
              <el-form-item label="每签认购额度" :label-width="formLabelWidth" prop="whiteListEachSubscriptionAmount" :rules="dialogForm.openState === 1 ? rules.whiteListEachSubscriptionAmount : [{ required: false }]">
                <el-input v-model="dialogForm.whiteListEachSubscriptionAmount" placeholder="每签可投入的上限" clearable :disabled="forbiddenModify || dialogForm.openState === 0" @input="(value) => (dialogForm.whiteListEachSubscriptionAmount = value.replace(/^\D*(\d*(?:\.\d{0,6})?).*$/g, '$1'))" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="11">
              <el-form-item label="认购单次最低投入数量" :label-width="formLabelWidth" prop="whiteListMinquantityPerTime" :rules="dialogForm.openState === 1 ? rules.whiteListMinquantityPerTime : [{ required: false }]">
                <el-input v-model="dialogForm.whiteListMinquantityPerTime" placeholder="请输入" clearable :disabled="forbiddenModify || dialogForm.openState === 0" @input="(value) => (dialogForm.whiteListMinquantityPerTime = value.replace(/^\D*(\d*(?:\.\d{0,6})?).*$/g, '$1'))" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    <div :class="$style.footer">
      <el-button @click="cancel">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </div>
  </div>
</template>
<script>
import BigNumber from 'bignumber.js'
import { mapState, mapActions } from 'vuex'
import { listConfig } from '@/api/system/languageconfig'
import { activityDetail, operateActivity } from '@/api/launchpad'
import { filesUploadAws } from '@/api/upload/upload'

const urlReg = new RegExp('^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$', 'i')
const checkRules = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请设置活动规则'))
  }
  if (value) {
    if (!urlReg.test(value)) {
      return callback(new Error('url格式不对'))
    } else {
      return callback()
    }
  }
}
export default {
  data() {
    const checkTotalQuota = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请设置认购总量'))
      }
      const reg = /^(?!\+?0+\.0+$)(?!\+?0+$)\+?\d+(?:\.\d+)?$/
      if (value) {
        if (!reg.test(value)) {
          return callback(new Error('认购总量只能是正数'))
        } else {
          return callback()
        }
      }
    }
    const checkSorts = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请设置排序'))
      }
      const reg = /^[1-9]\d*$/
      if (value) {
        if (!reg.test(value)) {
          return callback(new Error('排序只能是正整数'))
        } else {
          return callback()
        }
      }
    }

    const checkOfficialWebsite = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请设置官网（URL）'))
      }
      if (value) {
        if (!urlReg.test(value)) {
          return callback(new Error('url格式不对'))
        } else {
          return callback()
        }
      }
    }
    const checkWhitePaper = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请设置白皮书（URL）'))
      }
      if (value) {
        if (!urlReg.test(value)) {
          return callback(new Error('url格式不对'))
        } else {
          return callback()
        }
      }
    }
    const checkLockScale = (rule, value, callback) => {
      if (+this.dialogForm.isLock === 1) {
        if (!value) {
          return callback(new Error('请设置锁仓比例'))
        }
        const reg = /^[1-9]\d*$/
        if (value) {
          if (!reg.test(value) || value <= 0 || value >= 101) {
            return callback(new Error('锁仓比例为大于0并且小于或等于100的正整数'))
          } else {
            return callback()
          }
        }
      } else {
        return callback()
      }
    }
    const checkStartTime = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请设置活动开启时间'))
      } else {
        if (this.dialogForm.subscriptionStartTime) {
          if (this.dialogForm.startTime >= this.dialogForm.subscriptionStartTime) {
            return callback(new Error('活动开启时间不能晚于认购开始时间'))
          } else {
            return callback()
          }
        } else {
          return callback()
        }
      }
    }
    const checkSubscriptionStartTime = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请设置认购开始时间'))
      } else {
        if (this.dialogForm.subscriptionEndTime) {
          if (value >= this.dialogForm.subscriptionEndTime) {
            return callback(new Error('认购开始时间不能晚于认购结束时间'))
          } else {
            return callback()
          }
        }
        if (this.dialogForm.startTime) {
          if (this.dialogForm.startTime >= this.dialogForm.subscriptionStartTime) {
            return callback(new Error('认购开始时间不能早于活动开启时间'))
          } else {
            return callback()
          }
        } else {
          return callback()
        }
      }
    }
    const checkSubscriptionEndTime = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请设置认购结束时间'))
      } else {
        if (this.dialogForm.subscriptionStartTime) {
          if (value <= this.dialogForm.subscriptionStartTime) {
            return callback(new Error('认购结束时间不能早于认购开始时间'))
          } else {
            return callback()
          }
        }
        if (this.dialogForm.distributionEndTime) {
          if (this.dialogForm.subscriptionEndTime >= this.dialogForm.distributionEndTime) {
            return callback(new Error('认购结束时间不能晚于分配结束时间'))
          } else {
            return callback()
          }
        } else {
          return callback()
        }
      }
    }
    const checkDistributionEndTime = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请设置分配结束时间'))
      } else {
        if (this.dialogForm.subscriptionEndTime) {
          if (this.dialogForm.subscriptionEndTime >= this.dialogForm.distributionEndTime) {
            return callback(new Error('分配结束时间不能早于认购结束时间'))
          } else {
            return callback()
          }
        } else {
          return callback()
        }
      }
    }
    const checkBasicsQuota = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请设置基础额度'))
      }
      const reg = /^(0|[1-9]\d*)$/
      if (value) {
        if (!reg.test(value)) {
          return callback(new Error('基础额度只能是非负整数'))
        } else {
          return callback()
        }
      }
    }
    const checkHoldCoinCurrency = (vm, { required, field }, value, callback) => {
      if (!required) return callback()

      if (!value) return callback(new Error('请选择持有币种'))

      const curIndexMatch = /(?<=\.)\d(?=\.)/.exec(field)
      const curIndex = curIndexMatch ? +curIndexMatch[0] : null

      if (vm && vm.dialogForm && vm.dialogForm.holdCoinList && vm.dialogForm.holdCoinList.find((holdCoin, index) => curIndex !== index && holdCoin.holdCoinCurrency === value)) {
        return callback(new Error('持币币种不能重复'))
      } else {
        return callback()
      }
    }
    const checkHoldCoinDeadline = ({ required }, value, callback) => {
      if (!required) return callback()

      const reg = /^[1-7]$/

      if (!value) return callback(new Error('请设置考核天数'))
      return reg.test(value) ? callback() : callback(new Error('只能输入8以下正整数'))
    }
    const checkInputAmountMin = ({ required }, value, callback) => {
      if (!value) {
        return callback()
      }
      if (Number.isNaN(+value) || +value <= 0 || BigNumber(value).dp() > 12) {
        return callback(new Error('请输入小于等于12位精度的正数'))
      }
      callback()
    }
    const checkTotalAmount = ({ required }, value, callback) => {
      if (Number.isNaN(+value) || +value <= 0 || BigNumber(value).dp() > 2) {
        return callback(new Error('请输入小于等于2位精度的正数'))
      }
      callback()
    }
    const checkWhiteListEachSubscriptionAmount = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请设置每签认购额度'))
      }
      if (value <= 0) {
        return callback(new Error('每签认购额度必须大于0'))
      } else {
        return callback()
      }
    }
    const checkWhiteListMinquantityPerTime = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请设置认购单次最低投入数量'))
      }
      if (value <= 0) {
        return callback(new Error('认购单次最低投入数量必须大于0'))
      } else {
        return callback()
      }
    }
    return {
      id: this.$route.query.id || '',
      title: '',
      languageOptions: [],
      checkList: ['en_US'],
      taskKycId: '',
      taskInviteId: '',
      taskDepositId: '',
      taskExchangeId: '',
      activeTab: '1',
      formLabelWidth: '163px',
      tagsOptions: [
        { id: 'Prime', name: 'Prime' },
        { id: 'Startup', name: 'Startup' },
        { id: 'Token-sale', name: 'Token-sale' }
      ],
      lockOptions: [
        { value: 0, label: '否' },
        { value: 1, label: '是' }
      ],
      dialogForm: {
        calendarFlag: 1,
        type: 1, // 空投模式
        holdCoinList: [{ renderId: 1 }],
        rules: {},
        synopsiss: {},
        unLockRules: {},
        inputAmountMin: '',
        totalAmount: '',
        isLock: undefined,
        poolConfigList: [{}],
        openState: 0
      },
      rules: {
        currencyId: [
          { required: true, message: '请选择认购币种', trigger: 'change' }
        ],
        totalQuota: [
          { required: true, validator: checkTotalQuota, trigger: 'blur' }
        ],
        logo: [
          { required: true, message: '请上传活动海报', trigger: 'change' }
        ],
        sorts: [
          { required: true, validator: checkSorts, trigger: 'blur' }
        ],
        tags: [
          { required: true, message: '请选择活动标签', trigger: 'change' }
        ],
        calendarFlag: [
          { required: true, message: '请选择是否添加到日历管理中', trigger: 'blur' }
        ],
        officialWebsite: [
          { required: true, validator: checkOfficialWebsite, trigger: 'blur' }
        ],
        whitePaper: [
          { required: true, validator: checkWhitePaper, trigger: 'blur' }
        ],
        subscriptionCurrencyId: [
          { required: true, message: '请选择投入币种', trigger: 'change' }
        ],
        subscriptionPrice: [
          { required: true, message: '请设置兑换汇率', trigger: 'blur' }
        ],
        inputAmountMin: [
          { validator: checkInputAmountMin, trigger: 'blur' }
        ],
        totalAmount: [
          { required: true, message: '请设置投入总额', trigger: 'blur' },
          { validator: checkTotalAmount, trigger: 'blur' }
        ],
        isLock: [
          { required: true, message: '请选择是否锁仓', trigger: 'change' }
        ],
        lockScale: [
          { required: true, validator: checkLockScale, trigger: 'blur' }
        ],
        startTime: [
          { required: true, validator: checkStartTime, trigger: 'blur' }
        ],
        subscriptionStartTime: [
          { required: true, validator: checkSubscriptionStartTime, trigger: 'blur' }
        ],
        subscriptionEndTime: [
          { required: true, validator: checkSubscriptionEndTime, trigger: 'blur' }
        ],
        distributionEndTime: [
          { required: true, validator: checkDistributionEndTime, trigger: 'blur' }
        ],
        basicsQuota: [
          { required: true, validator: checkBasicsQuota, trigger: 'blur' }
        ],
        kycAmount: [
          { required: true, message: '请设置提额数量', trigger: 'blur' }
        ],
        kycTime: [
          { required: true, message: '请设置任务结束统计时间', trigger: 'blur' }
        ],
        inviteNum: [
          { required: true, message: '请设置每邀请人数', trigger: 'blur' }
        ],
        inviteAmount: [
          { required: true, message: '请设置提额数量', trigger: 'blur' }
        ],
        inviteLimit: [
          { required: true, message: '请设置提额上限', trigger: 'blur' }
        ],
        inviteTime: [
          { required: true, message: '请设置任务结束统计时间', trigger: 'blur' }
        ],
        depositCurrency: [
          { required: true, message: '请选择每充值币种', trigger: 'blur' }
        ],
        depositNum: [
          { required: true, message: '请设置数量', trigger: 'blur' }
        ],
        depositAmount: [
          { required: true, message: '请设置提额数量', trigger: 'blur' }
        ],
        depositLimit: [
          { required: true, message: '请设置提额上限', trigger: 'blur' }
        ],
        depositTime: [
          { required: true, message: '请设置任务结束统计时间', trigger: 'blur' }
        ],
        exchangeNum: [
          { required: true, message: '请设置每交易额度', trigger: 'blur' }
        ],
        exchangeAmount: [
          { required: true, message: '请设置提额数量', trigger: 'blur' }
        ],
        exchangeLimit: [
          { required: true, message: '请设置提额上限', trigger: 'blur' }
        ],
        exchangeTime: [
          { required: true, message: '请设置任务结束统计时间', trigger: 'blur' }
        ],
        holdCoinCurrency: [
          { required: true, validator: checkHoldCoinCurrency.bind(null, this), trigger: 'blur' }
        ],
        holdCoinCurrencyAmount: [
          { required: true, message: '请设置数量', trigger: 'blur' }
        ],
        holdCoinAmount: [
          { required: true, message: '请设置提额数量', trigger: 'blur' }
        ],
        holdCoinLimit: [
          { required: true, message: '请设置提额上限', trigger: 'blur' }
        ],
        holdCoinDeadline: [
          { required: true, validator: checkHoldCoinDeadline, trigger: 'blur' }
        ],
        holdCoinTaskStartTime: [
          { required: true, message: '请设置持币任务开始时间', trigger: 'blur' }
        ],
        whiteListTotalQuota: [
          { required: true, message: '请设置白名单总签数', trigger: 'blur' }
        ],
        whiteListEachSubscriptionAmount: [
          { required: true, validator: checkWhiteListEachSubscriptionAmount, trigger: 'blur' }
        ],
        whiteListMinquantityPerTime: [
          { required: true, validator: checkWhiteListMinquantityPerTime, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    checkListLang() {
      const langs = this.languageOptions.filter(item => this.checkList.includes(item.key))
      return langs
    },
    currencyOptions() {
      return this.currencyList
    },
    selectedHoldCoinCurrencyMap() {
      return new Map(
        this.dialogForm.holdCoinList
          .reduce((list, holdCoin, index) => {
            const { holdCoinCurrency } = holdCoin
            if (holdCoinCurrency) list.push([holdCoinCurrency, index])
            return list
          }, [])
      )
    },
    forbiddenModify() {
      const operation = this.$route.query.operation
      return operation === 'edit' && this.dialogForm.startTime < +new Date()
    }
  },
  watch: {
    checkList: {
      handler() {
        this.checkList.forEach(item => {
          if (!this.dialogForm.rules[item]) {
            this.$set(this.dialogForm.rules, item, '')
          }
          if (!this.dialogForm.synopsiss[item]) {
            this.$set(this.dialogForm.synopsiss, item, '')
          }
          if (!this.dialogForm.unLockRules[item]) {
            this.$set(this.dialogForm.unLockRules, item, '')
          }
        })


        this.languageOptions.forEach(item => {
          if (this.checkList.includes(item.key)) {
            const rulesRule = [
              { required: true, validator: checkRules, trigger: 'blur' }
            ]
            this.$set(this.rules, `rules.${item.key}`, rulesRule)
            const synopsissRule = [{ required: true, message: '请设置简介', trigger: 'blur' }
            ]
            this.$set(this.rules, `synopsiss.${item.key}`, synopsissRule)
            const unLockRules = [
              { required: true, message: '请设置解锁方式', trigger: 'blur' }
            ]
            this.$set(this.rules, `unLockRules.${item.key}`, unLockRules)
          } else {
            delete this.rules[`rules.${item.key}`]
            delete this.rules[`synopsiss.${item.key}`]
            delete this.rules[`unLockRules.${item.key}`]
            delete this.dialogForm.rules[item.key]
            delete this.dialogForm.synopsiss[item.key]
            delete this.dialogForm.unLockRules[item.key]
          }
        })
        this.$nextTick(() => {
          if (this.$refs.dialogForm) {
            this.$refs.dialogForm.clearValidate()
          }
        })
      },
      immediate: true
    }
  },
  async created() {
    listConfig().then(response => {
      this.languageOptions = response.rows
    })

    this.getCurrency(1)
    const operation = this.$route.query.operation
    this.title = operation === 'create' ? '创建活动' : '编辑活动'
    if (operation === 'edit') {
      this.getActiveDetail()
    }
    this.checkList.forEach(item => {
      this.rules[`rules.${item}`] = [
        { required: true, validator: checkRules, trigger: 'blur' }
      ]
      this.rules[`synopsiss.${item}`] = [
        { required: true, message: '请设置简介', trigger: 'blur' }
      ]
      this.rules[`unLockRules.${item}`] = [
        { required: true, message: '请设置解锁方式', trigger: 'blur' }
      ]
    })
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    checkRules() {
      if (this.dialogForm.UpAuth) {
        this.rules.kycAmount[0].required = true
        this.rules.kycTime[0].required = true
      } else {
        this.rules.kycAmount[0].required = false
        this.rules.kycTime[0].required = false
      }
      if (this.dialogForm.invite) {
        this.rules.inviteNum[0].required = true
        this.rules.inviteAmount[0].required = true
        this.rules.inviteLimit[0].required = true
        this.rules.inviteTime[0].required = true
      } else {
        this.rules.inviteNum[0].required = false
        this.rules.inviteAmount[0].required = false
        this.rules.inviteLimit[0].required = false
        this.rules.inviteTime[0].required = false
      }
      if (this.dialogForm.deposit) {
        this.rules.depositCurrency[0].required = true
        this.rules.depositNum[0].required = true
        this.rules.depositAmount[0].required = true
        this.rules.depositLimit[0].required = true
        this.rules.depositTime[0].required = true
      } else {
        this.rules.depositCurrency[0].required = false
        this.rules.depositNum[0].required = false
        this.rules.depositAmount[0].required = false
        this.rules.depositLimit[0].required = false
        this.rules.depositTime[0].required = false
      }
      if (this.dialogForm.exchange) {
        this.rules.exchangeNum[0].required = true
        this.rules.exchangeAmount[0].required = true
        this.rules.exchangeLimit[0].required = true
        this.rules.exchangeTime[0].required = true
      } else {
        this.rules.exchangeNum[0].required = false
        this.rules.exchangeAmount[0].required = false
        this.rules.exchangeLimit[0].required = false
        this.rules.exchangeTime[0].required = false
      }

      if (this.dialogForm.holdCoin) {
        this.rules.holdCoinCurrency[0].required = true
        this.rules.holdCoinCurrencyAmount[0].required = true
        this.rules.holdCoinAmount[0].required = true
        this.rules.holdCoinLimit[0].required = true
        this.rules.holdCoinDeadline[0].required = true
        this.rules.holdCoinTaskStartTime[0].required = true
      } else {
        this.rules.holdCoinCurrency[0].required = false
        this.rules.holdCoinCurrencyAmount[0].required = false
        this.rules.holdCoinAmount[0].required = false
        this.rules.holdCoinLimit[0].required = false
        this.rules.holdCoinDeadline[0].required = false
        this.rules.holdCoinTaskStartTime[0].required = false
      }
      if (this.dialogForm.openState === 1) {
        this.rules.whiteListTotalQuota[0].required = true
        this.rules.whiteListEachSubscriptionAmount[0].required = true
        this.rules.whiteListMinquantityPerTime[0].required = true
      } else {
        this.rules.whiteListTotalQuota[0].required = false
        this.rules.whiteListEachSubscriptionAmount[0].required = false
        this.rules.whiteListMinquantityPerTime[0].required = false
      }
    },
    getActiveDetail() {
      const id = this.$route.query.id
      activityDetail({ id: id }).then(response => {
        if (response.code === 200) {
          const curData = response.data
          const curPoolData = response.data.poolList
          this.dialogForm = {
            id: curData.id,
            currencyId: curData.currencyId,
            totalQuota: curData.totalQuotas,
            logo: curData.logo,
            sorts: curData.sorts,
            whitePaper: curData.whitePaper,
            officialWebsite: curData.officialWebsite,
            type: curData.type,
            calendarFlag: curData.calendarFlag,
            isLock: curData.isLock,
            lockScale: curData.lockScale || '',
            subscriptionCurrencyId: curData.subscriptionCurrencyId,
            subscriptionPrice: curData.subscriptionPrices,
            startTime: parseInt(curData.startTimes, 10),
            subscriptionStartTime: parseInt(curData.subscriptionStartTimes, 10),
            subscriptionEndTime: parseInt(curData.subscriptionEndTimes, 10),
            distributionEndTime: parseInt(curData.distributionEnsTimes, 10),
            basicsQuota: curData.basicsQuotas,
            holdCoin: false,
            holdCoinList: [{ renderId: 1 }],
            tags: curData.tags,
            totalAmount: curData.totalAmountStr,
            inputAmountMin: curData.inputAmountMinStr,
            rules: {},
            synopsiss: {},
            unLockRules: {},
            openState: curPoolData.length > 0 ? curPoolData[0].openState : 0,
            whiteListTotalQuota: curPoolData.length > 0 ? curPoolData[0].winnerNum : '',
            whiteListEachSubscriptionAmount: curPoolData.length > 0 ? curPoolData[0].singleAmount : '',
            whiteListMinquantityPerTime: curPoolData.length > 0 ? curPoolData[0].minAmount : ''
          }
          const jsonRule = JSON.parse(curData.rule)
          const jsonDesc = JSON.parse(curData.synopsis)
          const jsonUnLockRule = JSON.parse(curData.unlockRules)
          this.checkList = []
          Object.keys(jsonDesc).forEach(item => {
            this.$set(this.dialogForm.rules, item, jsonRule[item])
            this.$set(this.dialogForm.synopsiss, item, jsonDesc[item])
            this.$set(this.dialogForm.unLockRules, item, jsonUnLockRule[item])
            this.checkList.push(item)
          })
          const taskList = curData.taskList
          taskList.forEach((item) => {
            if (+item.type === 1) {
              this.taskKycId = item.id
              this.dialogForm.UpAuth = true
              this.dialogForm.kycAmount = item.promoteNumber
              this.dialogForm.kycTime = parseInt(item.endTime, 10)
            }
            if (+item.type === 2) {
              this.taskInviteId = item.id
              this.dialogForm.invite = true
              this.dialogForm.inviteAmount = item.promoteNumber
              this.dialogForm.inviteNum = item.askNumber
              this.dialogForm.inviteLimit = item.promoteMax
              this.dialogForm.inviteTime = parseInt(item.endTime, 10)
            }
            if (+item.type === 3) {
              this.taskDepositId = item.id
              this.dialogForm.deposit = true
              this.dialogForm.depositAmount = item.promoteNumber
              this.dialogForm.depositNum = item.askNumber
              this.dialogForm.depositLimit = item.promoteMax
              this.dialogForm.depositTime = parseInt(item.endTime, 10)
              this.dialogForm.depositCurrency = item.askCurrencyId
            }
            if (+item.type === 4) {
              this.taskExchangeId = item.id
              this.dialogForm.exchange = true
              this.dialogForm.exchangeAmount = item.promoteNumber
              this.dialogForm.exchangeNum = item.askNumber
              this.dialogForm.exchangeLimit = item.promoteMax
              this.dialogForm.exchangeTime = parseInt(item.endTime, 10)
            }
            if (+item.type === 5) {
              if (!this.dialogForm.holdCoin) {
                this.dialogForm.holdCoin = true
                this.dialogForm.holdCoinList = [{
                  renderId: item.id,
                  id: item.id,
                  holdCoinCurrency: item.askCurrencyId,
                  holdCoinCurrencyAmount: item.askNumber,
                  holdCoinAmount: item.promoteNumber,
                  holdCoinLimit: item.promoteMax,
                  holdCoinDeadline: item.deadline,
                  taskStartTime: item.taskStartTime
                }]
              } else {
                this.dialogForm.holdCoinList.push({
                  renderId: item.id,
                  id: item.id,
                  holdCoinCurrency: item.askCurrencyId,
                  holdCoinCurrencyAmount: item.askNumber,
                  holdCoinAmount: item.promoteNumber,
                  holdCoinLimit: item.promoteMax,
                  holdCoinDeadline: item.deadline,
                  taskStartTime: item.taskStartTime
                })
              }
            }
          })
          this.dialogForm = Object.assign({}, this.dialogForm)
        } else {
          this.msgError(response.msg)
        }
      })
    },
    handleStartTime() {
      this.$refs.dialogForm.validateField('startTime')
    },
    holdCoinCurrencyIsDisabled(item, index) {
      const { id: currencyId } = item

      const currencyIndex = this.selectedHoldCoinCurrencyMap.get(currencyId)

      /** unchecked */
      if (currencyIndex === undefined) return false
      /** self */
      if (currencyIndex === index) return false

      /** other checked */
      return true
    },
    cancel() {
      this.$router.go(-1)
    },
    upload(data) {
      filesUploadAws({ file: data.file }).then(res => {
        this.$set(this.dialogForm, 'logo', res.data.fullPath)
        this.$message.success('上传成功')
      })
    },
    addHoldCoinTask: (() => {
      let renderId = 1
      return function() {
        if (this.dialogForm.holdCoinList) this.dialogForm.holdCoinList.push({ renderId: ++renderId })
      }
    })(),
    removeHoldCoinTask(index) {
      if (this.dialogForm.holdCoinList && this.dialogForm.holdCoinList.length > 1) this.dialogForm.holdCoinList.splice(index, 1)
    },
    /** 提交按钮 */
    submitForm: function() {
      this.checkRules()

      const taskList = []
      if (this.dialogForm.UpAuth) {
        taskList.push({
          id: this.taskKycId ? this.taskKycId : '',
          type: 1,
          promoteNumber: this.dialogForm.kycAmount,
          endTime: this.dialogForm.kycTime,
          askNumber: '',
          promoteMax: '',
          askCurrencyId: ''
        })
      }
      if (this.dialogForm.invite) {
        taskList.push({
          id: this.taskInviteId ? this.taskInviteId : '',
          type: 2,
          promoteNumber: this.dialogForm.inviteAmount,
          endTime: this.dialogForm.inviteTime,
          askNumber: this.dialogForm.inviteNum,
          promoteMax: this.dialogForm.inviteLimit,
          askCurrencyId: ''
        })
      }
      if (this.dialogForm.deposit) {
        taskList.push({
          id: this.taskDepositId ? this.taskDepositId : '',
          type: 3,
          promoteNumber: this.dialogForm.depositAmount,
          endTime: this.dialogForm.depositTime,
          askNumber: this.dialogForm.depositNum,
          promoteMax: this.dialogForm.depositLimit,
          askCurrencyId: this.dialogForm.depositCurrency
        })
      }
      if (this.dialogForm.exchange) {
        taskList.push({
          id: this.taskExchangeId ? this.taskExchangeId : '',
          type: 4,
          promoteNumber: this.dialogForm.exchangeAmount,
          endTime: this.dialogForm.exchangeTime,
          askNumber: this.dialogForm.exchangeNum,
          promoteMax: this.dialogForm.exchangeLimit,
          askCurrencyId: ''
        })
      }

      if (this.dialogForm.holdCoin) {
        taskList.push(
          ...this.dialogForm.holdCoinList.map(holdCoin => ({
            id: holdCoin.id || '',
            type: 5,
            askCurrencyId: holdCoin.holdCoinCurrency,
            askNumber: holdCoin.holdCoinCurrencyAmount,
            promoteNumber: holdCoin.holdCoinAmount,
            promoteMax: holdCoin.holdCoinLimit,
            deadline: holdCoin.holdCoinDeadline,
            taskStartTime: holdCoin.taskStartTime
          }))
        )
      }
      const poolConfigList = []
      if (this.dialogForm.openState === 1) {
        poolConfigList.push({
          id: this.id,
          openState: 1,
          winnerNum: this.dialogForm.whiteListTotalQuota,
          minAmount: this.dialogForm.whiteListMinquantityPerTime,
          type: 1,
          singleAmount: this.dialogForm.whiteListEachSubscriptionAmount
        })
      }
      this.dialogForm.poolConfigList = poolConfigList
      this.dialogForm.taskList = taskList

      const jsonStr = JSON.stringify(this.dialogForm)
      const formatData = JSON.parse(jsonStr)
      delete formatData.UpAuth
      delete formatData.invite
      delete formatData.deposit
      delete formatData.exchange

      delete formatData.kycAmount
      delete formatData.kycTime
      delete formatData.inviteNum
      delete formatData.inviteAmount
      delete formatData.inviteLimit
      delete formatData.inviteTime
      delete formatData.depositCurrency
      delete formatData.depositNum
      delete formatData.depositAmount
      delete formatData.depositLimit
      delete formatData.depositTime
      delete formatData.exchangeNum
      delete formatData.exchangeAmount
      delete formatData.exchangeLimit
      delete formatData.exchangeTime

      delete formatData.holdCoin
      delete formatData.holdCoinList

      const operation = this.$route.query.operation
      this.$refs['dialogForm'].validate(valid => {
        if (valid) {
          if (operation === 'edit') {
            operateActivity(formatData).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                setTimeout(() => this.$router.go(-1), 1000)
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            operateActivity(formatData).then(response => {
              if (response.code === 200) {
                this.msgSuccess('添加成功')
                setTimeout(() => this.$router.go(-1), 1000)
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    }
  }
}
</script>
<style lang="scss" module>
.title {
  margin: 10px 0;
  font-weight: bold;
}
.footer {
  margin-left: 550px;
}
.divide {
  width: 100%;
  overflow: hidden;
  border-top: 1px solid #ccc;
  margin-bottom: 10px;
}
.holdCoin {
  display: flex;
  justify-content: space-between;
  margin-top: 7px;
  align-items: center;
  .addBtn {
    color: green;
    font-weight: bold;
    font-size: 24px;
    cursor: pointer;
  }
}
.holdCoinSection {
  overflow: hidden;
  .removeBtn {
    margin: 6px 0 0 28px;
    font-size: 24px;
    color: red;
    font-weight: bold;
    cursor: pointer;
  }
}
</style>
