<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="90px">
      <el-form-item label="会员等级" prop="levelId">
        <el-select
          v-model="queryParams.levelId"
          clearable
          size="mini"
          placeholder="请选择会员等级"
        >
          <el-option
            v-for="(item, index) in selectList"
            :key="item.levelId"
            :label="item.levelName"
            :value="item.levelId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="保证金币种" prop="marginCoin">
        <el-select
          v-model="queryParams.marginCoin"
          clearable
          size="mini"
          placeholder="请选择保证金币种"
        >
          <el-option
            v-for="(item, index) in goodsMarginList"
            :key="index"
            :label="item.marginCoin"
            :value="item.marginCoin"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="升级类型" prop="upgradeType">
        <el-select
          v-model="queryParams.upgradeType"
          clearable
          size="mini"
          placeholder="请选择升级类型"
        >
          <el-option
            v-for="(item, index) in upgradeTypeOptions"
            :key="item.upgradeType"
            :label="item.typeName"
            :value="item.upgradeType"
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
          v-hasPermi="['coinbull:partner:upgrade:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="upgradeList" border>
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="会员等级" align="center" prop="levelId">
        <template slot-scope="scope">
          <span v-for="(item,key) in selectList" :key="key">
            <span v-if="item.levelId==scope.row.levelId">{{ item.levelName }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="保证金币种" align="center" prop="marginCoin" />
      <el-table-column label="升级类型" align="center" prop="upgradeType">
        <template slot-scope="scope">
          <span v-if="scope.row.upgradeType == 2">抵押</span>
          <span v-else-if="scope.row.upgradeType == 1">消耗</span>
        </template>
      </el-table-column>
      <el-table-column label="消耗额" align="center" prop="costAmount" />
      <el-table-column label="周期" align="center" prop="period">
        <template slot-scope="scope">
          <span v-if="scope.row.period != null">{{ scope.row.period }}</span>
          <span v-for="opt in periodUnitOptions" :key="opt.periodUnit">
            <span v-if="scope.row.periodUnit==opt.periodUnit">{{ opt.unitName }}<br></span>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.remarks')" align="center" prop="remark" />
      <el-table-column :label="$t('common.operation')" align="center" class-name="small-padding fixed-width" width="200px">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['coinbull:partner:upgrade:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['coinbull:partner:upgrade:remove']"
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

    <!-- 添加或修改会员升级配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="会员等级" prop="levelId">
          <el-select
            v-model="form.levelId"
            clearable
            placeholder="请选择会员等级"
          >
            <el-option
              v-for="(item, index) in selectList"
              :key="item.levelId"
              :label="item.levelName"
              :value="item.levelId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="保证金币种" prop="marginCoin">
          <el-select
            v-model="form.marginCoin"
            clearable
            placeholder="请选择保证金币种"
          >
            <el-option
              v-for="(item, index) in goodsMarginList"
              :key="index"
              :label="item.marginCoin"
              :value="item.marginCoin"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="升级类型" prop="upgradeType">
          <el-select
            v-model="form.upgradeType"
            clearable
            placeholder="请选择升级类型"
          >
            <el-option
              v-for="(item, index) in upgradeTypeOptions"
              :key="item.upgradeType"
              :label="item.typeName"
              :value="item.upgradeType"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="消耗额" prop="costAmount">
          <el-input v-model="form.costAmount" placeholder="请输入消耗额" style="width:200px" clearable />
        </el-form-item>
        <el-form-item label="周期" prop="period">
          <el-input v-model="form.period" placeholder="请输入周期" style="width:200px" clearable />
        </el-form-item>
        <el-form-item label="周期单位" prop="periodUnit">
          <el-select v-model="form.periodUnit" placeholder="请选择周期单位" clearable>
            <el-option
              v-for="item in periodUnitOptions"
              :key="item.periodUnit"
              :label="item.unitName"
              :value="item.periodUnit"
            />
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
import { listUpgrade, getUpgrade, delUpgrade, addUpgrade, updateUpgrade, exportUpgrade } from '@/api/invitation/upgrade'
import { listLevel } from '@/api//invitation/invitationlevel'
import { listCoinGoods } from '@/api/contract/coin'

export default {
  name: 'VipUpgrade',
  data() {
    return {
      selectList: [],
      upgradeTypeOptions: [
        {
          upgradeType: 1,
          typeName: '消耗'
        },
        {
          upgradeType: 2,
          typeName: '抵押'
        }
      ],
      // 币种列表
      goodsMarginList: [],
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      periodUnitOptions: [
        {
          periodUnit: 1,
          unitName: '天'
        }
      ],
      // 会员升级配置表格数据
      upgradeList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        levelId: undefined,
        marginCoin: undefined,
        upgradeType: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        levelId: [
          { required: true, message: '会员等级不能为空', trigger: 'blur' }
        ],
        marginCoin: [
          { required: true, message: '保证金币种不能为空', trigger: 'blur' }
        ],
        upgradeType: [
          { required: true, message: '升级类型不能为空', trigger: 'blur' }
        ],
        costAmount: [
          { required: true, message: '消耗额不能为空', trigger: 'blur' },
          { pattern: /^(([0-9]\d*)|([[1-9]\d*\.\d*)|(0\.(\d*[1-9])))$/, message: '请输入大于等于0的正整数或小数', trigger: 'blur' }
        ],
        period: [
          { required: true, message: '周期不能为空', trigger: 'blur' },
          { pattern: /^([1-9]|[1-9]\d*)$/, message: '请输入大于0的正整数', trigger: 'blur' }
        ],
        periodUnit: [
          { required: true, message: '周期单位不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getSelect()
    this.getListCoinGoodsList()
    this.getList()
  },
  methods: {
    getSelect() {
      this.loading = true
      listLevel().then((response) => {
        this.selectList = response.rows
      })
    },
    // 商品id列表
    getListCoinGoodsList() {
      listCoinGoods().then((response) => {
        if (response.code == 200) {
          this.goodsMarginList = this.unique3(response.rows)
        }
      })
    },
    // 过滤
    unique3(arr) {
      const res = new Map()
      return arr.filter(
        (arr) => !res.has(arr.marginCoin) && res.set(arr.marginCoin, 1)
      )
    },
    /** 查询会员升级配置列表 */
    getList() {
      this.loading = true
      listUpgrade(this.queryParams).then(response => {
        this.upgradeList = response.rows
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
        levelId: undefined,
        marginCoin: undefined,
        upgradeType: undefined,
        costAmount: undefined,
        period: undefined,
        periodUnit: undefined,
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
      this.title = '添加会员升级配置'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getUpgrade(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改会员升级配置'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateUpgrade(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addUpgrade(this.form).then(response => {
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
      this.$confirm('是否确认删除会员升级配置编号为"' + ids + '"的数据项?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(function() {
        return delUpgrade(ids)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    }
  }
}
</script>
