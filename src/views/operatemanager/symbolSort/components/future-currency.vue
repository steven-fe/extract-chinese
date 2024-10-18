<template>
  <div>
    <div :class="$style.serachBox">
      <el-select
        v-model="futureValue"
        filterable
        :placeholder="$t('symbolSort.choiceOfBaseCurrency')"
        clearable
      >
        <el-option
          v-for="item in futureOptions"
          :key="item.id"
          :label="item.displayName"
          :value="item.id"
        />
      </el-select>
      <div :class="$style.button">
        <el-button type="primary" @click="search">{{ $t('symbolSort.search') }}</el-button>
      </div>
    </div>
    <el-table :data="futureLsit" border style="margin-bottom: 20px">
      <el-table-column prop="sort" :label="$t('symbolSort.sort')" />
      <el-table-column prop="symbol" :label="$t('symbolSort.currencyPair')" />
      <el-table-column prop="weight" :label="$t('symbolSort.weight')" />
      <el-table-column :label="$t('symbolSort.operate')">
        <template slot-scope="scope">
        <el-button type="text" size="small" @click="handleClick(scope.row)">{{ $t('symbolSort.editWeight') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="currentPageFuture"
      :page-sizes="[10, 20]"
      :page-size="futurePageSize"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalFuture"
      @size-change="handleSizeChangeFuture"
      @current-change="handleCurrentChangeFuture"
    />
    <el-dialog :title="$t('symbolSort.adjustedSort')" :visible.sync="dialogVisible" :close-on-click-modal="false" width="400">
      <span>{{ dialogInfo.symbol }}</span>
      <div :class="$style.dialogContentBox">
        <span :class="$style.title">{{ $t('symbolSort.currentWeight') }}</span> <el-input v-model="currentWeight" :min="0" oninput="value = value.replace(/[^\d]/g, '')" type="number" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('symbolSort.cancel') }}</el-button>
        <el-button type="primary" @click="sure">{{ $t('symbolSort.sure') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getFutureList, updateFutureWeight } from '@/api/cmsSymbolSort.js'
export default {
  name: 'FutureCurrency',
  data() {
    return {
      futureValue: '',
      futureOptions: [],
      futureLsit: [],
      currentPageFuture: 1,
      futurePageSize: 10,
      totalFuture: 0,
      dialogVisible: false,
      dialogInfo: {},
      currentWeight: ''
    }
  },
  created() {
    this.getFutureList()
    this.getFutureListInfo()
  },
  methods: {
    search() {
      this.currentPageFuture = 1
      this.getFutureListInfo()
    },
    handleSizeChangeFuture(val) {
      this.futurePageSize = val
      this.getFutureListInfo()
    },
    handleCurrentChangeFuture(val) {
      this.currentPageFuture = val
      this.getFutureListInfo()
    },
    getFutureList() {
      getFutureList({pageSize: 9999}).then((res) => {
        if (res.code === 200) {
          this.futureOptions = res.rows
        }
      })
    },
    getFutureListInfo() {
      const data = {
        pageSize: this.futurePageSize,
        pageNum: this.currentPageFuture,
        id: this.futureValue
      }
      getFutureList(data).then((res) => {
        if (res.code === 200) {
          this.futureLsit = res.rows.map((item, index) => {
            return {
              sort: (this.currentPageFuture - 1) * this.futurePageSize + (index + 1),
              symbol: item.displayName,
              weight: item.weight,
              id: item.id
            }
          })
          this.totalFuture = res.total
        } else {
          this.futureLsit = []
          this.totalFuture = 0
        }
      })
    },
    handleClick(row) {
      this.dialogVisible = true
      this.dialogInfo = row
      this.currentWeight = row.weight
    },
    sure() {
      const data = {
        id: this.dialogInfo.id,
        sequencer: this.currentWeight
      }
      updateFutureWeight(data).then(res => {
        if (res.code === 200) {
          this.$message({
            message: this.$t('symbolSort.editSuccess'),
            type: 'success'
          })
          this.dialogVisible = false
          this.getFutureListInfo()
        } else {
          this.$message.error(this.$t('symbolSort.editFail'))
        }
      })
    }
  }
}
</script>
<style lang="scss" module>
.serachBox {
  display: flex;
  margin-bottom: 20px;
}
.button {
  margin-left: 10px;
}
.dialogContentBox {
  display: flex;
  margin-top: 20px;
  .title {
    width: 70px;
    padding-top: 10px;
  }
}
</style>
