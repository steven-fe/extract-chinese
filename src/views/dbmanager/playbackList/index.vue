<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="上线状态:" prop="onLine">
        <el-select v-model="queryParams.onLine" clearable size="mini">
          <el-option :key="-1" :label="$t('common.all')" value="" />
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="直播主题" prop="liveTopic">
        <el-input v-model="queryParams.liveTopic" size="mini" clearable />
      </el-form-item>
      <el-form-item label="回放ID" prop="id">
        <el-input v-model="queryParams.id" size="mini" clearable />
      </el-form-item>
      <el-form-item label="直播ID" prop="liveId">
        <el-input v-model="queryParams.liveId" size="mini" clearable />
      </el-form-item>
      <el-form-item label="直播语言" prop="langurageEnv">
        <el-select v-model="queryParams.langurageEnv" size="mini" clearable>
          <el-option :key="-1" :label="$t('common.all')" value="" />
          <el-option v-for="item in languageOptions" :key="item.key" :label="item.language" :value="item.key" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >查找</el-button>
        <!-- <el-button type="primary"
                            size="mini"
                            @click="add">添加直播</el-button> -->
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      :data="dataList"
      border
    >
      <el-table-column
        :label="$t('common.operation')"
        align="center"
        width="400"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="handleEdit(scope.row)"
          >修改
          </el-button>
          <el-button v-if="scope.row.onLine === 0" size="mini" type="success" @click="handleOnline(scope.row)">上线</el-button>
          <el-button v-if="scope.row.onLine === 1" size="mini" type="danger" @click="handleOnline(scope.row)">下线</el-button>
          <el-button size="mini" type="primary" @click="deleted(scope.row)">删除</el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="回放ID"
        align="center"
        prop="id"
      />
      <el-table-column
        label="直播ID"
        align="center"
        prop="liveId"
      />
      <el-table-column
        label="排序权重"
        align="center"
        prop="sort"
      />
      <el-table-column
        label="直播主题"
        align="center"
        prop="liveTopic"
        width="150"
      />
      <el-table-column
        label="直播简介"
        align="center"
        prop="liveContent"
        :show-overflow-tooltip="true"
        width="200"
      />
      <el-table-column
        label="直播封面"
        align="center"
        prop="coverUrl"
        width="150"
      >
        <template slot-scope="scope">
          <img class="logo" :src="scope.row.coverUrl" alt="">
        </template>
      </el-table-column>
      <el-table-column
        label="语言"
        align="center"
        prop="langurageEnv"
      >
        <template slot-scope="scope">
          {{ language(scope.row.langurageEnv) }}
        </template>
      </el-table-column>
      <el-table-column
        label="当前状态"
        align="center"
        prop="onLine"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.onLine === 0">下线</span>
          <span v-if="scope.row.onLine === 1">上线</span>
        </template>
      </el-table-column>
      <el-table-column
        label="累计观看人数"
        align="center"
        prop="accumulateWatch"
        width="150"
      />
      <el-table-column
        label="虚增累计观看人数"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.wateredCount }}</span>
          <el-button
            size="mini"
            type="primary"
            style="margin-left:20px"
            @click="editNum(scope.row)"
          >
            修改
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 修改回放弹窗 -->
    <el-dialog
      title="回放信息"
      :visible.sync="open"
      :close-on-click-modal="false"
      width="550px"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        label-width="90px"
        label-position="left"
        class="form-grid"
      >
        <el-form-item label="直播主题:" class="grid-item">
          <el-input v-model="editForm.liveTopic" type="text" maxlength="40" show-word-limit clearable placeholder="请输入直播主题,最大40个字符" />
        </el-form-item>
        <el-form-item label="直播简介:" class="grid-item">
          <el-input
            v-model="editForm.liveContent"
            type="textarea"
            :rows="5"
            placeholder="请输入直播简介,最大200个字符"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="直播封面:" class="grid-item" prop="coverUrl">
          <el-upload
            class="upload-demo"
            action="#"
            :data="{property: `editForm.coverUrl`}"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
          >
            <el-input v-model="editForm.coverUrl" placeholder="点击上传直播封面" style="width: 405px" clearable />
          </el-upload>
          <span style="color:red">封面尺寸 100*100 </span>
        </el-form-item>
        <el-form-item label="直播语种:" class="grid-item">
          <el-checkbox-group v-model="editForm.langurageEnv">
            <el-checkbox v-for="(item, index) in languageOptions" :key="index" :label="item.key">{{ item.language }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="排序权重" class="grid-item">
          <el-input v-model="editForm.sort" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open=false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="handleSubmit">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
    <!-- 虚增累计观看人数修改弹窗 -->
    <el-dialog title="虚增累计观看人数修改" :visible.sync="open1" :close-on-click-modal="false" width="300px">
      <el-form ref="editForm1" :model="editForm1">
        <el-form-item label="虚增累计观看人数:">
          <el-input v-model="editForm1.wateredCount" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open1 = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="edit1">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { playbackpageList, playbackLive, deletePlayback, Edit } from '@/api/broadcast/playbackList'
import { upload } from '@/api/indexImg'
import { listConfig } from '@/api/system/languageconfig'
export default {
  name: 'PlaybackList',
  data() {
    return {
      value: true,
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 语言选项
      languageOptions: [],
      // 直播列表
      dataList: [],
      checkList: ['en'],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        onLine: '',
        liveTopic: '',
        id: '',
        liveId: '',
        langurageEnv: ''
      },
      // 弹窗
      open: false,
      open1: false,
      fixInfo: {
        id: ''
      },
      // 修改参数
      editForm: {
        id: '',
        liveTopic: '',
        liveContent: '',
        coverUrl: '',
        langurageEnv: '',
        sort: ''
      },
      editForm1: {
        wateredCount: ''
      },
      statusOptions: [
        {
          value: '0',
          label: '下线'
        },
        {
          value: '1',
          label: '上线'
        }
      ]
    }
  },
  created() {
    this.getList()
    this.getLanguageselect()
  },
  methods: {
    /** 语言下拉结构 */
    getLanguageselect() {
      listConfig().then((response) => {
        this.languageOptions = response.rows
      })
    },
    /** 回放列表 */
    getList() {
      playbackpageList(this.queryParams).then(response => {
        this.dataList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    handleEdit(row) {
      this.open = true
      this.fixInfo.id = row.id
      this.editForm = Object.assign({}, row)
      console.log(123)
      if (this.editForm.langurageEnv) {
        this.editForm.langurageEnv = this.editForm.langurageEnv.split(',').filter(item => !!item)
      } else {
        this.editForm.langurageEnv = []
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 添加直播弹窗
    add() {
      this.open = true
    },

    handleSubmit() {
      const params = {
        id: this.fixInfo.id,
        liveContent: this.editForm.liveContent,
        coverUrl: this.editForm.coverUrl,
        sort: this.editForm.sort,
        liveTopic: this.editForm.liveTopic,
        langurageEnv: this.editForm.langurageEnv.join(',')
      }
      Edit(params).then(response => {
        if (response.code === 200) {
          this.msgSuccess('修改成功')
          this.open = false
          this.getList()
        }
      })
    },
    // 上下线
    handleOnline(row) {
      Edit({ id: row.id, onLine: row.onLine === 0 ? 1 : 0 }).then(response => {
        if (response.code === 200) {
          this.msgSuccess(row.onLine === 0 ? '上线成功' : '下线成功')
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 删除按钮
    deleted(row) {
      deletePlayback({ id: row.id }).then(response => {
        if (response.code === 200) {
          this.msgSuccess('删除成功')
          this.getList()
        }
      })
    },
    language(str) {
      if (str) {
        const strLang = str.split(',').map(item => {
          const obj = this.languageOptions.find(el => el.key === item)
          return obj ? obj.language : ''
        }).join(',')
        return strLang
      }
      return ''
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
    },
    // 修改观看人数
    editNum(row) {
      this.open1 = true
      this.editForm1.wateredCount = row.wateredCount
      this.fixInfo.id = row.id
    },
    edit1() {
      Edit({ id: this.fixInfo.id, wateredCount: this.editForm1.wateredCount }).then(response => {
        if (response.code === 200) {
          this.msgSuccess('修改成功')
          this.open1 = false
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.modify {
 ::v-deep .el-form-item__error {
  left: 110px;
 }
}
::v-deep {
  .el-button + .el-button {
    margin-left: 10px;
  }
  .el-dialog {
    display: flex;
    flex-direction: column;
    margin:0 !important;
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    .el-col {
      margin-right: 10px;
    }
    .el-form-item--medium .el-form-item__label {
      padding: 0;
    }
  }
  .el-form-item {
    margin: 0 15px 20px 0;
    .modify{
      font-size: 30px;
      font-weight: bold;
      text-align: center;
      display: block;
    }
  }
  .el-form-item__content {
    line-height: 30px;
  }
  .el-icon-circle-plus-outline{
    font-size: 50px;
    margin-top: 20px;
  }
}
.upload-demo {
  float: left;
  width: 100%;
}
.logo {
  width: 80px;
}
// .form-grid {
//   display: grid;
//   .grid-item {
//     width: 90%;
//   }
// }
</style>
