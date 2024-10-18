<template>
  <div :class="$style.contentBox">
    <div :class="$style.serachBox">
      <div :class="$style.searchTitle">{{ $t('symbolSort.currencyPair') }}：</div>
      <el-select
        v-model="searchValue"
        filterable
        :placeholder="$t('symbolSort.pleaseSelect')"
        clearable
      >
        <el-option
          v-for="item in symbolOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <div :class="$style.button">
        <el-button type="primary" @click="getList">{{ $t('symbolSort.search') }}</el-button>
        <el-button type="warning" @click="sort">{{ $t('symbolSort.sort') }}</el-button>
        <el-button type="warning" @click="handleEdit">{{ $t('symbolSort.changePair') }}</el-button>
        <el-tooltip :content="$t('symbolSort.onlineLimitNine')" placement="top">
          <i :class="$style.iconInfo" class="el-icon-info" />
        </el-tooltip>
      </div>
    </div>
    <el-table :data="dataList" border style="margin-bottom: 20px">
      <el-table-column :label="$t('symbolSort.operate')" align="center">
        <template slot-scope="scope">
          <el-button v-if="scope.row.state === 0" type="primary" size="mini" @click="handleChangeState(scope.row, 1)">{{ $t('symbolSort.popUpOnline') }}</el-button>
          <el-button v-if="scope.row.state === 1" type="danger" size="mini" @click="handleChangeState(scope.row, 0)">{{ $t('symbolSort.offline') }}</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">{{ $t('symbolSort.delete') }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="weight" :label="$t('symbolSort.clientSort')" align="center" />
      <el-table-column prop="symbol" :label="$t('symbolSort.currencyPairCode')" align="center" />
      <el-table-column prop="state" :label="$t('symbolSort.state')" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.state === 0">{{ $t('symbolSort.offline') }}</span>
          <span v-if="scope.row.state === 1">{{ $t('symbolSort.popUpOnline') }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 修改币对弹窗 -->
    <el-dialog
    :title="$t('symbolSort.changePair')"
      :visible.sync="open1"
      :close-on-click-modal="false"
      width="1000px"
      @close="closed"
    >
      <template>
        <div id="app">
          <tree-transfer
            v-model="model"
            ref="treeTransfer"
            node-key="id"
            default-expand-all
            show-checkbox
            :titles="[$t('symbolSort.allCurrencyPairCodes'), $t('symbolSort.goldGangCurrencyPairCode')]"
            :placeholder="[$t('symbolSort.searchCurrencyPairCodes'), $t('symbolSort.searchCurrencyPairCodes')]"
            search
            :selectMax='30'
            showCheckAll
            showCheckNum
            :props="props"
            :data="symbolDataList"
          >
            <!-- 自定义节点内容 -->
            <template #leftText="{ node }">
              <span>{{ node.label }}</span>
            </template>
            <template #rightText="{ node }">
              <span>{{ node.label }}</span>
            </template>
          </tree-transfer>
        </div>
      </template>
      <div :class="$style.footerButton">
        <span slot="footer" class="dialog-footer" >
          <el-tooltip placement="top">
            <div slot="content">{{ $t('symbolSort.addAMaximumOf30CoinPairs') }}</div>
            <i :class="$style.iconInfo" class="el-icon-info" />
          </el-tooltip>
          <el-button type="primary" @click="handlesure">{{ $t('symbolSort.save') }}</el-button>
        </span>
      </div>
    </el-dialog>
    <!-- 排序 -->
    <el-dialog :title="$t('symbolSort.sort')" :visible.sync="sortVisible" :close-on-click-modal="false" width="600px">
      <div :class="$style.mb">{{ $t('symbolSort.maxSort9') }}</div>
      <div v-if="sortData.length > 0" :class="$style.df">
        <div>
          <div v-for="(item, index) in sortData.length" :key="index">
            <div :class="$style.num">{{ item }}</div>
          </div>
        </div>
        <div>
          <el-tree
            :data="sortData"
            node-key="id"
            :props="defaultProps"
            default-expand-all
            draggable
            :allow-drop="allowDrop"
            :allow-drag="allowDrag"
          />
        </div>
      </div>
      <div :class="$style.footerButton">
        <span slot="footer" :class="$style.footerDf" class="dialog-footer" >
          <div :class="$style.tips">{{ $t('symbolSort.saveLocally') }}<br/>{{ $t('symbolSort.savedEditSort') }}</div>
          <div>
            <el-tooltip placement="top">
              <div slot="content">{{ $t('symbolSort.maxNinetip') }}<br/>{{ $t('symbolSort.awaitUse') }}</div>
              <i :class="$style.iconInfo" class="el-icon-info" />
            </el-tooltip>
            <el-button type="primary" @click="sortSure">{{ $t('symbolSort.save') }}</el-button>
            <el-button @click="sortVisible = false">{{ $t('symbolSort.cancel') }}</el-button>
          </div>
        </span>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { TreeTransfer } from "ele-tree-transfer"
import { getPairList } from '@/api/systemsetting/common.js'
import { getList, delHot, saveHot, sortHot, editState } from '@/api/systemsetting/hotcurrency'
export default {
  name: 'HotCurrency',
  components: {
    TreeTransfer,
  },
  data() {
    return {
      searchValue: '',
      symbolOptions: [],
      dataList: [],
      open1: false,
      sortVisible: false,
      sortData: [],
      defaultProps: {
        children: 'children',
        label: 'symbol'
      },
      symbolDataList: [],
      props: {
        label: "name",
        value: "id",
        children: "children",
        disabled: "disabled",
      },
      model: []
    }
  },
  created() {
    this.getSymbolOptions()
    this.getList()
  },
  methods: {
    async getSymbolOptions() {
      const { data } = await getPairList()
      this.symbolOptions = data
      this.symbolDataList = data
    },
    async getList() {
      const { rows } = await getList({ symbolId: this.searchValue })
      this.dataList = rows
    },
    async handleEdit() {
      this.model = []
      const { rows } = await getList({ symbolId: null })
      rows.map(item => {
        this.model.push(item.symbolId)
      })
      this.open1 = true
    },
    handlesure() {
      if (this.model.length <= 0) {
        return this.msgError(this.$t('symbolSort.limitMinCurrency'))
      }
      saveHot({ symbolIds: this.model }).then(response => {
        if (response.code === 200) {
          this.msgSuccess(this.$t('symbolSort.saveSuccess'))
          this.getList()
          this.open1 = false
        } else {
          this.msgError(res.msg)
        }
      })
    },
    handleDelete(row) {
      this.$confirm(this.$t('symbolSort.isDeleteCoin'), this.$t('symbolSort.tip'), {
        confirmButtonText: this.$t('symbolSort.sure'),
        cancelButtonText: this.$t('symbolSort.cancel'),
        type: 'warning'
      }).then(() => {
        delHot(row.id)
          .then(response => {
            this.$message({
              type: 'success',
              message: this.$t('symbolSort.deleteSuccess')
            })
            this.getList()
          })
          .catch(error => {
            console.log(error)
          })
      })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('symbolSort.canceled')
          })
        })
    },
    handleChangeState(row, state) {
      editState({ id: row.id, state: state }).then(res => {
        if (res.code === 200) {
          state === 1 ? this.msgSuccess(this.$t('symbolSort.onlineSuccess')) : this.msgSuccess(this.$t('symbolSort.offlineSuccess'))
          this.getList()
        } else {
          this.msgError(res.msg)
        }
      })
    },
    closed() {
      this.$refs['treeTransfer'].clearSearch()
      this.$refs['treeTransfer'].clearChecked()
    },
    sort() {
      const onlineSymbolList = []
      this.dataList.map(item => {
        if (item.state === 1) {
          onlineSymbolList.push(item)
        }
      })
      this.sortData = onlineSymbolList
      this.sortVisible = true
    },
    allowDrop(draggingNode, dropNode, type) {
      return type !== 'inner'
    },
    allowDrag(draggingNode) {
      return true
    },
    sortSure() {
      const sortArr = []
      this.sortData.map((item, index) => {
        sortArr.push({ symbolId: item.symbolId, weight: index + 1 })
      })
      sortHot({ symbols: sortArr }).then(res => {
        if (res.code === 200) {
          this.msgSuccess(this.$t('symbolSort.saveSortSuccess'))
          this.getList()
          this.sortVisible = false
        } else {
          this.msgError(res.msg)
        }
      })
    }
  }
}
</script>
<style lang="scss" module>
.contentBox {
  margin-top: 20px;
  margin-left: 20px;
}
.serachBox {
  display: flex;
  margin-bottom: 20px;
}
.button {
  margin-left: 10px;
}
.iconInfo {
  font-size: 20px;
}
.footerButton {
  text-align: right;
  margin-top: 10px;
  .tips {
    color: red;
  }
}
.footerDf {
  display: flex;
  justify-content: space-between;
}
.df {
  display: flex;
  .num {
    line-height: 26px;
    text-align: center;
  }
}
.mb {
  margin-bottom: 20px;
}
.searchTitle {
  margin-top: 10px;
}
</style>
