<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24">
        <div class="base">
          <span class="title">{{ $t('app.platformBasicData') }}</span>
          <div class="base-box">
            <div class="base-left">
              <p>{{ $t('index.today') }}</p>
              <p>{{ $t('index.yesterday') }}</p>
              <p>{{ $t('index.accumulativeTotal') }}</p>
            </div>
            <div v-for="item in sceneUserList" :key="item.babel" class="base-right">
              <div class="label">{{ item.label }}</div>
              <p v-if="item.scene!=='spotTradingAmount'">{{ format_number(item.todayCount) }}</p>
              <p v-if="item.scene!=='spotTradingAmount'">{{ format_number(item.yesterdayCount) }}</p>
              <p v-if="item.scene!=='spotTradingAmount'">{{ format_number(item.totalCount) }}</p>
              <p v-if="item.scene ==='spotTradingAmount'">{{ format_number(item.todayAmount) }}</p>
              <p v-if="item.scene ==='spotTradingAmount'">{{ format_number(item.yesterdayAmount) }}</p>
              <p v-if="item.scene ==='spotTradingAmount'">{{ format_number(item.totalAmount) }}</p>
            </div>
          </div>

        </div>
      </el-col>
    </el-row>
    <el-row class="row-center" :gutter="10">
      <el-col>
        <div class="base">
          <div class="button-scene">
            <el-radio-group
              v-model="queryParamsUser.scene"
              @change="handleUserChart"
            >
              <el-radio-button label="login">{{ $t('index.login') }}</el-radio-button>
              <el-radio-button label="register">{{ $t('common.signUp') }}</el-radio-button>
              <el-radio-button label="trade">{{ $t('index.transaction') }}</el-radio-button>
              <el-radio-button label="deposit">{{ $t('index.topUp') }}</el-radio-button>
              <el-radio-button label="withdraw">{{ $t('index.withdrawalOfCurrency') }}</el-radio-button>
            </el-radio-group>
          </div>
          <div class="line">
            <ve-line
              :data="chartData"
              :loading="loadingUser"
              :data-empty="emptyUser"
              :settings="chartSettings"
            />
          </div>
          <div class="button-scene">
            <el-radio-group
              v-model="queryParamsUser.interval"
              @change="handleUserChart"
            >
              <el-radio-button label="1">{{ $t('index.day7') }}</el-radio-button>
              <el-radio-button label="2">{{ $t('index.day30') }}</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <div class="base">
          <span class="title">{{ $t('index.platformData') }}</span>
          <div class="queryParams-bottom">
            <el-form
              ref="queryParamsDW"
              :model="queryParamsDW"
              :inline="true"
              label-width="80px"
            >
              <el-form-item :label="$t('common.coin')">
                <el-select
                  v-model="queryParamsDW.name"
                  size="mini"
                  :placeholder="$t('common.selectCurrency')"
                  @change="handleDWSelect"
                >
                  <el-option
                    v-for="(item, index) in dwCurrencyList"
                    :key="index"
                    :label="item.name"
                    :value="item.name"
                  />
                </el-select>
              </el-form-item>
            </el-form>
          </div>
          <div class="card">
            <el-card
              v-for="(item, index) in sceneDWList"
              :key="index"
              class="box-card-index transaction dw"
              :body-style="{ padding: '0px' }"
            >
              <div v-if=" item.scene !=='wcount' && item.scene !=='wamount'" class="content">{{ item.label }}({{ item.symbol }})</div>
              <div v-else class="content">{{ item.label }}</div>
              <div class="content">{{ item.todayAmount }}</div>
              <div class="content bottom">{{ $t('index.accumulativeTotal') }}:{{ item.totalAmount }}</div>
            </el-card>
          </div>
          <el-row class="el-row-bottom">
            <el-col :span="18">
              <div class="button-scene">
                <el-radio-group
                  v-model="queryParamsDWScene.scene"
                  @change="handleDWChart"
                >
                  <el-radio-button label="wcount">{{ $t('index.withdrawalAmount') }}</el-radio-button>
                  <el-radio-button label="wamount">{{ $t('index.withdrawalMoney') }}</el-radio-button>
                  <el-radio-button label="dcount">{{ $t('index.recharge') }}</el-radio-button>
                  <el-radio-button label="damount">{{ $t('index.rechargeMoney') }}</el-radio-button>
                </el-radio-group>
              </div>
              <div class="line">
                <ve-line
                  :data="chartDWData"
                  :loading="loadingDW"
                  :data-empty="emptyDW"
                  :settings="chartTradeSettings"
                />
              </div>
              <div class="button-scene">
                <el-radio-group
                  v-model="queryParamsDWScene.interval"
                  @change="handleDWChart"
                >
                  <el-radio-button label="1">{{ $t('index.day7') }}</el-radio-button>
                  <el-radio-button label="2">{{ $t('index.day30') }}</el-radio-button>
                </el-radio-group>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import {
  userDateStats,
  userDateChart,
  dwDataStats,
  dwDataChart
} from '@/api/index/index'
import { listSupportTokenByType } from '@/api/coin'
export default {
  name: '',

  data() {
    this.chartSettings = {
      labelMap: {
        userCount: this.$t('index.numberOfUsers')
      }
    }
    this.chartTradeSettings = {
      labelMap: {
        amount: this.$t('index.countOfUsers')
      }
    }
    this.extend = {
      series: {
        label: {
          normal: {
            show: true
          }
        }
      }
    }
    return {
      // loading: undefined,
      // fullscreenLoading: false,
      chartData: {
        columns: ['statsDate', 'userCount'],
        rows: []
      },
      chartDWData: {
        columns: ['statsDate', 'amount'],
        rows: []
      },
      sceneUserList: [
        {
          scene: 'login',
          label: this.$t('index.loginUser'),
          todayCount: 0,
          totalCount: 0,
          yesterdayCount: 0
        },
        {
          scene: 'register',
          label: this.$t('index.registeredUser'),
          todayCount: 0,
          totalCount: 0,
          yesterdayCount: 0
        },
        {
          scene: 'deposit',
          label: this.$t('index.topUpUser'),
          todayCount: 0,
          totalCount: 0,
          yesterdayCount: 0
        },
        {
          scene: 'withdraw',
          label: this.$t('index.withdrawalUser'),
          todayCount: 0,
          totalCount: 0,
          yesterdayCount: 0
        },
        {
          scene: 'trade',
          label: this.$t('index.spotTradingUser'),
          todayCount: 0,
          totalCount: 0,
          yesterdayCount: 0
        },
        {
          scene: 'spotTradingAmount',
          label: this.$t('index.spotTradingVolume'),
          todayCount: 0,
          totalAmount: 0,
          yesterdayAmount: 0
        }
      ],
      sceneTradeList: [],
      sceneDWList: [],
      flag: false,
      dwStatsList: [],
      loadingUser: true,
      loadingDW: true,
      emptyUser: false,
      emptyDW: false,
      userDateStatsList: [],
      queryParamsUser: {
        scene: 'login',
        interval: '1'
      },
      queryParamsDWScene: {
        symbol: undefined,
        scene: 'wcount',
        interval: '1'
      },
      queryParamsDW: {
        name: undefined
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    dwCurrencyList() {
      return this.currencyList
    }
  },
  watch: {
    dwCurrencyList(val) {
      if (val) {
        this.queryParamsDW.name = val[0].name
        this.getDwDataStats()
        this.getDWDateChart()
      }
    }
  },
  created() {
    this.getCurrency(1)
    this.getUserDateStatsList()
    this.getUserDateChart()
    // this.openFullScreen();
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    // 平台基础数据
    getUserDateStatsList() {
      userDateStats().then((response) => {
        if (response.code == 200) {
          this.userDateStatsList = response.data
          this.sceneUserList.forEach((element) => {
            this.userDateStatsList.forEach((e) => {
              if (e.scene && element.scene == e.scene) {
                element.todayCount = e.todayCount
                element.totalCount = e.totalCount
                element.yesterdayCount = e.yesterdayCount
                element.todayAmount = e.todayAmount
                element.yesterdayAmount = e.yesterdayAmount
                element.totalAmount = e.totalAmount
              }
            })
          })
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 基础数据图表
    getUserDateChart() {
      this.loadingUser = true
      userDateChart(this.queryParamsUser).then((response) => {
        if (response.code == 200) {
          this.chartData.rows = response.data
          if (this.chartData.rows.length == 0) {
            this.emptyUser = true
          } else {
            this.emptyUser = false
          }
          this.loadingUser = false
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 充提图表
    getDWDateChart() {
      this.loadingDW = true
      this.queryParamsDWScene.symbol = this.queryParamsDW.name
      dwDataChart(this.queryParamsDWScene).then((response) => {
        if (response.code == 200) {
          this.chartDWData.rows = response.data
          if (this.chartDWData.rows.length == 0) {
            this.emptyDW = true
          } else {
            this.emptyDW = false
          }
          this.loadingDW = false
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 平台充提数据
    getDwDataStats() {
      this.resetDW()
      const form = {
        symbol: this.queryParamsDW.name
      }
      dwDataStats(form).then((response) => {
        this.dwStatsList = response.data
        if (response.code == 200) {
          this.sceneDWList.forEach((element) => {
            element.symbol = this.queryParamsDW.name
            this.dwStatsList.forEach((e) => {
              if (e.scene && element.scene == e.scene) {
                element.todayAmount = e.todayAmount
                element.totalAmount = e.totalAmount
              }
            })
          })
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 重置
    resetDW() {
      this.sceneDWList = [
        {
          scene: 'wcount',
          label: this.$t('index.withdrawalNumByData'),
          symbol: undefined,
          todayAmount: 0,
          totalAmount: 0
        },
        {
          scene: 'wamount',
          label: this.$t('index.withdrawalAmountByData'),
          symbol: undefined,
          todayAmount: 0,
          totalAmount: 0
        },
        {
          scene: 'dcount',
          label: this.$t('index.payNumByData'),
          symbol: undefined,
          todayAmount: 0,
          totalAmount: 0
        },
        {
          scene: 'damount',
          label: this.$t('index.payAmountByData'),
          symbol: undefined,
          todayAmount: 0,
          totalAmount: 0
        }
      ]
    },
    // 过滤
    unique(arr) {
      const res = new Map()
      return arr.filter(
        (arr) => !res.has(arr.currency) && res.set(arr.currency, 1)
      )
    },
    // 过滤
    unique2(arr) {
      const res = new Map()
      return arr.filter(
        (arr) => !res.has(arr.goodsId) && res.set(arr.goodsId, 1)
      )
    },
    // 过滤
    unique3(arr) {
      const res = new Map()
      return arr.filter(
        (arr) => !res.has(arr.marginCoin) && res.set(arr.marginCoin, 1)
      )
    },
    // 平台充提数据选择
    handleDWSelect() {
      this.getDWDateChart()
      this.getDwDataStats()
    },
    handleUserChart() {
      this.getUserDateChart()
    },
    handleDWChart() {
      this.getDWDateChart()
    },
    // 千分位分隔
    format_number(n) {
      const b = parseInt(n).toString()
      const len = b.length
      if (len <= 3) { return b }
      const r = len % 3
      return r > 0 ? b.slice(0, r) + ',' + b.slice(r, len).match(/\d{3}/g).join(',') : b.slice(r, len).match(/\d{3}/g).join(',')
    }
  }
}
</script>

<style scoped>
.queryParams-bottom {
  margin: 5px 0;
}
.transaction {
  width: 260px !important;
}
.dw {
  width: 350px !important;
}
.el-row-bottom {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
.button-scene {
  margin: 10px 0;
  display: flex;
  justify-content: space-around;
}
.el-row {
  margin-bottom: 10px;
}
.base {
  width: 100%;
  padding-bottom: 20px;
  padding-top: 5px;
  border: solid 1px rgb(121, 121, 121);
}
.base .title {
  font-size: 18px;
  color: rgb(120, 120, 120);
  font-weight: 600;
  margin-left: 10px;
}
.tab-title{
  display: flex;
  justify-content: space-around;
  padding-left: 100px;
}
.base-box{
  display: flex;
}
.base-box>.base-left{
  flex: 6;
  text-align: center;
  padding-top: 20px;
  box-sizing: border-box;
}
.base-box>.base-right{
  flex: 18;
}
.base-box>.base-right:hover{
  color: rgb(0, 144, 171);
}
.label{
  text-align: center;
}
.base-box>.base-right> p {
  text-align: center;
}
.card {
  display: flex;
  margin-top: 10px;
  justify-content: space-around;
}

.card-position {
  margin: 5px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
.box-card-index {
  height: 150px;
  width: 250px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-content: space-around;
  border-radius: 10px;
}
.big-text {
  font-size: 24px;
}
.box-card-position {
  text-align: center;
  height: 120px;
}
.box-card-position:nth-child(2) {
  margin: 24px 0 23px 0;
}
.content {
  line-height: 2;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.content-position {
  line-height: 2.5;
}
.queryParams {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-left: 9px;
}
.bottom {
  color: white;
  background: #0000007d;
  border-radius: 5px;
}
.app-container {
  padding-bottom: 50px;
}
</style>
<style>
.box-card-index .el-card__body {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.el-radio-button__inner {
  width: 200px;
}
.queryParams .el-form-item__label {
  line-height: 0;
  padding: 0;
}
.queryParams .el-form-item {
  width: 48%;
  margin-right: 0;
  margin-bottom: 0;
}
.queryParams-bottom .el-form-item {
  margin-bottom: 0;
}
</style>
