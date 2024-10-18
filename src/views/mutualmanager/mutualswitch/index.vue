<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="合约" prop="goodsId">
        <el-select v-model="queryParams.goodsId" clearable size="mini" placeholder="请选择合约">
          <el-option
            v-for="(item, index) in goodsList"
            :key="index"
            :label="item.goodsId"
            :value="item.goodsId"
          />
        </el-select>
      </el-form-item>
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['coinbull:contract:mutualswitch:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="swicthList" border>
      <el-table-column label="合约" align="center" prop="goodsId" />
      <el-table-column label="保证金币种" align="center" prop="marginCoin" />
      <el-table-column :label="$t('common.status')" align="center" prop="guaranteeStatus">
        <template slot-scope="scope">
          <span v-if="scope.row.guaranteeStatus==0">关闭</span>
          <span v-if="scope.row.guaranteeStatus==1">开启</span>
        </template>
      </el-table-column>
      <el-table-column label="操作员" align="center" prop="statusMuser" />
      <el-table-column label="操作时间" align="center" prop="statusMtime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.statusMtime) }}</span>
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
            v-hasPermi="['coinbull:contract:mutualswitch:edit']"
            size="mini"
            type="text"
            icon="el-icon-s-opportunity"
            @click="openMsgBox(scope.row)"
          >
            <span v-if="scope.row.guaranteeStatus==0">启用</span>
            <span v-if="scope.row.guaranteeStatus==1">停用</span>
          </el-button>
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
    <el-dialog :title="title" :visible.sync="open" width="600px">
      <el-form ref="form" :model="form" :rules="rules">
        <el-row>
          <el-col :span="12">
            <el-form-item label="合约" prop="goodsId">
              <el-select v-model="form.goodsId" size="mini" placeholder="请选择合约">
                <el-option
                  v-for="(item, index) in goodsList"
                  :key="index"
                  :label="item.goodsId"
                  :value="item.goodsId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保证金币种" prop="marginCoin">
              <el-select v-model="form.marginCoin" size="mini" placeholder="请选择保证金">
                <el-option
                  v-for="(item, index) in marList"
                  :key="index"
                  :label="item.marginCoin"
                  :value="item.marginCoin"
                />
              </el-select>
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
} from '@/api/mutual/mutualswitch'
import { listCoinGoods } from '@/api/contract/coin'
import { listCoinMar } from '@/api/contract/margin'

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
      // 相互宝开关信息表格数据
      swicthList: [],
      // 弹出层标题
      title: '',
      goodsList: [],
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
        goodsId: [{ required: true, message: '合约不能为空', trigger: 'blur' }],
        marginCoin: [
          { required: true, message: '保证金币种不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getListCoinGoodsList()
    this.getMarList()
    this.getList()
  },
  methods: {
    /** 查询相互宝配置信息列表 */
    getList() {
      this.loading = true
      listConfig(this.queryParams).then((response) => {
        this.swicthList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 商品id列表
    getListCoinGoodsList() {
      listCoinGoods().then((response) => {
        if (response.code == 200) {
          this.goodsList = this.unique2(response.rows)
        }
      })
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
      this.title = '添加相互宝配置信息'
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
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
      })
    },
    openMsgBox(row) {
      const form = Object.assign({}, row)
      const status = form.guaranteeStatus == 0 ? '启用' : '停用'
      this.$confirm(
        '确定要' +
          status +
          form.goodsId +
          ' 合约 ' +
          form.marginCoin +
          ' 保证金的相互保功能?',
        this.$t('common.alert'),
        {
          confirmButtonText: this.$t('common.sure') + status,
          cancelButtonText: this.$t('common.cancel'),
          type: 'warning'
        }
      )
        .then(function() {
          form.guaranteeStatus = form.guaranteeStatus == 0 ? 1 : 0
          return updateConfig(form)
        })
        .then(() => {
          this.getList()
          this.msgSuccess(this.$t('common.operationSucceed'))
        })
        .catch(function() {})
    }
  }
}
</script>
