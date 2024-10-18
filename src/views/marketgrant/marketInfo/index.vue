<template>
  <div class="app-container">
    <el-card class="box-card">
      <!-- <el-tabs v-if="userId" v-model="activeName"> -->
      <el-tabs v-if="data.uid" v-model="activeName">
        <el-tab-pane label="做市商账户" name="name0">
          <market-account :msg="data" />
        </el-tab-pane>
        <el-tab-pane label="做市日报" name="name1">
          <market-daily :msg="data" />
        </el-tab-pane>
        <el-tab-pane label="资金流水" name="name2">
          <market-serial :msg="data" />
        </el-tab-pane>
        <el-tab-pane label="提取申请记录" name="name3">
          <market-extract :msg="data" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import marketAccount from './components/marketAccount'
import marketDaily from './components/marketDaily'
import marketSerial from './components/marketSerial'
import marketExtract from './components/marketExtract'
import { listCoinMar } from '@/api/contract/margin'
export default {
  name: '',
  components: { marketAccount, marketDaily, marketSerial, marketExtract },
  data() {
    return {
      activeName: 'name0',
      data: {
        uid: undefined,
        currencys: []
      }
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      listCoinMar().then((response) => {
        if (response.code == 200) {
          this.data.currencys = response.rows
          this.data.uid = this.$route.query.uid
        } else {
          this.msgError(response.msg)
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
