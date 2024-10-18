<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form" label-width="80px">
      <el-form-item label="币对:" label-width="50px" prop="symbolId">
        <el-select v-model="form.symbolId" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in currencyOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-optional" size="mini" @click="getConfigList">查找</el-button>
      </el-form-item>
    </el-form>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="addConfig">添加自选热门币对配置</el-button>

    <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
      <el-table-column :label="$t('common.operation')" align="center" width="220">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="queryConfig(scope.row.id)">编辑</el-button>
          <el-button type="danger" size="mini" @click="del(scope.row.id)">删除</el-button>
          <el-button type="primary" size="mini" @click="updateWeight(scope.row.id)">置顶</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="symbol" label="币对代码" align="center" />
      <el-table-column prop="weight" label="排序" align="center" />
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
    <el-dialog title="添加自选热门币对配置" :visible.sync="open" width="500px" :before-close="cancel" :close-on-click-modal="false">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        class="form-grid"
      >
        <el-form-item label="币对代码:" prop="symbolId">
          <el-select v-model="digform.symbolId" style="width: 100%;" :placeholder="$t('common.pleaseChoose')" filterable>
            <el-option
              v-for="item in currencyOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序:" prop="weight">
          <el-input v-model="digform.weight" placeholder="请输入大于0的整数" clearable />
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
import { mapState, mapActions } from 'vuex'
import * as API from '@/api/systemsetting/optionalhotcurrency'

export default {
  name: 'Optionalhotcurrency',
  data() {
    var checkNumber1 = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入正确数字'))
      }
      var reg = /^[0-9]\d*$/
      if (value) {
        if (!reg.test(value) || Number(value) <= 0) {
          return callback(new Error('请输入正确数字'))
        } else {
          callback()
        }
      }
    }
    return {
      total: 0,
      configId: '',
      form: {
        symbolId: '',
        pageNum: 1,
        pageSize: 10,
        orderByColumn: 'weight',
        isAsc: 'desc'
      },
      tableData: [],
      open: false,
      digform: {
        symbolId: '',
        weight: ''
      },
      rules: {
        symbolId: [
          { required: true, message: '请选择币对', trigger: 'change' }
        ],
        weight: [
          { required: true, validator: checkNumber1, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['pairList']),
    currencyOptions() {
      return this.pairList
    }
  },
  mounted() {
    this.getPair()
    this.getConfigList()
  },
  methods: {
    ...mapActions('systemsetting', ['getPair']),
    cancel() {
      this.open = false
      this.$refs['digform'].resetFields()
    },
    getConfigList() {
      API.getList(this.form).then(response => {
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
            API.addHot(this.digform).then(response => {
              if (response.code == 200) {
                this.msgSuccess('添加成功')
                this.getConfigList()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            API.updateHot(this.digform).then(response => {
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
    del(id) {
      API.delHot(id).then(response => {
        if (response.code == 200) {
          this.msgSuccess('删除成功')
          this.getConfigList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    updateWeight(id) {
      API.updateWeight(id).then(response => {
        if (response.code == 200) {
          this.msgSuccess('置顶成功')
          this.getConfigList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    queryConfig(id) {
      API.getInfo(id).then(response => {
        if (response.code == 200) {
          this.digform = response.data
          this.configId = id
          this.open = true
        } else {
          this.msgError(response.msg)
        }
      })
    },
    addConfig(row) {
      this.open = true
      this.digform = {}
      this.configId = ''
    }
  }
}
</script>

<style scoped lang="scss">
.table {
  margin-top: 20px;
}
</style>
