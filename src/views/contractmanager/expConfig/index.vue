<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="88px"
    >
      <el-form-item label="体验金批次ID" prop="id" label-width="98px">
        <el-input
          v-model="queryParams.id"
          placeholder="请输入体验金批次ID"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="体验金币种" prop="marginCoin">
        <el-select
          v-model="queryParams.marginCoin"
          size="mini"
          @change="getList"
        >
          <el-option
            v-for="(item, index) in marQueryList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="ctime">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('common.startTime')"
          :range-separator="$t('common.toTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item label="状态 " prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          size="mini"
          @change="getList"
        >
          <el-option
            v-for="(item, index) in statusTypes"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >{{$t('common.search')}}</el-button>
        <el-button
          icon="el-icon-refresh"
          size="mini"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新建体验金批次</el-button>
      </el-col>
    </el-row>
    <el-table v-loading="loading" :data="configList" border>
      <el-table-column
        label="体验金批次ID"
        align="center"
        prop="id"
        width="100"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="ctime"
        width="150px"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.ctime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="体验金币种"
        align="center"
        prop="marginCoin"
        width="100"
      />
      <el-table-column
        label="金额"
        align="center"
        prop="experienceAmount"
        width="100"
      />
      <el-table-column
        label="适用币对"
        align="center"
        prop="goodsIds"
        width="150"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.goodsIds">{{ scope.row.goodsIds }}</span>
          <span v-else>全部币对</span>
        </template>
      </el-table-column>
      <el-table-column
        label="杠杆倍数"
        align="center"
        prop="multiples"
        width="150"
      />
      <el-table-column
        label="有效期"
        align="center"
        prop="effectiveDay"
        width="100"
      />
      <el-table-column
        label="领取限制"
        align="center"
        prop="limitType"
        width="100"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.limitType == 0">无</span>
        </template>
      </el-table-column>
      <el-table-column
        label="上架时间"
        align="center"
        prop="marketTimeStart"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.marketTimeStart) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="下架时间"
        align="center"
        prop="marketTimeEnd"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.marketTimeEnd) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="发放对象"
        align="center"
        width="120"
        prop="experienceUidsNum"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.experienceUidsNum">
            <el-link
              type="primary"
              :underline="false"
              @click="toExpUserList(scope.row)"
            >
              {{ scope.row.experienceUidsNum }}
            </el-link>
          </span>
          <span v-else> 全部用户 </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.status')" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <span v-for="(item, index) in statusTypes" :key="index">
            <span v-if="item.value == scope.row.status">{{
              item.label
            }}</span></span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" align="center" width="150px">
        <template slot-scope="scope">
          <span v-if="scope.row.status != 2 && scope.row.status != 6">
            <span v-if="scope.row.status == 4 || scope.row.status == 5">
              <el-button
                v-if="scope.row.status == 4"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row, 5)"
              >启用
              </el-button>
              <el-button
                v-else-if="scope.row.status == 5"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row, 4)"
              >
                禁用
              </el-button>
            </span>
            <span v-else-if="scope.row.status == 1">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleConfirm(scope.row)"
              >
                审核
              </el-button>
            </span>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleUpdate(scope.row, 6)"
            >作废</el-button>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="cuser" />
      <el-table-column label="创建备注" align="center" prop="remark">
        <template
          slot-scope="scope"
        ><span>{{ parseStr(scope.row.remark) }}</span></template>
      </el-table-column>
      <el-table-column label="审核人" align="center" prop="checkUser">
        <template
          slot-scope="scope"
        ><span>{{ parseStr(scope.row.checkUser) }}</span></template>
      </el-table-column>
      <el-table-column label="审核时间" align="center" prop="checkTime">
        <template slot-scope="scope">
          <span v-if="scope.row.checkTime">{{
            parseTime(scope.row.checkTime)
          }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 审核 -->
    <el-dialog
      title="体验金审核"
      :visible.sync="dialogConfirmVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="form2" :model="form" label-width="100px" :rules="rules2">
        <el-form-item label="审核:" prop="confirmStatus">
          <el-radio v-model="form.confirmStatus" label="3">通过</el-radio>
          <el-radio v-model="form.confirmStatus" label="2">不通过</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :disabled="disabledConfirm"
          @click="submitConfirm"
        >{{$t('common.sure')}}</el-button>
        <el-button @click="cancel">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>

    <!-- 添加或修改体验金配置对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="体验金币种" prop="marginCoin">
          <el-select
            v-model="form.marginCoin"
            style="width: 100%"
            placeholder="请选择体验金币种"
          >
            <el-option
              v-for="(item, index) in marFormList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="体验金金额" prop="experienceAmount">
          <el-input
            v-model="form.experienceAmount"
            placeholder="请输入体验金金额"
          />
        </el-form-item>
        <el-form-item label="适用币对" prop="formGoodsIds">
          <el-select
            v-model="form.formGoodsIds"
            multiple
            style="width: 100%"
            allow-create
            placeholder="请选择适用币对"
            @change="changeGoods"
          >
            <el-option
              v-for="item in goodsList"
              :key="item.value"
              :label="item.label"
              :disabled="item.disabled"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="杠杆倍数" prop="formMultiples">
          <el-select
            v-model="form.formMultiples"
            multiple
            style="width: 100%"
            allow-create
            placeholder="请选择杠杆倍数"
          >
            <el-option
              v-for="item in multiples"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="有效期" prop="effectiveDay">
          <el-input v-model="form.effectiveDay" placeholder="请输入天数" />
        </el-form-item>
        <el-form-item label="领取限制" prop="limitType">
          <el-select
            v-model="form.limitType"
            style="width: 100%"
            placeholder="请选择领取限制 "
          >
            <el-option label="无" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="上架时间" prop="marketTimeStart">
          <el-date-picker
            v-model="form.marketTimeStart"
            style="width: 100%"
            type="datetime"
            placeholder="选择上架时间"
          />
        </el-form-item>
        <el-form-item label="下架时间" prop="marketTimeEnd">
          <el-date-picker
            v-model="form.marketTimeEnd"
            clearable
            style="width: 100%"
            type="datetime"
            placeholder="选择下架时间"
          />
        </el-form-item>
        <el-form-item label="发放对象" prop="experienceType">
          <el-select
            v-model="form.experienceType"
            style="width: 100%"
            placeholder="请选择发放对象"
            @change="selectChange"
          >
            <el-option label="全部用户" :value="0" />
            <el-option label="指定用户" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.experienceType" prop="experienceUids">
          <el-input
            v-model="form.experienceUids"
            type="textarea"
            rows="5"
            show-word-limit
          />
          <el-upload
            ref="upload"
            accept=".xlsx, .xls"
            action=""
            :on-exceed="onExceed"
            :file-list="fileList"
            :on-change="onUploadChange"
            :limit="1"
            :auto-upload="false"
          >
            <el-button
              slot="trigger"
              size="mini"
              type="primary"
            >选取文件</el-button>
            <el-button
              style="margin-left: 10px"
              size="mini"
              type="success"
              @click="downTemplate"
            >{{$t('frozen.downloadTemplate')}}</el-button>
            <span
              style="color: #ec808d; font-size: 12px"
            >*UID之间用逗号间隔,本次导入包含数据：{{ sheetLen }}条</span>
          </el-upload>
        </el-form-item>
        <el-form-item label="操作备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            rows="5"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :disabled="subDisabled"
          @click="submitForm"
        >{{$t('common.sure')}}</el-button>
        <el-button @click="cancel">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listConfig,
  getConfig,
  addConfig,
  importTemplate,
  confirmConfig,
  expMarList,
  updateConfig
} from '@/api/contract/expConfig'
import { listCoinGoods } from '@/api/contract/coin'
import { listCoinMar } from '@/api/contract/margin'
import XLSX, { read } from 'xlsx'
export default {
  name: '',
  data() {
    var checkQuota1 = (rule, value, callback) => {
      if (!this.form.marketTimeStart) {
        callback(new Error('请先选择上架时间'))
      } else if (value.getTime() <= this.form.marketTimeStart.getTime()) {
        callback(new Error('下架时间不得早于上架时间'))
      } else {
        callback()
      }
    }
    return {
      time: undefined,
      dialogConfirmVisible: false,
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 体验金配置表格数据
      configList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      subDisabled: false,
      disabledConfirm: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        exchId: undefined,
        marginCoin: undefined,
        goodsIds: undefined,
        experienceAmount: undefined,
        multiples: undefined,
        effectiveDay: undefined,
        limitType: undefined,
        marketTimeStart: undefined,
        marketTimeEnd: undefined,
        status: undefined,
        cuser: undefined,
        ctime: undefined,
        mtime: undefined
      },
      goodsList: [],
      marQueryList: [],
      marFormList: [],
      fileList: [],
      statusTypes: [
        { label: this.$t('common.all'), value: undefined },
        { label: '待审核', value: 1 },
        { label: '审核不通过', value: 2 },
        { label: '审核通过', value: 3 },
        { label: '已禁用', value: 4 },
        { label: '已启用', value: 5 },
        { label: '已作废', value: 6 }
      ],
      multiples: [
        { label: '1X', value: '1' },
        { label: '2X', value: '2' },
        { label: '3X', value: '3' },
        { label: '5X', value: '5' },
        { label: '10X', value: '10' },
        { label: '20X', value: '20' },
        { label: '50X', value: '50' },
        { label: '100X', value: '100' }
      ],
      // 表单参数
      form: {},
      sheetLen: 0,
      formConfirm: {},
      // 表单校验
      rules: {
        marginCoin: [
          { required: true, message: '保证金币种不能为空', trigger: 'blur' }
        ],
        experienceAmount: [
          { required: true, message: '体验金金额不能为空', trigger: 'blur' }
        ],
        formGoodsIds: [
          { required: true, message: '适用币对不能为空', trigger: 'blur' }
        ],
        formMultiples: [
          { required: true, message: '杠杆倍数不能为空', trigger: 'blur' }
        ],
        effectiveDay: [
          { required: true, message: '有效期不能为空', trigger: 'blur' }
        ],
        limitType: [
          { required: true, message: '领取限制不能为空', trigger: 'blur' }
        ],
        marketTimeStart: [
          { required: true, message: '上架时间不能为空', trigger: 'blur' }
        ],
        marketTimeEnd: [
          { required: true, message: '下架时间不能为空', trigger: 'blur' },
          { validator: checkQuota1, trigger: 'blur' }
        ],
        experienceType: [
          { required: true, message: '发放对象不能为空', trigger: 'blur' }
        ]
      },
      rules2: {
        confirmStatus: [
          { required: true, message: '请选择审核操作', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getListCoinGoodsList()
    this.getMarList()
    this.getExpMarList()
  },
  methods: {
    // 体验金币种
    getExpMarList() {
      this.loading = true
      expMarList().then((response) => {
        if (response.code == 200) {
          const list = response.rows
          list.forEach((element) => {
            const data = { label: element.marginCoin, value: element.marginCoin }
            this.marQueryList.push(data)
          })
          this.marQueryList = [
            { label: this.$t('common.all'), value: undefined },
            ...this.marQueryList
          ]
          this.loading = false
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 保证金币种
    getMarList() {
      listCoinMar().then((response) => {
        if (response.code == 200) {
          const list = response.rows
          list.forEach((element) => {
            const data = { label: element.marginCoin, value: element.marginCoin }
            this.marFormList.push(data)
          })
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 商品id列表
    getListCoinGoodsList() {
      listCoinGoods().then((response) => {
        if (response.code == 200) {
          const list = this.unique2(response.rows)
          list.forEach((element) => {
            const data = {
              label: element.goodsId,
              value: element.goodsId,
              disabled: false
            }
            this.goodsList.push(data)
          })
          this.goodsList = [
            { label: '全部币对', value: 1, disabled: false },
            ...this.goodsList
          ]
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
    // 审核dialog
    handleConfirm(row) {
      this.reset()
      this.dialogConfirmVisible = true
      this.form = Object.assign({}, row)
    },
    /** 查询体验金配置列表 */
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
      this.dialogConfirmVisible = false
      this.subDisabled = false
      this.disabledConfirm = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        exchId: undefined,
        marginCoin: undefined,
        goodsIds: undefined,
        experienceAmount: undefined,
        multiples: undefined,
        effectiveDay: undefined,
        id: undefined,
        limitType: undefined,
        marketTimeStart: undefined,
        marketTimeEnd: undefined,
        status: '0',
        remark: undefined,
        cuser: undefined,
        ctime: undefined,
        mtime: undefined,
        experienceType: undefined,
        formGoodsIds: undefined,
        experienceUids: undefined,
        formMultiples: undefined,
        confirmStatus: undefined
      }
      this.resetForm('form')
      this.resetForm('form2')
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
    // 文件选择完
    onUploadChange(file, fileList) {
      this.file2Xce(file).then((tabJson) => {
        let uids = ''
        this.sheetLen = tabJson[0].sheet.length
        tabJson[0].sheet.forEach((e) => {
          uids += e.Uids + ','
        })
        this.$set(
          this.form,
          'experienceUids',
          uids.substring(0, uids.length - 1)
        )
      })
    },
    // xls解析
    file2Xce(file) {
      return new Promise(function(resolve, reject) {
        const reader = new FileReader()
        reader.onload = function(e) {
          const data = e.target.result
          this.wb = XLSX.read(data, {
            type: 'binary'
          })
          const result = []
          this.wb.SheetNames.forEach((sheetName) => {
            result.push({
              sheetName: sheetName,
              sheet: XLSX.utils.sheet_to_json(this.wb.Sheets[sheetName])
            })
          })
          resolve(result)
        }
        reader.readAsBinaryString(file.raw)
      })
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新建体验金批次'
    },
    /** 修改按钮操作 */
    handleUpdate(row, status) {
      this.reset()
      const that = this
      const text =
        status == 5 ? '启用' : status == 4 ? '禁用' : status == 6 ? '废除' : ''
      this.$confirm('是否确认' + text + '该体验金?', this.$t('common.alert'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(function() {
          const form = {
            id: row.id,
            status: status
          }
          updateConfig(form)
            .then((res) => {
              if (res.code === 200) {
                that.msgSuccess(text + '成功')
                that.getList()
              } else {
                that.msgError(res.msg)
              }
            })
            .catch((e) => {
              that.msgError(e)
            })
        })
        .catch((e) => {})
    },
    selectChange() {
      this.$set(this.form, 'experienceUids', undefined)
    },
    changeGoods(val) {
      let flag = false
      this.goodsList.forEach((e) => {
        e.disabled = false
      })
      if (val.length > 0) {
        val.forEach((element) => {
          if (element == 1) {
            flag = true
            this.form.formGoodsIds = [1]
          }
        })
      }
      if (flag) {
        this.goodsList.forEach((e) => {
          if (e.value != 1) {
            e.disabled = true
          }
        })
      }
    },
    // 跳转指定用户列表
    toExpUserList(row) {
      this.$router.push({
        name: 'expUserList',
        query: {
          expId: row.id
        }
      })
    },
    // 模板下载
    downTemplate() {
      importTemplate().then((response) => {
        this.download(response.msg)
      })
    },
    // 审核
    submitConfirm() {
      this.$refs['form2'].validate((valid) => {
        if (valid) {
          this.disabledConfirm = true
          const data = {
            id: this.form.id,
            status: this.form.confirmStatus
          }
          confirmConfig(data)
            .then((response) => {
              if (response.code === 200) {
                this.msgSuccess('审核成功')
                this.cancel()
                this.getList()
              } else {
                this.msgError(response.msg)
                this.disabledConfirm = false
              }
            })
            .catch((e) => {
              this.disabledConfirm = false
            })
        }
      })
    },
    // 文件超出限制钩子
    onExceed(files, fileList) {
      this.$set(fileList[0], 'raw', files[0])
      this.$set(fileList[0], 'name', files[0].name)
      this.$refs.upload.clearFiles() // 清除文件
      this.$refs.upload.handleStart(files[0])
    },
    sortNum(a, b) {
      return a - b
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.subDisabled = true
          this.form.goodsIds =
            this.form.formGoodsIds[0] == 1 ? undefined : this.form.formGoodsIds
          if (this.form.goodsIds) {
            this.form.goodsIds = this.form.formGoodsIds.join(',')
          }
          this.form.multiples = this.form.formMultiples
            .sort(this.sortNum)
            .join(',')
          addConfig(this.form)
            .then((response) => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getList()
                this.subDisabled = false
              } else {
                this.msgError(response.msg)
                this.subDisabled = false
              }
            })
            .catch((e) => {
              this.subDisabled = false
            })
        }
      })
    }
  }
}
</script>
