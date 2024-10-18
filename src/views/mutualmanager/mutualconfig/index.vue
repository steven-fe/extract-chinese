<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="保证金币种" prop="marginCoin" label-width="100px">
        <el-select v-model="queryParams.marginCoin" clearable size="mini" placeholder="请选择保证金">
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

    <el-table v-loading="loading" :data="configList" border>
      <el-table-column label="保证金币种" align="center" prop="marginCoin" />
      <el-table-column label="最低投保比例" align="center" prop="guaranteeProportion" />
      <el-table-column label="用户亏损系数" align="center" prop="lossCoefficient" />
      <el-table-column label="用户投保系数" align="center" prop="guaranteeCoefficient" />
      <el-table-column label="当日投保总额系数" align="center" prop="totalCoefficient" />
      <el-table-column label="操作员" align="center" prop="coefficientMuser" />
      <el-table-column label="操作时间" align="center" prop="coefficientMtime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.coefficientMtime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.operation')"
        align="center"
        class-name="small-padding fixed-width"
        width="200px"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['coinbull:contract:mutualconfig:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
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

    <!-- 添加或修改相互宝配置信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px">
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="保证金币种" prop="marginCoin">
              <el-select
                v-model="form.marginCoin"
                :disabled="editFlag"
                size="mini"
                placeholder="请选择保证金"
              >
                <el-option
                  v-for="(item, index) in marList"
                  :key="index"
                  :label="item.marginCoin"
                  :value="item.marginCoin"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="用户投保系数" prop="guaranteeCoefficient">
              <el-input v-model="form.guaranteeCoefficient" placeholder="请输入用户投保系数" />
            </el-form-item>
            <el-form-item label="当日投保总额系数" prop="totalCoefficient">
              <el-input v-model="form.totalCoefficient" placeholder="请输入当日投保总额系数" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户亏损系数" prop="lossCoefficient">
              <el-input v-model="form.lossCoefficient" placeholder="请输入用户亏损系数" />
            </el-form-item>
            <el-form-item label="最低投保比例" prop="guaranteeProportion">
              <el-input v-model="form.guaranteeProportion" placeholder="请输入最低投保比例" />
            </el-form-item>
          </el-col>
        </el-row>
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
  listConfig,
  getConfig,
  delConfig,
  addConfig,
  updateConfig
} from '@/api/mutual/mutualconfig'
import { listConfigCoin as listCoinMar } from '@/api/mutual/mutualswitch'

export default {
  data() {
    var checkQuota = (rule, value, callback) => {
      const reg = /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g
      if (value === '') {
        callback(new Error(this.$t('frozen.pleaseEnterContent')))
      } else if (!reg.test(value)) {
        callback(new Error(this.$t('frozen.pleaseEnterTheNumber')))
      }
      if (String(value).includes(' ')) {
        callback(new Error(this.$t('frozen.cannotContainSpaces')))
      } else {
        callback()
      }
    }
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      editFlag: false,
      // 相互宝配置信息表格数据
      configList: [],
      // 弹出层标题
      title: '',
      marList: [],
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        exchId: undefined,
        goodsId: undefined,
        marginCoin: undefined,
        guaranteeStatus: undefined,
        lossCoefficient: undefined,
        guaranteeCoefficient: undefined,
        totalCoefficient: undefined,
        guaranteeProportion: undefined,
        ctime: undefined,
        cuser: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        marginCoin: [
          { required: true, message: '保证金币种不能为空', trigger: 'blur' }
        ],
        lossCoefficient: [
          { required: true, message: '用户亏损系数不能为空', trigger: 'blur' },
          { validator: checkQuota, trigger: 'blur' }
        ],
        guaranteeCoefficient: [
          { required: true, message: '用户投保系数不能为空', trigger: 'blur' },
          { validator: checkQuota, trigger: 'blur' }
        ],
        totalCoefficient: [
          {
            required: true,
            message: '当日投保总额系数不能为空',
            trigger: 'blur'
          },
          { validator: checkQuota, trigger: 'blur' }
        ],
        guaranteeProportion: [
          { required: true, message: '最低投保比例不能为空', trigger: 'blur' },
          { validator: checkQuota, trigger: 'blur' }
        ],
        cuser: [
          { required: true, message: '创建用户不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getMarList()
    this.getList()
  },
  methods: {
    /** 查询相互宝配置信息列表 */
    getList() {
      this.loading = true
      listConfig(this.queryParams).then((response) => {
        this.configList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 保证金币种
    getMarList() {
      listCoinMar().then((response) => {
        if (response.code == 200) {
          if (response.rows) {
            this.marList = response.rows
          }
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 过滤
    unique2(arr) {
      const res = new Map()
      return arr.filter(
        (arr) => !res.has(arr.goodsId) && res.set(arr.goodsId, 1)
      )
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        exchId: undefined,
        goodsId: undefined,
        marginCoin: undefined,
        guaranteeStatus: '0',
        lossCoefficient: undefined,
        guaranteeCoefficient: undefined,
        totalCoefficient: undefined,
        guaranteeProportion: undefined,
        ctime: undefined,
        cuser: undefined
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
      this.editFlag = false
      this.title = '添加相互宝配置信息'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.editFlag = true
      const marginCoin = row.marginCoin || this.ids
      getConfig(marginCoin).then((response) => {
        this.form = response.data
        this.open = true
        this.title = '修改相互宝配置信息'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.coefficientMuser != undefined) {
            updateConfig(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addConfig(this.form).then((response) => {
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
    }
  }
}
</script>
