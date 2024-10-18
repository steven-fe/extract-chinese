<template>
  <!-- 防插针 -->
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="searchForm" label-width="80px">
      <el-form-item label="币对:" prop="instrumentId">
        <el-select v-model="searchForm.instrumentId" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in symbolList"
            :key="item.instrumentId"
            :label="item.name"
            :value="item.instrumentId"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="search">{{$t('common.search')}}</el-button>
      </el-form-item>
    </el-form>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="add">新增配置</el-button>

    <el-table ref="table" :data="tableData" border style="width: 100%" class="table cabin-table">
      <!--      buySellGap: 0.01-->
      <!--      ctime: 1635921296517-->
      <!--      dayDownLimit: 0.03-->
      <!--      dayUpLimit: 0.02-->
      <!--      id: 1-->
      <!--      instrumentId: 1-->
      <!--      likeSymbolGap: 0.07-->
      <!--      mtime: 1635921296518-->
      <!--      status: 1-->
      <!--      symbol: "BTCUSDT"-->
      <!--      type: 1-->
      <el-table-column prop="id" label="ID" align="center" />
      <el-table-column prop="symbol" label="币对" align="center" />
      <el-table-column prop="buySellGap" label="买一卖一偏离百分比" align="center">
        <template slot-scope="scope">
          {{ scope.row.buySellGap | numFilter }}
        </template>
      </el-table-column>
      <el-table-column prop="dayUpLimit" width="100" label="日涨幅限制" align="center">
        <template slot-scope="scope">
          {{ scope.row.dayUpLimit | numFilter }}
        </template>
      </el-table-column>
      <el-table-column prop="dayDownLimit" label="日跌幅限制" align="center">
        <template slot-scope="scope">
          {{ scope.row.dayDownLimit | numFilter }}
        </template>
      </el-table-column>
      <el-table-column prop="likeSymbolGap" label="对标币价偏离" align="center">
        <template slot-scope="scope">
          {{ scope.row.likeSymbolGap | numFilter }}
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('common.status')" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.status === 0">关闭</span>
          <span v-if="scope.row.status === 1">开启</span>
        </template>
      </el-table-column>
      <el-table-column prop="showPrecision" :label="$t('common.operation')" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="openClose(scope.row)">
            <span v-if="scope.row.status === 0">开启</span>
            <span v-if="scope.row.status === 1">关闭</span>
          </el-button>
          <el-button type="primary" size="mini" @click="modify(scope.row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > searchForm.pageSize"
        :total="total"
        :page.sync="searchForm.pageNum"
        :limit.sync="searchForm.pageSize"
        @pagination="pageChange"
      />
    </div>
    <el-dialog title="新增配置" :visible.sync="dialogStatus" width="1000px" :before-close="cancel" :close-on-click-modal="false">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        class="form-grid"
      >
        <el-form-item class="grid-item" label="币对:" prop="instrumentId">
          <el-select v-model="digform.instrumentId" style="width: 100%" filterable size="small" :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in symbolList"
              :key="item.instrumentId"
              :label="item.name"
              :value="item.instrumentId"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="grid-item" label="买一卖一偏离百分比:" label-width="auto" prop="buySellGap">
          <el-input v-model="digform.buySellGap" placeholder="" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="日涨幅限制:" label-width="auto" prop="dayUpLimit">
          <el-input v-model="digform.dayUpLimit" placeholder="" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="日跌幅限制:" label-width="auto" prop="dayDownLimit">
          <el-input v-model="digform.dayDownLimit" placeholder="" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="对标指数价偏离百分比:" label-width="auto" prop="likeSymbolGap">
          <el-input v-model="digform.likeSymbolGap" placeholder="" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button size="mini" type="primary" @click="save">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import BigNumber from 'bignumber.js'
import * as API from '@/api/pin'
// import { queryInfo } from "@/api/configmanage";
// import {mapState, mapGetters, mapActions} from 'vuex'
// import { listCoinGoods } from '@/api/contract/coin'

export default {
  name: 'SettingPin',
  filters: {
    numFilter(num) {
      if (Number.isNaN(+num)) {
        return num
      }
      num = new BigNumber(num).times(100)
      return `${num}%`
    }
  },
  data() {
    return {
      total: 0,
      searchForm: {
        instrumentId: '',
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      symbolList: [],
      dialogStatus: false,
      status: '', // add新增，update修改
      digform: {
        buySellGap: '',
        dayDownLimit: '',
        dayUpLimit: '',
        instrumentId: '',
        likeSymbolGap: '',
        symbol: '',
        type: '1', // 固定值
        id: undefined
      },
      rules: {
        buySellGap: [
          { required: true, message: '买一卖一偏离百分比必填', trigger: 'blur' }
        ],
        dayDownLimit: [
          { required: true, message: '日跌幅限制必填', trigger: 'blur' }
        ],
        dayUpLimit: [
          { required: true, message: '日涨幅限制必填', trigger: 'blur' }
        ],
        likeSymbolGap: [
          { required: true, message: '对标币价偏离必填', trigger: 'blur' }
        ],
        instrumentId: [
          { required: true, message: '币对必填', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.getSymbolList()
    this.search()
  },
  methods: {
    // 获取币对
    getSymbolList() {
      API.symbolList().then(res => {
        console.log('币对', res)
        if (res.code === 200) {
          this.symbolList = res.data
        }
      })
    },
    search() {
      API.pinList(this.searchForm).then(res => {
        console.log('获取列表', this.searchForm)
        if (res.code === 200) {
          this.tableData = res.rows
          this.total = res.total
        }
      })
    },
    pageChange(page) {
      console.log('当前页码', page)
      this.searchForm.pageNum = page.page
      this.search()
    },
    add() {
      this.dialogStatus = true
      this.status = 'add'
      this.digform.id = undefined
    },
    cancel() {
      this.dialogStatus = false
      this.$refs['digform'].resetFields()
    },
    openClose(row) {
      const status = row.status === 0 ? 1 : 0
      API.openClose({ id: row.id, status: status }).then(res => {
        if (res.code === 200) {
          this.search()
        }
      })
    },
    modify(row) {
      if (row.status === 1) {
        this.msgError('必须关闭状态下才能修改')
        return
      }
      this.dialogStatus = true
      Object.keys(this.digform).forEach(item => {
        this.digform[item] = row[item]
      })
      this.digform.id = row.id
      this.status = 'update'
    },
    save() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          console.log('提交参数', this.digform)
          const symbol = this.symbolList.find(item => item.instrumentId === this.digform.instrumentId)
          this.digform.symbol = symbol.name
          if (this.status === 'update') {
            API.update(this.digform).then(res => {
              if (res.code == 200) {
                this.msgSuccess('修改成功')
                this.cancel()
                this.search()
                this.dialogStatus = false
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            API.add(this.digform).then(res => {
              if (res.code == 200) {
                this.msgSuccess('添加成功')
                this.cancel()
                this.search()
                this.dialogStatus = false
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
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
.demo-ruleForm {
  .el-form-item {
    float: left;
  }
}
</style>
