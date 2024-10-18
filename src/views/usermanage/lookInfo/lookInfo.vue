<template>
  <el-card class="box-card">
    <h2>{{ userPhone }} 的用户详情</h2>
    <span v-if="userId!=''">
      <el-tabs v-model="activeName">
        <el-tab-pane label="用户日志" name="name0">
          <useroptlog :msg="userId" />
        </el-tab-pane>
        <!-- <el-tab-pane label="订单详情" name="name1">
          <Ddlist :msg="userId" :cur="currency"></Ddlist>
        </el-tab-pane>
        <el-tab-pane label="挂单详情" name="name2">
          <GdList :msg="userId" :cur="currency"></GdList>
        </el-tab-pane>-->
        <el-tab-pane label="充值详情" name="name3">
          <CzList :msg="userId" />
        </el-tab-pane>
        <el-tab-pane label="提现详情" name="name10">
          <TxList :msg="userId" />
        </el-tab-pane>
        <el-tab-pane label="合约对账" name="name13">
          <contract-biiling :msg="userId" />
        </el-tab-pane>
        <el-tab-pane label="钱包对账" name="name14">
          <finance-biiling :msg="userId" />
        </el-tab-pane>
        <el-tab-pane label="充币地址" name="name15">
          <cbdz :msg="userId" />
        </el-tab-pane>
        <!-- <el-tab-pane label="拨币详情" name="name4">
          <giveCoinList :msg="userId" :cur="currency"></giveCoinList>
        </el-tab-pane>-->
        <!-- <el-tab-pane label="兑换详情" name="name11">
          <dh-list :msg="userId"></dh-list>
        </el-tab-pane>-->
        <!-- <el-tab-pane label="签到详情" name="name12">
          <qdList :msg="userId"></qdList>
        </el-tab-pane>-->
        <!-- <el-tab-pane label="交易账户" name="name5">
          <jyzh :msg="userId"></jyzh>
        </el-tab-pane>
        <el-tab-pane v-if="false" label="币币账户" name="name6">
          <bb :msg="userId"></bb>
        </el-tab-pane>
        <el-tab-pane v-if="false" label="资产" name="name7">
          <jyzh :msg="userId"></jyzh>
        </el-tab-pane>-->
        <!-- <el-tab-pane v-if="false" label="币币释放记录" name="name8">
          <bbsf :msg="userId"></bbsf>
        </el-tab-pane>-->
        <!-- <el-tab-pane label="交易信用" name="name9">
          <jyxy :msg="userId"></jyxy>
        </el-tab-pane>-->
      </el-tabs>
    </span>
  </el-card>
</template>
<script>
import Ddlist from './components/Ddlist'
// import useroptlog from "./components/useroptlog";
import GdList from './components/GdList'
// import CzList from "./components/CzList";
// import TxList from "./components/TxList";
import jyzh from './components/jyzh'
import zc from './components/zc'
import bb from './components/bb'
import bbsf from './components/bbsf'
import jyxy from './components/jyxy'
import giveCoinList from './components/giveCoinList'
import dhList from './components/dhList'
import qdList from './components/qdList'
// import contractBiiling from "./components/contractBiiling";
// import financeBiiling from "./components/financeBiiling";
// import cbdz from "./components/cbdz";

export default {
  components: {
    Ddlist,
    GdList,
    // CzList,
    // TxList,
    jyzh,
    // cbdz,
    zc,
    bb,
    // useroptlog,
    bbsf,
    jyxy,
    giveCoinList,
    dhList,
    // financeBiiling,
    // contractBiiling,
    qdList
  },
  data() {
    return {
      activeName: 'name0',
      userId: '',
      currency: '',
      userPhone: undefined
    }
  },
  mounted() {
    // this.userId = sessionStorage.getItem("userId");
    // this.userPhone = sessionStorage.getItem("userPhone");
  }
}
</script>
