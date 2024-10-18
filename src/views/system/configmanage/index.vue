<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="80px">
      <el-form-item label="配置key:" prop="configKey">
        <el-input v-model="form.configKey" placeholder="请输入key" size="mini" clearable />
      </el-form-item>
      <el-form-item label="配置value:" prop="value" label-width="100px">
        <el-input v-model="form.value" placeholder="请输入value" size="mini" clearable />
      </el-form-item>
      <el-form-item label="标题:" prop="title">
        <el-input v-model="form.title" placeholder="请输入标题" size="mini" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList">{{$t('common.search')}}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="addConfig">添加</el-button>
    <el-button type="primary" size="mini" @click="handleAll">全部发布</el-button>

    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column type="index" :index="indexMethod" label="序号" align="center" />
      <el-table-column prop="configKey" label="唯一的key" align="center" />
      <el-table-column prop="value" label="配置值" align="center" />
      <el-table-column prop="title" label="标题" align="center" />
      <el-table-column prop="meta" label="描述" align="center" />
      <el-table-column :label="$t('common.operation')" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="updateConfig(scope.row)">修改</el-button>
          <el-button
            v-if="scope.row.isRelease==1"
            type="danger"
            size="mini"
            @click="releaseConfig(scope.row)"
          >发布上线</el-button>
          <el-button
            v-if="scope.row.isRelease==0"
            disabled
            type="success"
            size="mini"
            @click="releaseConfig(scope.row)"
          >发布上线</el-button>
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
        @pagination="getConfigList"
      />
    </div>
    <el-dialog title="修改配置" :visible.sync="open" width="1000px" :before-close="cancel">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        label-width="150px"
        style="margin-left: 4%"
      >
        <el-form-item label="标题:" prop="title">
          <el-input v-model="digform.title" placeholder="请输入" style="width:80%" clearable />
        </el-form-item>
        <el-form-item label="描述:" prop="meta">
          <el-input v-model="digform.meta" placeholder="请输入" style="width:80%" clearable />
        </el-form-item>
        <el-form-item label="唯一key:" prop="configKey">
          <el-input v-model="digform.configKey" placeholder="请输入" style="width:80%" clearable />
        </el-form-item>
        <el-form-item label="配置值:" prop="value">
          <el-input
            v-model="digform.value"
            clearable
            type="textarea"
            :rows="10"
            placeholder="请输入"
            style="width:80%"
          />
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
import {
  findConfigList,
  publishAll,
  publish,
  queryConfig,
  addConfig,
  editConfig
} from '@/api/configmanage'
export default {
  name: 'Configmanage',
  data() {
    return {
      pageShow: true,
      total: 0,
      configId: '',
      form: {
        configKey: '',
        value: '',
        title: '',
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      open: false,
      digform: {},
      rules: {
        configKey: [
          { required: true, message: '请输入案件名称', trigger: 'change' }
        ],
        value: [
          { required: true, message: '请输入案件名称', trigger: 'change' }
        ]
      }
    }
  },
  mounted() {
    this.getConfigList()
  },
  methods: {
    resetQuery() {
      if (this.$refs['form']) {
        this.$refs['form'].resetFields()
      }
    },
    handleAll() {
      publishAll().then(response => {
        if (response.code == 200) {
          this.msgSuccess('全部发布成功')
          this.getConfigList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    cancel() {
      this.open = false
    },
    getConfigList() {
      const params = {
        configKey: this.form.configKey,
        value: this.form.value,
        title: this.form.title,
        pageNum: this.form.pageNum,
        pageSize: this.form.pageSize
      }
      findConfigList(params).then(response => {
        if (response.code == 200) {
          this.tableData = response.rows
          this.total = response.total
          this.tableData.forEach(element => {
          })
        } else {
          this.msgError(response.msg)
        }
      })
    },
    setConfig() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          if (this.configId == '') {
            addConfig(this.digform).then(response => {
              if (response.code == 200) {
                this.msgSuccess('添加成功')
                this.getConfigList()
              } else {
                this.msgError(response.msg)
              }
              this.open = false
            })
          } else {
            editConfig(this.digform).then(response => {
              if (response.code == 200) {
                this.msgSuccess('修改成功')
                this.getConfigList()
              } else {
                this.msgError(response.msg)
              }
              this.open = false
            })
          }
        }
      })
    },
    releaseConfig(row) {
      publish({ configId: row.id }).then(response => {
        if (response.code == 200) {
          this.msgSuccess('发布成功')
          this.getConfigList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 索引值
    indexMethod(index) {
      return index + (this.form.pageNum - 1) * this.form.pageSize + 1
    },
    queryConfig(configId) {
      queryConfig({ configId: configId }).then(response => {
        if (response.code == 200) {
          this.digform = response.data
        } else {
          this.msgError(response.msg)
        }
      })
    },
    updateConfig(row) {
      this.open = true
      this.queryConfig(row.id)
      this.configId = row.id
    },
    addConfig(row) {
      this.open = true
      this.digform = {}
      this.configId = ''
    }
  }
}
</script>

<style scoped>
.table {
  margin-top: 20px;
}
</style>
