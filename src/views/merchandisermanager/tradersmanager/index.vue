<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="120px">
      <el-form-item label="交易员类型：" prop="guidesType">
        <el-select v-model="queryParams.guidesType" placeholder="请选择交易员类型" size="mini" clearable>
          <el-option
            v-for="item in guidesType"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="交易员ID：" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入交易员ID"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分享跟单状态：" prop="followStatus">
        <el-select
          v-model="queryParams.followStatus"
          placeholder="请选择分享跟单状态"
          clearable
          size="mini"
        >
          <el-option
            v-for="item in followStatus"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="申请状态：" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择申请状态"
          clearable
          size="mini"
        >
          <el-option
            v-for="item in applyStatus"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="guidesList" border>
      <el-table-column label="交易员ID" align="center" prop="userId" />
      <el-table-column label="交易员类型" align="center" prop="guidesType">
        <template slot-scope="scope">
          <span v-if="scope.row.guidesType=='1'">交易员</span>
          <span v-if="scope.row.guidesType=='2'">普通带单用户</span>
        </template>
      </el-table-column>
      <el-table-column label="返佣比例" align="center" prop="commissionRate">
        <template slot-scope="scope">
          <span>{{ scope.row.commissionRate*100 }}%</span>
        </template>
      </el-table-column>
      <el-table-column label="分享跟单状态" align="center" prop="followStatus">
        <template slot-scope="scope">
          <span v-if="scope.row.followStatus=='1'">开启</span>
          <span v-if="scope.row.followStatus=='2'">关闭</span>
          <span v-if="scope.row.followStatus=='3'">系统关闭</span>
        </template>
      </el-table-column>
      <el-table-column label="简介" align="center" prop="introduction" />
      <el-table-column label="交易员标签" align="center" prop="label">
        <template slot-scope="scope">
          <span v-for="label in labels" :key="label.value">
            <span v-for="(rLabel,index) in scope.row.label" :key="index">
              <span v-if="rLabel==label.value">{{ label.label }}&nbsp;</span>
            </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="微信账号" align="center" prop="wechat" />
      <el-table-column label="邮箱地址" align="center" prop="email" />
      <el-table-column label="分成比例" align="center" prop="rate" />
      <el-table-column label="申请状态" align="center" prop="status">
        <template slot-scope="scope">
          <span v-if="scope.row.status=='1'">申请中</span>
          <span v-if="scope.row.status=='2'">通过</span>
          <span v-if="scope.row.status=='3'">拒绝</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="ctime" />
      <el-table-column label="榜单排序" align="center" prop="guidesSort" />
      <el-table-column label="交易员开关" align="center" prop="guidesOpen">
        <template slot-scope="scope">
          <span v-if="scope.row.guidesOpen=='1'">开启</span>
          <span v-if="scope.row.guidesOpen=='0'">关闭</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" align="center" width="200px">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status=='2'"
            size="mini"
            icon="el-icon-edit"
            type="primary"
            @click="handleUpdate(1, scope.row)"
          >修改</el-button>
          <el-button
            v-else
            size="mini"
            icon="el-icon-edit"
            type="primary"
            @click="handleUpdate(2, scope.row)"
          >审批</el-button>
          <el-button
            size="mini"
            type="success"
            icon="el-icon-view"
            @click="handleInfo(scope.row)"
          >详情</el-button>
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

    <!-- 添加或修改跟单用户信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="交易员ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="用户标签" prop="label">
          <el-checkbox-group v-model="form.label">
            <el-checkbox
              v-for="label in labels"
              :key="label.value"
              :label="label.value"
            >{{ label.label }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="分享跟单状态" prop="followStatus">
          <el-select v-model="form.followStatus" placeholder="请选择分享跟单状态" clearable size="mini">
            <el-option
              v-for="item in followStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="返佣比例" prop="commissionRate">
          <el-input v-model="form.commissionRate" placeholder="请输入返佣比例">
            <template slot="append">%</template>
          </el-input>
        </el-form-item>
        <el-form-item label="榜单排序" prop="guidesSort">
          <el-input v-model="form.guidesSort" placeholder="请输入榜单排序" />
        </el-form-item>
        <el-form-item label="交易员开关">
          <el-radio-group v-model="form.guidesOpen">
            <el-radio label="1">开</el-radio>
            <el-radio label="0">关</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm(1)">{{ btnLeft }}</el-button>
        <el-button v-if="btnRight == '取 消'" @click="cancel">{{ btnRight }}</el-button>
        <el-button v-else @click="submitForm(2)">{{ btnRight }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listGuides, addGuides, updateGuides } from '@/api/system/guides'

export default {
  data() {
    var checkQuota = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('参数不能为空!'))
      }
      if (String(value).includes(' ')) {
        callback(new Error(this.$t('frozen.cannotContainSpaces')))
      }
      if (!Number.isFinite(Number(value))) {
        callback(new Error('请输入数字值!'))
      } else {
        if (value <= 0 || value > 100) {
          callback(new Error('数值范围0-100'))
        } else {
          callback()
        }
      }
    }
    return {
      // 遮罩层
      loading: true,
      isAdd: true,
      // 总条数
      total: 0,
      // 跟单用户信息表格数据
      guidesList: [],
      // 弹出层标题
      title: '',
      btnLeft: '',
      btnRight: '',
      // 是否显示弹出层
      open: false,
      labels: [
        {
          value: '1',
          label: '短线'
        },
        {
          value: '2',
          label: '重仓'
        },
        {
          value: '3',
          label: '长线'
        },
        {
          value: '4',
          label: '稳健'
        },
        {
          value: '5',
          label: '高风险'
        },
        {
          value: '6',
          label: '轻仓'
        },
        {
          value: '7',
          label: '中线'
        },
        {
          value: '8',
          label: '激进'
        },
        {
          value: '9',
          label: '主流'
        },
        {
          value: '10',
          label: '高频'
        },
        {
          value: '11',
          label: '低频'
        }
      ],
      guidesType: [
        {
          value: '1',
          label: '交易员'
        },
        {
          value: '2',
          label: '普通带单用户'
        }
      ],
      followStatus: [
        {
          value: '1',
          label: '开启'
        },
        {
          value: '2',
          label: '关闭'
        },
        {
          value: '3',
          label: '系统关闭'
        }
      ],
      applyStatus: [
        {
          value: '1',
          label: '申请中'
        },
        {
          value: '2',
          label: '通过'
        },
        {
          value: '3',
          label: '拒绝'
        }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: undefined,
        guidesType: '',
        followStatus: '',
        status: ''
      },
      // 表单参数
      form: {
        label: [],
        approval: undefined
      },
      // 表单校验
      rules: {
        commissionRate: [
          { required: true, message: '返佣比例不能为空', trigger: 'blur' }
        ],
        userId: [
          { required: true, message: '交易员ID不能为空', trigger: 'blur' }
        ],
        commissionRate: [
          {
            validator: checkQuota,
            trigger: 'blur'
          }
        ],
        followStatus: [
          {
            required: true,
            message: '分享跟单状态不能为空',
            trigger: 'blur'
          }
        ],
        guidesSort: [
          { pattern: /^([1-9]|[1-9]\d*)$/, message: '请输入大于0的正整数', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询跟单用户信息列表 */

    getList() {
      this.loading = false
      listGuides(this.queryParams).then(response => {
        this.guidesList = response.rows
        this.guidesList.forEach(element => {
          if (element.label != null) {
            element.label = element.label.split(',')
          }
        })
        this.total = response.total
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
        userId: undefined,
        label: [],
        followStatus: '',
        commissionRate: undefined,
        guidesSort: undefined,
        guidesOpen: undefined
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
      this.form.followStatus = '1'
      this.form.guidesOpen = '1'
      this.isAdd = true
      this.title = '添加跟单用户信息'
      this.btnLeft = this.$t('common.sure')
      this.btnRight = '取 消'
    },
    /** 修改按钮操作 */
    handleUpdate(type, row) {
      if (row.label == null) {
        row.label = []
      } else if (!(row.label instanceof Array)) {
        row.label = row.label.split(',')
      }
      this.form = Object.assign({}, row)
      this.form.commissionRate = this.form.commissionRate * 100
      this.form.guidesOpen = this.form.guidesOpen + ''
      this.open = true
      this.isAdd = false
      this.title = '修改跟单用户信息'
      if (type == 2) {
        this.btnLeft = '同 意'
        this.btnRight = '拒 绝'
      } else {
        this.btnLeft = this.$t('common.sure')
        this.btnRight = '取 消'
      }
    },
    /** 提交按钮 */
    submitForm: function(approval) {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.form.label = this.form.label.join(',')
          this.form.approval = approval
          const data = Object.assign({}, this.form)
          if (!this.isAdd) {
            updateGuides(data)
              .then(response => {
                if (response.code === 200) {
                  this.msgSuccess('修改成功')
                  this.open = false
                  this.getList()
                } else {
                  this.open = false
                  this.msgError(response.msg)
                  this.getList()
                }
              })
              .catch(error => {
                this.open = false
                this.getList()
              })
          } else {
            addGuides(data)
              .then(response => {
                if (response.code === 200) {
                  this.msgSuccess('新增成功')
                  this.open = false
                  this.getList()
                } else {
                  this.open = false
                  this.msgError(response.msg)
                  this.getList()
                }
              })
              .catch(error => {
                this.open = false
                this.getList()
              })
          }
        }
      })
    },
    handleInfo(row) {
      this.$router.push({
        name: 'tradersinfo',
        params: { guideId: row.userId }
      })
    }
  }
}
</script>
