<template>
  <div class="app-container">
    <el-table v-loading="loading" border :data="tableList">
      <el-table-column
        v-if="tableList.length > 0"
        :label="$t('common.coin')"
        align="center"
        fixed="left"
        prop="symbol"
        width="120"
      />
      <el-table-column
        v-else
        :label="$t('common.coin')"
        align="center"
        prop="symbol"
        width="120"
      />
      <el-table-column label="可用账户" align="center" width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'usable'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span v-if="sceneList[scope.$index].indexOf('usable') === -1">0</span>
        </template>
      </el-table-column>
      <el-table-column label="冻结" align="center" width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'freeze'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span v-if="sceneList[scope.$index].indexOf('freeze') === -1">0</span>
        </template>
      </el-table-column>
      <el-table-column label="锁仓" align="center" width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'locked'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span v-if="sceneList[scope.$index].indexOf('locked') === -1">0</span>
        </template>
      </el-table-column>
      <el-table-column label="充值" align="center" width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'deposit'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="sceneList[scope.$index].indexOf('deposit') === -1"
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="提现" align="center" width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'withdraw_success'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="sceneList[scope.$index].indexOf('withdraw_success') === -1"
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="签到奖励" align="center" width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'wallet_to_wallet_checkin'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="
              sceneList[scope.$index].indexOf('wallet_to_wallet_checkin') === -1
            "
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="注册奖励" align="center" width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'wallet_to_wallet_register'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="
              sceneList[scope.$index].indexOf('wallet_to_wallet_register') ===
                -1
            "
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="邀请奖励" align="center" width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'wallet_to_wallet_invite'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="
              sceneList[scope.$index].indexOf('wallet_to_wallet_invite') === -1
            "
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="提现手续费" align="center" width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'withdraw_succ_fee'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="sceneList[scope.$index].indexOf('withdraw_succ_fee') === -1"
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="赠币" align="center" width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'present' && item.direct == 2">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="sceneList[scope.$index].indexOf('present') === -1"
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="钱包空投" align="center" width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'airdrop'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="sceneList[scope.$index].indexOf('airdrop') === -1"
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="钱包划扣" align="center" width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'withhold'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="sceneList[scope.$index].indexOf('withhold') === -1"
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="钱包到合约" align="center" width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'wallet_to_cfd'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="sceneList[scope.$index].indexOf('wallet_to_cfd') === -1"
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="合约到钱包" align="center" width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'cfd_to_wallet'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="sceneList[scope.$index].indexOf('cfd_to_wallet') === -1"
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="钱包到期权" align="center" width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'wallet_to_option'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="sceneList[scope.$index].indexOf('wallet_to_option') === -1"
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="期权到钱包" align="center" width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'option_to_wallet'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="sceneList[scope.$index].indexOf('option_to_wallet') === -1"
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="钱包平账减" align="center" width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'finance_flat_bill_scene_1'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="
              sceneList[scope.$index].indexOf('finance_flat_bill_scene_1') ===
                -1
            "
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="钱包平账加" align="center" width="120">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'finance_flat_bill_scene_2'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="
              sceneList[scope.$index].indexOf('finance_flat_bill_scene_2') ===
                -1
            "
          >0</span>
        </template>
      </el-table-column>
      <el-table-column
        label="平账结果"
        align="center"
        prop="result"
        width="120"
      />
      <!-- <el-table-column :label="$t('common.operation')" align="center" width="110">
        <template slot-scope="scope">
          <el-button
            size="mini"
            :disabled="scope.row.result==0"
            @click="handleManual(scope.row)"
          >手动平账</el-button>
        </template>
      </el-table-column> -->
    </el-table>
  </div>
</template>

<script>
import { financeBiilingInfo, manualFlatBill } from '@/api/contract/biilingInfo'
export default {
  props: ['msg'],
  data() {
    return {
      loading: true,
      queryParams: {
        uid: this.msg
      },
      tableList: [],
      sceneList: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.sceneList = []
      this.loading = true
      financeBiilingInfo(this.queryParams)
        .then((response) => {
          if (response.code == 200 && response.data) {
            this.tableList = response.data
            this.tableList.forEach((element, index) => {
              const itemList = []
              element.sceneFlowList.forEach((e) => {
                var item = e.item
                itemList.push(item)
              })
              this.sceneList.push(itemList)
            })
          } else {
            this.tableList = []
            this.msgError(response.msg)
          }
          this.loading = false
        })
        .catch((error) => {
          console.log(error)
        })
    },
    handleManual(row) {
      const data = {
        uid: row.uid,
        symbol: row.symbol,
        scene: 'finance_flat_bill_scene',
        amount: Math.abs(parseInt(row.result)),
        directType: row.result < 0 ? 1 : 2
      }
      manualFlatBill(data).then((response) => {
        if (response.code == 200) {
          this.msgSuccess(response.msg)
          this.load()
        } else {
          this.msgError(response.msg)
        }
      })
    }
  }
}
</script>
