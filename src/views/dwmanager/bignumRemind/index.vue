<template>
  <!-- 大额充提提醒设置 -->
  <div class="app-container">
    <!--    <el-form :inline="true" ref="form" :model="searchForm" label-width="80px">-->
    <!--      <el-form-item label="币对:" prop="instrumentId">-->
    <!--        <el-select v-model="searchForm.instrumentId" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">-->
    <!--          <el-option-->
    <!--              v-for="item in symbolList"-->
    <!--              :key="item.instrumentId"-->
    <!--              :label="item.name"-->
    <!--              :value="item.instrumentId">-->
    <!--          </el-option>-->
    <!--        </el-select>-->
    <!--      </el-form-item>-->
    <!--      <el-form-item>-->
    <!--        <el-button type="primary" icon="el-icon-search" size="mini" @click="search">{{$t('common.search')}}</el-button>-->
    <!--      </el-form-item>-->
    <!--    </el-form>-->
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="add">添加提醒邮箱</el-button>

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
      <el-table-column prop="email" label="提醒邮箱" align="center" />
      <el-table-column prop="remarks" :label="$t('common.remarks')" align="center" />
      <el-table-column prop="showPrecision" :label="$t('common.operation')" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="modify(scope.row)">编辑</el-button>
          <el-button type="primary" size="mini" @click="deleted(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <!--    <div class="block top">-->
    <!--      <pagination-->
    <!--          v-show="total > searchForm.pageSize"-->
    <!--          :total="total"-->
    <!--          :page.sync="searchForm.pageNum"-->
    <!--          :limit.sync="searchForm.pageSize"-->
    <!--          @pagination="pageChange"-->
    <!--      />-->
    <!--    </div>-->
    <el-dialog title="添加提醒邮箱" :visible.sync="dialogStatus" width="500px" :before-close="cancel" :close-on-click-modal="false">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        class="form-grid"
        label-width="120px"
      >
        <el-form-item class="grid-item" label="添加邮箱:" prop="email">
          <el-input v-model="digform.email" placeholder="" clearable :disabled="disabledInput" />
        </el-form-item>
        <el-form-item class="grid-item" label="添加备注:" prop="remarks">
          <el-input v-model="digform.remarks" placeholder="" clearable />
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
import * as API from '@/api/bignumRemind'
// import {mapState, mapGetters, mapActions} from 'vuex'
// import { listCoinGoods } from '@/api/contract/coin'

export default {
  name: 'BignumRemind',
  data() {
    return {
      disabledInput: false,
      total: 0,
      searchForm: {
        instrumentId: '',
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      dialogStatus: false,
      status: '', // add新增，update修改
      digform: {
        email: '',
        remarks: '',
        id: undefined
      },
      rules: {
        email: [
          { required: true, message: '邮箱不能为空', trigger: 'blur' }
        ],
        remarks: [
          { required: true, message: this.$t('dwmanager.remarkCannotBeEmpty'), trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.search()
  },
  methods: {
    search() {
      API.list().then(res => {
        console.log('获取列表', res)
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
    cancel() {
      this.dialogStatus = false
      this.$refs['digform'].resetFields()
    },
    add() {
      this.dialogStatus = true
      this.status = 'add'
      this.digform.id = undefined
      this.disabledInput = false
    },
    modify(row) {
      this.dialogStatus = true
      Object.keys(this.digform).forEach(item => {
        this.digform[item] = row[item]
      })
      this.status = 'update'
      this.disabledInput = true
    },
    save() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          console.log('提交参数', this.digform)
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
    },
    deleted(row) {
      // status; 状态 1开启 0关闭
      API.deleted({ id: row.id, status: 0 }).then(res => {
        console.log('删除成功', res)
        if (res.code === 200) {
          this.msgSuccess('删除成功')
          this.search()
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
  //display: grid;
  //grid-template-columns: 50% 50%;
  //margin-left: 5%;
  //.grid-item {
  //  width: 90%;
  //}
}
.demo-ruleForm {
  .el-form-item {
    //float: left;
  }
}
</style>
