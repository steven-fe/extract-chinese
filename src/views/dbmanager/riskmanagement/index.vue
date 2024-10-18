<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="直播ID" prop="liveId">
        <el-input v-model="queryParams.liveId" size="mini" clearable />
      </el-form-item>
      <el-form-item label="UID" prop="strUid">
        <el-input v-model="queryParams.strUid" size="mini" clearable />
      </el-form-item>
      <el-form-item label="违规记录" prop="type">
        <el-select v-model="queryParams.type" clearable size="mini">
          <el-option :key="-1" :label="$t('common.all')" value="" />
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否在黑名单" prop="inBlacklist">
        <el-select v-model="queryParams.inBlacklist" size="mini" clearable>
          <el-option :key="-1" :label="$t('common.all')" value="" />
          <el-option v-for="item in inBlacklistOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >查询</el-button>
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
        width="200"
      >
        <template slot-scope="scope">
          <el-button v-if="scope.row.inBlacklist === 0" size="mini" type="danger" @click="handleBlack( 1,scope.row.id)">拉黑</el-button>
          <el-button v-if="scope.row.inBlacklist === 1" size="mini" type="success" @click="handleBlack( 0,scope.row.id)">移除拉黑</el-button>
          <el-button
            size="mini"
            type="primary"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="违规时间"
        align="center"
        prop="violationTs"
        width="120"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.violationTs) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="UID"
        align="center"
        prop="strUid"
      />
      <el-table-column
        label="直播ID"
        align="center"
        prop="liveId"
      />
      <el-table-column
        label="违规记录"
        align="center"
        prop="type"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.type === 0">被禁言</span>
          <span v-if="scope.row.type === 1">被撤销评论</span>
        </template>
      </el-table-column>
      <el-table-column
        label="违规处理人"
        align="center"
        prop="violationOperator"
        width="150"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.violationOperator === 0">主播</span>
          <span v-if="scope.row.violationOperator === 1">管理员</span>
        </template>
      </el-table-column>
      <el-table-column
        label="是否在黑名单"
        align="center"
        prop="inBlacklist"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.inBlacklist === 0">否</span>
          <span v-if="scope.row.inBlacklist === 1">是</span>
        </template>
      </el-table-column>
      <el-table-column
        label="拉黑时间"
        align="center"
        prop="blackenTs"
        width="120"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.blackenTs) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="拉黑操作人"
        align="center"
        prop="blackenOperator"
      />
      <el-table-column
        label="移除黑名单时间"
        align="center"
        prop="removeBlacklistTs"
        width="120"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.removeBlacklistTs) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="移除黑名单操作人"
        align="center"
        prop="removeBlacklistOperator"
      />
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <!-- 拉黑/移除拉黑违规人 -->
    <el-dialog
      title="提示"
      :visible.sync="open"
      width="30%"
    >
      <span>确定要{{ contentText }}该违规人吗?</span>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="open = false">{{$t('common.cancel')}}</el-button>
        <el-button
          type="primary"
          @click="handleChange"
        >{{$t('common.sure')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { riskList, riskDelete, blacklistOperation } from '@/api/broadcast/risk'
export default {
  name: 'Riskmanagement',
  data() {
    return {
      value: true,
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 直播列表
      dataList: [],
      open: false,
      open1: false,
      contentText: '',
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        strUid: '',
        type: '',
        inBlacklist: '',
        liveId: ''
      },
      fixInfo: {
        inBlacklist: '',
        id: ''
      },
      typeOptions: [
        {
          value: '0',
          label: '被禁言'
        },
        {
          value: '1',
          label: '被撤回评论'
        }
      ],
      inBlacklistOptions: [
        {
          value: '0',
          label: '否'
        },
        {
          value: '1',
          label: '是'
        }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 风控列表 */
    getList() {
      riskList(this.queryParams).then(response => {
        this.dataList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 拉黑/移除拉黑
    handleBlack(inBlacklist, id) {
      if (inBlacklist == 0) {
        this.contentText = '移除拉黑'
      } else {
        this.contentText = '拉黑'
      }
      this.open = true
      this.fixInfo.inBlacklist = inBlacklist
      this.fixInfo.id = id
    },
    handleChange() {
      this.open = false
      this.$confirm('请再次确认是否进行当前该操作', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        blacklistOperation({ id: this.fixInfo.id, blackOperationType: this.fixInfo.inBlacklist })
          .then(response => {
            this.$message({
              type: 'success',
              message: this.$t('common.operationSucceed')
            })
            this.getList()
          })
          .catch(error => {
            console.log(error)
          })
      })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
    },

    // 删除
    handleDelete(row) {
      riskDelete({ id: row.id }).then(response => {
        this.msgSuccess('删除成功')
        this.getList()
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
.dividing-line {
  position: relative;
  height: 30px;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 100%;
    border: 1px dashed #ccc;
    z-index: 3;
  }

  span {
    position: absolute;
    top: 50%;
    left: 50%;
    display: block;
    padding: 0 10px;
    background: #fff;
    transform: translate(-50%, -50%);
    z-index: 4;
  }
}
</style>
