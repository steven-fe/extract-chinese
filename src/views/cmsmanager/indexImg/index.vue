<template>
  <!--   大额充提提醒设置-->
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="searchForm" label-width="80px">
      <el-form-item label="标题:" prop="titles">
        <el-input v-model="searchForm.titles" />
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="status">
        <el-select v-model="searchForm.status" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in statusList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="search">{{$t('common.search')}}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" icon="el-icon-plus" @click="add">添加</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="table" :data="tableData" border style="width: 100%" class="table cabin-table">
      <!--      contents: "abc"-->
      <!--      createTime: null-->
      <!--      id: 1-->
      <!--      newsUrl: "www.baidu.com"-->
      <!--      picture: "sdasd"-->
      <!--      sort: 1-->
      <!--      status: 1-->
      <!--      titles: "456"-->
      <!--      updateTime: "2021-12-03T07:30:50.000+08:00"-->
      <!--      utime: "2021-12-03 07:30:50"-->
      <el-table-column :label="$t('common.operation')" align="center" width="230">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="modify(scope.row)">修改</el-button>
          <el-button type="primary" size="mini" @click="updateStatus(scope.row)">
            {{ scope.row.status === 1 ? '下线' : '上线' }}
          </el-button>
          <el-button type="primary" size="mini" @click="deleted(scope.row)">删除</el-button>
        </template>
      </el-table-column>
      <el-table-column type="index" label="id" align="center" />
      <el-table-column prop="titles" label="标题" align="center" />
      <el-table-column prop="contents" label="内容" align="center" />
      <el-table-column prop="picture" label="图片" align="center">
        <template slot-scope="scope">
          <img width="100px" :src="scope.row.picture" alt="">
        </template>
      </el-table-column>
      <el-table-column prop="newsUrl" label="跳转" align="center" />
      <el-table-column prop="sort" label="排序" align="center" />
      <el-table-column prop="status" :label="$t('common.status')" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.status === 1">上线</span>
          <span v-if="scope.row.status === 2">下线</span>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" align="center">
        <template slot-scope="scope">
          {{ scope.row.updateTime | dateFilter }}
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
    <el-dialog title="媒体链接管理" :visible.sync="dialogStatus" width="500px" :before-close="cancel" :close-on-click-modal="false">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        class="form-grid"
        label-width="120px"
      >
        <el-form-item class="grid-item" label="标题:" prop="titles">
          <el-input v-model="digform.titles" placeholder="" clearable :disabled="disabledInput" />
        </el-form-item>
        <el-form-item class="grid-item" label="内容:" prop="contents">
          <el-input v-model="digform.contents" placeholder="" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="跳转地址:" prop="newsUrl">
          <el-input v-model="digform.newsUrl" placeholder="" clearable />
        </el-form-item>
        <el-form-item class="grid-item" label="图片:" prop="picture">
          <!--          <el-input class="uploadInput" v-model="digform.picture" :readonly="true" placeholder="" clearable></el-input>-->
          <el-upload
            class="upload-demo"
            action="#"
            :show-file-list="false"
            :http-request="upload"
          >
            <!--            <el-button size="small" type="primary">上传</el-button>-->
            <img v-if="digform.picture" :src="digform.picture" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
        <el-form-item class="grid-item" label="排序:" prop="sort">
          <el-input v-model="digform.sort" placeholder="" clearable />
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
import * as API from '@/api/indexImg'
import dayjs from 'dayjs'

export default {
  name: 'BignumRemind',
  filters: {
    dateFilter(time) {
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  data() {
    return {
      disabledInput: false,
      statusList: [
        { label: '上线', value: 1 },
        { label: '下线', value: 2 }
      ],
      total: 0,
      searchForm: {
        titles: '',
        status: '',
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      dialogStatus: false,
      status: '', // add新增，update修改
      digform: {
        titles: '',
        contents: '',
        picture: '',
        newsUrl: '',
        sort: '',
        id: undefined
      },
      rules: {
      }
    }
  },
  mounted() {
    this.search()
  },
  methods: {
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
    add() {
      this.dialogStatus = true
      this.status = 'add'
      this.digform.id = undefined
    },
    modify(row) {
      this.dialogStatus = true
      Object.keys(this.digform).forEach(item => {
        this.digform[item] = row[item]
      })
      this.status = 'update'
    },
    save() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          console.log('提交参数', this.digform)
          if (this.status === 'update') {
            API.update(this.digform).then(res => {
              if (res.code == 200) {
                this.msgSuccess('修改成功')
                this.cancel()
                this.search()
                this.dialogStatus = false
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
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
        }
      })
    },
    // 图片上传
    upload(data) {
      API.upload({ file: data.file }).then(res => {
        // fullPath: "https://coinstore-sg-encryption.s3.ap-southeast-1.amazonaws.com/filesUpload/ex1/public/bc8b6aeebee54a16aac0e69a97c671b0_1638776160054.txt"
        // path: "filesUpload/ex1/public/bc8b6aeebee54a16aac0e69a97c671b0_1638776160054.txt"
        if (res.code === 200) {
          this.digform.picture = res.data.fullPath
          this.$message.success(this.$t('common.uploadSucceeded'))
        }
      })
    },
    deleted(row) {
      // status; 状态 1开启 0关闭
      API.deleted({ id: row.id }).then(res => {
        if (res.code === 200) {
          this.msgSuccess('删除成功')
          this.search()
        }
      })
    },
    updateStatus(row) {
      // status; 状态 1开启 0关闭
      const status = row.status === 1 ? 2 : 1
      API.updateStatus({ id: row.id, status }).then(res => {
        if (res.code === 200) {
          this.msgSuccess('修改成功')
          this.search()
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep .uploadInput{
  width: 250px;
}
::v-deep .upload-demo {
  display: inline-block;
  margin-left: 10px;
  .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
}
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
