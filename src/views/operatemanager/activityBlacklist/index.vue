<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="90px">
      <el-form-item label="uid:" placeholder="活动名称">
        <el-input v-model="form.uid" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList(true)">查找</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="exportData">{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="addActivity">添加黑名单</el-button>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column :label="$t('common.operation')" width="200px" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="remove(scope.row)">移除</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="序号" align="center" />
      <el-table-column prop="usersId" label="用户id" align="center" />
      <el-table-column prop="operator" label="操作者" align="center" />

    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="pageChange"
      />
    </div>
    <el-dialog :title="'添加黑名单'" :visible.sync="open" width="1000px" :before-close="cancel">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        class="form-grid"
      >
        <el-form-item class="grid-item" label="用户uid(多个以,分隔):" prop="activityName">
          <el-input v-model="digform.uids" placeholder="请输入用户id" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button size="mini" type="primary" @click="setConfig">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { pageList, remove, exportData } from '@/api/operate/activityBlacklist'
import { commonFilter } from '@/utils/filters'
import { date, time } from '@/utils/format'
import { mapState } from 'vuex'
import * as API from '@/api/operate/activityBlacklist'

export default {
  name: 'ActivityBlacklist',
  filters: {
    timeFilter(val) {
      if (Number(val) === 0) {
        return '- -'
      }
      return date(val) + ' ' + time(val)
    }
  },
  data() {
    return {
      pickerOptions: {
        disabledDate: (time) => {
          if (time) {
            return time.getTime() < new Date(new Date().toLocaleDateString()).getTime()
          }
          return true
        }
      },
      total: 0,
      configId: '',
      updateId: '',
      form: {
        uid: undefined,
        pageNum: 1,
        pageSize: 10
      },
      date: '',
      tableData: [{}],
      open: false,
      digform: {
        uids: ''
      },
      rules: {
        uids: [
          { required: true, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    currencyOptions() {
      return this.currencyList
    }
  },

  mounted() {
    this.getConfigList()
  },
  methods: {
    // 导出
    exportData() {
      exportData(this.form).then(res => {
        if (res.code === 200) {
          this.download(res.msg)
          this.$message({
            type: 'success',
            message: '导出成功'
          })
        }
      })
    },
    // 币种类型过滤方法
    typeLabel(data, val) {
      return commonFilter(data, val)
    },
    // 分页改变
    pageChange(val) {
      if (val) {
        this.pageNum = val.page
        this.pageSize = val.limit
        this.getConfigList()
      }
    },
    cancel() {
      this.open = false
      this.$refs['digform'].resetFields()
    },
    getConfigList(flag) {
      if (flag) {
        this.form.pageNum = 1
      }
      pageList(this.form).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
    },
    remove(row) {
      const params = {
        uid: row.usersId
      }
      remove(params).then(res => {
        if (res.code === 200) {
          this.$message({
            type: 'success',
            message: this.$t('common.operationSucceed')
          })
          this.getConfigList()
        } else {
          this.$message({
            type: 'error',
            message: '操作失败'
          })
        }
      })
    },
    setConfig() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          API.insert(this.digform).then(response => {
            if (response.code == 200) {
              this.msgSuccess('添加成功')
              this.getConfigList()
              this.cancel()
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    },

    /** 新增按钮操作 */
    addActivity() {
      this.open = true
      this.title = '添加活动信息'
      this.updateId = ''
      this.digform = {}
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
