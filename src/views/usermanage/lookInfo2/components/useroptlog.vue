<template>
  <div style="padding-bottom: 20px">
    <el-table v-loading="loading" border :data="tableData" style="width: 100%">
      <el-table-column prop="hostip" label="ip" />
      <el-table-column :label="$t('common.operation')">
        <template slot-scope="scope">
          <span v-if="scope.row.operating">{{ scope.row.operating }}</span>
          <span v-else>
            <span v-if="scope.row.loginType==0">{{ $t('userManager.unknown') }}</span>
            <span v-if="scope.row.loginType==1">{{ $t('userManager.phoneNumber') }}</span>
            <span v-if="scope.row.loginType==2">{{ $t('userManager.email') }}</span>
            <span v-if="scope.row.loginType==3">{{ $t('userManager.fingerprint') }}</span>
            <span v-if="scope.row.loginType==4">{{ $t('userManager.QQ') }}</span>
            {{ $t('userManager.login') }}
            <span v-if="scope.row.loginStatus==1">{{ $t('userManager.success') }}</span>
            <span v-if="scope.row.loginStatus==0">{{ $t('userManager.error') }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="platform" :label="$t('userManager.equType')" />
      <el-table-column :label="$t('userManager.operateTime')">
        <template slot-scope="scope">
          {{ parseTime(scope.row.ctime) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.logoutTime')">
        <template slot-scope="scope">
          {{ parseTime(scope.row.logoutDate) }}
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="form.pageNum"
      :limit.sync="form.pageSize"
      @pagination="load"
    />
  </div>
</template>

<script>
import { listLog } from '@/api/useroptlog'
export default {
  props: ['msg'],
  data() {
    return {
      loading: true,
      tableData: [],
      form: {
        userid: this.msg,
        pageSize: 10,
        pageNum: 1
      },
      total: 0
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      listLog(this.form)
        .then(response => {
          if (response.code == 200) {
            this.tableData = response.rows
            this.sum = response.data
            this.total = response.total
          } else {
            this.tableData = []
            this.total = 0
            this.sum = 0
            this.msgError(response.msg)
          }
          this.loading = false
        })
        .catch(error => {
          console.log(error)
        })
    }
  }
}
</script>

