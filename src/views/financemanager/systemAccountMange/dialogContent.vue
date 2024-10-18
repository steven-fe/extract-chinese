<template>
  <div class="dialog-content">
    <div class="search">
      <span class="label">{{ $t('financemanager.currency') }}</span>
      <el-select v-model="currencyId" :placeholder="$t('common.all')" clearable>
        <el-option
          v-for="item in currencyList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <div class="btnBox">
        <el-button type="primary" @click="getList">{{ $t('common.seek') }}</el-button>
        <el-button type="success" @click="myExportAccountInfo">{{ $t('common.derive') }}</el-button>
      </div>
    </div>

    <div class="hiden">
      <el-checkbox v-model="isHideData">{{ $t('financemanager.hiddenBalanceIsInZeroCoins') }}</el-checkbox>
    </div>
    <div class="tableBox">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
      >
        <el-table-column prop="currency" :label="$t('common.coin')" />
        <el-table-column prop="spotBalance" :label="$t('usermanage.text58')" />
        <el-table-column prop="spotToUsdt" :label="$t('financemanager.spotDiscountUBalance')" />
        <el-table-column prop="contractBalance" :label="$t('financemanager.contractAccountBalance')" />
        <el-table-column prop="contractToUsdt" :label="$t('financemanager.contractToUBalance')" />
      </el-table>
    </div>
  </div>
</template>

<script>
import {
  getAccountInfo,
  exportAccountInfo
} from '@/api/systemAccountMange/index.js'
import { mapState } from 'vuex'

export default {
  props: ['userId'],
  data() {
    return {
      options: [],
      currencyId: '',
      isHideData: false,
      tableData: [],
      loading: false
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList'])
  },
  watch: {
    userId(val) {
      if (val) {
        (this.isHideData = false), (this.currencyId = ''), this.getList()
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    myExportAccountInfo() {
      const data = {
        isHideData: this.isHideData,
        currencyId: this.currencyId,
        userId: this.userId
      }
      exportAccountInfo(data).then((res) => {
        if (res.code === 200) {
          this.download(res.msg)
          this.$message({
            type: 'success',
            message: this.$t('financemanager.exportSuccessfully')
          })
        } else {
          this.$message.error(this.$t('financemanager.exportFailure'))
        }
      })
    },
    getList() {
      this.loading = true
      const data = {
        isHideData: this.isHideData,
        currencyId: this.currencyId,
        userId: this.userId
      }
      getAccountInfo(data)
        .then((res) => {
          if (res.code === 200) {
            this.tableData = res.data.list
          } else {
            this.tableData = []
          }
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-content {
  width: 100%;

  .search {
    display: flex;
    align-items: center;

    ::v-deep .el-select {
      margin-left: 20px;
    }

    .btnBox {
      margin-left: 20px;
    }
  }
  .hiden {
    margin: 20px 0;
  }

  .tableBox {
  }

  .sort-pageNation {
    margin-top: 20px;
  }
}
</style>
