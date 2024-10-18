<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="90px"
    >
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="做市商ID" prop="id">
        <el-input
          v-model="queryParams.id"
          placeholder="请输入做市商ID"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="加入时间" prop="time">
        <el-date-picker
          v-model="time"
          size="mini"
          type="datetimerange"
          :range-separator="$t('common.toTime')"
          :start-placeholder="$t('common.startTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item label="做市商等级" prop="levelId">
        <el-select
          v-model="queryParams.levelId"
          size="mini"
          clearable
          placeholder="请选择做市商等级"
        >
          <el-option
            v-for="(item, index) in levelIdOptions"
            :key="index"
            :label="item.levelName + '做市商'"
            :value="item.levelId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="账号状态" prop="openFlag">
        <el-select
          v-model="queryParams.openFlag"
          size="mini"
          clearable
          placeholder="请选择账号状态"
        >
          <el-option
            v-for="(item, index) in openFlagOptions"
            :key="index"
            :label="item.openFlagName"
            :value="item.openFlag"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否备注" prop="remarkFlag">
        <el-select
          v-model="queryParams.remarkFlag"
          size="mini"
          clearable
          placeholder="请选择是否备注"
        >
          <el-option
            v-for="(item, index) in remarkFlagOptions"
            :key="index"
            :label="item.remarkFlagName"
            :value="item.remarkFlag"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >{{$t('common.search')}}</el-button>
        <el-button
          icon="el-icon-refresh"
          size="mini"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['coinbull:marketgrant:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增做市商
        </el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="grantList" border>
      <el-table-column label="做市商ID" align="center" prop="id">
        <template slot-scope="scope">
          <el-link
            :underline="false"
            type="primary"
            @click="toUserInfo(scope.row, 1)"
          >{{ scope.row.id }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="用户ID" align="center" prop="userId">
        <template slot-scope="scope">
          <el-link
            :underline="false"
            type="primary"
            @click="toUserInfo(scope.row, 2)"
          >{{ scope.row.userId }}</el-link>
        </template>
      </el-table-column>
      <!-- <el-table-column label="授权API接口" align="center" prop="grantApi">
        <template slot-scope="scope">
          <span v-for="opt in grantApiOptions" :key="opt.grantApi">
            <span v-for="(item, index) in scope.row.grantApi" :key="index">
              <span v-if="item==opt.grantApi">{{opt.grantApiName}}<br></span>
            </span>
          </span>
        </template>
      </el-table-column> -->
      <el-table-column label="加入做市商时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="做市商等级" align="center" prop="levelId">
        <template slot-scope="scope">
          <span v-if="scope.row.levelId">
            <span v-for="opt in levelIdOptions" :key="opt.levelId">
              <span v-if="scope.row.levelId == opt.levelId">{{
                opt.levelName + "做市商"
              }}</span>
            </span>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="做市币种" align="center" prop="marginCoin" />
      <el-table-column label="有效邀请人数" align="center" prop="inviteEffNum">
        <template slot-scope="scope">
          <el-link
            :underline="false"
            type="primary"
            @click="toUserInfo(scope.row, 3)"
          >{{ scope.row.inviteEffNum }}</el-link>
        </template>
      </el-table-column>
      <!-- <el-table-column label="授权结束日期" align="center" prop="endDate" >
        <template slot-scope="scope">
          <span>{{ getDateYMD(scope.row.endDate, '-') }}</span>
        </template>
      </el-table-column> -->
      <el-table-column :label="$t('common.remarks')" align="center" prop="remark">
        <template slot-scope="scope">
          <span v-if="scope.row.remark">{{ scope.row.remark }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <!-- <el-table-column :label="$t('financemanager.operator')" align="center" prop="updateBy" /> -->
      <!-- <el-table-column label="操作时间" align="center" prop="updateTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="做市账号状态" align="center" prop="openFlag">
        <template slot-scope="scope">
          <span v-if="scope.row.openFlag == 1">正常</span>
          <span v-else-if="scope.row.openFlag == 2">暂停做市资格</span>
          <span v-else>封禁</span>
        </template>
      </el-table-column>
      <!-- <el-table-column
        :label="$t('common.operation')"
        align="center"
        class-name="small-padding fixed-width"
        width="120px"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['coinbull:marketgrant:edit']"
            >修改</el-button
          > -->
      <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['coinbull:marketgrant:remove']"
          >删除</el-button> -->
      <!-- </template>
      </el-table-column> -->
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <!-- 添加或修改做市商用户授权对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="用户ID" prop="userId">
          <el-input
            v-model="form.userId"
            placeholder="请输入用户ID"
            :disabled="inputFlag"
          />
        </el-form-item>
        <el-form-item label="做市商等级" prop="levelId">
          <el-select
            v-model="form.levelId"
            style="width: 100%"
            placeholder="请选择做市商等级"
          >
            <el-option
              v-for="(item, index) in levelIdOptions"
              :key="index"
              :label="item.levelName + '做市商'"
              :value="item.levelId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="做市币种" prop="marginCoinData">
          <!-- <el-select
            v-model="form.marginCoinData"
            multiple
            style="width: 100%"
            placeholder="请选择授权币种"
          >
            <el-option
              v-for="(item, index) in marList"
              :key="index"
              :label="item.marginCoin"
              :value="item.marginCoin"
            >
            </el-option>
          </el-select> -->
          <el-checkbox-group
            v-model="form.marginCoinData"
            @change="handleChange"
          >
            <el-checkbox
              v-for="(item, index) in marList"
              :key="index"
              :label="item"
            ><span>{{ item }}</span>
              <el-input
                v-model="val[item]"
                placeholder="最低保证金"
                :disabled="disabled[index]"
                class="box-input"
                size="mini"
              /></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <!-- <el-form-item label="授权API接口" prop="grantApiData">
          <el-select v-model="form.grantApiData" multiple placeholder="请选择授权API接口">
            <el-option
              v-for="item in grantApiOptions"
              :key="item.grantApi"
              :label="item.grantApiName"
              :value="item.grantApi">
            </el-option>
          </el-select>
        </el-form-item> -->
        <!-- <el-form-item label="授权开始日期" prop="startDate">
          <el-date-picker
            clearable
            style="width: 100%"
            v-model="form.startDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择授权开始日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="授权结束日期" prop="endDate">
          <el-date-picker
            clearable
            style="width: 100%"
            v-model="form.endDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择授权结束日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="授权开关" prop="openFlag">
          <el-radio-group v-model="form.openFlag" placeholder="请选择授权开关">
            <el-radio label="0">关闭</el-radio>
            <el-radio label="1">开启</el-radio>
          </el-radio-group>
        </el-form-item> -->
        <el-form-item :label="$t('common.remarks')" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{$t('common.sure')}}</el-button>
        <el-button @click="cancel">{{$t('common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listGrant,
  getGrant,
  addGrant,
  exportGrant
} from '@/api/marketgrant/grant'
import { listCoinMar } from '@/api/contract/margin'
import { levelList } from '@/api/marketgrant/marketLevel'

export default {
  name: 'MarketGrant',
  data() {
    var checkQuota = (rule, value, callback) => {
      value.forEach((element) => {
        if (!this.val[element]) {
          callback(new Error('请选择币种并输入限额'))
        }
      })
      if (value === '') {
        callback(new Error('请选择币种'))
      } else {
        callback()
      }
    }
    return {
      // 遮罩层
      loading: true,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 币种列表
      levelIdOptions: [],
      disabled: [],
      openFlagOptions: [
        {
          openFlag: 0,
          openFlagName: '封禁'
        },
        {
          openFlag: 1,
          openFlagName: '正常'
        },
        {
          openFlag: 2,
          openFlagName: '暂停做市资格'
        }
      ],
      remarkFlagOptions: [
        {
          remarkFlag: 1,
          remarkFlagName: '是'
        },
        {
          remarkFlag: 2,
          remarkFlagName: '否'
        }
      ],
      val: [],
      marList: [],
      inputFlag: false,
      // API接口列表
      // grantApiOptions: [
      //   {
      //     grantApi: "/coinbull/marketUser",
      //     grantApiName: "首页",
      //   },
      //   {
      //     grantApi: "/coinbull/marketUser/invitationDetail",
      //     grantApiName: "邀请列表",
      //   },
      //   {
      //     grantApi: "/coinbull/market/makerdaily",
      //     grantApiName: "做市日报",
      //   },
      //   {
      //     grantApi: "/coinbull/market/transaction",
      //     grantApiName: "交易记录",
      //   },
      // ],
      // 总条数
      total: 0,
      // 做市商用户授权表格数据
      grantList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      time: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        beginTime: undefined,
        endTime: undefined,
        userId: undefined,
        id: undefined,
        levelId: undefined,
        openFlag: undefined,
        remarkFlag: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        userId: [
          { required: true, message: '用户ID不能为空', trigger: 'blur' }
        ],
        levelId: [
          { required: true, message: '做市商等级不能为空', trigger: 'blur' }
        ],
        marginCoinData: [
          {
            required: true,
            message: '授权币种（保证金币种）不能为空',
            trigger: 'blur'
          },
          { validator: checkQuota, trigger: 'blur' }
        ]
        // grantApiData: [
        //   { required: true, message: "授权API接口不能为空", trigger: "blur" }
        // ],
        // startDate: [
        //   { required: true, message: "授权开始日期不能为空", trigger: "blur" },
        // ],
        // endDate: [
        //   { required: true, message: "授权结束日期不能为空", trigger: "blur" },
        // ],
        // openFlag: [
        //   { required: true, message: "授权开关不能为空", trigger: "blur" },
        // ],
      }
    }
  },
  created() {
    this.getMarLevelList()
    this.getMarList()
    this.getList()
  },
  methods: {
    // 做市等级列表
    getMarLevelList() {
      levelList().then((response) => {
        if (response.code == 200) {
          if (this.levelIdOptions) {
            this.levelIdOptions = response.rows
          }
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 商品id列表
    getMarList() {
      listCoinMar().then((response) => {
        if (response.code == 200) {
          if (this.marList) {
            response.rows.forEach((e) => {
              this.marList.push(e.marginCoin)
              this.disabled.push(true)
            })
          }
        } else {
          this.msgError(response.msg)
        }
      })
    },
    /** 查询做市商用户授权列表 */
    getList() {
      this.loading = true
      this.queryParams.beginTime = (this.time && this.time[0]) || ''
      this.queryParams.endTime = (this.time && this.time[1]) || ''
      listGrant(this.queryParams).then((response) => {
        this.grantList = response.rows
        this.grantList.forEach((element) => {
          if (element.grantApi != null) {
            element.grantApi = element.grantApi.split(',')
          }
          // if (element.marginCoin != null) {
          //   element.marginCoin = element.marginCoin.split(",");
          // }
        })
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        userId: undefined,
        marginCoinData: [],
        grantApiData: undefined,
        startDate: undefined,
        endDate: undefined,
        openFlag: undefined,
        remark: undefined,
        limitAmt: undefined,
        limitAmtData: []
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.time = undefined
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.inputFlag = false
      this.title = '添加做市商用户授权'
    },
    /** 修改按钮操作 */
    // handleUpdate(row) {
    //   this.reset();
    //   const id = row.id || this.ids;
    //   getGrant(id).then((response) => {
    //     this.form = response.data;
    //     this.$set(this.form, "grantApiData", []);
    //     this.form.grantApiData = response.data.grantApi.split(",");
    //     this.$set(this.form, "marginCoinData", []);
    //     this.form.marginCoinData = response.data.marginCoin.split(",");
    //     this.form.openFlag = response.data.openFlag + "";
    //     this.open = true;
    //     this.inputFlag = true;
    //     this.title = "修改做市商用户授权";
    //   });
    // },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          // this.form.grantApi = "/coinbull/marketUser";
          this.form.marginCoin = this.form.marginCoinData.join(',')
          this.form.marginCoinData.forEach((element) => {
            if (this.val[element]) {
              this.form.limitAmtData.push(element + ':' + this.val[element])
            }
          })
          this.form.limitAmt = this.form.limitAmtData.join(',')
          this.form.openFlag = 1
          addGrant(this.form).then((response) => {
            if (response.code === 200) {
              this.msgSuccess('新增成功')
              this.open = false
              this.getList()
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    },
    handleChange(arr) {
      this.disabled = []
      this.marList.forEach((e) => {
        this.disabled.push(true)
      })
      arr.forEach((element) => {
        this.disabled[this.marList.indexOf(element)] = false
      })
      this.marList
        .filter((i) => !arr.includes(i))
        .forEach((e) => {
          this.$delete(this.val, e)
        })
    },
    // 跳转
    toUserInfo(row, type) {
      switch (type) {
        case 1:
          this.$router.push({
            name: 'marketInfo',
            query: {
              uid: row.userId
            }
          })
          break
        case 2:
          // 跳用户详情
          sessionStorage.setItem('uid', row.userId)
          this.$nextTick(() => {
            this.$router.replace({
              path: '/redirect/lookInfo2/index'
            })
          })
          break
        case 3:
          // 跳邀请列表
          this.$router.push({
            name: 'userinvitationlist',
            query: {
              uid: row.userId
            }
          })
          break
      }
    }
    /** 删除按钮操作 */
    // handleDelete(row) {
    //   const ids = row.id || this.ids;
    //   this.$confirm(
    //     '是否确认删除做市商用户授权编号为"' + ids + '"的数据项?',
    //     "警告",
    //     {
    //       confirmButtonText: "确定",
    //       cancelButtonText: "取消",
    //       type: "warning",
    //     }
    //   )
    //     .then(function () {
    //       return delGrant(ids);
    //     })
    //     .then(() => {
    //       this.getList();
    //       this.msgSuccess("删除成功");
    //     })
    //     .catch(function () {});
    // },
  }
}
</script>
<style scoped>
.box-input {
  width: 95px;
  margin-left: 10px;
}
</style>
