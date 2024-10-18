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
      <el-table-column label="可用账户" align="center" width="100">
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
      <el-table-column label="保证金账户" align="center" width="100">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'margin'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span v-if="sceneList[scope.$index].indexOf('margin') === -1">0</span>
        </template>
      </el-table-column>
      <el-table-column label="收益账户" align="center" width="100">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'profit'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span v-if="sceneList[scope.$index].indexOf('profit') === -1">0</span>
        </template>
      </el-table-column>
      <el-table-column label="开仓转出可用" align="center" width="120">
        <template slot-scope="scope">
          <span
            v-if="sceneList[scope.$index].indexOf('usable-balance_1') != -1"
          >
            <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
              <span v-if="item.item == 'usable-balance_1' && item.direct == 1">
                <span v-if="item.direct == 0" />
                <span v-if="item.direct == 1">-</span>
                <span v-if="item.direct == 2">+</span>
                {{ item.amount }}
              </span>
            </span>
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column label="平仓转入可用" align="center" width="120">
        <template slot-scope="scope">
          <span
            v-if="sceneList[scope.$index].indexOf('usable-balance_2') != -1"
          >
            <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
              <span v-if="item.item == 'usable-balance_2' && item.direct == 2">
                <span v-if="item.direct == 0" />
                <span v-if="item.direct == 1">-</span>
                <span v-if="item.direct == 2">+</span>
                {{ item.amount }}
              </span>
            </span>
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column label="开仓转入保证金" align="center" width="120">
        <template slot-scope="scope">
          <span
            v-if="sceneList[scope.$index].indexOf('margin-balance_2') != -1"
          >
            <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
              <span v-if="item.item == 'margin-balance_2' && item.direct == 2">
                <span v-if="item.direct == 0" />
                <span v-if="item.direct == 1">-</span>
                <span v-if="item.direct == 2">+</span>
                {{ item.amount }}
              </span>
            </span>
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column label="平仓转出保证金" align="center" width="120">
        <template slot-scope="scope">
          <span
            v-if="sceneList[scope.$index].indexOf('margin-balance_1') != -1"
          >
            <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
              <span v-if="item.item == 'margin-balance_1' && item.direct == 1">
                <span v-if="item.direct == 0" />
                <span v-if="item.direct == 1">-</span>
                <span v-if="item.direct == 2">+</span>
                {{ item.amount }}
              </span>
            </span>
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column label="开仓手续费" align="center" width="100">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'open-position-fee'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="sceneList[scope.$index].indexOf('open-position-fee') === -1"
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="平仓手续费" align="center" width="100">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'close-position-fee'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="sceneList[scope.$index].indexOf('close-position-fee') === -1"
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="平仓收益" align="center" width="100">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'close-position-profit'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="
              sceneList[scope.$index].indexOf('close-position-profit') === -1
            "
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="平仓亏损" align="center" width="100">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'close-position-loss'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="sceneList[scope.$index].indexOf('close-position-loss') === -1"
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="隔夜费转出保证金" align="center" width="130">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'position-night-fee'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="sceneList[scope.$index].indexOf('position-night-fee') === -1"
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="资金费转出保证金" align="center" width="130">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'position-funding-fee_2'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="
              sceneList[scope.$index].indexOf('position-funding-fee_2') === -1
            "
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="保证金转出资金费" align="center" width="130">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'position-funding-fee_1'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="
              sceneList[scope.$index].indexOf('position-funding-fee_1') === -1
            "
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="资金费转出可用" align="center" width="130">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'position-funding-fee-enable'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="
              sceneList[scope.$index].indexOf('position-funding-fee-enable') ===
                -1
            "
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="隔夜费转出可用" align="center" width="130">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'position-night-fee-enable'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="
              sceneList[scope.$index].indexOf('position-night-fee-enable') ===
                -1
            "
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="返佣奖励" align="center" width="100">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'invitation-rake-back'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="
              sceneList[scope.$index].indexOf('invitation-rake-back') === -1
            "
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="合约空投" align="center" width="100">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'cfd-transfer'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="sceneList[scope.$index].indexOf('cfd-transfer') === -1"
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="合约划转钱包" align="center" width="100">
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
      <el-table-column label="钱包划转合约" align="center" width="100">
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
      <el-table-column label="合约平账减" align="center" width="100">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'contract_flat_bill_scene_1'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="
              sceneList[scope.$index].indexOf('contract_flat_bill_scene_1') ===
                -1
            "
          >0</span>
        </template>
      </el-table-column>
      <el-table-column label="合约平账加" align="center" width="100">
        <template slot-scope="scope">
          <span v-for="(item, index) in scope.row.sceneFlowList" :key="index">
            <span v-if="item.item == 'contract_flat_bill_scene_2'">
              <span v-if="item.direct == 0" />
              <span v-if="item.direct == 1">-</span>
              <span v-if="item.direct == 2">+</span>
              {{ item.amount }}
            </span>
          </span>
          <span
            v-if="
              sceneList[scope.$index].indexOf('contract_flat_bill_scene_2') ===
                -1
            "
          >0</span>
        </template>
      </el-table-column>
      <el-table-column
        label="其他"
        align="center"
        prop="other"
        width="100"
      />
      <el-table-column
        label="平账结果"
        align="center"
        prop="result"
        width="100"
      />
      <!-- <el-table-column :label="$t('common.operation')" align="center" width="110">
        <template slot-scope="scope">
          <el-button
            size="mini"
            :disabled="scope.row.result==0"
            @click="handleManual(scope.row)"
          >手动平账</el-button>
        </template>
      </el-table-column>-->
    </el-table>
  </div>
</template>

<script>
import {
  contractBiilingInfo,
  manualFlatBill
} from '@/api/contract/biilingInfo'
export default {
  props: ['msg'],
  data() {
    return {
      loading: true,
      queryParams: {
        uid: this.msg
      },
      tableList: [],
      sceneList: [],
      showScenceList: [
        'usable',
        'margin',
        'profit',
        'usable-balance_1',
        'usable-balance_2',
        'margin-balance_2',
        'margin-balance_1',
        'open-position-fee',
        'close-position-fee',
        'close-position-profit',
        'close-position-loss',
        'position-night-fee',
        'position-funding-fee_2',
        'position-night-fee-enable',
        'position-funding-fee_1',
        'position-funding-fee-enable',
        'invitation-rake-back',
        'cfd_to_wallet',
        'cfd-transfer',
        'wallet_to_cfd',
        'contract_flat_bill_scene_1',
        'contract_flat_bill_scene_2'
      ]
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.sceneList = []
      this.loading = true
      contractBiilingInfo(this.queryParams)
        .then((response) => {
          if (response.code == 200 && response.data) {
            this.tableList = response.data
            this.tableList.forEach((element, index) => {
              const itemList = []
              element.sceneFlowList.forEach((e) => {
                var item = e.item
                itemList.push(item)
              })
              const other = this.unique2Add(itemList, element.sceneFlowList)
              this.sceneList.push(itemList)
              this.$set(element, 'other', other)
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
    unique(arr) {
      return [...new Set(arr)]
    },
    unique2Add(arr1, rowData) {
      const that = this
      const _arr2Set = new Set(this.showScenceList)
      const noneScenceList = this.unique(
        arr1.filter((item) => !_arr2Set.has(item))
      )
      let sum = 0
      rowData.forEach((e) => {
        noneScenceList.forEach((e2) => {
          if (e.item == e2) {
            if (e.direct == 1) {
              sum = this.algorithmSub(sum, e.amount)
            }
            if (e.direct == 2) {
              sum = this.algorithmAdd(sum, e.amount)
            }
          }
        })
      })
      return sum
    },
    handleManual(row) {
      const data = {
        uid: row.uid,
        symbol: row.symbol,
        scene: 'contract_flat_bill_scene',
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
