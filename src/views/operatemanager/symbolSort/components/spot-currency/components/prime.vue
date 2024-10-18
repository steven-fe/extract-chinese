<template>
  <div>
    <div :class="$style.serachBox">
      <el-select
        v-model="primeValue"
        filterable
        :placeholder="$t('symbolSort.choiceOfBaseCurrency')"
        clearable
      >
        <el-option
          v-for="item in primeOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <div :class="$style.button">
        <el-button type="primary" @click="search">{{ $t('symbolSort.search') }}</el-button>
      </div>
    </div>
    <el-table :data="primeList" border style="margin-bottom: 20px">
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
      :current-page="currentPagePrime"
      :page-sizes="[10, 20]"
      :page-size="primePageSize"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalPrime"
      @size-change="handleSizeChangePrime"
      @current-change="handleCurrentChangePrime"
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
import { updateSpotWeight, getPrimeSymbolList, getPrimeList } from '@/api/cmsSymbolSort.js'
export default {
  name: 'Prime',
  data() {
    return {
      primeValue: '',
      primeOptions: [],
      primeList: [],
      currentPagePrime: 1,
      primePageSize: 10,
      totalPrime: 0,
      dialogVisible: false,
      dialogInfo: {},
      currentWeight: ''
    }
  },
  created() {
    this.getPrimeSymbolList()
    this.getPrimeListInfo()
  },
  methods: {
    search() {
      this.currentPagePrime = 1
      this.getPrimeListInfo()
    },
    handleSizeChangePrime(val) {
      this.primePageSize = val
      this.getPrimeListInfo()
    },
    handleCurrentChangePrime(val) {
      this.currentPagePrime = val
      this.getPrimeListInfo()
    },
    getPrimeSymbolList() {
      getPrimeSymbolList().then((res) => {
        if (res.code === 200) {
          this.primeOptions = res.data
        }
      })
    },
    getPrimeListInfo() {
      const data = {
        pageSize: this.primePageSize,
        pageNum: this.currentPagePrime,
        id: this.primeValue
      }
      getPrimeList(data).then((res) => {
        if (res.code === 200) {
          this.primeList = res.rows.map((item, index) => {
            return {
              sort: (this.currentPagePrime - 1) * this.primePageSize + (index + 1),
              symbol: item.displayName.toUpperCase(),
              weight: item.sequencer,
              id: item.id
            }
          })
          this.totalPrime = res.total
        } else {
          this.totalPrime = 0
          this.primeList = []
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
      updateSpotWeight(data).then(res => {
        if (res.code === 200) {
          this.$message({
            message: this.$t('symbolSort.editSuccess'),
            type: 'success'
          })
          this.dialogVisible = false
          this.getPrimeListInfo()
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
