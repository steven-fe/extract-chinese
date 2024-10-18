<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="100px">
      <el-form-item :label="$t('symbolSort.currencyPairCode')" prop="symbol">
        <el-input v-model="queryParams.symbol" :placeholder="$t('symbolSort.enterCoinPairCode')" clearable />
      </el-form-item>

      <el-form-item :label="$t('symbolSort.currencyPairOnlineState')" prop="state">
        <el-select v-model="queryParams.state" :placeholder="$t('symbolSort.pleaseSelect')" clearable>
          <el-option
            v-for="item in stateOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('symbolSort.transactionStatus')" prop="isTrade">
        <el-select v-model="queryParams.isTrade" :placeholder="$t('symbolSort.pleaseSelect')" clearable>
          <el-option
            v-for="item in isTradeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('symbolSort.partitionType')" prop="region">
        <el-select v-model="queryParams.region" :placeholder="$t('symbolSort.pleaseSelect')" clearable>
          <el-option
            v-for="item in regionOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('symbolSort.showOrNot')" prop="visibleState">
        <el-select v-model="queryParams.visibleState" :placeholder="$t('symbolSort.pleaseSelect')" clearable>
          <el-option
            v-for="item in visibleStateOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleQuery">{{ $t('symbolSort.search') }}</el-button>
        <el-button type="warning" @click="handleExport">{{ $t('symbolSort.export') }}</el-button>
      </el-form-item>
      <el-form-item>
        <el-upload
          ref="upload"
          action="#"
          :on-change="handleChange"
          :show-file-list="false"
          accept=".xls,.xlsx"
          :auto-upload="false"
          class="upload-demo"
        >
          <el-button type="primary">{{ $t('symbolSort.uploadSort') }}</el-button>
        </el-upload>
      </el-form-item>
      <el-tooltip placement="top">
        <div slot="content">{{ $t('symbolSort.exportListData') }}<br/>{{ $t('symbolSort.canOnlyAdjustTheWeight') }}</div>
        <i :class="$style.iconInfo" class="el-icon-info" />
      </el-tooltip>
    </el-form>

    <el-table :data="dataList" border style="margin-bottom: 20px">
      <el-table-column :label="$t('symbolSort.operate')" align="center" width="100">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleEdit(scope.row)">{{ $t('symbolSort.edit') }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="sequencer" :label="$t('symbolSort.sort')" align="center" width="100" />
      <el-table-column prop="symbol" :label="$t('symbolSort.currencyPairCode')" align="center" width="150" />
      <el-table-column prop="state" :label="$t('symbolSort.currencyPairOnlineState')" align="center" width="100">
        <template slot-scope="scope">
          <span v-for="(item, index) in stateOptions" :key="index">
            <span v-if="scope.row.state === item.value">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="isTrade" :label="$t('symbolSort.transactionStatus')" align="center" width="100">
        <template slot-scope="scope">
          <span v-for="(item, index) in isTradeOptions" :key="index">
            <span v-if="scope.row.isTrade === item.value">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="visibleState" :label="$t('symbolSort.showAndhide')" align="center" width="100">
        <template slot-scope="scope">
          <span v-for="(item, index) in visibleStateOptions" :key="index">
            <span v-if="scope.row.visibleState === item.value">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="regions" :label="$t('symbolSort.partitionType')" align="center" width="200">
        <template slot-scope="scope">
          <span v-if="scope.row.regions.length <= 0">{{ $t('symbolSort.unallocatedPartition') }}</span>
          <span v-else>{{ scope.row.regions.join('、') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="weight" :label="$t('symbolSort.weight')" align="center" width="150" />
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <!-- 编辑弹窗 -->
    <el-dialog :title="$t('symbolSort.edit')" :visible.sync="editVisible" :close-on-click-modal="false" width="550px" @closed="closedDialog">
      <el-form ref="dialogForm" :model="dialogForm" label-width="150px" :rules="rules">
        <el-form-item :label="$t('symbolSort.currencyPairCode')" prop="symbol">
          <el-input disabled v-model="dialogForm.symbol" clearable />
        </el-form-item>
        <el-form-item :label="$t('symbolSort.partitionType')" prop="regions">
          <el-select style="display:block;" v-model="dialogForm.regions" multiple clearable>
            <el-option
              v-for="item in regionsList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('symbolSort.weight')" prop="weight">
          <el-input v-model="dialogForm.weight" :placeholder="$t('symbolSort.positiveIntegerWeight')" clearable @input="(value)=>(dialogForm.weight = value.replace(/^(0+)|[^\d]+/g, ''))" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSure">{{ $t('symbolSort.save') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getSymbolSortList, getSortDetail, sortExport, sortEdit, sortImport, getSubregionList } from '@/api/cmsSymbolSort.js'
export default {
  data() {
    return {
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        symbol: '',
        state: '',
        visibleState: '',
        isTrade: '',
        region: ''
      },
      stateOptions: [
        { value: '', label: this.$t('symbolSort.all') },
        { value: 1, label: this.$t('symbolSort.popUpOnline') },
        { value: 2, label: this.$t('symbolSort.offline') }
      ],
      isTradeOptions: [
        { value: '', label: this.$t('symbolSort.all') },
        { value: 1, label: this.$t('symbolSort.tradable') },
        { value: 2, label: this.$t('symbolSort.noTradable') }
      ],
      visibleStateOptions: [
        { value: '', label: this.$t('symbolSort.all') },
        { value: 1, label: this.$t('symbolSort.show') },
        { value: 2, label: this.$t('symbolSort.hide') }
      ],
      regionOptions: [],
      dataList: [],
      editVisible: false,
      dialogForm: {
        symbol: '',
        regions: [],
        weight: ''
      },
      regionsList: [],
      symbolId: '',
      rules: {
        weight: [
          { required: true, message: this.$t('symbolSort.positiveIntegerWeight'), trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getRegionOptions()
    this.getList()
  },
  methods: {
    async getList() {
      const { rows, total } = await getSymbolSortList(this.queryParams)
      this.dataList = rows
      this.total = total
    },
    // 搜索按钮操作
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 搜索筛选分区类型
    async getRegionOptions() {
      const regionArr = [
        { id: '', name: this.$t('symbolSort.all') },
        { id: 0, name: this.$t('symbolSort.unallocatedPartition') }
      ]
      const { data } = await getSubregionList()
      this.regionOptions = regionArr.concat(data)
    },
    // 编辑弹窗分区类型
    async getRegionsList() {
      const { data } = await getSubregionList()
      this.regionsList = data
    },
    /** 导出按钮操作 */
    handleExport() {
      sortExport(this.queryParams).then(res => {
        this.download(res.msg)
        this.$message({
          type: 'success',
          message: this.$t('symbolSort.exportSuccess')
        })
      })
    },
    handleChange(file) {
      sortImport({ file: file.raw }).then(res => {
        if (res.code === 200) {
          this.msgSuccess(this.$t('symbolSort.uploadSortSuccessful'))
          this.getList()
        } else {
          this.msgError(res.msg)
        }
      })
    },
    async handleEdit(row) {
      this.getRegionsList()
      const { data } = await getSortDetail({ id: row.id })
      this.dialogForm = data
      this.symbolId = data.id
      this.editVisible = true
    },
    closedDialog() {
      this.$refs['dialogForm'].resetFields()
    },
    handleSure() {
      this.$refs['dialogForm'].validate(valid => {
        if (valid) {
          const params = {
            id: this.symbolId,
            weight: this.dialogForm.weight,
            regions: this.dialogForm.regions
          }
          sortEdit(params).then(res => {
            this.msgSuccess(this.$t('symbolSort.saveSuccess'))
            this.getList()
            this.editVisible = false
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" module>
.iconInfo {
  font-size: 20px;
  margin-top: 10px;
}
</style>
