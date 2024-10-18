<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="90px">
      <el-form-item label="查询批次号:">
        <el-input v-model="form.batchNo" placeholder="请输入批次号" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getTableData">查询结果</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="exportList">导出列表</el-button>
      </el-form-item>
    </el-form>
    <!--    <el-button type="primary" size="mini" icon="el-icon-plus" @click="open = true">添加</el-button>-->
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="downloadTemplate">{{$t('frozen.downloadTemplate')}}</el-button>
    <el-upload
      class="upload-demo"
      action="#"
      :show-file-list="false"
      accept=".xlsx,.xls"
      :http-request="uploadBantch"
    >
      <el-button type="primary" size="mini" icon="el-icon-plus">上传批量添加文件</el-button>
    </el-upload>

    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column prop="userId" :label="$t('dwmanager.userUID')" align="center" />
      <el-table-column prop="parentId" label="上级UID" align="center" />
      <el-table-column prop="msg" label="添加结果" align="center">
        <template slot-scope="scope">
          {{ scope.row.status == 1 ? '成功' : '失败' }}
        </template>
      </el-table-column>
      <el-table-column prop="msg" label="修改结果" align="center" />
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <!--      <pagination-->
      <!--              v-show="total > form.pageSize"-->
      <!--              :total="total"-->
      <!--              :page.sync="form.pageNum"-->
      <!--              :limit.sync="form.pageSize"-->
      <!--              @pagination="getConfigList"-->
      <!--      />-->
    </div>
    <el-dialog title="批次号" :visible.sync="open" width="500px" :close-on-click-modal="false">
      您本次批量修改的批次号为：{{ batchNo }}, 请保存，后续查询结果
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="open = false">关闭弹窗</el-button>
        <el-button size="mini" type="primary" class="copyTest" @click="copyText($event)">复制批次号</el-button>
      </div>
    </el-dialog>
    <!--    <el-dialog title="添加" :visible.sync="open" width="500px">-->
    <!--      <el-form-->
    <!--          ref="digform"-->
    <!--          :model="digform"-->
    <!--          :rules="rules"-->
    <!--          label-width="100px"-->
    <!--          class="form-grid">-->
    <!--        <el-form-item class="grid-item" label="UID:" prop="uids">-->
    <!--          <el-input type="textarea" :rows="5" v-model="digform.uids" :placeholder="$t('frozen.pleaseEnterUID')" clearable></el-input>-->
    <!--          <span style="color: red">输入UID,使用英文','分隔,每次操作最多50个UID</span>-->
    <!--        </el-form-item>-->
    <!--        <el-form-item class="grid-item" label="PID:" prop="pid">-->
    <!--          <el-input v-model="digform.pid" placeholder="请输入PID" clearable></el-input>-->
    <!--        </el-form-item>-->
    <!--      </el-form>-->
    <!--      <div slot="footer" class="dialog-footer">-->
    <!--        <el-button size="mini" @click="open = false">{{$t('common.cancel')}}</el-button>-->
    <!--        <el-button size="mini" type="primary" @click="save">保 存</el-button>-->
    <!--      </div>-->
    <!--    </el-dialog>-->
  </div>
</template>
<script>
import * as API from '@/api/invitation/invitation'
import Clipboard from 'clipboard'

export default {
  name: 'Currencyapply',
  data() {
    var checkUid = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('frozen.pleaseEnterContent')))
      } else if (value.split(',').length > 50 || value.split(',').some(item => !item)) {
        callback(new Error('请输入正确的格式'))
      } else {
        callback()
      }
    }
    return {
      initialOfferingOptions: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ],
      pageShow: true,
      total: 0,
      form: {
        batchNo: undefined
      },
      digform: {
        uids: '',
        pid: ''
      },
      rules: {
        uids: [
          { validator: checkUid, trigger: 'blur' }
        ],
        pid: [
          { required: true, message: '请输入内容', trigger: 'blur' }
        ]
      },
      tableData: [],
      open: false,
      batchNo: ''
    }
  },
  computed: {

  },
  mounted() {
    this.getTableData()
  },
  methods: {
    getTableData() {
      if (this.form.batchNo) {
        API.list(this.form).then(response => {
          if (response.code == 200) {
            this.tableData = response.rows
            this.total = response.total
          } else {
            this.msgError(response.msg)
          }
        })
      }
    },
    downloadTemplate() {
      window.open('https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/batchAddParentUidTemplate.xlsx')
    },
    uploadBantch(data) {
      const batchNo = `${+new Date()}${Math.ceil(Math.random() * 100000)}`
      API.uploadBantch({ batchNo, file: data.file }).then(response => {
        if (response.code == 200) {
          this.batchNo = batchNo
          this.open = true
        } else {
          this.msgError(response.msg)
        }
      })
    },
    copyText(e) {
      console.log('copyTest', e.target)
      const clipboard = new Clipboard('.copyTest', {
        text: () => this.batchNo
      })
      clipboard.on('success', () => {
        this.$message.success('复制成功')
        // 释放内存
        clipboard.destroy()
      })
      clipboard.on('error', () => {
        // 不支持复制
        this.$toast('暂不支持复制')
        // 释放内存
        clipboard.destroy()
      })
    },
    exportList() {
      if (this.form.batchNo) {
        API.exportList({ batchNo: this.form.batchNo }).then(response => {
          if (response.code == 200) {
            this.download(response.msg)
          } else {
            this.msgError(response.msg)
          }
        })
      }
    }
    // save() {
    //   // code: 200
    //   // data: 1651038721841
    //   // msg: "绑定完成，失败uid=36310276290644017,"
    //   this.form.number = undefined
    //   this.$refs["digform"].validate(valid => {
    //     if (valid) {
    //       API.batchBind(this.digform).then(res => {
    //         if (res.code === 200) {
    //           this.msgSuccess(res.msg);
    //           this.form.number = res.data
    //           this.getTableData()
    //           this.open = false
    //         }
    //       })
    //     }
    //   })
    // }
  }
}
</script>

<style scoped lang="scss">
  .table {
    margin-top: 20px;
  }
  .form-grid {
    margin-left: 5%;
  }
  .upload-demo {
    display: inline-block;
  }
</style>
