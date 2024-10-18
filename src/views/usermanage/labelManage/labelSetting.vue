<template>
  <!-- 大额充提提醒设置 -->
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="searchForm" label-width="80px">
      <el-form-item label="标签分类:" prop="parentId">
        <el-select v-model="searchForm.parentId" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')" @change="searchParentLabel">
          <el-option
            v-for="item in parentLableList"
            :key="item.id"
            :label="item.parentName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="客户标签:" prop="id">
        <el-select v-model="searchForm.id" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in labelData"
            :key="item.id"
            :label="item.labelName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('dwmanager.userUID')" prop="uid">
        <el-input v-model="searchForm.uid" placeholder="" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="search">{{$t('common.search')}}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="add">添加</el-button>
      </el-form-item>
    </el-form>

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
      <el-table-column prop="parentName" label="标签分类" align="center">
        <template slot-scope="scope">
          <span :style="{color: scope.row.labelColor}">{{ scope.row.parentName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="labelName" label="客户标签" align="center" />
      <el-table-column prop="uid" :label="$t('dwmanager.userUID')" align="center" />
      <el-table-column prop="showPrecision" :label="$t('common.operation')" align="center">
        <template slot-scope="scope">
          <!--          <el-button type="primary" size="mini" @click="modify(scope.row, 'updateLabel', '编辑客户标签')">编辑</el-button>-->
          <el-button type="primary" size="mini" @click="deleted(scope.row)">删除</el-button>
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
    <el-dialog title="添加用户标签" :visible.sync="dialogStatus" width="500px" :before-close="cancel" :close-on-click-modal="false">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        class="form-grid"
        label-width="130px"
      >
        <el-form-item class="grid-item" label="标签分类:" prop="parentId">
          <el-select v-model="digform.parentId" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')" @change="selectParentLabel">
            <el-option
              v-for="item in parentLableList"
              :key="item.id"
              :label="item.parentName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item class="grid-item" label="客户标签:" prop="id">
          <el-select v-model="digform.id" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in labelArr"
              :key="item.id"
              :label="item.labelName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item class="grid-item" :label="$t('dwmanager.userUID')" prop="uids">
          <el-input v-model="digform.uids" type="textarea" placeholder="" clearable />
          <span>可输入多个UID，使用英文","隔开</span>
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
import * as commonAPI from '@/api/labelClass'
import * as API from '@/api/labelSetting'
import { frozen } from '@/api/finance/transfer'
// import {mapState, mapGetters, mapActions} from 'vuex'
// import { listCoinGoods } from '@/api/contract/coin'

export default {
  name: 'LabelClass',
  data() {
    return {
      disabledInput: false,
      total: 0,
      searchForm: {
        parentId: '',
        id: '',
        uid: '',
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      dialogStatus: false,
      status: '', // addParentLabel新增，updateParentLabel修改, addLabel新增客户标签, updateLabel修改客户标签
      digform: {
        parentId: '',
        id: '',
        uids: ''
      },
      rules: {
        parentId: [
          { required: true, message: '标签分类不能为空', trigger: 'blur' }
        ],
        id: [
          { required: true, message: '客户标签不能为空', trigger: 'blur' }
        ],
        uids: [
          { required: true, message: '用户UID不能为空', trigger: 'blur' }
        ]
      },
      parentLabelData: [],
      labelName: '' // dialog名称
    }
  },
  computed: {
    parentLableList() {
      const list = this.parentLabelData.filter(item => item.parentId === 0)
      return list
    },
    labelData() {
      const list = this.parentLabelData.filter(item => item.labelName)
      return list
    },
    labelArr() {
      const list = this.parentLabelData.filter(item => item.parentId === this.digform.parentId)
      return list
    },
    searchLabelArr() {
      const list = this.parentLabelData.filter(item => item.parentId === this.searchForm.parentId)
      return list
    }
  },
  mounted() {
    this.search()
    this.labelList()
  },
  methods: {
    searchParentLabel() {
      this.searchForm.id = ''
    },
    selectParentLabel() {
      this.digform.id = ''
    },
    labelList() {
      commonAPI.labelList(this.searchForm).then(res => {
        console.log('获取列表labelList', res)
        if (res.code === 200) {
          this.parentLabelData = res.data
        }
      })
    },
    search() {
      API.list(this.searchForm).then(res => {
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
    },
    save() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          const params = Object.assign({}, this.digform)
          params.uids = params.uids.split(',')
          API.add(params).then(res => {
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
      })
    },
    deleted(row) {
      this.$confirm('确认删除？', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        API.deleted({ id: row.id }).then(res => {
          if (res.code === 200) {
            this.msgSuccess('删除成功')
            this.search()
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消删除'
        })
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
