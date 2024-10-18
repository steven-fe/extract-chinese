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
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="add">新建礼盒封面</el-button>
    <el-table ref="table" :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="showPrecision" :label="$t('common.operation')" align="center" width="350">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="modify(scope.row)">编辑</el-button>
          <el-button type="primary" size="mini" @click="deleted(scope.row)">删除</el-button>
          <el-button type="primary" size="mini" @click="editState(scope.row)">{{ scope.row.coverState === 0 ? '上线' : '下线' }}</el-button>
          <el-button type="primary" size="mini" @click="changeDefaultState(scope.row)">{{ scope.row.coverDefaultState === 1 ? $t('red.cancelDefault') : $t('red.setDefault') }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="coverPhoto" label="礼盒封面" align="center">
        <template slot-scope="scope">
          <img width="50" :src="scope.row.coverPhoto" alt="">
        </template>
      </el-table-column>
      <el-table-column prop="coverState" label="礼盒状态" align="center">
        <template slot-scope="scope">
          {{ scope.row.coverState === 0 ? '下线' : '上线' }}
        </template>
      </el-table-column>
      <el-table-column prop="coverRemark" :label="$t('common.remarks')" align="center" />
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        :total="total"
        :page.sync="searchForm.pageNum"
        :limit.sync="searchForm.pageSize"
        @pagination="pageChange"
      />
    </div>
    <el-dialog :title="dialogTitle" :visible.sync="dialogStatus" width="500px" :before-close="cancel" :close-on-click-modal="false">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        class="form-grid"
        label-width="120px"
      >
        <el-form-item class="grid-item" label="礼盒封面:" prop="coverPhoto">
          <el-upload
            class="upload-demo"
            action="#"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
          >
            <el-input v-model="digform.coverPhoto" placeholder="点击上传封面" style="width: 340px" clearable />
            <div style="text-align: left">图片尺寸600x900</div>
          </el-upload>
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('common.remarks')" prop="coverRemark">
          <el-input v-model="digform.coverRemark" placeholder="" maxlength="40" clearable />
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
import * as API from '@/api/redenvelope/giftBoxCover'
import * as CommonAPI from '@/api/indexImg'
// import {mapState, mapGetters, mapActions} from 'vuex'
// import { listCoinGoods } from '@/api/contract/coin'

export default {
  name: 'BignumRemind',
  data() {
    return {
      total: 0,
      searchForm: {
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      dialogStatus: false,
      dialogTitle: '',
      digform: {
        coverPhoto: '',
        coverRemark: '',
        id: undefined
      },
      rules: {
        coverPhoto: [
          { required: true, message: '图片不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.search()
  },
  methods: {
    search() {
      API.list(this.searchForm).then(res => {
        this.tableData = res.rows
        this.total = res.total
      })
    },
    pageChange(page) {
      this.searchForm.pageNum = page.page
      this.search()
    },
    cancel() {
      this.dialogStatus = false
      this.$refs['digform'].resetFields()
    },
    add() {
      this.dialogStatus = true
      this.digform.id = undefined
      this.dialogTitle = '新建礼盒封面'
    },
    modify(row) {
      this.dialogStatus = true
      Object.keys(this.digform).forEach(item => {
        this.digform[item] = row[item]
      })
      this.dialogTitle = '修改礼盒封面'
    },
    save() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          if (this.digform.id) {
            API.update(this.digform).then(res => {
              this.msgSuccess('修改成功')
              this.cancel()
              this.search()
              this.dialogStatus = false
            })
          } else {
            API.add(this.digform).then(res => {
              this.msgSuccess('添加成功')
              this.cancel()
              this.search()
              this.dialogStatus = false
            })
          }
        }
      })
    },
    deleted(row) {
      // status; 状态 1开启 0关闭
      this.$confirm('确认删除？', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        API.deleted(row.id).then(res => {
          this.msgSuccess('删除成功')
          this.search()
        })
      }).catch(() => {
        this.$message({ type: 'info', message: '取消删除' })
      })
    },
    changeDefaultState(row) {
      API.changeDefaultState({ id: row.id, coverDefaultState: row.coverDefaultState === 1 ? 0 : 1 }).then(res => {
        this.msgSuccess('设置成功')
        this.search()
      })
    },
    editState(row) {
      API.editState({ id: row.id, coverState: row.coverState === 0 ? 1 : 0 }).then(res => {
        this.msgSuccess('设置成功')
        this.search()
      })
    },
    // 图片上传
    upload(data) {
      CommonAPI.upload({ file: data.file }).then(res => {
        this.digform.coverPhoto = res.data.fullPath
        this.$message.success(this.$t('common.uploadSucceeded'))
      })
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
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
