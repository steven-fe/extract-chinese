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
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="add">新曾礼盒活动</el-button>
    <el-table ref="table" :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="showPrecision" :label="$t('common.operation')" align="center" width="250">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="modify(scope.row)">编辑</el-button>
          <el-button type="primary" size="mini" @click="deleted(scope.row)">删除</el-button>
          <el-button type="primary" size="mini" @click="editState(scope.row)">{{ scope.row.activityState === 0 ? '上线' : '下线' }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="coverPhoto" label="礼盒活动banner" align="center">
        <template slot-scope="scope">
          <img width="50" :src="scope.row.giftBoxActivityPhoto" alt="">
        </template>
      </el-table-column>
      <el-table-column prop="coverState" label="开始时间" align="center">
        <template slot-scope="scope">
          {{ scope.row.activityBeginTime | timeFormat }} - <br> {{ scope.row.activityEndTime | timeFormat }}
        </template>
      </el-table-column>
      <el-table-column prop="giftBoxNo" label="礼盒编号" align="center" />
      <el-table-column prop="giftBoxPwd" label="礼盒口令" align="center" />
      <el-table-column prop="activityStatus" label="活动状态" align="center">
        <template slot-scope="scope">
          {{ scope.row.activityStatus === 0 ? '预热中' : scope.row.activityStatus === 1 ? '进行中' : '已结束' }}
        </template>
      </el-table-column>
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
        <el-form-item class="grid-item" label="Banner:" prop="giftBoxActivityPhoto">
          <el-upload
            class="upload-demo"
            action="#"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
          >
            <el-input v-model="digform.giftBoxActivityPhoto" placeholder="点击上传图片" style="width: 340px" clearable />
            <div style="text-align: left">图片尺寸750x520</div>
          </el-upload>
        </el-form-item>
        <el-form-item class="grid-item" label="礼盒编号:" prop="giftBoxNo">
          <el-input v-model="digform.giftBoxNo" placeholder="" clearable @change="checkGiftBoxNo" />
        </el-form-item>
        <el-form-item class="grid-item" label="礼盒口令:" prop="giftBoxPwd">
          <el-input v-model="digform.giftBoxPwd" placeholder="" clearable :disabled="true" />
        </el-form-item>
        <el-form-item class="grid-item" label="活动时间:" prop="timeRange">
          <el-date-picker
            v-model="digform.timeRange"
            :disabled="true"
            size="mini"
            style="width: 340px"
            type="datetimerange"
            :range-separator="$t('common.toTime')"
            :start-placeholder="$t('common.startTime')"
            :end-placeholder="$t('common.endTime')"
            value-format="timestamp"
            :default-time="['00:00:00', '23:59:59']"
          />
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
import * as API from '@/api/redenvelope/giftBoxActivity'
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
        giftBoxActivityPhoto: '',
        giftBoxNo: '',
        giftBoxPwd: '',
        activityBeginTime: '',
        activityEndTime: '',
        timeRange: '',
        activityState: 0,
        id: undefined
      },
      rules: {
        giftBoxActivityPhoto: [
          { required: true, message: this.$t('frozen.notIsData'), trigger: 'blur' }
        ],
        giftBoxNo: [
          { required: true, message: this.$t('frozen.notIsData'), trigger: 'blur' }
        ],
        giftBoxPwd: [
          { required: true, message: this.$t('frozen.notIsData'), trigger: 'change' }
        ],
        timeRange: [
          { required: true, message: this.$t('frozen.notIsData'), trigger: 'change' }
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
    checkGiftBoxNo() {
      if (!this.digform.giftBoxNo) return
      this.digform.giftBoxPwd = ''
      this.digform.timeRange = []
      API.checkGiftBoxNo({ giftBoxNo: this.digform.giftBoxNo }).then(res => {
        this.digform.giftBoxPwd = res.data.giftBoxPwd
        this.digform.timeRange = [res.data.giftBoxBeginTime, res.data.giftBoxFailureTime]
      })
    },
    add() {
      this.dialogStatus = true
      this.digform.id = undefined
      this.dialogTitle = '新增礼盒活动'
    },
    modify(row) {
      this.dialogStatus = true
      Object.keys(this.digform).forEach(item => {
        this.digform[item] = row[item]
      })
      this.digform.timeRange = [this.digform.activityBeginTime, this.digform.activityEndTime]
      this.dialogTitle = '修改礼盒活动'
    },
    save() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          this.digform.activityBeginTime = this.digform.timeRange[0]
          this.digform.activityEndTime = this.digform.timeRange[1]
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
    editState(row) {
      API.editState({ id: row.id, activityState: row.activityState === 0 ? 1 : 0 }).then(res => {
        this.msgSuccess('设置成功')
        this.search()
      })
    },
    // 图片上传
    upload(data) {
      CommonAPI.upload({ file: data.file }).then(res => {
        this.digform.giftBoxActivityPhoto = res.data.fullPath
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
