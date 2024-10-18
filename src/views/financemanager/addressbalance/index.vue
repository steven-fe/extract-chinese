<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="币种：" prop="symbol">
        <el-select v-model="queryParams.symbol" placeholder="请选择币种" clearable size="mini">
          <el-option v-for="(item,index) in symbols" :key="index" :label="item" :value="index" />
        </el-select>
      </el-form-item>
      <el-form-item label="地址类型：" prop="addrType" label-width="90px">
        <el-select v-model="queryParams.addrType" placeholder="请选择地址类型" clearable size="mini">
          <el-option v-for="(item,index) in addrTypes" :key="index" :label="item" :value="index" />
        </el-select>
      </el-form-item>
      <el-form-item label="查看类型：" prop="scanType" label-width="90px">
        <el-select v-model="queryParams.scanType" placeholder="请选择查看类型" clearable size="mini">
          <el-option v-for="(item,index) in scanTypes" :key="index" :label="item" :value="index" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="mini">
          <el-option v-for="(item,index) in statuss" :key="index" :label="item" :value="index" />
        </el-select>
      </el-form-item>
      <el-form-item label="告警状态：" prop="alarmStatus" label-width="90px">
        <el-select v-model="queryParams.alarmStatus" placeholder="请选择告警状态" clearable size="mini">
          <el-option v-for="(item,index) in alarmStatuss" :key="index" :label="item" :value="index" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >添加地址</el-button>
      </el-col>
    </el-row>
    <el-table v-loading="loading" border :data="balanceList">
      <el-table-column label="币种：" align="center" prop="symbol" />
      <el-table-column label="地址类型" align="center" prop="addrType">
        <template slot-scope="scope">
          <span v-for="(item,index) in addrTypes" :key="index" :label="item" :value="index">
            <span v-if="scope.row.addrType==index">{{ item }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="地址" align="center" prop="address">
        <template slot-scope="scope">
          <el-link
            :href="scope.row.blockLink"
            type="primary"
            target="_blank"
            :underline="false"
          >{{ scope.row.address }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="最小报警值" align="center" prop="minAlarmValue" />
      <el-table-column label="数据更新时间" align="center" prop="latestUpdateTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.latestUpdateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="金额" align="center" prop="balance" />
      <el-table-column label="告警状态" align="center" prop="alarmStatus">
        <template slot-scope="scope">
          <span v-for="(item,index) in alarmStatuss" :key="index" :label="item" :value="index">
            <span v-if="scope.row.alarmStatus==index">{{ item }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="查看类型" align="center" prop="scanType">
        <template slot-scope="scope">
          <span v-for="(item,index) in scanTypes" :key="index" :label="item" :value="index">
            <span v-if="scope.row.scanType==index">{{ item }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.status')" align="center" prop="status">
        <template slot-scope="scope">
          <span v-for="(item,index) in statuss" :key="index" :label="item" :value="index">
            <span v-if="scope.row.status==index">{{ item }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <!-- 添加或修改地址余额对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="币种：" prop="symbol">
          <el-select v-model="form.symbol" placeholder="请选择币种" clearable size="mini">
            <el-option v-for="(item,index) in symbols" :key="index" :label="item" :value="index" />
          </el-select>
        </el-form-item>
        <el-form-item label="地址类型：">
          <el-select v-model="form.addrType" placeholder="请选择地址类型" clearable size="mini">
            <el-option v-for="(item,index) in addrTypes" :key="index" :label="item" :value="index" />
          </el-select>
        </el-form-item>
        <el-form-item label="地址：" prop="address">
          <el-input v-model="form.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="地址查询链接：" prop="blockLink">
          <el-input v-model="form.blockLink" type="textarea" placeholder="请输入地址查询链接" />
        </el-form-item>
        <el-form-item label="最小报警值：" prop="minAlarmValue">
          <el-input v-model="form.minAlarmValue" placeholder="请输入最小报警值" />
        </el-form-item>
        <el-form-item label="金额：" prop="balance">
          <el-input v-model="form.balance" placeholder="请输入金额：" />
        </el-form-item>
        <el-form-item label="告警状态：" prop="alarmStatus">
          <el-select v-model="form.alarmStatus" placeholder="请选择告警状态" clearable size="mini">
            <el-option
              v-for="(item,index) in alarmStatuss"
              :key="index"
              :label="item"
              :value="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="查看类型：" prop="scanType">
          <el-select v-model="form.scanType" placeholder="请选择查看类型" clearable size="mini">
            <el-option v-for="(item,index) in scanTypes" :key="index" :label="item" :value="index" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.status')" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" clearable size="mini">
            <el-option v-for="(item,index) in statuss" :key="index" :label="item" :value="index" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{$t('common.sure')}}</el-button>
        <el-button @click="cancel">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listBalance,
  delBalance,
  addBalance,
  updateBalance,
  queryParamsList
} from '@/api/addressbalance'

export default {
  name: 'Balance',
  data() {
    return {
      symbols: [],
      addrTypes: [],
      scanTypes: [],
      statuss: [],
      alarmStatuss: [],
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 地址余额表格数据
      balanceList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        symbol: undefined,
        addrType: undefined,
        alarmStatus: undefined,
        status: undefined,
        scanType: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        symbol: [{ required: true, message: this.$t('financemanager.currencyCannotBeEmpty'), trigger: 'blur' }],
        addrType: [
          { required: true, message: '地址类型不能为空', trigger: 'blur' }
        ],
        address: [{ required: true, message: '地址不能为空', trigger: 'blur' }],
        blockLink: [
          { required: true, message: '地址查询链接不能为空', trigger: 'blur' }
        ],
        minAlarmValue: [
          { required: true, message: '最小报警值不能为空', trigger: 'blur' }
        ],
        balance: [{ required: true, message: this.$t('contractmanager.amountCannotBeEmpty'), trigger: 'blur' }],
        alarmStatus: [
          { required: true, message: '告警状态不能为空', trigger: 'blur' }
        ],
        scanType: [
          { required: true, message: '查看类型不能为空', trigger: 'blur' }
        ],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getQueryList()
  },
  methods: {
    /** 查询地址余额列表 */
    getList() {
      this.loading = true
      listBalance(this.queryParams).then(response => {
        this.balanceList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    getQueryList() {
      queryParamsList().then(response => {
        this.symbols = response.data.coinList
        this.addrTypes = response.data.addTypeMap
        this.scanTypes = response.data.scanTypeMap
        this.statuss = response.data.statusMap
        this.alarmStatuss = response.data.alarmStatusMap
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        symbol: undefined,
        addrType: undefined,
        address: undefined,
        blockLink: undefined,
        minAlarmValue: undefined,
        balance: undefined,
        alarmStatus: '0',
        status: '0',
        scanType: undefined
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加地址余额'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.form = Object.assign({}, row)
      this.form.addrType = this.form.addrType + ''
      this.form.alarmStatus = this.form.alarmStatus + ''
      this.form.scanType = this.form.scanType + ''
      this.form.status = this.form.status + ''
      this.open = true
      this.title = '修改地址余额'
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateBalance(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addBalance(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id
      this.$confirm(
        '是否确认删除地址余额编号为"' + ids + '"的数据项?',
        this.$t('common.alert'),
        {
          confirmButtonText: this.$t('common.sure'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'warning'
        }
      )
        .then(function() {
          return delBalance(ids)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
        .catch(function() {})
    }
  }
}
</script>
