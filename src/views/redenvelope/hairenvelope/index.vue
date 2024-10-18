<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="80px">
      <el-form-item :label="$t('common.coin')" prop="currencyName">
        <el-select v-model="form.currencyId" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in codeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="日期" prop="time">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="daterange"
          :range-separator="$t('common.toTime')"
          value-format="yyyy-MM-dd"
          :start-placeholder="$t('common.startTime')"
          :end-placeholder="$t('common.endTime')"
        />
      </el-form-item>
      <el-form-item :label="$t('dwmanager.userUID')" prop="uid">
        <el-input
          v-model="form.uid"
          placeholder="请输入用户UID"
          size="mini"
        />
      </el-form-item>
      <el-form-item label="手机号/邮箱" prop="userAccount">
        <el-input
          v-model="form.userAccount"
          placeholder="请输入手机号/邮箱"
          size="mini"
        />
      </el-form-item>
      <el-form-item label="红包类型" prop="type">
        <el-select v-model="form.type" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in typeOptions"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="state">
        <el-select v-model="form.state" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in stateOptions"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getList">{{$t('common.search')}}</el-button>
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport">{{$t('common.derive')}}</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格数据 -->
    <el-table :data="dayList" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="id" label="红包ID" align="center" />
      <el-table-column label="时间" align="center" prop="createdAt">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt,"{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="uid" label="UID" align="center" />
      <el-table-column prop="userAccount" label="手机号/邮箱" align="center" />
      <el-table-column prop="amount" label="红包总金额" align="center" />
      <el-table-column prop="currencyName" :label="$t('common.coin')" align="center" />
      <el-table-column prop="count" label="红包数量" align="center" />
      <el-table-column prop="typeName" label="红包类型" align="center" />
      <el-table-column prop="singleEnvelopeAmount" label="单个红包金额" align="center" />
      <el-table-column prop="blessingContent" label="祝福语" align="center" />
      <el-table-column prop="collectionProgress" label="领取进度" align="center" />
      <el-table-column prop="stateName" :label="$t('common.status')" align="center" />
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > form.pageSize"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="getList"
      />
    </div>
  </div>
</template>
<script>
import * as API from '@/api/redenvelope/hairenvelope'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Hairenvelope',
  data() {
    return {
      pageShow: true,
      total: 0,
      form: {
        currencyName: '',
        sTime: undefined,
        eTime: undefined,
        pageNum: 1,
        pageSize: 10
      },
      dayList: [],
      time: undefined,
      open: false,
      digform: {
        currencyName: '',
        state: '',
        currencyMinVolume: '',
        currencyMaxVolume: '',
        redEnvelopeMax: ''
      },
      typeOptions: [
        { label: this.$t('common.all'), value: '' },
        { label: '普通红包', value: 0 },
        { label: '拼手气红包', value: 1 }
      ],
      stateOptions: [
        { label: this.$t('common.all'), value: '' },
        { label: '已过期', value: 2 },
        { label: '可用', value: 1 },
        { label: '未使用', value: 0 }
      ]
    }
  },
  computed: {
    ...mapState('redenvelope', ['redEnvelopeCurrencyList']),
    codeOptions() {
      return this.redEnvelopeCurrencyList
    }
  },
  // 初始化
  mounted() {
    this.getList()
    this.getRedEnvelopeCurrency()
  },
  methods: {
    ...mapActions('redenvelope', ['getRedEnvelopeCurrency']),
    /** 查询红包统计列表 */
    getList() {
      this.loading = true
      this.form.sTime = (this.time && this.time[0]) || ''
      this.form.sTime = this.form.sTime ? new Date(this.form.sTime + ' 00:00:00').getTime() : this.form.sTime
      this.form.eTime = (this.time && this.time[1]) || ''
      this.form.eTime = this.form.eTime ? new Date(this.form.eTime + ' 23:59:59').getTime() : this.form.eTime
      API.listDay(this.form).then(response => {
        this.dayList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出红包统计数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          return API.exportDay(queryParams)
        })
        .then(response => {
          this.download(response.msg)
        })
        .catch(function() {})
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
  display: grid;
  grid-template-columns: 50% 50%;
  margin-left: 5%;
  .grid-item {
    width: 90%;
  }
}
</style>
