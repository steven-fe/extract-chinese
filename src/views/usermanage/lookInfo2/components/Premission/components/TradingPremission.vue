
<template>
  <div class="tradingpremission-container">
    <!-- 现货 -->
    <div class="premission-title">
      <div class="premission-left">
        <h3>现货交易权限</h3>
        <br>
        <span v-if="userInfo && userInfo.cmsSpotTradeLimit === 1" class="title-tip">
          用户已被禁止所有现货币对交易
        </span>
        <div class="switch-wraper">
          <span>所有现货币对交易权限：</span>
          <el-button
            v-if="userInfo && userInfo.cmsSpotTradeLimit === 1"
            type="primary"
            size="mini"
            @click="openStatus(1)"
          >
            开启
          </el-button>
          <div style="margin-left: 10px;">
            <el-button
              v-if="userInfo && userInfo.cmsSpotTradeLimit !== 1"
              type="danger"
              size="mini"
              @click="openCloseDialog('spot')"
            >
              禁止
            </el-button>
            <el-tooltip
              v-if="userInfo && userInfo.cmsSpotTradeLimit !== 1"
              :content="tipText"
              placement="top"
            >
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </div>
        </div>
        <div class="radio-wraper">
          <el-radio v-model="radio" label="0" @change="radioChange">所有现货币对可交易</el-radio>
          <el-radio v-model="radio" label="2">指定现货币对可交易</el-radio>
        </div>
      </div>
      <div class="premission-right other-wraper">
        <div class="handle-box">
          <div v-if="radio === '2'" class="tree-box">
            <div class="source-tree">
              <el-input
                v-model="spotSearchText"
                prefix-icon="el-icon-search"
                size="mini"
                clearable
                placeholder="请输入需要搜索的现货币对"
                @input="searchSpot"
              />
              <el-checkbox v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
              <el-checkbox-group
                v-model="defaultCheckedKeys"
                @change="clickSpotCheck"
              >
                <el-checkbox
                  v-for="item in spotList"
                  :key="item.id"
                  :label="item.id"
                >
                  {{ item.label }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
            <div class="selected-list">
              <div class="list-t">
                已选 {{ selectedList.length }} 个
                <el-button
                  type="text"
                  size="mini"
                  :disabled="!!!selectedList.length"
                  @click="clearSelected"
                >
                  清空
                </el-button>
              </div>

              <div class="tag-list">
                <el-tag
                  v-for="tag in selectedList"
                  :key="tag.symbolId"
                  closable
                  type="info"
                  :disable-transitions="false"
                  @close="tagClose(tag)"
                >
                  {{ tag.label }}
                </el-tag>
              </div>
            </div>
          </div>
          <div v-if="radio === '2'" class="button-wraper">
            <el-button type="primary" size="mini" @click="submitSelectSpot">
              确认添加
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <!-- 合约 -->
    <div class="premission-title">
      <div class="premission-left">
        <h3>合约交易权限</h3>
        <br>
        <span v-if="userInfo && userInfo.cmsSwapTradeLimit === 1" class="title-tip">
          用户已被禁止所有合约标的交易
        </span>
        <div class="handle-wraper">
          <div class="switch-wraper">
            <span>所有合约标的交易权限(禁止开仓和平仓)：</span>
            <el-button
              v-if="userInfo && userInfo.cmsSwapTradeLimit === 1"
              type="primary"
              size="mini"
              @click="openStatus(2)"
            >
              开启
            </el-button>
            <div style="margin-left: 10px;">
              <el-button
                v-if="userInfo && userInfo.cmsSwapTradeLimit !== 1"
                type="danger"
                size="mini"
                @click="openCloseDialog('pact')"
              >
                禁止
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 禁止现货/合约操作modal -->
    <Dialog
      :title="closeHandleTitle"
      :visible="closeDialogVisible"
      @cancel="closeDialogVisible = false"
      @submit="closeHandleSubmit"
    >
      <div v-if="closeHandleType ==='spot'">
        确定关闭用户现货交易权限？
        <p v-if="isOrder" style="color: #d81e06;">用户当前存在现货委托单</p>
      </div>
      <div v-if="closeHandleType === 'pact'">
        确定关闭用户合约交易权限(禁止开仓和平仓)？
        <p v-if="isEntrust || isPosition" style="color: #d81e06;">用户当前存在合约委托/仓位</p>
      </div>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/iDialog'
import { Message, MessageBox } from 'element-ui'
import { getList } from '@/api/systemsetting/currencypairmanage'
import {
  userInfo,
  modifyStatus,
  saveAuthData
} from '@/api/user'
import { entrustList, getUserPositionList, getActiveOrderList } from '@/api/userinfo/userInfo'
export default {
  name: 'TradingPremission',
  components: {
    Dialog
  },
  props: {
    uid: { // 用户长id
      type: String,
      default: ''
    },
    userId: { // 用户短id
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tipText: '重新开启现货交易权限时，将会保留仅支持交易的现货币对',
      closeHandleTitle: '',
      closeHandleType: '',
      closeDialogVisible: false,
      spotList: [],
      spotSearchText: '',
      selectedList: [],
      radio: '0',
      userInfo: null,
      statusParams: {
        userId: this.userId,
        status: null, // 0开启 1 禁止
        type: null // 1现货 2 合约
      },
      saveAuthParams: {
        userId: this.userId,
        cmsSpotTradeLimit: 0,
        cmsSpotTradePairsList: [],
        cmsSwapTradeLimit: 0,
        cmsSwapTradePairsList: [],
        reqType: 1 // 1现货 2 合约
      },
      isOrder: false, // 是否有现货委托
      isEntrust: false, // 是否有合约委托
      isPosition: false, // 是否合约持仓
      originSoptList: [],
      timer: null,
      checkAll: false,
      defaultCheckedKeys: []
    }
  },
  async created() {
    await this.getSpotList()
    this.getUserInfo()
  },
  beforeDestroy() {
    this.timer = null
  },
  methods: {
    /**
     * 币对列表搜索
     */
    searchSpot() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        const filterList = this.originSoptList.filter(item => item.label.indexOf(this.spotSearchText) !== -1)
        this.spotList = filterList
        // 每次筛选后判断是否全选
        const checkedCount = this.defaultCheckedKeys.length
        this.checkAll = checkedCount >= filterList.length
      }, 500)
    },
    /**
     * 是否存在现货委托/合约委托持仓
     */
    async checkUserSpot1Pact() {
      const { data } = await getActiveOrderList({ pageSize: 1, userId: this.userId })
      const { rows: spotList } = await entrustList({ pageSize: 1, userShortId: this.userId })
      const { rows: pactList } = await getUserPositionList({ pageSize: 1, userShortId: this.userId })
      this.isOrder = !!data.length // 现货委托单
      this.isEntrust = !!spotList.length // 合约委托
      this.isPosition = !!pactList.length // 合约持仓
    },
    /**
     * 选择现货所以币对列表可交易选项
     */
    async radioChange() {
      if (this.radio === '0') {
        this.saveAuthParams.cmsSpotTradeLimit = 0
        await saveAuthData(this.saveAuthParams)
        this.getUserInfo()
      }
    },
    // 开启现货/合约交易
    async openStatus(type) {
      this.statusParams.type = type
      this.statusParams.status = 0
      await modifyStatus(this.statusParams)
      this.msgSuccess('开启成功')
      this.getUserInfo()
    },
    // 清空执行现货币对
    async clearSelected() {
      try {
        await MessageBox.confirm(
          '确定清空所有现货交易对？',
          this.$t('common.prompt'),
          {
            type: 'warning',
            dangerouslyUseHTMLString: true,
            confirmButtonText: this.$t('common.sure'),
            cancelButtonText: this.$t('common.cancel')
          }
        ).then(async() => {
          this.saveAuthParams.cmsSpotTradeLimit = 1
          this.saveAuthParams.cmsSpotTradePairsList = []
          await saveAuthData(this.saveAuthParams)
          Message.success('操作成功！')
          this.selectedList = []
          this.defaultCheckedKeys = []
          this.checkAll = false
          this.getUserInfo()
        })
      } catch (e) {
        console.log(e)
      }
    },
    handleCheckAllChange() {
      if (this.checkAll) {
        this.defaultCheckedKeys = this.spotList.map(item => item.id)
      } else {
        this.defaultCheckedKeys = []
      }
    },
    // 点击选择现货币对儿
    clickSpotCheck(e) {
      const checkedCount = e.length
      this.checkAll = checkedCount === this.spotList.length
    },
    // 删除某现货币对 只是本地删除，保存时保存
    async tagClose(tag) {
      const index = this.selectedList.findIndex(_item => _item.id === tag.id)
      const keysIndex = this.defaultCheckedKeys.findIndex(_item => _item === tag.id)
      if (index !== -1) {
        this.selectedList.splice(index, 1)
      }
      if (keysIndex !== -1) {
        this.defaultCheckedKeys.splice(keysIndex, 1)
      }
      this.saveAuthParams.cmsSpotTradeLimit = 2
      this.saveAuthParams.cmsSpotTradePairsList = this.defaultCheckedKeys
    },
    // 提交选择的币对列表
    async submitSelectSpot() {
      if (this.defaultCheckedKeys.length <= 0) {
        this.saveAuthParams.cmsSpotTradeLimit = 1
      } else {
        this.saveAuthParams.cmsSpotTradeLimit = 2
      }
      this.saveAuthParams.cmsSpotTradePairsList = this.defaultCheckedKeys
      await saveAuthData(this.saveAuthParams)
      this.getUserInfo()
      this.msgSuccess(this.$t('common.operationSucceed'))
    },
    // 获取币对列表
    async getSpotList() {
      const { rows } = await getList({
        pageSize: 9999
      })
      // todo: 是否需要判断是否可交易，是否上线等情况
      this.spotList = rows.map(item => {
        const _item = {
          id: item.instrumentId,
          label: item.showName
        }
        this.originSoptList.push(_item)
        return _item
      })
    },
    // 获取用户详情
    async getUserInfo() {
      const { data } = await userInfo({ uid: this.userId })
      this.userInfo = data
      const { cmsSpotTradeLimit, cmsSpotTradePairsList, cmsSwapTradeLimit, cmsSwapTradePairsList } = data
      this.radio = String(cmsSpotTradeLimit)
      this.saveAuthParams = {
        ...this.saveAuthParams,
        cmsSpotTradeLimit,
        cmsSpotTradePairsList,
        cmsSwapTradeLimit,
        cmsSwapTradePairsList
      }
      // 根据名称找到id
      this.defaultCheckedKeys = []
      this.selectedList = []
      cmsSpotTradePairsList.forEach(_i => {
        this.originSoptList.forEach(_s => {
          if (_i === _s.id) {
            this.selectedList.push(_s)
            this.defaultCheckedKeys.push(_s.id)
          }
        })
      })
      // 判断全选
      if (this.selectedList.length === this.originSoptList.length) {
        this.checkAll = true
      }
    },
    // 禁止现货/合约交易权限
    async closeHandleSubmit() {
      try {
        this.statusParams.status = 1
        await modifyStatus(this.statusParams)
        this.msgSuccess('禁止成功')
        this.getUserInfo()
        this.closeDialogVisible = false
      } catch (error) {
        console.log(error)
      }
    },
    // 打开弹窗
    async openCloseDialog(type) {
      this.closeHandleType = type
      await this.checkUserSpot1Pact()
      if (type === 'spot') {
        this.closeHandleTitle = '关闭现货交易权限'
        this.statusParams.type = 1
      } else {
        this.closeHandleTitle = '关闭合约交易权限'
        this.statusParams.type = 2
      }
      this.closeDialogVisible = true
    }
  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped lang="scss">
.tradingpremission-container {
  margin-top: 15px;
  display: flex;
  padding-bottom: 20px;
  .premission-title {
    width: 100%;
    font-size: 16px;
    flex: 1;

    .premission-left {
      font-size: 13px;
      h3{
        padding: 0;
        margin: 0;
      }
      .title-tip {
        margin: 15px 0;
        display: block;
        font-size: 13px;
        color: #d81e06;
      }
      .switch-wraper {
        display: flex;
        align-items: center;
        i {
          font-size: 14px;
          margin-left: 6px;
          cursor: pointer;
        }
      }
    }
    .radio-wraper {
      margin-top: 20px;
      display: flex;
      align-items: center;
    }
    .other-wraper {
      width: 600px;
      margin-top: 20px;
      .handle-box {
        .tree-box {
          display: flex;
          border-radius: 4px 4px 0 0;
          border: 1px solid #eee;
          position: relative;
          &::after {
            content: '';
            width: 1px;
            height: 100%;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            top: 0;
            background-color: #eee;
          }
          .source-tree {
            flex: 1;
            position: relative;
            box-sizing: border-box;
            padding: 15px 20px;
            >>> .el-input {
              margin-bottom: 15px;
              input {
                background: #F2F6FC;
                border: none;
              }
            }
            .el-checkbox-group {
              display: flex;
              flex-direction: column;
              max-height: 350px;
              overflow-y: auto;
            }
            .el-checkbox  {
              font-size: 13px;
              color: #606266;
              font-weight: 400;
              margin-bottom: 5px;
            }
          }
          .selected-list {
            flex: 1;
            display: flex;
            flex-wrap: wrap;
            align-content: flex-start;
            position: relative;
            box-sizing: border-box;
            padding: 15px 20px;
            max-height: 100%;
            overflow: hidden;
            .tag-list {
              width: 100%;
              max-height: 386px;
              overflow-y: auto;
              .el-tag {
                margin-right: 10px;
                margin-bottom: 10px;
              }
            }
            .list-t {
              display: flex;
              align-items: center;
              font-size: 15px;
              color: #606266;
              .el-button {
                font-size: 15px;
                font-weight: 600;
                margin-left: 10px;
              }
            }
          }
        }
        .button-wraper {
          border: 1px solid #eee;
          border-top: none;
          padding: 10px 20px;
          border-radius: 0 0 4px 4px;
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }
  .premission-title:first-child {
    position: relative;
    &::after{
      content: '';
      width: 1px;
      height: 100%;
      background: #eee;
      position: absolute;
      right: 20px;
      top: 0;
    }
  }
}
</style>
