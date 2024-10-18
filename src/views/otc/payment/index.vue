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
    <!--    <el-button type="primary" size="mini" icon="el-icon-plus" @click="addActivity">添加渠道</el-button>-->
    <!--    <el-select v-model="form.coin" filterable clearable placeholder="请选择空投锁仓币种">-->
    <!--      <el-option-->
    <!--          v-for="item in codeOptions"-->
    <!--          :key="item.id"-->
    <!--          :label="item.name"-->
    <!--          :value="item.name">-->
    <!--      </el-option>-->
    <!--    </el-select>-->
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="channelName" label="渠道名称" align="center" width="180" />
      <el-table-column prop="channelLogoUrl" label="渠道logo" align="center" width="160">
        <template slot-scope="scope"><img class="logo" :src="scope.row.channelLogoUrl" alt=""></template>
      </el-table-column>
      <el-table-column prop="channelPayType" label="支付方式" align="center" />
      <el-table-column prop="channelBuyCurrency" label="购买支持法币" align="center">
        <template slot-scope="scope">{{ getCurrencyName(scope.row.channelBuyCurrency) }}</template>
      </el-table-column>
      <el-table-column prop="channelSellCurrency" label="出售支持法币" align="center" width="260">
        <template slot-scope="scope">{{ getCurrencyName(scope.row.channelSellCurrency) }}</template>
      </el-table-column>
      <el-table-column prop="channelSupportCurrency" label="支持数字货币" align="center" width="260" />
      <el-table-column prop="status" label="当前状态" align="center" width="160">
        <template slot-scope="scope">{{ scope.row.status == 0 ? '禁用' : '启用' }}</template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" width="200px" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="update(scope.row)">修改</el-button>
          <el-button type="primary" size="mini" @click="changeStatus(scope.row)">{{ scope.row.status == 1 ? '禁用' : '启用' }}</el-button>
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
    <el-dialog title="修改渠道信息" :visible.sync="open" width="800px" :before-close="cancel">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        label-width="180px"
        class="form-grid"
      >
        <el-form-item class="grid-item" label="渠道名称:" prop="channelName">
          <el-input v-model="digform.channelName" placeholder="请输入渠道名称" disabled clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="渠道logo:" prop="channelLogoUrl">
          <el-upload
            class="upload-demo"
            action="#"
            :data="{property: `digform.channelLogoUrl`}"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
          >
            <el-input v-model="digform.channelLogoUrl" placeholder="请上传图片" style="width: 504px" clearable />
          </el-upload>
        </el-form-item>
        <el-form-item class="grid-item" label="支付方式:" prop="channelPayType">
          <el-select v-model="digform.channelPayType" multiple :placeholder="$t('common.pleaseChoose')" style="width: 504px">
            <el-option
              v-for="item in payTypes"
              :key="item.id"
              :label="item.thirdPayName"
              :value="item.thirdPayName"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="grid-item" label="购买支持法币:" prop="channelBuyCurrency">
          <el-select v-model="digform.channelBuyCurrency" multiple :placeholder="$t('common.pleaseChoose')" style="width: 504px">
            <el-option
              v-for="item in fiatList"
              :key="item.id"
              :label="item.currencyName"
              :value="item.currencyCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="grid-item" label="出售支持法币:" prop="channelSellCurrency">
          <el-select v-model="digform.channelSellCurrency" multiple :placeholder="$t('common.pleaseChoose')" style="width: 504px">
            <el-option
              v-for="item in fiatList"
              :key="item.id"
              :label="item.currencyName"
              :value="item.currencyCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="grid-item" label="支持数字货币:" prop="channelSupportCurrency">
          <el-select v-model="digform.channelSupportCurrency" multiple :placeholder="$t('common.pleaseChoose')" style="width: 504px">
            <el-option
              v-for="item in codeOptions"
              :key="item.id"
              :label="item.name"
              :value="item.name"
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
import * as API from '@/api/payment'
import { upload } from '@/api/indexImg'
import dayjs from 'dayjs'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'ActivityList',
  data() {
    return {
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
      digform: {
        id: undefined,
        channelName: '',
        channelLogoUrl: '',
        channelPayType: '',
        channelBuyCurrency: '',
        channelSellCurrency: '',
        channelSupportCurrency: ''
      },
      rules: {
      },
      payTypes: [],
      fiatList: []
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList']),
    codeOptions() {
      return this.currencyList
    }
  },
  created() {
    this.getConfigList()
    this.getFiatList()
    this.getPayTypes()
    this.getCurrency()
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency']),
    getCurrencyName(name) {
      if (name) {
        const currencyName = name.split(',').map(item => {
          const cname = this.fiatList.find(el => el.currencyCode === item)
          return cname ? cname.currencyName : ''
        }).join(',')
        return currencyName
      }
      return ''
    },
    getPayTypes() {
      API.getPayTypes({ pageNum: 1, pageSize: 100 }).then(res => {
        if (res.code === 200) {
          this.payTypes = res.rows
        }
      })
    },
    getFiatList() {
      API.getFiatList({ pageNum: 1, pageSize: 100 }).then(res => {
        if (res.code === 200) {
          console.log('fiatList', res)
          this.fiatList = res.rows
        }
      })
    },
    changeStatus(row) {
      API.changeStatus({ id: row.id, status: row.status == 1 ? 0 : 1 }).then(res => {
        if (res.code === 200) {
          this.msgSuccess('修改成功')
          this.getConfigList()
        }
      })
    },
    // 日期改变事件
    timeChange(val) {
      if (val && val.length > 0) {
        this.form.startTime = val[0]
        this.form.endTime = val[1]
        return
      }
      this.form.startTime = undefined
      this.form.endTime = undefined
    },
    // 分页改变
    pageChange(val) {
      if (val) {
        this.pageNum = val.page
        this.pageSize = val.limit
        this.getConfigList()
      }
    },
    cancelImgs() {
      this.viewImgDialog = false
      this.imgs = {
        zh_CN: undefined,
        en_US: undefined,
        ja_JP: undefined,
        ko_KR: undefined
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
    addActivity() {
      this.open = true
      this.updateId = ''
    },
    update(row) {
      this.digform = Object.assign({}, row)
      // channelPayType: '',
      //     channelBuyCurrency: '',
      //     channelSellCurrency: '',
      //     channelSupportCurrency: '',
      this.digform.channelPayType = this.digform.channelPayType.split(',')
      this.digform.channelBuyCurrency = this.digform.channelBuyCurrency.split(',')
      this.digform.channelSellCurrency = this.digform.channelSellCurrency.split(',')
      this.digform.channelSupportCurrency = this.digform.channelSupportCurrency.split(',')
      this.open = true
    },
    setConfig() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          const params = Object.assign({}, this.digform)
          params.channelPayType = params.channelPayType.join(',')
          params.channelBuyCurrency = params.channelBuyCurrency.join(',')
          params.channelSellCurrency = params.channelSellCurrency.join(',')
          params.channelSupportCurrency = params.channelSupportCurrency.join(',')
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
                if (form[item] && typeof form[item] === 'object') {
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
    }
  },
  filters: {
    dateFilter(time) {
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
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
  float: left;
  width: 100%;
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
.upload-demo {
  float: left;
  width: 100%;
}
</style>
