<template>
  <div class="app-container">
    <!-- <el-table v-loading="loading" :data="fileList" border>
      <el-table-column label="序号" align="center" type="index" />
      <el-table-column label="目标地址" align="center">
        <template slot-scope="scope">
          <span>{{scope.row}}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" align="center" width="150">
        <template slot-scope="scope">
    <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>-->
    <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
    >删除</el-button>-->
    <!-- </template>
      </el-table-column>
    </el-table>-->

    <!-- <el-dialog :title="title" :visible.sync="open"> -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="12">
        <el-form ref="form" :model="form" label-width="100px">
          <el-row :gutter="6" class="mb8">
            <el-form-item label="目标地址：">
              <el-col :span="18">
                <el-input v-model="form.fullPath" size="mini" />
              </el-col>
              <el-col :span="1.5">
                <el-button type="success" size="mini" @click="handleConfig">导 入</el-button>
              </el-col>
              <el-col :span="3">
                <el-button type="primary" size="mini" @click="submitForm">{{$t('common.sure')}}</el-button>
              </el-col>
            </el-form-item>
          </el-row>
          <el-form-item label="内容：">
            <el-input v-model="form.textContext" type="textarea" :disabled="falg" rows="25" />
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <!-- </el-dialog> -->
  </div>
</template>

<script>
import {
  readerFile,
  updateFile,
  findFileList,
  delFile
} from '@/api/upload/upload'
export default {
  name: '',

  data() {
    return {
      form: {
        fullPath: undefined,
        textContext: undefined
      },
      loading: true,
      falg: true
    }
  },
  created() {
    this.findList()
  },
  methods: {
    handleConfig() {
      this.form.textContext = '导入中...'
      readerFile(this.form.fullPath).then(response => {
        if (response.code === 200) {
          this.form.textContext = response.data
          this.falg = false
        } else {
          this.msgError(response.msg)
        }
      })
    },
    findList() {
      findFileList().then(response => {
        if (response.code === 200) {
          this.form.fullPath = response.data
          this.loading = false
        } else {
          this.msgError(response.msg)
        }
      })
    },
    submitForm() {
      const data = {
        configUrl: this.form.fullPath,
        textContext: this.form.textContext
      }
      updateFile(data).then(response => {
        if (response.code === 200) {
          this.msgSuccess('修改成功')
          this.handleConfig()
        } else {
          this.msgError(response.msg)
        }
      })
    }
    // handleUpdate(row) {
    //   this.open = true;
    //   this.title = "修改内容";
    //   this.form.fullPath = row;
    //   this.handleConfig();
    // }
    // /** 删除按钮操作 */
    // handleDelete(row) {
    //   const fullPath = row;
    //   this.$confirm("是否确认删除该数据文件?", "警告", {
    //     confirmButtonText: "确定",
    //     cancelButtonText: "取消",
    //     type: "warning"
    //   })
    //     .then(function() {
    //       return delFile(fullPath);
    //     })
    //     .then(() => {
    //       this.getList();
    //       this.msgSuccess("删除成功");
    //     })
    //     .catch(function() {});
    // }
  }
}
</script>

<style scoped>
</style>
