<template>
  <div class="app-container">
    <!--form-->
    <!--    <el-row :gutter="20">-->
    <!--      <el-form :model="form" class="demo-form-inline">-->
    <!--        <el-form-item label="ID" :label-width="formLabelWidth">-->
    <!--          <el-input v-model="form.id" placeholder="请输入ID" size="mini" clearable></el-input>-->
    <!--        </el-form-item>-->
    <!--        <el-form-item label="版本" :label-width="formLabelWidth">-->
    <!--          <el-input v-model="form.versionCode" placeholder="请输入版本" size="mini" clearable></el-input>-->
    <!--        </el-form-item>-->
    <!--        <el-form-item label="版本号" :label-width="formLabelWidth">-->
    <!--          <el-input v-model="form.versionStr" placeholder="请输入版本号" size="mini" clearable></el-input>-->
    <!--        </el-form-item>-->
    <!--        <el-form-item label="更新信息" :label-width="formLabelWidth">-->
    <!--          <el-input v-model="form.detail" placeholder="请输入更新信息" size="mini" clearable></el-input>-->
    <!--        </el-form-item>-->
    <!--        <el-form-item label="下载地址" :label-width="formLabelWidth">-->
    <!--          <el-input v-model="form.url" placeholder="请输入下载地址" size="mini" clearable></el-input>-->
    <!--        </el-form-item>-->
    <!--        <el-form-item label="是否强制更新" :label-width="formLabelWidth">-->
    <!--          <el-radio v-model="form.isForce" :label="0">不强制</el-radio>-->
    <!--          <el-radio v-model="form.isForce" :label="1">强制</el-radio>-->
    <!--        </el-form-item>-->
    <!--        <el-form-item label="选择平台" :label-width="formLabelWidth">-->
    <!--          <el-radio v-model="form.platform" label="android">android</el-radio>-->
    <!--          <el-radio v-model="form.platform" label="ios">ios</el-radio>-->
    <!--          <el-radio v-model="form.platform" label="TestFlight">TestFlight</el-radio>-->
    <!--        </el-form-item>-->
    <!--        <el-form-item label="是否显示升级弹框" :label-width="formLabelWidth">-->
    <!--          <el-radio v-model="form.isAlert" :label="0">否</el-radio>-->
    <!--          <el-radio v-model="form.isAlert" :label="1">是</el-radio>-->
    <!--        </el-form-item>-->
    <!--        <el-col :xs="12" :span="5">-->
    <!--          <div class="grid-content bg-purple">-->
    <!--            <el-button type="primary" icon="el-icon-edit" @click="addHandle()" size="mini">修改</el-button>-->
    <!--          </div>-->
    <!--        </el-col>-->
    <!--      </el-form>-->
    <!--    </el-row>-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="margin-top: 20px;width: 100%">
      <el-table-column label="ID" width="40" type="index" align="center" />
      <!--      <el-table-column prop="versionCode" label="版本" width="120"></el-table-column>-->
      <el-table-column prop="versionStr" label="版本号" align="center" width="120" />
      <el-table-column prop="detail" label="内容" align="center" width="280" />
      <!--      <el-table-column prop="langType" label="语言"></el-table-column>-->
      <el-table-column prop="url" label="下载链接" align="center" width="380" />
      <el-table-column prop="platform" label="平台" align="center" width="180" />
      <el-table-column prop="isForce" label="是否强制" align="center" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.isForce">强制</span>
          <span v-if="!scope.row.isForce">不强制</span>
        </template>
      </el-table-column>
      <el-table-column prop="isAlert" label="是否弹框" align="center" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.isAlert">弹框</span>
          <span v-if="!scope.row.isAlert">不弹框</span>
        </template>
      </el-table-column>
      <el-table-column prop="[isVersion]" label="是否指定版本更新" align="center" width="100">
        <template slot-scope="scope">
          <span v-if="scope.row.isVersion">是</span>
          <span v-if="!scope.row.isVersion">否</span>
        </template>
      </el-table-column>
      <el-table-column prop="updateVersion" label="更新版本" align="center" width="180" />
      <el-table-column prop="appDate" label="创建时间" align="center" width="180" />
      <el-table-column label="弹窗跳转链接" prop="linkType" align="center" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.platform === 'ios' || scope.row.platform === 'tf'">
            <el-switch
              v-model="scope.row.linkType"
              :active-value="1"
              :inactive-value="0"
              @change="handleChangeLinkType(scope.row)"
            />
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="appDate" :label="$t('common.operation')" align="center" width="150">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="edit(scope.row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="修改" :visible.sync="editDialog" width="500px">
      <el-form ref="form" :model="form" :rules="rules" class="demo-form-inline">
        <!--        <el-form-item label="ID" :label-width="formLabelWidth">-->
        <!--          <el-input v-model="form.id" placeholder="请输入ID" size="mini" clearable></el-input>-->
        <!--        </el-form-item>-->
        <!--        <el-form-item label="版本" :label-width="formLabelWidth">-->
        <!--          <el-input v-model="form.versionCode" placeholder="请输入版本" size="mini" clearable></el-input>-->
        <!--        </el-form-item>-->
        <el-form-item label="版本号" prop="versionStr" :label-width="formLabelWidth">
          <el-input v-model="form.versionStr" placeholder="请输入版本号" size="mini" clearable />
        </el-form-item>
        <el-form-item label="语言" prop="langType" :label-width="formLabelWidth">
          <el-select v-model="form.langType" placeholder="请选择语言类型" @change="getLang">
            <el-option
              v-for="item in languageOptions"
              :key="item.key"
              :label="item.language"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="detail" :label-width="formLabelWidth">
          <el-input
            v-model="form.detail"
            type="textarea"
            :rows="2"
            placeholder="请输入更新信息"
            size="mini"
            clearable
          />
        </el-form-item>
        <el-form-item label="下载链接" :label-width="formLabelWidth">
          <el-input v-model="form.url" placeholder="请输入下载地址" size="mini" clearable />
        </el-form-item>
        <el-form-item label="是否强制" :label-width="formLabelWidth">
          <el-radio v-model="form.isForce" :label="0">不强制</el-radio>
          <el-radio v-model="form.isForce" :label="1">强制</el-radio>
        </el-form-item>
        <el-form-item label="是否显示升级弹框" :label-width="formLabelWidth">
          <el-radio v-model="form.isAlert" :label="0">否</el-radio>
          <el-radio v-model="form.isAlert" :label="1">是</el-radio>
        </el-form-item>
        <el-form-item label="是否指定版本更新" :label-width="formLabelWidth">
          <el-radio v-model="form.isVersion" :label="0">否</el-radio>
          <el-radio v-model="form.isVersion" :label="1">是</el-radio>
        </el-form-item>
        <el-form-item label="更新版本" prop="updateVersion" :label-width="formLabelWidth">
          <el-input v-model="form.updateVersion" placeholder="请输入版本号" size="mini" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="addHandle">{{$t('common.sure')}}</el-button>
        <el-button size="mini" @click="editDialog = false">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { updateAppDate, listAppDate, getAppDateById, changeLinkType } from '@/api/coin'
import { listConfig } from '@/api/system/languageconfig'

export default {
  data() {
    return {
      editDialog: false,
      loading: false,
      isForceOptions: [
        { label: '强制弹窗', value: '' },
        { label: '非强制弹窗', value: '' },
        { label: '非强制不弹窗', value: '' }
      ],
      platformOptions: [
        { label: this.$t('common.all'), value: '' },
        { label: 'android', value: 'android' },
        { label: 'ios', value: 'ios' }
      ],
      tableData: [],
      form: {
        id: '',
        versionCode: '',
        versionStr: '', // 版本号
        detail: '', // 内容
        url: '', // 下载连接
        isForce: 0, // 是否强制
        platform: '', // 平台
        isAlert: 0,
        isVersion: 0,
        updateVersion: '', // 更新版本
        langType: 'zh_CN' // 语言"en_US"""
      },
      rules: {
        versionStr: [
          { required: true, message: this.$t('frozen.notIsData'), trigger: 'blur' }
        ],
        langType: [
          { required: true, message: this.$t('frozen.notIsData'), trigger: 'blur' }
        ],
        detail: [
          { required: true, message: this.$t('frozen.notIsData'), trigger: 'blur' }
        ]
      },
      formLabelWidth: '140px',
      languageOptions: []
    }
  },
  created() {
    this.load()
    this.getLanguageselect()
  },
  methods: {
    getLanguageselect() {
      listConfig().then(response => {
        this.languageOptions = response.rows.filter(item => item.isOpen === 1)
        console.log('语言', this.languageOptions)
      })
    },
    load() {
      this.loading = true
      const formData = {}
      listAppDate(formData)
        .then(response => {
          console.log('返回值', response)
          if (response.code == 200) {
            this.tableData = response.data
          } else {
            this.tableData = []
            this.msgError(response.msg)
          }
          this.loading = false
        })
        .catch(error => {
          console.log(error)
        })
    },
    // 查询语言
    getLang() {
      getAppDateById({ platform: this.form.platform, langType: this.form.langType }).then(res => {
        if (res.code === 200 && res.data) {
          this.form.detail = res.data.detail
        } else {
          this.form.detail = ''
        }
      })
    },
    // 修改
    edit(row) {
      this.editDialog = true
      for (const key in this.form) {
        if (row[key]) {
          this.$set(this.form, key, row[key])
        }
      }
      this.getLang()
    },
    async handleChangeLinkType(row) {
      try {
        const params = {
          platform: row.platform,
          linkType: row.linkType
        }
        await changeLinkType(params)
        this.load()
      } catch (e) {
        console.error(e)
      }
    },
    addHandle() {
      this.$confirm('确定修改, 是否继续?', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(() => {
          this.$refs.form.validate((valid) => {
            if (valid) {
              updateAppDate(this.form)
                .then(response => {
                  this.editDialog = false
                  this.load()
                  this.$message({
                    showClose: true,
                    message: '修改成功',
                    type: 'success'
                  })
                })
                .catch(error => {
                  this.$message({
                    showClose: true,
                    message: '修改失败',
                    type: 'error'
                  })
                })
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消修改'
          })
        })
    }
  }
}
</script>

