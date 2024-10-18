<template>
  <div>
    <el-dialog
      :title="$t('financemanager.causeOfFailure')"
      :visible.sync="isShow.dialogTableVisible"
      center
    >
      <el-table :data="isShow.errDatas">
        <el-table-column
          property="fId"
          :label="$t('common.orderNumber')"
          width="150"
        />
        <el-table-column
          property="userId"
          label="UID"
          width="200"
        />
        <el-table-column
          property="ffailMessage"
          :label="$t('financemanager.causeOfFailure')"
        >
          <!--          <template slot-scope="scope">-->
          <!--            <span v-if="scope.row.ffailMessage==='123'">已领取勿重复</span>-->
          <!--            <span v-if="scope.row.ffailMessage==='345'">合约账户未开通</span>-->
          <!--          </template>-->
        </el-table-column>
      </el-table>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          @click="erports"
        >{{ $t('financemanager.batchExport') }}</el-button>
        <el-button
          type="primary"
          @click="submit"
        >{{ $t('common.sure') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { exportData } from '@/api/operate/bonus'
export default {
  props: {
    isShow: {
      typeof: Object,
      default: () => {}
    }
  },
  data() {
    return {}
  },
  methods: {
    // 确定
    submit() {
      this.isShow.dialogTableVisible = false
    },
    // 批量导出
    erports() {
      const params = {
        batchNo: this.isShow.batchNo
      }
      exportData(params).then(res => {
        if (res.code === 200) {
          this.download(res.msg)
          this.$message({
            type: 'success',
            message: this.$t('financemanager.exportSuccessfully')
          })
        }
      })
    }
  }
}
</script>

<style>
</style>
