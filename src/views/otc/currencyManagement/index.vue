<template>
  <div class="app-container">
    <!--    <el-form :inline="true" ref="form" :model="form" label-width="90px">-->
    <!--      <el-form-item label="">-->
    <!--        <el-input v-model="form.channelId" placeholder="请输入渠道ID/渠道名称" clearable></el-input>-->
    <!--      </el-form-item>-->
    <!--      <el-form-item label="创建时间：">-->
    <!--        <el-date-picker-->
    <!--            v-model="date"-->
    <!--            type="datetimerange"-->
    <!--            value-format="timestamp"-->
    <!--            @change="timeChange"-->
    <!--            :range-separator="$t('common.toTime')"-->
    <!--            :start-placeholder="$t('common.startTime')"-->
    <!--            :end-placeholder="$t('common.endTime')">-->
    <!--        </el-date-picker>-->
    <!--      </el-form-item>-->
    <!--      <el-form-item>-->
    <!--        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList(true)">{{$t('common.search')}}</el-button>-->
    <!--      </el-form-item>-->
    <!--    </el-form>-->
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="add">添加法币</el-button>
    <el-upload
      class="upload-demo"
      action="#"
      :data="{property: `digform.currencyLogoUrl`}"
      :show-file-list="false"
      accept=".xlsx,.xls"
      :http-request="addBatch"
    >
      <el-button type="primary" size="mini" icon="el-icon-plus">批量添加</el-button>
    </el-upload>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="downloadTemplate">下载批量添加模版</el-button>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="currencyName" label="法币名称" align="center" />
      <el-table-column prop="currencyCode" label="法币代码" align="center" />
      <el-table-column prop="currencySymbol" label="法币符号" align="center" />
      <el-table-column prop="currencyLogoUrl" label="法币logo" align="center">
        <template slot-scope="scope"><img class="logo" :src="scope.row.currencyLogoUrl" alt=""> </template>
      </el-table-column>
      <el-table-column prop="showAccuracy" label="币种精度" align="center" />
      <el-table-column prop="languageDefault" label="语言环境默认" align="center">
        <template slot-scope="scope">
          {{ language(scope.row.languageDefault) }}
          <!--          {{ scope.row.languageDefault}}-->
        </template>
      </el-table-column>
      <el-table-column prop="supportFinanceTransaction" label="是否支持p2p交易" align="center">
        <template slot-scope="scope">
          {{ scope.row.supportFinanceTransaction === 0 ? '不支持' : '支持' }}
        </template>
      </el-table-column>
      <el-table-column prop="orderMinAmt" label="P2P订单下限" align="center" />
      <el-table-column prop="orderMaxAmt" label="P2P订单上限" align="center" />
      <el-table-column prop="advertMinAmt" label="P2P广告下限" align="center" />
      <el-table-column prop="advertMaxAmt" label="P2P广告上限" align="center" />
      <el-table-column prop="financeTransactionType" label="p2p推荐收款类型" align="center" />
      <el-table-column :label="$t('common.operation')" width="200px" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="update(scope.row)">修改</el-button>
          <el-button type="primary" size="mini" @click="deleted(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="form.pageNum"
        :limit.sync="form.pageSize"
        @pagination="pageChange"
      />
    </div>
    <el-dialog :title="digform.id ? '修改法币' : '添加法币'" :visible.sync="open" width="800px" :before-close="cancel">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        label-width="180px"
        class="form-grid"
      >
        <el-form-item class="grid-item" label="法币名称:" prop="currencyName">
          <el-input v-model="digform.currencyName" placeholder="请输入法币名称" :disabled="!!updateId" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="法币代码:" prop="currencyCode">
          <el-input v-model="digform.currencyCode" placeholder="请输入法币代码" clearable />
          <span style="color: red">*使用ISO 4217标准</span>
        </el-form-item>
        <el-form-item class="grid-item" label="法币符号:" prop="currencySymbol">
          <el-input v-model="digform.currencySymbol" placeholder="请输入法币符号" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="法币logo:" prop="currencyLogoUrl">
          <el-upload
            class="upload-demo"
            action="#"
            :data="{property: `digform.currencyLogoUrl`}"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
          >
            <el-input v-model="digform.currencyLogoUrl" placeholder="请上传图片" style="width: 504px" clearable />
          </el-upload>
          <!--          <el-input v-model="digform.fiatCurrencyLogoUrl" placeholder="请上传图片" style="width: 324px" clearable></el-input>-->
        </el-form-item>
        <el-form-item class="grid-item" label="币种精度:" prop="showAccuracy">
          <el-input v-model="digform.showAccuracy" placeholder="请输入币种精度" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="语言环境默认:" prop="languageDefault">
          <el-checkbox-group v-model="digform.languageDefault">
            <el-checkbox v-for="(item, index) in languageOptions" :key="index" :label="item.key">{{ item.language }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item class="grid-item" label="支持P2P交易:" prop="supportFinanceTransaction">
          <el-select v-model="digform.supportFinanceTransaction" :placeholder="$t('common.pleaseChoose')" @change="changeP2P">
            <el-option
              v-for="item in isP2P"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="digform.supportFinanceTransaction == 1" class="grid-item" label="P2P订单下限:" prop="orderMinAmt">
          <el-input v-model="digform.orderMinAmt" placeholder="请输入P2P订单下限" clearable />
        </el-form-item>
        <el-form-item v-if="digform.supportFinanceTransaction == 1" class="grid-item" label="P2P订单上限:" prop="orderMaxAmt">
          <el-input v-model="digform.orderMaxAmt" placeholder="请输入P2P订单上限" clearable />
        </el-form-item>
        <el-form-item v-if="digform.supportFinanceTransaction == 1" class="grid-item" label="P2P广告下限:" prop="advertMinAmt">
          <el-input v-model="digform.advertMinAmt" placeholder="请输入P2P广告下限" clearable />
        </el-form-item>
        <el-form-item v-if="digform.supportFinanceTransaction == 1" class="grid-item" label="P2P广告上限:" prop="advertMaxAmt">
          <el-input v-model="digform.advertMaxAmt" placeholder="请输入P2P广告上限" clearable />
        </el-form-item>
        <el-form-item v-if="digform.supportFinanceTransaction == 1" class="grid-item" label="P2P推荐收款类型:" prop="financeTransactionType">
          <el-select v-model="digform.financeTransactionType" :placeholder="$t('common.pleaseChoose')" style="width: 504px" @change="changeP2P">
            <el-option
              v-for="item in TransactionType"
              :key="item.id"
              :label="item.typeKey"
              :value="item.typeKey"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button size="mini" type="primary" @click="setConfig">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import * as API from '@/api/paymentCurrency'
import { upload } from '@/api/indexImg'
import { listConfig } from '@/api/system/languageconfig'
import dayjs from 'dayjs'
import { profitAndLossExportData } from '@/api/contract/contractDaily'

export default {
  name: 'ActivityList',
  data() {
    const validateChannelIds = async(rule, value, callback) => {
      if (new RegExp(/[^0-9]/).test(value) || +value < 0) {
        callback(new Error('只支持输入大于0的整数'))
      } else {
        callback()
      }
    }
    return {
      isP2P: [
        { label: '否', value: 0 },
        { label: '是', value: 1 }
      ],
      viewImgDialog: false,
      updateId: '',
      total: 0,
      form: {
        channelId: undefined,
        startTime: undefined,
        endTime: undefined,
        pageNum: 1,
        pageSize: 10
      },
      date: '',
      tableData: [{}],
      open: false,
      TransactionType: [],
      digform: {
        id: undefined,
        currencyName: '',
        currencyCode: '',
        currencySymbol: '',
        currencyLogoUrl: '',
        showAccuracy: '',
        languageDefault: [],
        supportFinanceTransaction: 1,
        orderMinAmt: '',
        orderMaxAmt: '',
        advertMinAmt: '',
        advertMaxAmt: '',
        financeTransactionType: ''
      },
      rules: {
        currencyName: [
          { required: true, message: '法币名称必填', trigger: 'blur' }
        ],
        currencyCode: [
          { required: true, message: '法币代码必填', trigger: 'blur' }
        ],
        currencySymbol: [
          { required: true, message: '法币符号必填', trigger: 'blur' }
        ],
        currencyLogoUrl: [
          { required: true, message: '法币logo必填', trigger: 'blur' }
        ],
        showAccuracy: [
          { required: true, validator: validateChannelIds, trigger: 'blur' }
        ]
      },
      languageOptions: []
    }
  },
  mounted() {
    this.getConfigList()
    this.paymentType()
    listConfig().then(res => {
      if (res.code === 200) {
        this.languageOptions = res.rows
      }
    })
  },
  methods: {
    paymentType() {
      API.paymentType({ pageNum: 1, pageSize: 100 }).then(res => {
        if (res.code === 200) {
          this.TransactionType = res.rows
        }
      })
    },
    changeP2P(val) {
      if (val == 0) {
        this.digform.financeTransactionType = undefined
        this.digform.orderMinAmt = undefined
        this.digform.orderMaxAmt = undefined
        this.digform.advertMinAmt = undefined
        this.digform.advertMaxAmt = undefined
      }
    },
    deleted(row) {
      this.$confirm('是否确认删除?', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        API.deleted(row.id).then(res => {
          if (res.code == 200) {
            this.msgSuccess('删除成功')
            this.getConfigList()
            this.cancel()
          } else {
            this.msgError(res.msg)
          }
        }
        )
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消删除'
        })
      })
    },
    addBatch(data) {
      API.addBatch({ file: data.file }).then(res => {
        if (res.code === 200) {
          this.getConfigList()
          this.$message({
            type: 'success',
            message: res.msg
          })
        }
      })
    },
    downloadTemplate() {
      window.open('https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/otcFiatCurrencyTemplate.xlsx')
    },
    // 分页改变
    pageChange(val) {
      if (val) {
        this.pageNum = val.page
        this.pageSize = val.limit
        this.getConfigList()
      }
    },
    cancel() {
      this.open = false
      this.digform = Object.assign({}, this.$options.data().digform)
    },
    getConfigList(flag) {
      if (flag) {
        this.form.pageNum = 1
      }
      Object.keys(this.form).forEach(item => {
        if (!this.form[item]) {
          this.form[item] = undefined
        }
      })
      API.pageList(this.form).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
    },
    /** 新增按钮操作 */
    add() {
      this.open = true
      this.digform.id = ''
    },
    update(row) {
      this.digform = Object.assign({}, row)
      if (this.digform.languageDefault) {
        this.digform.languageDefault = this.digform.languageDefault.split(',').filter(item => !!item)
      } else {
        this.digform.languageDefault = []
      }
      this.open = true
      // API.fiatInfo(row.id).then(res => {
      //   if (res.code === 200) {
      //     console.log('详细信息', res)
      //   }
      // })
    },
    setConfig() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          const params = Object.assign({}, this.digform)
          console.log('params1', this.digform)
          console.log('params2', params)
          params.languageDefault = params.languageDefault.join(',')
          if (!params.id) {
            API.add(params).then(response => {
              if (response.code == 200) {
                this.msgSuccess('添加成功')
                this.getConfigList()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            API.update(params).then(response => {
              if (response.code == 200) {
                this.msgSuccess('修改成功')
                this.getConfigList()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    // 图片上传
    upload(data) {
      if (data.file.size > 500 * 1024) {
        this.$message.warning('图片大小不能超过500k')
        return
      }
      upload({ file: data.file }).then(res => {
        if (res.code === 200) {
          const arr = data.data.property.split('.')
          if (arr && arr.length > 0) {
            let form = ''
            arr.forEach((item, index) => {
              if (index === 0) {
                form = this[item]
              } else {
                if (typeof form[item] === 'object') {
                  form = form[item]
                } else {
                  form[item] = res.data.fullPath
                }
              }
            })
          }
          this.$message.success(this.$t('common.uploadSucceeded'))
        }
      })
    },
    language(str) {
      if (str) {
        const strLang = str.split(',').map(item => {
          const obj = this.languageOptions.find(el => el.key === item)
          return obj ? obj.language : ''
        }).join(',')
        return strLang
      }
      return ''
    }
  }
}
</script>

<style scoped lang="scss">
.logo {
  width: 80px;
}
.viewImg {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  & > div {
    padding: 20px;
  }
  img {
    width: 250px;
    margin-top: 10px;
  }
}
.upload-demo {
  display: inline-block;
  width: 100px;
}
.table {
  margin-top: 20px;
}
.form-grid {
  display: grid;
  .grid-item {
    width: 90%;
  }
}
</style>
