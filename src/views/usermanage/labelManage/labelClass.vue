<template>
  <!-- 大额充提提醒设置 -->
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="searchForm" label-width="80px">
      <el-form-item label="标签分类:" prop="parentId">
        <el-select v-model="searchForm.parentId" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in parentLableList"
            :key="item.id"
            :label="item.parentName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="客户标签:" prop="id">
        <el-select v-model="searchForm.id" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in labelData"
            :key="item.id"
            :label="item.labelName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="search">{{$t('common.search')}}</el-button>
      </el-form-item>
    </el-form>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="add('addParentLabel', '添加标签分类')">添加标签分类</el-button>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="add('updateParentLabel', '编辑标签分类')">编辑标签分类</el-button>
    <el-button type="primary" size="mini" icon="el-icon-plus" @click="add('addLabel', '添加客户标签')">添加客户标签</el-button>

    <el-table ref="table" :data="tableData" border style="width: 100%" class="table cabin-table">
      <!--      buySellGap: 0.01-->
      <!--      ctime: 1635921296517-->
      <!--      dayDownLimit: 0.03-->
      <!--      dayUpLimit: 0.02-->
      <!--      id: 1-->
      <!--      instrumentId: 1-->
      <!--      likeSymbolGap: 0.07-->
      <!--      mtime: 1635921296518-->
      <!--      status: 1-->
      <!--      symbol: "BTCUSDT"-->
      <!--      type: 1-->
      <el-table-column prop="parentName" label="标签分类" align="center">
        <template slot-scope="scope">
          <span :style="{color: scope.row.labelColor}">{{ scope.row.parentName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="labelName" label="客户标签" align="center" />
      <el-table-column prop="showPrecision" :label="$t('common.operation')" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="modify(scope.row, 'updateLabel', '编辑客户标签')">编辑</el-button>
          <!--          <el-button type="primary" size="mini" @click="deleted(scope.row)">删除</el-button>-->
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total > searchForm.pageSize"
        :total="total"
        :page.sync="searchForm.pageNum"
        :limit.sync="searchForm.pageSize"
        @pagination="pageChange"
      />
    </div>
    <el-dialog :title="labelName" :visible.sync="dialogStatus" width="500px" :before-close="cancel" :close-on-click-modal="false">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        class="form-grid"
        label-width="130px"
      >
        <el-form-item v-if="status === 'updateParentLabel' || status === 'addLabel'" class="grid-item" label="标签分类:" prop="id">
          <el-select v-model="digform.id" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in parentLableList"
              :key="item.id"
              :label="item.parentName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="status === 'updateParentLabel'" class="grid-item" label="标签分类修改为:" prop="parentName">
          <el-input v-model="digform.parentName" placeholder="名称最多为20个字符" clearable />
        </el-form-item>

        <el-form-item v-if="status === 'addParentLabel' || status === 'updateLabel'" class="grid-item" label="标签分类:" prop="parentName">
          <el-input v-model="digform.parentName" placeholder="名称最多为20个字符" clearable :disabled="disabledInput" />
        </el-form-item>

        <el-form-item v-if="status === 'updateLabel' || status === 'addLabel'" class="grid-item" label="客户标签:" prop="labelName">
          <el-input v-model="digform.labelName" placeholder="名称最多为20个字符" clearable :disabled="disabledInput" />
        </el-form-item>

        <el-form-item v-if="status === 'updateLabel'" class="grid-item" label="客户标签修改为:" prop="editLableName">
          <el-input v-model="digform.editLableName" placeholder="名称最多为20个字符" clearable />
        </el-form-item>

        <el-form-item v-if="status === 'addParentLabel' || status === 'updateParentLabel'" class="grid-item" label="标签颜色:" prop="color">
          <el-color-picker
            v-model="digform.color"
            color-format="hex"
            :predefine="predefineColors"
          />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button size="mini" type="primary" @click="save">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import * as API from '@/api/labelClass'
// import {mapState, mapGetters, mapActions} from 'vuex'
// import { listCoinGoods } from '@/api/contract/coin'

export default {
  name: 'LabelClass',
  data() {
    var checkName = (rule, value, callback) => {
      if (value.length > 20) {
        return callback(new Error('名称最多为20个字符'))
      } else {
        callback()
      }
    }
    return {
      disabledInput: false,
      total: 0,
      searchForm: {
        parentId: '',
        id: '',
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      dialogStatus: false,
      status: '', // addParentLabel新增，updateParentLabel修改, addLabel新增客户标签, updateLabel修改客户标签
      digform: {
        parentId: '',
        color: '#000000',
        labelName: '',
        editLableName: '',
        parentName: '',
        id: ''
      },
      rules: {
        parentId: [
          { required: true, message: '标签分类不能为空', trigger: 'blur' }
        ],
        editLableName: [
          { required: true, message: '名称不能为空', trigger: 'blur' },
          { required: true, validator: checkName, trigger: 'blur' }
        ],
        labelName: [
          { required: true, message: '名称不能为空', trigger: 'blur' },
          { required: true, validator: checkName, trigger: 'blur' }
        ],
        parentName: [
          { required: true, message: '名称不能为空', trigger: 'blur' },
          { required: true, validator: checkName, trigger: 'blur' }
        ]
      },
      parentLabelData: [],
      labelName: '', // dialog名称
      predefineColors: [
        '#636060',
        '#000000',
        '#FF2525',
        '#FF6200',
        '#FCCA00',
        '#27B148',
        '#00C7FF',
        '#3291F8',
        '#A411D1',
        '#8CA2AA',
        '#505559',
        '#FF7272',
        '#FF9959',
        '#FEDD59',
        '#52CC6F',
        '#59DBFF',
        '#7AB8FB',
        '#C465E2',
        '#C1CDD1',
        '#C2C7CC',
        '#FFB3B3',
        '#FFC9A6',
        '#FEEDA6',
        '#7EE697',
        '#A6ECFF',
        '#B8D9FD',
        '#E0ACEF',
        '#EDF1F2',
        '#E1E3E6',
        '#FFE9E9',
        '#FFEFE5',
        '#FFFAE5',
        '#DDFAE4',
        '#E5FAFF',
        '#EBF4FF',
        '#F6E7FB'
      ]
    }
  },
  computed: {
    parentLableList() {
      const list = this.parentLabelData.filter(item => item.parentId === 0)
      return list
    },
    labelData() {
      const list = this.parentLabelData.filter(item => item.labelName)
      return list
    }
  },
  watch: {
    'digform.id'() {
      const obj = this.parentLabelData.find(item => item.id === this.digform.id)
      if (obj) this.digform.color = obj.labelColor
    }
  },
  mounted() {
    this.search()
    this.labelList()
  },
  methods: {
    labelList() {
      API.labelList(this.searchForm).then(res => {
        console.log('获取列表labelList', res)
        if (res.code === 200) {
          this.parentLabelData = res.data
        }
      })
    },
    search() {
      API.list(this.searchForm).then(res => {
        console.log('获取列表', res)
        if (res.code === 200) {
          this.tableData = res.rows
          this.total = res.total
        }
      })
    },
    pageChange(page) {
      console.log('当前页码', page)
      this.searchForm.pageNum = page.page
      this.search()
    },
    cancel() {
      this.dialogStatus = false
      this.$refs['digform'].resetFields()
    },
    add(status, labelName) {
      this.dialogStatus = true
      this.status = status
      this.labelName = labelName
      this.disabledInput = false
    },
    modify(row, status, labelName) {
      this.dialogStatus = true
      Object.keys(this.digform).forEach(item => {
        this.digform[item] = row[item]
      })
      console.log('编辑', this.digform, row)
      this.status = status
      this.labelName = labelName
      this.disabledInput = true
    },
    save() {
      console.log('提交参数', this.digform)
      this.$refs['digform'].validate(valid => {
        if (valid) {
          if (this.status === 'addParentLabel' || this.status === 'addLabel') {
            if (this.status === 'addParentLabel') {
              this.digform.parentId = this.digform.parentId || 0
              this.digform.id = undefined
              this.digform.labelName = this.digform.parentName
              this.digform.parentName = undefined
              this.digform.editLableName = undefined
            }
            if (this.status === 'addLabel') {
              this.digform.parentId = this.digform.id
              this.digform.id = undefined
              this.digform.parentName = undefined
              this.digform.color = undefined
              this.digform.editLableName = undefined
            }
            API.add(this.digform).then(res => {
              if (res.code == 200) {
                this.msgSuccess('添加成功')
                this.cancel()
                this.search();
                this.$router.push({ name: 'LabelClass' })
                this.dialogStatus = false
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            if (this.status === 'updateParentLabel') {
              this.digform.parentId = undefined
              this.digform.labelName = undefined
              this.digform.editLableName = undefined
            }
            if (this.status === 'updateLabel') {
              this.digform.labelName = this.digform.editLableName
              this.digform.editLableName = undefined
            }
            API.update(this.digform).then(res => {
              if (res.code == 200) {
                this.msgSuccess('修改成功')
                this.cancel()
                this.search();
                this.$router.push({ name: 'LabelClass' })
                this.dialogStatus = false
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.table {
  margin-top: 20px;
}
.form-grid {
  //display: grid;
  //grid-template-columns: 50% 50%;
  //margin-left: 5%;
  //.grid-item {
  //  width: 90%;
  //}
}
.demo-ruleForm {
  .el-form-item {
    //float: left;
  }
}
</style>
