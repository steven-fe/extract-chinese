<template>
  <div class="app-container">
    {{ $t('dwmanager.transferType') }}:
    <el-select v-model="transferType">
      <el-option :label="$t('financemanager.bulkGift')" value="1" />
      <el-option :label="$t('financemanager.batchRecovery')" value="2" />
    </el-select>
    <div style="height: 20px;" />
    <el-form ref="form" :inline="true" :model="form" label-width="130px">
      <el-form-item :label="$t('financemanager.batchNo')" prop="code">
        {{ form.batchNumber ? form.batchNumber : '- -' }}
      </el-form-item>
      <el-form-item prop="type">
        <el-upload
          ref="upload"
          action="#"
          :on-change="handleChange"
          :show-file-list="false"
          accept=".xls,.xlsx"
          :auto-upload="false"
          class="upload-demo"
        >
          <el-button type="primary" size="mini">{{ $t('financemanager.selectFile') }}</el-button>
          <span style="font-size: 14px; color: #999">{{ fileName }}</span>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="downLoad">{{ $t('financemanager.downloadTemplate') }}</el-button>
        <el-button type="primary" size="mini" @click="batchAdd">{{ $t('financemanager.confirmImport') }}</el-button>
      </el-form-item>
    </el-form>
    <p style="font-size: 14px; color: #666;">{{ $t('financemanager.importDataThisTime', {number: tableData.length}) }}</p>
    <el-table v-if="tableData.length > 0" :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="currencyName" :label="$t('common.coin')" align="center" />
      <el-table-column prop="volume" :label="$t('financemanager.releasedQuantity')" align="center" />
      <el-table-column prop="count" :label="$t('financemanager.numberOfBranches')" align="center" />
    </el-table>
    <!--分页组件-->
    <!--    <div class="block top">-->
    <!--      <pagination-->
    <!--        v-show="total>0"-->
    <!--        :total="total"-->
    <!--        :page.sync="form.pageNum"-->
    <!--        :limit.sync="form.pageSize"-->
    <!--        @pagination="getConfigList"-->
    <!--      />-->
    <!--    </div>-->
  </div>
</template>
<script>
import { freeBatchAdd, recoveryBatch } from '@/api/finance/freecurrency'
import { getNowFormatDate } from '@/utils'
import { award } from '@/api/operate/activity'
export default {
  name: 'Batchfreecurrency',
  data() {
    return {
      transferType: '1', // 1 批量赠币，2 批量回收
      total: 0,
      configId: '',
      form: {
        batchNumber: '',
        file: null
      },
      fileName: this.$t('financemanager.unselectedFile'),
      tableData: []
    }
  },
  methods: {
    // 文件上传
    handleChange(file) {
      this.form.batchNumber = getNowFormatDate()
      this.form.file = file.raw
      this.fileName = file.name
    },
    // 批量上传
    async batchAdd() {
      if (!this.form.file) {
        this.$message({
          type: 'error',
          message: this.$t('financemanager.unuploadedFile')
        })
        return
      }
      let res = ''
      if (this.transferType === '1') {
        res = await freeBatchAdd(this.form)
      } else if (this.transferType === '2') {
        res = await recoveryBatch(this.form)
      }
      this.tableData = res.data
      this.$message({
        type: 'success',
        message: this.$t('financemanager.batchAddSucceeded')
      })
    },
    // 下载模版
    downLoad() {
      window.open('https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/giftCoinTemplate.xlsx')
    }
  }
}
</script>

<style scoped lang="scss">
.table {
  margin-top: 20px;
}
.form-grid {
  display: grid;
  grid-template-columns: 50% 50%;
  margin-left: 5%;
  .grid-item {
    width: 90%;
  }
}
.upload-demo {
  float: left;
  width: 100%;
}
</style>
