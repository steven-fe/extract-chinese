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
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="add">添加支付方式</el-button>
    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="thirdPayName" label="支付方式名称" align="center" />
      <el-table-column prop="thirdPayLogoUrl" label="支付方式logo" align="center">
        <template slot-scope="scope"><img class="logo" :src="scope.row.thirdPayLogoUrl" alt=""> </template>
      </el-table-column>
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
    <el-dialog :title="form.id ? '修改支付方式' : '添加支付方式'" :visible.sync="open" width="600px" :before-close="cancel">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        label-width="180px"
        class="form-grid"
      >
        <el-form-item class="grid-item" label="支付方式名称:" prop="thirdPayName">
          <el-input v-model="digform.thirdPayName" placeholder="请输入支付方式名称" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="支付方式logo:" prop="thirdPayLogoUrl">
          <el-upload
            class="upload-demo"
            action="#"
            :data="{property: `digform.thirdPayLogoUrl`}"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
          >
            <el-input v-model="digform.thirdPayLogoUrl" placeholder="请上传图片" style="width: 324px" clearable />
          </el-upload>
          <!--          <el-input v-model="digform.thirdPayLogoUrl" placeholder="请上传图片" style="width: 324px" clearable></el-input>-->
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
import * as API from '@/api/paymentChannel'
import { upload } from '@/api/indexImg'
import dayjs from 'dayjs'
import { audit } from '@/api/finance/freecurrency'

export default {
  name: 'ActivityList',
  filters: {
    dateFilter(time) {
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  data() {
    return {
      viewImgDialog: false,
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
        thirdPayName: undefined,
        thirdPayLogoUrl: undefined
      },
      rules: {
        thirdPayName: [
          { required: true, message: '支付方式名称不能为空', trigger: 'blur' }
        ],
        thirdPayLogoUrl: [
          { required: true, message: '支付方式logo不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    'digform.advertStatus'() {
      if (this.digform.advertStatus == 1) {
        this.digform.skipType = 1
        this.digform.advertBanners = {
          zh_CN: undefined,
          en_US: undefined,
          ja_JP: undefined,
          ko_KR: undefined
        }
      } else {
        this.digform.skipType = undefined
        this.digform.advertSkips = {
          zh_CN: undefined,
          en_US: undefined,
          ja_JP: undefined,
          ko_KR: undefined
        }
        this.digform.advertBanners = undefined
      }
    },
    'digform.skipType'() {
      if (this.digform.skipType == 0) {
        this.digform.advertSkips = {
          zh_CN: undefined,
          en_US: undefined,
          ja_JP: undefined,
          ko_KR: undefined
        }
      }
    }
  },
  mounted() {
    this.getConfigList()
  },
  methods: {
    viewImg(imgs) {
      this.viewImgDialog = true
      this.imgs = {
        zh_CN: undefined,
        en_US: undefined,
        ja_JP: undefined,
        ko_KR: undefined
      }
      this.imgs = imgs !== 'null' && imgs ? JSON.parse(imgs) : this.imgs
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
    add() {
      this.open = true
      this.digform.id = undefined
    },
    update(row) {
      this.digform.id = row.id
      this.digform = Object.assign({}, row)
      Object.keys(this.digform).forEach(item => {
        this.digform[item] = row[item]
      })
      this.open = true
    },
    setConfig() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          if (!this.digform.id) {
            API.add(this.digform).then(response => {
              if (response.code == 200) {
                this.msgSuccess('添加成功')
                this.getConfigList()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            API.update(this.digform).then(response => {
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
