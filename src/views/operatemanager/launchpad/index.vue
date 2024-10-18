<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="活动id:" prop="userId">
        <el-input v-model="queryParams.id" placeholder="活动id" clearable size="mini" />
      </el-form-item>
      <el-form-item label="活动开启时间:">
        <el-date-picker v-model="time" clearable size="mini" type="datetimerange" :start-placeholder="$t('common.startDate')" :range-separator="$t('common.toTime')" :end-placeholder="$t('common.endTime')" value-format="yyyy-MM-dd HH:mm:ss" :default-time="['00:00:00', '23:59:59']" />
      </el-form-item>
      <el-form-item :label="$t('common.coin')" prop="authStatus">
        <el-select v-model="queryParams.currencyId" size="mini" filterable clearable :placeholder="$t('common.all')">
          <el-option v-for="item in currencyOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="活动标签:" prop="authStatus">
        <el-select v-model="queryParams.tags" size="mini" filterable clearable :placeholder="$t('common.all')">
          <el-option v-for="item in tagsOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="是否开启白名单认购:">
        <el-select v-model="queryParams.openState" size="mini" clearable placeholder="全部">
          <el-option v-for="item in modeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="authStatus">
        <el-select v-model="queryParams.status" size="mini" clearable :placeholder="$t('common.all')">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增活动</el-button>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">查找</el-button>
        <el-button type="primary" size="mini" @click="handleActice">往期活动管理</el-button>
        <el-button type="primary" size="mini" @click="addSpecialActiveId">添加特殊活动ID</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="table" v-loading="loading" :data="dataList" border :class="$style.hide">
      <el-table-column label="操作" align="center" min-width="600" class-name>
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.row)">修改</el-button>
          <el-button size="mini" :type="scope.row.lookStatus ? 'danger' : 'success'" @click="updateLookStatus(scope.row)">{{ scope.row.lookStatus ? '下线' : '上线' }}</el-button>
          <el-button size="mini" type="warning" :disabled="scope.row.activityStatus === 3" @click="handleMock(scope.row)">虚增认购数据</el-button>
          <el-button size="mini" type="primary" @click="showMock(scope.row)">查看虚增数据</el-button>
          <el-button size="mini" type="primary" :disabled="scope.row.openState !== 1" @click="addWhiteList(scope.row)">添加白名单</el-button>
        </template>
      </el-table-column>
      <el-table-column label="活动id" align="center" prop="id" />
      <el-table-column label="活动开启时间" align="center" prop="ctime" min-width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="币种" align="center" prop="currencyCode" />
      <el-table-column label="活动标签" align="center" prop="tags" min-width="100" />
      <el-table-column label="是否开启白名单认购" align="center" prop="openState">
        <template slot-scope="scope">
          <div v-for="(item, index) in modeOptions" :key="index">
            <span v-if="scope.row.openState === item.value">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="活动状态" align="center" prop="volumeState">
        <template slot-scope="scope">
          <div v-for="(item, index, key) in statusOptions" :key="key">
            <span v-if="item.value && scope.row.activityStatus === +item.value">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="上线状态" align="center" prop="volumeState">
        <template slot-scope="scope">
          <div v-for="(item, index, key) in onlineOptions" :key="key">
            <span v-if="item.value && scope.row.lookStatus === +item.value">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column type="expand" label="认购数据">
        <template slot-scope="scope">
          <el-form label-position="top" inline class="demo-table-expand">
            <el-row :class="$style.expand">
              <el-form-item label="公开认购人数">
                <span>{{ scope.row.realSubNumber }}</span>
              </el-form-item>
              <el-form-item label="公开投入金额">
                <span>{{ scope.row.realSubAmount }} USDT</span>
              </el-form-item>
              <el-form-item label="公开认购虚增人数">
                <span>{{ scope.row.detailSubNumber }}</span>
              </el-form-item>
              <el-form-item label="公开认购虚增金额">
                <span>{{ scope.row.detailSubAmount }} USDT</span>
              </el-form-item>
            </el-row>
            <el-row v-if="scope.row.openState === 1" :class="$style.expand">
              <el-form-item label="白名单认购人数">
                <span>{{ scope.row.wlSubNum }}</span>
              </el-form-item>
              <el-form-item label="白名单投入金额">
                <span>{{ scope.row.wlSubAmount }} USDT</span>
              </el-form-item>
            </el-row>
          </el-form>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 往期活动管理弹窗 -->
    <el-dialog title="往期活动配置" :visible.sync="open1" :close-on-click-modal="false" width="600px">
      <div>该功能用于配置客户端要展示的往期活动</div>
      <el-table :data="manageList" border class="mt">
        <el-table-column :label="$t('common.coin')" align="center" prop="currencyCode" />
        <el-table-column label="排序权重" align="center" prop="sort" />
        <el-table-column :label="$t('common.operation')" align="center">
          <template slot-scope="scope">
            <el-button type="success" size="mini" @click="handleEditDetail(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleted(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddActive">添加</el-button>
      <span slot="footer" class="dialog-footer">
        <el-button @click="open1 = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="handleSure">保 存</el-button>
      </span>
    </el-dialog>

    <!-- 添加往期活动币种弹窗 -->
    <el-dialog title="添加往期活动币种" :visible.sync="open2" :close-on-click-modal="false" width="300px">
      <el-form ref="dialogForm1" :model="dialogForm1">
        <el-form-item :label="$t('common.coin')" align="left" label-width="80px">
          <el-select v-model="currency" value-key="currencyId" filterable placeholder="请选择币种" clearable>
            <el-option v-for="item in currencyOption" :key="item.currencyId" :label="item.currencyName" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序权重" label-width="80px" prop="sort">
          <el-input v-model="dialogForm1.sort" clearable :min="0" oninput="value = value.replace(/[^\d]/g, '')" type="number" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleAddPastActive">添 加</el-button>
      </span>
    </el-dialog>

    <!-- 编辑往期活动币种弹窗 -->
    <el-dialog title="编辑往期活动币种" :visible.sync="open3" :close-on-click-modal="false" width="300px">
      <el-form ref="dialogForm2" :model="dialogForm2">
        <el-form-item :label="$t('common.coin')" label-width="80px" prop="currencyCode">
          <el-input v-model="dialogForm2.currencyCode" clearable :disabled="true" />
        </el-form-item>
        <el-form-item label="排序权重" label-width="80px" prop="sort">
          <el-input v-model="dialogForm2.sort" clearable :min="0" oninput="value = value.replace(/[^\d]/g, '')" type="number" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmit">{{$t('common.sure')}}</el-button>
      </span>
    </el-dialog>

    <!-- 虚增对话框 -->
    <el-dialog title="虚增认购数据" :class="$style.mockDialog" :close-on-click-modal="false" :visible.sync="mockDialogVisible" width="35%" @closed="mockClosed">
      <div class="dialog-content">
        <el-form ref="mockForm" :model="mockForm" :rules="mockRules">
          <el-form-item label="公开认购人数" :label-width="formLabelWidth" prop="detailSubNumber">
            <el-input v-model="mockForm.detailSubNumber" type="number" clearable :disabled="mockFormDisabled" oninput="value=value.replace(/[^0-9]/g,'')" />
          </el-form-item>
          <el-form-item label="公开认购金额" :label-width="formLabelWidth" prop="detailSubAmount">
            <el-input v-model="mockForm.detailSubAmount" type="number" clearable :disabled="mockFormDisabled" />
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="mockDialogVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="mockFormDisabled" @click="handleSave">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 白名单 -->
    <el-dialog title="上传白名单" :visible.sync="whiteListVisible" :close-on-click-modal="false" width="600px" @closed="addWhiteListClosed">
      <div :class="$style.mb">
        当前已上传：{{ importUidNum ? importUidNum : 0 }} UID， {{ importTickets  ? importTickets : 0 }} 签
      </div>
      <div><el-button type="primary" :disabled="importUidNum <= 0" @click="downloadWhiteList">下载白名单</el-button></div>
      <div :class="$style.white">上传白名单</div>
      <div :class="$style.df">
        <el-button type="primary" @click="downLoadWhite">下载模版</el-button>
        <el-upload
          ref="upload"
          action="#"
          :on-change="handleChange"
          :show-file-list="false"
          accept=".xls,.xlsx"
          :auto-upload="false"
          class="upload-demo"
        >
          <el-button type="primary" :class="$style.ml">选择文件</el-button>
        </el-upload>
        <el-button type="primary" @click="batchUploadWhiteList">确认上传</el-button>
      </div>
      <div :class="$style.fileName">{{ fileName }}</div>
    </el-dialog>

    <!-- 上传成功 -->
    <el-dialog title="上传完成" :visible.sync="resultSuccessVisible" :close-on-click-modal="false" width="400px">
      <div>上传成功： {{ num }} UID， {{ ticketNum }} 签</div>
    </el-dialog>

    <!-- 上传失败 -->
    <el-dialog title="上传失败" :visible.sync="resultFailVisible" :close-on-click-modal="false" width="400px" @closed="closeFailDialog">
      <div :class="$style.mb">UID有误，请下载错误信息并重新上传</div>
      <el-button type="primary" @click="handleDownloadFailMsg">下载错误信息</el-button>
    </el-dialog>

    <!-- 特殊活动ID列表弹窗 -->
    <el-dialog title="特殊活动ID" :visible.sync="specialActiveIdVisible" :close-on-click-modal="false" width="600px">
      <el-table :data="specialActiveIdList" border>
        <el-table-column label="活动ID" align="center" prop="id" />
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" @click="delectSpecialActiveId(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="specialActiveIdTotal>0" :total="specialActiveIdTotal" :page.sync="dialogQueryParams.pageNum" :limit.sync="dialogQueryParams.pageSize" @pagination="getSpecialActiveIdList" />
      <el-button type="primary" icon="el-icon-plus" @click="addActiveId">添加</el-button>
    </el-dialog>
    <!-- 删除特殊活动ID提示弹窗 -->
    <el-dialog title="提示" :visible.sync="delectSpecialActiveIdVisible" :close-on-click-modal="false" width="30%">
      <span>确定要删除吗？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delectSpecialActiveIdVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleDelectSpecialActiveId">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加特殊活动ID -->
    <el-dialog title="添加特殊活动ID" :visible.sync="addspecialActiveIdVisible" :close-on-click-modal="false" width="500px" @closed="closedDialog">
      <el-form ref="addActiveIdDialogForm" :model="addActiveIdDialogForm" :rules="idRules">
        <el-form-item label="特殊活动ID" label-width="100px" prop="id">
          <el-input v-model="addActiveIdDialogForm.id" clearable />
        </el-form-item>
        <span style="color: red;">一次只能添加一个活动ID</span>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addspecialActiveIdVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSureActiceId">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { showPrivateData, activityList, addBasicData, updateLookStatus, getCurrencyList, getPastList, addPastActivity, editPastActive, getDetail, deletePastActive, getImportNum, exportUid, getPoolSubNum, exportPoolSubUid, importUid, importWinUid, getSpecialActiveIdList, addSpecialActiveId, delectSpecialActiveId } from '@/api/launchpad'

export default {
  name: 'Launchpad',
  data() {
    return {
      languageOptions: [],
      activeId: undefined,
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 商户列表
      dataList: [],
      time: '',
      // 查询参数
      queryParams: {
        id: '',
        pageNum: 1,
        pageSize: 10,
        startTime: '',
        endTime: '',
        currencyId: '',
        tags: '',
        openState: '',
        status: ''
      },
      num: '',
      ticketNum: '',
      openState: '',
      specialActiveIdVisible: false,
      specialActiveIdTotal: 0,
      delectSpecialActiveIdVisible: false,
      addspecialActiveIdVisible: false,
      specialActiveIdList: [],
      specialActiveId: '',
      dialogQueryParams: {
        pageNum: 1,
        pageSize: 10
      },
      addActiveIdDialogForm: {
        id: ''
      },
      mockFormDisabled: false,
      dialogForm1: {
        sort: ''
      },
      currency: {
        currencyName: '',
        currencyId: ''
      },
      dialogForm2: {
        currencyCode: '',
        sort: ''
      },
      fixInfo: {
        id: ''
      },
      open1: false,
      open2: false,
      open3: false,
      manageList: [],
      // 添加往期活动币种弹窗，币种选择项
      currencyOption: [],
      formLabelWidth: '150px',
      statusOptions: [
        { value: '', label: this.$t('common.all') },
        { value: '2', label: '预热中' },
        { value: '1', label: '进行中' },
        { value: '3', label: '已结束' }
      ],
      modeOptions: [
        { value: '', label: '全部' },
        { value: 1, label: '是' },
        { value: 0, label: '否' }
      ],
      onlineOptions: [
        { value: '', label: this.$t('common.all') },
        { value: '0', label: '下线' },
        { value: '1', label: '上线' }
      ],
      tagsOptions: [
        { id: 'Prime', name: 'Prime' },
        { id: 'Startup', name: 'Startup' },
        { id: 'Token-sale', name: 'Token-sale' }
      ],
      activeTab: '1',
      uploadType: 1,
      mockDialogVisible: false,
      // 虚增弹窗参数
      mockForm: {
        id: '',
        detailSubNumber: '',
        detailSubAmount: ''
      },
      radio: '1',
      mockRules: {
        detailSubNumber: [{ required: true, message: '公开认购人数不能为空', trigger: 'blur' }],
        detailSubAmount: [{ required: true, message: '公开认购金额不能为空', trigger: 'blur' }]
      },
      whiteListVisible: false,
      resultSuccessVisible: false,
      resultFailVisible: false,
      successNum: '',
      failFilePath: '',
      importUidNum: 0,
      importTickets: 0,
      file: null,
      fileName: '未上传文件',
      idRules: {
        id: [
          { required: true, message: '请输入特殊活动ID', trigger: 'blur' }
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
  created() {
    this.getList()
    this.getCurrency(1)
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    async showMock(row) {
      if (row.isWhite === 0 && row.specialActive === 1) {
        this.msgError('该活动已添加特殊活动标签，需要白名单才能查看')
        return
      }
      const { data } = await showPrivateData(row.id)
      Object.keys(data).forEach(item => {
        if (data[item] === 0) {
          data[item] = String(data[item])
        }
        if (data[item]) {
          Object.assign(row, { [item]: data[item] })
        }
      })
      const $table = this.$refs.table
      $table.toggleRowExpansion(row)
    },
    /** 活动列表 */
    getList() {
      activityList(this.queryParams).then(response => {
        this.dataList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      if (this.time && this.time[0]) {
        // this.queryParams.startTime = this.time[0]
        this.queryParams.startTime = new Date(this.time && this.time[0]).getTime()
      } else {
        this.queryParams.startTime = ''
      }
      if (this.time && this.time[1]) {
        // this.queryParams.endTime = this.time[1]
        this.queryParams.endTime = new Date(this.time && this.time[1]).getTime()
      } else {
        this.queryParams.endTime = ''
      }
      this.getList()
    },
    async getSpecialActiveIdList() {
      const { total, rows } = await getSpecialActiveIdList(this.dialogQueryParams)
      this.specialActiveIdList = rows
      this.specialActiveIdTotal = total
    },
    addSpecialActiveId() {
      this.getSpecialActiveIdList()
      this.specialActiveIdVisible = true
    },
    delectSpecialActiveId(row) {
      this.delectSpecialActiveIdVisible = true
      this.specialActiveId = row.id
    },
    handleDelectSpecialActiveId() {
      this.delectSpecialActiveIdVisible = false
      this.$confirm('请再次确认是否删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        delectSpecialActiveId({ id: this.specialActiveId })
          .then(response => {
            this.$message({
              type: 'success',
              message: '删除成功'
            })
            this.getSpecialActiveIdList()
            this.getList()
          })
          .catch(error => {
            console.log(error)
          })
      })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
    },
    addActiveId() {
      this.addspecialActiveIdVisible = true
    },
    handleSureActiceId() {
      this.$refs['addActiveIdDialogForm'].validate(valid => {
        if (valid) {
          addSpecialActiveId(this.addActiveIdDialogForm).then(res => {
            this.msgSuccess('添加成功')
            this.getSpecialActiveIdList()
            this.getList()
            this.addspecialActiveIdVisible = false
          })
        }
      })
    },
    closedDialog() {
      this.$refs['addActiveIdDialogForm'].resetFields()
    },
    mockClosed() {
      this.$refs['mockForm'].resetFields()
    },
    handleDelectFileName() {
      this.file = null
      this.fileName = '未上传文件'
    },
    // 得到白名单已上传人数
    getWhiteListImportNum() {
      const params = {
        id: this.activeId,
        type: 1
      }
      getImportNum(params).then(res => {
        this.importUidNum = res.data.importNum
        this.importTickets = res.data.importTickets
      })
    },
    // 添加白名单
    addWhiteList(row) {
      this.activeId = row.id
      this.getWhiteListImportNum()
      this.whiteListVisible = true
    },
    // 下载模版
    downLoadWhite() {
      window.open('https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/launchpadWhiteTicketsTemplate.xls')
    },
    // 文件上传
    handleChange(file) {
      this.file = file.raw
      this.fileName = file.name
    },
    addWhiteListClosed() {
      this.file = null
      this.fileName = '未上传文件'
    },
    // 下载白名单
    downloadWhiteList() {
      const params = {
        id: this.activeId,
        type: 1
      }
      exportUid(params).then(res => {
        this.download(res.msg)
        this.msgSuccess('下载成功')
      })
    },
    // 下载错误数据
    handleDownloadFailMsg() {
      this.download(this.failFilePath)
      this.msgSuccess('下载成功')
    },
    // 批量上传白名单
    batchUploadWhiteList() {
      if (!this.file) {
        this.$message({
          type: 'error',
          message: '未上传文件'
        })
        return
      }
      this.$confirm('确定要执行该操作吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        const params = {
          id: this.activeId,
          type: 1,
          file: this.file
        }
        importUid(params).then(res => {
          if (res.data.failNum <= 0) {
            this.num = res.data.num
            this.ticketNum = res.data.ticketNum
            this.resultSuccessVisible = true
            this.whiteListVisible = false
          } else {
            this.failFilePath = res.data.filePath
            this.resultFailVisible = true
            this.whiteListVisible = false
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消成功'
        })
      })
    },
    closeFailDialog() {
      this.failFilePath = ''
    },
    // 往期活动配置列表
    getManageList() {
      const params = {
        'pageNum': 1,
        'pageSize': 10
      }
      getPastList(params).then(res => {
        if (res.code === 200) {
          this.manageList = res.rows
        } else {
          this.msgError(res.msg)
        }
      })
    },
    // 往期活动配置
    handleActice() {
      this.open1 = true
      this.getManageList()
    },
    getCurrencyList() {
      const params = {
        'pageNum': 1,
        'pageSize': 10
      }
      getCurrencyList(params).then(res => {
        if (res.code === 200) {
          this.currencyOption = res.rows
        }
      })
    },
    handleAddActive() {
      this.dialogForm1 = {}
      this.currency = {}
      this.open1 = false
      this.open2 = true
      this.getCurrencyList()
    },
    handleAddPastActive() {
      const params = {
        currencyName: this.currency.currencyName,
        currencyId: this.currency.currencyId,
        sort: Number(this.dialogForm1.sort)
      }
      addPastActivity(params).then(res => {
        if (res.code === 200) {
          this.msgSuccess('添加成功')
          this.open2 = false
        } else {
          this.msgError(res.msg)
        }
      })
    },
    handleEditDetail(row) {
      this.open3 = true
      this.open1 = false
      this.fixInfo.id = row.id
      getDetail({ id: row.id }).then(res => {
        if (res.code === 200) {
          this.dialogForm2 = res.data
        } else {
          this.msgError(res.msg)
        }
      })
    },
    deleted(row) {
      deletePastActive({ id: row.id }).then(res => {
        if (res.code === 200) {
          this.msgSuccess('删除成功')
          this.getManageList()
          this.open1 = false
        } else {
          this.msgError(res.msg)
        }
      })
    },
    handleSubmit() {
      const params = {
        id: this.fixInfo.id,
        currencyCode: this.dialogForm2.currencyCode,
        sort: Number(this.dialogForm2.sort)
      }
      editPastActive(params).then(res => {
        if (res.code === 200) {
          this.msgSuccess(this.$t('common.operationSucceed'))
          this.open3 = false
        } else {
          this.msgError(res.msg)
        }
      })
    },
    handleSure() {
      this.msgSuccess(this.$t('common.operationSucceed'))
      this.open1 = false
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.$router.push({ name: 'addLaunchpadActive', query: { operation: 'create' }})
    },
    handleEdit({ id }) {
      this.$router.push({ name: 'modifyLaunchpadActive', query: { id, operation: 'edit' }})
    },
    handleMock(data) {
      this.openState = data.openState
      this.mockForm.id = data.id
      if (data.isWhite === 0 && data.specialActive === 1) {
        this.mockForm = {
          id: data.id,
          detailSubNumber: '',
          detailSubAmount: ''
        }
        this.mockFormDisabled = true
        this.msgError('该活动已添加特殊活动标签，需要白名单才能查看')
      } else {
        this.mockForm = {
          id: data.id,
          detailSubNumber: data.detailSubNumber,
          detailSubAmount: data.detailSubAmount
        }
        this.mockFormDisabled = false
      }
      this.mockDialogVisible = true
    },
    handleSave() {
      this.$refs['mockForm'].validate(valid => {
        if (valid) {
          const params = {
            id: this.mockForm.id,
            detailSubNumber: this.mockForm.detailSubNumber,
            detailSubAmount: this.mockForm.detailSubAmount
          }
          addBasicData(params).then(response => {
            if (response.code === 200) {
              this.msgSuccess('修改成功')
              this.mockDialogVisible = false
              this.getList()
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    },
    async updateLookStatus({ id, lookStatus }) {
      await updateLookStatus({ id, status: +!lookStatus })
      await this.getList()
    }
  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" scoped>
::v-deep {
  .el-button + .el-button {
    margin-left: 10px;
  }
  .el-dialog {
    .title {
      width: 100%;
      font-size: 20px;
      color: #000;
      margin: 0 0 30px;
      overflow: hidden;
    }
    .title-task {
      padding: 50px 0 0;
    }
    .el-col {
      margin-right: 10px;
    }
    .el-form-item {
      margin: 0 0 20px;
    }
    .el-form-item--medium .el-form-item__label {
      padding: 0;
      text-align: left;
    }
    .task-box {
      .el-form-item--medium .el-form-item__label {
        padding: 0;
        text-align: center;
      }
    }
    .form-grid {
      display: grid;
      grid-template-columns: 50% 50%;
      margin-left: 5%;
      .grid-item {
        width: 90%;
      }
    }
    .divide {
      width: 100%;
      overflow: hidden;
      border-top: 1px solid #ccc;
    }
    .el-dialog__footer {
      clear: both;
    }
    .tip {
      width: 100%;
      padding: 0 0 0 120px;
      margin-bottom: 20px;
      overflow: hidden;
    }
  }
  .el-form-item {
    margin: 0 0 15px;
  }
  .el-form-item__content {
    line-height: 30px;
  }
}

.form-title {
  display: flex;
  justify-content: space-between;
  margin-top: 7px;
  align-items: center;

  .add-btn {
    color: green;
    font-weight: bold;
    font-size: 24px;
    cursor: pointer;
  }
}

.hold-coin-section {
  overflow: hidden;

  /* chrome */
  ::v-deep input::-webkit-outer-spin-button,
  ::v-deep input::-webkit-inner-spin-button {
      -webkit-appearance: none;
  }
  /* firefox */
  ::v-deep input[type="number"]{
      -moz-appearance: textfield;
  }

  .remove-btn {
    margin: 6px 0 0 28px;
    font-size: 24px;
    color: red;
    font-weight: bold;
    cursor: pointer;
  }
}
.el-icon-question {
  font-size: 20px;
  margin-top: 9px;
  margin-right: 30px;
}
.mt {
  margin-top: 20px;
  margin-bottom: 20px;
}

</style>
<style lang="scss" module>
.white {
  margin: 20px 0;
}
.df {
  display: flex;
  .ml {
    margin: 0 20px;
  }
}
.fileName {
  font-size: 14px;
  color: #999;
  margin-top: 20px;
}
.expand {
  :global(.el-form-item) {
    width: 24%;
    text-align: center;
  }
}
.mb {
  margin-bottom: 20px;
}
.delect {
  font-weight: bold;
  color: #000;
}
.hide {
  :global(.el-table__expand-icon) {
    display: none;
  }
}
.mockDialog {
  :global(.el-dialog) {
    margin-top: 90px !important;
  }
}
</style>
