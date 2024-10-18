<template>
  <!-- 大额充提提醒设置 -->
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="searchForm" label-width="80px">
      <!--      <el-form-item label="标签分类:" prop="parentId">-->
      <!--        <el-select v-model="searchForm.parentId" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')" @change="searchParentLabel" >-->
      <!--          <el-option-->
      <!--              v-for="item in parentLableList"-->
      <!--              :key="item.id"-->
      <!--              :label="item.parentName"-->
      <!--              :value="item.id">-->
      <!--          </el-option>-->
      <!--        </el-select>-->
      <!--      </el-form-item>-->
      <!--      <el-form-item label="客户标签:" prop="id">-->
      <!--        <el-select v-model="searchForm.id" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">-->
      <!--          <el-option-->
      <!--              v-for="item in labelData"-->
      <!--              :key="item.id"-->
      <!--              :label="item.labelName"-->
      <!--              :value="item.id">-->
      <!--          </el-option>-->
      <!--        </el-select>-->
      <!--      </el-form-item>-->
      <!--      <el-form-item :label="$t('dwmanager.userUID')" prop="uid">-->
      <!--        <el-input v-model="searchForm.uid" placeholder="" clearable ></el-input>-->
      <!--      </el-form-item>-->
      <!--      <el-form-item>-->
      <!--        <el-button type="primary" icon="el-icon-search" size="mini" @click="search">{{$t('common.search')}}</el-button>-->
      <!--      </el-form-item>-->
      <el-form-item>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="setWeight">排序</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="add">添加</el-button>
      </el-form-item>
    </el-form>

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
      <el-table-column prop="showPrecision" :label="$t('common.operation')" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="modify(scope.row)">修改</el-button>
          <el-button type="primary" size="mini" @click="update(scope.row)">{{ scope.row.state === 1 ? '下线' : '上线' }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="names" label="分组名称" align="center">
        <template slot-scope="scope">
          {{ scope.row.defaultName }}
        </template>
      </el-table-column>
      <el-table-column prop="weight" label="排序" align="center" />
      <el-table-column prop="languageCode" label="语种" align="center" />
      <el-table-column prop="createdAt" label="创建时间" align="center" :formatter="({ createdAt }) => timeFormat(createdAt)">
        <template slot-scope="scope">
          {{ scope.row.createdAt | timeFormat }}
        </template>
      </el-table-column>
      <el-table-column prop="createdName" label="创建人" align="center" />
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogStatus" width="500px" :before-close="cancel" :close-on-click-modal="false">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        class="form-grid"
        label-width="130px"
      >
        <el-form-item v-for="(item, index) of languageOptions" :key="index" class="grid-item" :label="`${item.language}-分组名称:`" :prop="`names.${item.key}`">
          <el-input v-model="digform.names[item.key]" placeholder="" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogStatus = false">{{$t('common.cancel')}}</el-button>
        <el-button size="mini" type="primary" @click="save">保 存</el-button>
      </div>
    </el-dialog>
    <el-dialog title="排序" :visible.sync="weightDialogStatus" width="500px" :close-on-click-modal="false">
      组别名称和排序
      <br>
      <el-tree
        :data="weightData"
        node-key="id"
        :props="defaultProps"
        default-expand-all
        draggable
        :allow-drop="allowDrop"
        :allow-drag="allowDrag"
      />
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="weightDialogStatus = false">{{$t('common.cancel')}}</el-button>
        <el-button size="mini" type="primary" @click="setWeightSave">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import * as API from '@/api/blogs'
import { listConfig } from '@/api/system/languageconfig'
import dayjs from 'dayjs'

export default {
  name: 'LabelClass',
  data() {
    return {
      weightData: [],
      defaultProps: {
        children: 'children',
        label: 'defaultName'
      },
      dialogTitle: '',
      languageOptions: [],
      disabledInput: false,
      total: 0,
      searchForm: {
        // parentId: '',
        // id: '',
        // uid: '',
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      weightDialogStatus: false,
      dialogStatus: false,
      status: '', // addParentLabel新增，updateParentLabel修改, addLabel新增客户标签, updateLabel修改客户标签
      digform: {
        createdName: '',
        languageCode: '',
        defaultName: '',
        state: 1,
        weight: 1,
        names: { en_US: '' } // { "zh_CN":"分组1", "en_US":"one1" }
      },
      rules: {
        'names.en_US': [
          { required: true, message: '内容不能为空', trigger: 'blur' }
        ]
      },
      parentLabelData: [],
      labelName: '' // dialog名称
    }
  },
  mounted() {
    this.search()
    // this.labelList()
    this.getLanguageselect()
  },
  methods: {
    setWeightSave() {
      const params = { contentGroupList: [] }
      this.weightData.forEach((item, index) => {
        params.contentGroupList.push({ id: item.id, weight: 4 - index })
      })
      API.setWeight(params).then(res => {
        if (res.code === 200) {
          this.msgSuccess('更新成功')
          this.search()
          this.weightDialogStatus = false
        }
      })
    },
    setWeight() {
      this.weightDialogStatus = true
      API.getGroupList().then(res => {
        if (res.code === 200) {
          this.weightData = res.data
        }
      })
    },
    /** 语言下拉结构 */
    getLanguageselect() {
      listConfig().then(response => {
        this.languageOptions = response.rows.filter(item => item.isOpen === 1)
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
      // this.$refs['digform'].resetFields()
    },
    modify(row) {
      console.log('当前数据', row)
      this.dialogStatus = true
      this.dialogTitle = '修改'
      this.digform = { ...row, names: { ...row.names }}
    },
    add() {
      this.dialogStatus = true
      this.dialogTitle = '新增'
      this.digform = this.$options.data().digform
      console.log('this.digform', this.digform)
    },
    save() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          this.digform.defaultName = this.digform.names.en_US
          this.digform.languageCode = Object.keys(this.digform.names).join(',')
          this.digform.createdName = this.$store.state.user.name
          console.log('params', this.digform)
          API.add(this.digform).then(res => {
            if (res.code == 200) {
              this.msgSuccess('添加成功')
              this.cancel()
              this.search()
              this.dialogStatus = false
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    },
    update(row) {
      API.update({ id: row.id, state: row.state === 1 ? 2 : 1 }).then(res => {
        if (res.code === 200) {
          this.msgSuccess('更新成功')
          this.search()
        }
      })
    },
    allowDrop(draggingNode, dropNode, type) {
      return type !== 'inner'
    },
    allowDrag(draggingNode) {
      console.log('tree-node-drag-start', draggingNode)
      return true
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
