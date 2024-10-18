<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="授权币种" prop="marginCoin">
        <el-select
          v-model="queryParams.marginCoin"
          placeholder="请选择授权币种"
        >
          <el-option
            v-for="(item, index) in marList"
            :key="index"
            :label="item.marginCoin"
            :value="item.marginCoin"
          />
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
          v-hasPermi="['coinbull:projectside:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="grantList" border>
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="授权币种" align="center" prop="marginCoin" />
      <el-table-column label="授权API接口" align="center" prop="grantApi">
        <template slot-scope="scope">
          <span v-for="opt in grantApiOptions" :key="opt.grantApi">
            <span v-for="(item, index) in scope.row.grantApi" :key="index">
              <span v-if="item==opt.grantApi">{{ opt.grantApiName }}<br></span>
            </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="授权开始日期" align="center" prop="startDate" width="100">
        <template slot-scope="scope">
          <span>{{ getDateYMD(scope.row.startDate, '-') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="授权结束日期" align="center" prop="endDate" width="100">
        <template slot-scope="scope">
          <span>{{ getDateYMD(scope.row.endDate, '-') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="授权开关" align="center" prop="openFlag">
        <template slot-scope="scope">
          <span v-if="scope.row.openFlag == 1">开启</span>
          <span v-else>关闭</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.remarks')" align="center" prop="remark" />
      <el-table-column :label="$t('financemanager.operator')" align="center" prop="updateBy" />
      <el-table-column label="操作时间" align="center" prop="updateTime" width="100px">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" align="center" class-name="small-padding fixed-width" width="120px">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['coinbull:projectside:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['coinbull:projectside:remove']"
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

    <!-- 添加或修改项目方用户授权对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户ID" style="width: 60%" :disabled="inputFlag" />
        </el-form-item>
        <el-form-item label="授权币种" prop="marginCoin">
          <el-select
            v-model="form.marginCoin"
            placeholder="请选择授权币种"
          >
            <el-option
              v-for="(item, index) in marList"
              :key="index"
              :label="item.marginCoin"
              :value="item.marginCoin"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="授权API接口" prop="grantApiData">
          <el-select v-model="form.grantApiData" multiple placeholder="请选择授权API接口">
            <el-option
              v-for="item in grantApiOptions"
              :key="item.grantApi"
              :label="item.grantApiName"
              :value="item.grantApi"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="授权开始日期" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            clearable
            style="width: 200px"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择授权开始日期"
          />
        </el-form-item>
        <el-form-item label="授权结束日期" prop="endDate">
          <el-date-picker
            v-model="form.endDate"
            clearable
            style="width: 200px"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择授权结束日期"
          />
        </el-form-item>
        <el-form-item label="授权开关" prop="openFlag">
          <el-radio-group v-model="form.openFlag" placeholder="请选择授权开关">
            <el-radio label="0">关闭</el-radio>
            <el-radio label="1">开启</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('common.remarks')" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
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
import { listGrant, getGrant, delGrant, addGrant, updateGrant, exportGrant } from '@/api/projectside/grant'
import { listCoinMar } from '@/api/contract/margin'

export default {
  name: 'ProjectSideGrant',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 币种列表
      marList: [],
      inputFlag: false,
      // API接口列表
      grantApiOptions: [
        {
          grantApi: '/coinbull/project/home',
          grantApiName: '首页'
        },
        {
          grantApi: '/coinbull/project/contract',
          grantApiName: '交易数据'
        },
        {
          grantApi: '/coinbull/project/partner/action',
          grantApiName: '返佣查询'
        }
      ],
      // 总条数
      total: 0,
      // 项目方用户授权表格数据
      grantList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: undefined,
        marginCoin: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        userId: [
          { required: true, message: '用户ID不能为空', trigger: 'blur' }
        ],
        marginCoin: [
          { required: true, message: '授权币种（保证金币种）不能为空', trigger: 'blur' }
        ],
        grantApiData: [
          { required: true, message: '授权API接口不能为空', trigger: 'blur' }
        ],
        startDate: [
          { required: true, message: '授权开始日期不能为空', trigger: 'blur' }
        ],
        endDate: [
          { required: true, message: '授权结束日期不能为空', trigger: 'blur' }
        ],
        openFlag: [
          { required: true, message: '授权开关不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getMarList()
    this.getList()
  },
  methods: {
    // 商品id列表
    getMarList() {
      listCoinMar().then((response) => {
        if (response.code == 200) {
          if (this.marList) {
            this.marList = response.rows
          }
        } else {
          this.msgError(response.msg)
        }
      })
    },
    /** 查询项目方用户授权列表 */
    getList() {
      this.loading = true
      listGrant(this.queryParams).then(response => {
        this.grantList = response.rows
        this.grantList.forEach(element => {
          if (element.grantApi != null) {
            element.grantApi = element.grantApi.split(',')
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
        marginCoin: undefined,
        grantApiData: undefined,
        startDate: undefined,
        endDate: undefined,
        openFlag: undefined,
        remark: undefined
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
      this.inputFlag = false
      this.title = '添加项目方用户授权'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getGrant(id).then(response => {
        this.form = response.data
        this.$set(this.form, 'grantApiData', [])
        this.form.grantApiData = response.data.grantApi.split(',')
        this.form.openFlag = response.data.openFlag + ''
        this.open = true
        this.inputFlag = true
        this.title = '修改项目方用户授权'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.form.grantApi = this.form.grantApiData.join(',')
          if (this.form.id != undefined) {
            updateGrant(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addGrant(this.form).then(response => {
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
      const ids = row.id || this.ids
      this.$confirm('是否确认删除项目方用户授权编号为"' + ids + '"的数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(function() {
        return delGrant(ids)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    }
  }
}
</script>
