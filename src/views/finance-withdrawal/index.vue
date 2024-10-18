<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="UID">
        <el-input v-model="queryParams.uid" size="mini" clearable placeholder="请输入UID" />
      </el-form-item>

      <el-form-item label="做市币对">
        <el-select v-model="queryParams.symbolId" size="mini" filterable clearable>
          <el-option :key="-1" label="全部" value="" />
          <el-option v-for="item in currencyPairList" :key="item.id" :label="item.symbol" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="客户标签">
        <el-input v-model="queryParams.labelName" size="mini" clearable placeholder="请输入客户标签" />
      </el-form-item>

      <el-form-item label="标签分类">
        <el-input v-model="queryParams.parentName" size="mini" clearable placeholder="请输入标签分类" />
      </el-form-item>

      <el-form-item label="白名单币种">
        <el-select v-model="queryParams.currencyId" size="mini" filterable clearable :filter-method="(text) => (formCodeFilterKeyword = text)" @visible-change="visible => (!visible && (formCodeFilterKeyword = ''))">
          <el-option :key="-1" label="全部" value="" />
          <el-option v-for="item in codeOptions" :key="item.id" :label="item.name" :value="item.id">
            <span style="float: left">{{ item.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.id }}</span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="加入白名单时间">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="timestamp"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" size="mini" @click="handleQuery">搜索</el-button>
        <el-button type="warning" size="mini" @click="exportData">导出</el-button>
        <el-button type="primary" size="mini" @click="addWlUser">新增白名单用户</el-button>
        <el-button type="primary" size="mini" @click="batchAddWlUsers">批量新增白名单用户</el-button>
        <el-button type="danger" size="mini" @click="batchDelete">批量删除白名单用户</el-button>
      </el-form-item>
      <el-form-item>
        <el-tooltip placement="top">
          <div slot="content">提币白名单的UID在进行提币时，不再受到以下约束：<br/>1、单次限定提币额度；<br/>2、单日累计提币限额；<br/>3、全币种单日累计限额；</div>
          <i class="el-icon-info" />
        </el-tooltip>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border @selection-change="handleSelectionChange">
      <el-table-column label="操作" width="300" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleEdit(scope.row)">修改</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
      <el-table-column type="selection" width="55" />
      <el-table-column label="UID" prop="uid" align="center" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.uid">
            <el-link type="primary" :underline="false" @click="toUserInfo(scope.row)">{{ scope.row.uid }}</el-link>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="做市币对" prop="symbolNames" align="center" width="180">
        <template slot-scope="scope">
          {{ scope.row.symbolNames ? scope.row.symbolNames.join('、') : '--' }}
        </template>
      </el-table-column>
      <el-table-column label="标签分类" prop="parentNames" align="center" width="180">
        <template slot-scope="scope">
          {{ scope.row.parentNames ? scope.row.parentNames.join('、') : '--' }}
        </template>
      </el-table-column>
      <el-table-column label="客户标签" prop="labelNames" align="center" width="180">
        <template slot-scope="scope">
          {{ scope.row.labelNames ? scope.row.labelNames.join('、') : '--' }}
        </template>
      </el-table-column>
      <el-table-column label="白名单币种" prop="currencyNames" align="center" width="180">
        <template slot-scope="scope">
          <el-tooltip placement="top">
            <div slot="content">
              <span v-for="(item, index) in scope.row.currencyList" :key="index">
                {{item.currencyName}}: <br/>小额免审阈值： {{item.smallLimit}} {{item.currencyName}}<br/>小额免审单日上限： {{item.dayLimit}} {{item.currencyName}}<br/>
              </span>
            </div>
            <span :class="$style.borderBottom">{{scope.row.currencyNames.join('、')}}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="加入白名单时间" prop="createdTime" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后一次操作人" prop="updatedBy" align="center" width="180" />
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <!-- 新增/修改白名单用户 -->
    <el-dialog :title="wlTitle" :visible.sync="wlVisible" :close-on-click-modal="false" width="700px" @closed="wlDialogClosed">
      <el-form ref="wlForm" :model="wlForm" label-width="220px" :rules="rules">
        <el-form-item label="UID" prop="uid">
          <el-input v-model="wlForm.uid" :disabled="submitType === 'edit'" />
        </el-form-item>
        <el-form-item label="白名单币种" required :error="customError">
          <el-select v-model="slectedCurrencyInForm" filterable placeholder="请选择白名单币种" multiple collapse-tags :filter-method="(text) => (formCodeFilterKeyword = text)" @visible-change="visible => (!visible && (formCodeFilterKeyword = ''))" @change="handleSelect">
<!--            <div style="padding: 0 20px;line-height:34px">-->
<!--              <el-checkbox v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>-->
<!--            </div>-->
            <el-checkbox-group v-model="slectedCurrencyInForm">
              <el-option v-for="item in codeOptions" :key="item.id" :label="item.name" :value="item.name" :class="$style.yincang">
                <el-checkbox style="float: left; pointer-events: none" :label="item.name" />
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.id }}</span>
              </el-option>
            </el-checkbox-group>
          </el-select>
        </el-form-item>
        <span v-if="slectedCurrencyInForm.length > 0">
          <template v-for="(item, index) in wlForm.currencyList">
            <el-form-item :label="`${item.currencyName}财务免审阈值`" :key="index" :prop="`currencyList.${index}.smallLimit`" :rules="item.dayLimit ? [{ required: true, message: '请输入财务免审阈值', trigger: 'blur' }] : [{ required: false, message: '', trigger: 'blur' }]">
              <el-input v-model="item.smallLimit" placeholder="财务免审阈值不得超过2000U" @input="(value)=>(item.smallLimit = value.replace(/[^\d.]/g,''))">
                <template slot="append">{{ item.currencyName }}</template>
              </el-input>
            </el-form-item>
            <el-form-item :label="`${item.currencyName}财务免审单日上限`" :key="`${index}-${item}`" :prop="`currencyList.${index}.dayLimit`" :rules="item.smallLimit ? [{ required: true, message: '请输入财务免审单日上限', trigger: 'blur' }] : [{ required: false, message: '', trigger: 'blur' }]">
              <el-input v-model="item.dayLimit" placeholder="财务免审单日上限不得超过10000U" @input="(value)=>(item.dayLimit = value.replace(/[^\d.]/g,''))">
                <template slot="append">{{ item.currencyName }}</template>
              </el-input>
            </el-form-item>
          </template>
        </span>
      </el-form>
      <div :class="$style.tips">
        <div :class="$style.tip">小额免审阈值和小额免审单日上限均是币本位,</div>
        <div :class="$style.tip">若不填写,则默认应用为0</div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="wlVisible = false">取 消</el-button>
        <el-button type="primary" size="mini" @click="handleWlSure">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 批量新增白名单用户 -->
    <el-dialog title="批量新增白名单用户" :visible.sync="batchAddWlVisible" :close-on-click-modal="false" width="600px" @closed="batchAddWlDialogClosed">
      <div :class="$style.mb"><el-button type="primary" size="mini" icon="el-icon-download" @click="downTemplate">下载Excel模板</el-button></div>
      <div :class="$style.mb">
        <el-upload
          ref="upload"
          action="#"
          :on-change="handleChange"
          :show-file-list="false"
          accept=".xls,.xlsx"
          :auto-upload="false"
          class="upload-demo"
        >
          <el-button type="primary" size="mini" icon="el-icon-upload2">上传Excel文件</el-button>
          <span v-if="fileName !== ''">文件 {{ fileName }} 已上传</span>
        </el-upload>
      </div>
      <div v-if="fileName !== ''" :class="$style.mb">
        <el-button type="primary" size="mini" @click="batchAdd">确认导入</el-button>
        <el-tooltip placement="top-start">
          <div slot="content">文件确认导入后，程序将会根据上传的文档进行批量新增白名单用户的操作，<br/>并且在操作完成后，返回导入结果，可以通过点击“下载”按钮，下载导入失败的结果</div>
          <i class="el-icon-info" />
        </el-tooltip>
      </div>
      <div v-if="uploadResultVisible">
        <div :class="$style.line1">
          <div :class="$style.item">导入用户总数</div>
          <div :class="$style.item">已完成导入的用户数</div>
          <div :class="$style.item">导入失败的用户数</div>
          <div :class="$style.item">下载导入失败文件</div>
        </div>
        <div :class="$style.line2">
          <div :class="$style.item">{{ userAmount }}</div>
          <div :class="$style.item">{{ successNum }}</div>
          <div :class="$style.item" style="color: red;">{{ failNum }}</div>
          <div :class="$style.item"><el-button v-if="failNum > 0" type="primary" size="mini" @click="downloadFail">下载</el-button></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { getList } from '@/api/systemsetting/currencypairmanage'
import { getWhiteList, addAssetsWhite, editAssetsWhite, getwhiteDetail, deleteWhite, batchDeleteWhite, importUid, exportWhiteList } from '@/api/finance-withdrawal'
export default {
  data() {
    return {
      time: '',
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 50,
        uid: '',
        symbolId: '',
        labelName: '',
        parentName: '',
        currencyId: '',
        beginTime: '',
        endTime: ''
      },
      currencyPairList: [],
      dataList: [],
      wlTitle: '',
      wlVisible: false,
      // 选择数据
      selectList: [],
      wlForm: {
        uid: '',
        currencyList: [{ currencyId: '', currencyName: '', smallLimit: '', dayLimit: '' }]
      },
      batchAddWlVisible: false,
      uploadResultVisible: false,
      // 白名单币种是否全选
      checkAll: false,
      file: null,
      fileName: '',
      userAmount: undefined,
      successNum: undefined,
      failNum: undefined,
      filePath: '',
      formCodeFilterKeyword: '',
      customError: '',
      wlCurrencyId: '',
      currencyName: '',
      isReturn: false,
      submitType: '', // add 新增， edit 修改
      rules: {
        uid: [{ required: true, message: '请输入UID', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    codeOptions() {
      if (!this.formCodeFilterKeyword) return this.currencyList
      return this.currencyList.filter(({ id, name }) => (
        name.toLowerCase().includes(this.formCodeFilterKeyword.toLowerCase()) || String(id).toLowerCase().includes(this.formCodeFilterKeyword.toLowerCase())
      ))
    },
    slectedCurrencyInForm: {
      get() {
        return this.wlForm.currencyList.map(({currencyName}) => currencyName).filter(currencyName => !!currencyName)
      },
      set(value) {
        const currencyArr = []
        const currencyNameList = []
        this.currencyList.map(item => {
          currencyNameList.push(item.name)
        })
        const staticOrderList = currencyNameList
        const sortedcurrencyList = value.sort((currency1, currency2) => staticOrderList.indexOf(currency1) - staticOrderList.indexOf(currency2))
        sortedcurrencyList.forEach(currencyitem => {
          if (this.slectedCurrencyInForm.includes(currencyitem)) {
            const currencyContent = this.wlForm.currencyList.find(item => item.currencyName === currencyitem)
            if (currencyContent) currencyArr.push(currencyContent)
          } else {
            this.currencyList.map(item => {
              if(item.name === currencyitem) this.wlCurrencyId = item.id
            })
            currencyArr.push({ currencyId: this.wlCurrencyId, currencyName: currencyitem, smallLimit: '', dayLimit: ''})
          }
        })
        this.wlForm.currencyList = currencyArr
      }
    }
  },
  created() {
    this.getList()
    this.getCurrencyPairList()
    this.getCurrency(1)
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    async getList() {
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      const { rows, total } = await getWhiteList(this.queryParams)
      this.dataList = rows
      this.total = total
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 做市币对
    async getCurrencyPairList() {
      const {rows} = await getList({ pageSize: 9999 })
      this.currencyPairList = rows
    },
    // 点击uid跳转到用户详情
    toUserInfo(row) {
      sessionStorage.setItem('uid', row.uid)
      sessionStorage.setItem('userId', row.userId)
      this.$router.push({ name: 'lookInfo2' })
    },
    // 列表导出
    async exportData() {
      const { msg } = await exportWhiteList(this.queryParams)
      this.download(msg)
      this.msgSuccess('导出成功')
    },
    addWlUser() {
      this.wlVisible = true
      this.submitType = 'add'
      this.wlTitle = '新增白名单用户'
    },
    handleDelete(row) {
      this.$confirm('确认要删除这名用户的白名单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        deleteWhite({ uid: row.uid }).then(res => {
          if (res.code === 200) {
            this.$message({
              type: 'success',
              message: '已完成白名单删除'
            })
            this.getList()
          } else {
            this.msgError(res.msg)
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 选择需要批量删除的数据
    handleSelectionChange(val) {
      this.selectList = val
    },
    batchDelete() {
      if (this.selectList.length <= 0) {
        return this.msgError('请选择至少一条数据')
      }
      const uids = []
      this.selectList.map(item => {
        uids.push(item.uid)
      })
      this.$confirm(`确认要删除已选中 ${this.selectList.length} 名用户的白名单？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        batchDeleteWhite({ uids: uids }).then(res => {
          if (res.code === 200) {
            this.$message({
              type: 'success',
              message: '已完成白名单删除'
            })
            this.getList()
          } else {
            this.msgError(res.msg)
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    async handleEdit(row) {
      this.wlTitle = '修改白名单用户'
      const { data } = await getwhiteDetail({ uid: row.uid })
      data.currencyList.map(item => {
        this.currencyList.map(infoItem => {
          if (infoItem.id === item.currencyId) {
            item.currencyName = infoItem.name
          }
        })
      })
      this.wlForm = data
      this.submitType = 'edit'
      this.wlVisible = true
    },
    // 关闭白名单用户弹窗
    wlDialogClosed() {
      this.$refs['wlForm'].resetFields()
      this.wlForm.uid = ''
      this.customError = ''
      this.slectedCurrencyInForm = []
    },
    // 白名单币种选择事件
    handleSelect(value) {
      if (value) {
        const checkedCount = value.length
        this.checkAll = checkedCount === this.currencyList.length
      }

      if (this.slectedCurrencyInForm.length <= 0) {
        this.customError = '请选择白名单币种'
        return false
      } else {
        this.customError = ''
        return true
      }
    },
    // 白名单币种全选
    // handleCheckAllChange(val) {
    //   const data = this.codeOptions.map(item => {
    //     return item.name
    //   })
    //   this.slectedCurrencyInForm = val ? data : []
    // },
    batchAddWlUsers() {
      this.batchAddWlVisible = true
    },
    // 下载模版
    downTemplate() {
      window.open('https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/financeWithdrawWhiteTemplate.xls')
    },
    // 文件上传
    handleChange(file) {
      this.file = file.raw
      this.fileName = file.name
    },
    // 批量导入导名单用户
    batchAdd() {
      if (!this.file) {
        this.$message({
          type: 'error',
          message: '未上传文件'
        })
        return
      }
      importUid({ file: this.file }).then(res => {
        if (res.code === 200) {
          this.userAmount = res.data.totalCount
          this.successNum = res.data.successCount
          this.failNum = res.data.failCount
          this.filePath = res.data.filePath
          this.uploadResultVisible = true
          this.getList()
        }
      })
    },
    // 下载导入失败的记录
    downloadFail() {
      this.download(this.filePath)
    },
    batchAddWlDialogClosed() {
      this.file = null
      this.fileName = ''
      this.uploadResultVisible = false
    },
    // 提交按钮
    handleWlSure() {
      this.$refs['wlForm'].validate((valid) => {
        if (this.handleSelect() && valid) {
          this.isReturn = false
          const currencyList = []
          this.wlForm.currencyList.map(item => {
            currencyList.push({ currencyId: item.currencyId, smallLimit: item.smallLimit, dayLimit: item.dayLimit })
            if (Number(item.dayLimit) < Number(item.smallLimit)) {
              this.currencyName = item.currencyName
              this.isReturn = true
            }
          })
          if (this.isReturn) {
            return this.msgError(`${this.currencyName}财务免审单日上限需要大于等于${this.currencyName}财务免审阈值`)
          }
          const params = {
            uid: this.wlForm.uid,
            currencyList: currencyList
          }
          if (this.submitType === 'add') {
            addAssetsWhite(params).then(res => {
              this.getList()
              this.wlVisible = false
              this.msgSuccess('新增白名单完成')
            })
          } else {
            editAssetsWhite(params).then(res => {
              this.getList()
              this.wlVisible = false
              this.msgSuccess('修改白名单完成')
            })
          }
        }
      })
    }
  }
}
</script>
<style lang="scss" module>
.tips {
  position: absolute;
  bottom: 15px;
  .tip {
    color: red;
  }
}
.mb {
  margin-bottom: 20px;
}
.line1 {
  display: flex;
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
}
.line2 {
  display: flex;
  border-bottom: 1px solid #000;
}
.item {
  width: 140px;
  height: 40px;
  text-align: center;
  line-height: 40px;
  border-left: 1px solid #000;
  &:last-child {
    border-right: 1px solid #000;
  }
}
.borderBottom {
  border-bottom: 1px solid #000;
}
.yincang {
  &:after{
    display: none;
  }
}
</style>
