<template>
  <!-- 高级认证 -->
  <div class="app-container">
    <!--form-->
    <el-form ref="queryForm" :inline="true">
      <el-form-item>
        <el-input v-model="like" size="mini" :placeholder="$t('userManager.mQuery')" clearable />
      </el-form-item>
      <el-form-item>
        <el-select v-model="status" size="mini" :placeholder="$t('userManager.selectAuthState')" clearable>
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="id" size="mini" :placeholder="$t('userManager.enterAuditID')" clearable />
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="startDate"
          align="right"
          type="date"
          size="mini"
          :placeholder="$t('userManager.selectStartTime')"
          :picker-options="pickerOptions"
        />
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="endDate"
          align="right"
          type="date"
          size="mini"
          :placeholder="$t('userManager.selectEndTime')"
          :picker-options="pickerOptions"
        />
      </el-form-item>
      <el-form-item>
        <el-select v-model="countrys" size="mini" filterable multiple collapse-tags :placeholder="$t('userManager.selectGJ')" @change="selectAll">
          <el-option :label="$t('userManager.selectAll')" value="all" />
          <el-option
            v-for="(item,index) in countryData"
            :key="index"
            :label="item.cnName"
            :value="item.dialingCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="load()">{{ $t('common.search') }}</el-button>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="exportCertifacation()">{{ $t('common.derive') }}</el-button>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="batchCheck">{{ $t('userManager.batchAudit') }}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="openMultipleAudit">{{ $t('userManager.multipleAudit') }}</el-button>
        <el-button type="primary" size="mini" @click="() => this.$router.push({ name: 'KycAuditLog' })">{{ $t('userManager.auditList') }}</el-button>
      </el-form-item>
    </el-form>

    <!--table-->
    <el-table v-loading="loading" border class="top" :data="tableData" style="width: 100%" @selection-change="selectChange">
      <el-table-column type="selection" label-class-name="mySelection" width="80" align="center" />

      <el-table-column type="index" :label="$t('userManager.no')" :index="indexMethod" align="center" />
      <el-table-column :label="$t('userManager.auditID')" prop="id" align="center" />
      <el-table-column :label="$t('userManager.userUID')">
        <template slot-scope="scope">
          <span v-if="scope.row.uid">
            <el-link
              type="primary"
              :underline="false"
              @click="toUserInfo(scope.row)"
            >{{ scope.row.uid }}</el-link>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('userManager.usetTag')" prop="labelName">
        <template slot-scope="scope">
          <span :style="{color: scope.row.labelColor}">{{ scope.row.labelName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="id_name" :label="$t('userManager.userName')" width="150" align="center" />
      <el-table-column prop="userPhone" :label="$t('userManager.phoneNumber')" align="center" />
      <el-table-column prop="userEmail" :label="$t('userManager.email')" align="center" />

      <el-table-column prop="countryCode" align="center" :label="$t('userManager.countryCode')" />
      <el-table-column prop="countryName" align="center" :label="$t('userManager.country')" />
      <el-table-column prop="id_number" align="center" :label="$t('userManager.idCardNumber')" />
      <el-table-column prop="update_time" :label="$t('userManager.submitTime')" />
      <el-table-column :label="$t('common.status')" align="center" prop="auth_status">
        <template slot-scope="scope">
          <div v-for="(item, index, key) in options" :key="key">
            <span v-if="scope.row.auth_status == item.value">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="applyNumber" :label="$t('userManager.submitKYC2Num')" align="center">
        <span slot-scope="scope" style="color: red;">{{ scope.row.applyNumber }}</span>
      </el-table-column>

      <el-table-column prop="reviewerUserName" :label="$t('userManager.auditName')" />
      <el-table-column prop="reviewerTime" width="160" :label="$t('userManager.auditTime')" />
      <el-table-column :label="$t('common.operation')" align="center" width="150">
        <template slot-scope="scope">
          <el-button size="mini" type="warning" @click="handleEdit(scope.$index, scope.row)">
            <span v-if="scope.row.auth_status == '0' || scope.row.auth_status == '2'">{{ $t('userManager.audit') }}</span>
            <span v-else>{{ $t('userManager.repulse') }}</span>
          </el-button>
          <el-button size="mini" type="warning" style="margin-top: 5px" @click="add(scope.row)">
            <span>{{ $t('userManager.addTag') }}</span>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--分页组件-->
    <div class="block top">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="pageNum"
        :limit.sync="pageSize"
        :pageSizes="[20, 30, 50, 100]"
        @pagination="load"
      />
    </div>
    <!-- 身份审核 -->
    <el-dialog :title="$t('userManager.identityVerification')" width="70%" :visible.sync="dialogFormVisible" class="dialog-edit">
      <div style="display: flex;">
        <div class="table-wrpaer">
          <el-table
            v-if="!batchCheckStatus"
            border
            class="top"
            :data="detailTableData"
            style="width: 100%"
          >
            <el-table-column prop="uid" label="UID" align="center" />
            <el-table-column prop="registerDate" :label="$t('userManager.regTime')" align="center" />
            <el-table-column :label="$t('userManager.usetTag')" prop="labelName">
              <template slot-scope="scope">
                <span :style="{color: scope.row.labelColor}">{{ scope.row.labelName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="countryName" :label="$t('userManager.country')" align="center" />
            <el-table-column prop="id_number" :label="$t('userManager.idCardNumber')" align="center" />
            <el-table-column prop="id_name" :label="$t('userManager.userName')" align="center" />
            <el-table-column prop="nameNum" :label="$t('userManager.isRepeatName')" align="center">
              <template slot-scope="scope">
                {{ scope.row.nameNum === 1 ? $t('userManager.not') : scope.row.nameNum - 1 }}
              </template>
            </el-table-column>
          </el-table>
          <!-- 身份证 -->
          <img v-if="!batchCheckStatus" :src="imgSrc.img1" style="width: 49%; margin-top: 20px;" alt="">
          <!-- KYC人像 -->
          <img v-if="!batchCheckStatus" :src="imgSrc.img3" style="width: 49%; margin-top: 20px;" alt="">
        </div>
        <div class="handle-wraper">
          <!-- 操作 -->
          <h3>
            {{ $t('common.operation') }}
            <el-tooltip effect="dark" :content="$t('userManager.errorTip3')" placement="top">
              <i class="el-icon-warning" />
            </el-tooltip>
          </h3>
          <!-- 账户 -->
          <div class="label-item">{{ $t('userManager.accountHandle') }}</div>
          <el-button type="warning" size="mini" @click="auditAddTag">{{ $t('userManager.addTag') }}</el-button>
          <!-- KYC -->
          <div class="label-item">KYC：</div>
          <div class="button-wraper">
            <el-button type="danger" size="mini" @click="rejectKYC2(detailTableData[0])">{{ $t('userManager.rejectKYC2') }}</el-button>
            <el-button type="danger" size="mini" @click="rejectKYC2AndKYC1(detailTableData[0])">{{ $t('userManager.rejectKYC1And2') }}</el-button>
            <el-button type="success" size="mini" @click="applyKYC2(detailTableData[0])">{{ $t('userManager.successKYC2') }}</el-button>
          </div>
          <!-- 拒绝模版 -->
          <div class="label-item">{{ $t('userManager.rejectTamplateSelect') }}</div>
          <el-select v-model="verifyData" :placeholder="$t('common.pleaseChoose')" :popper-append-to-body="false" popper-class="select-edit">
            <el-option
              v-for="item in verifyDataList"
              :key="item.id"
              :label="item.template"
              :value="item.template"
            />
          </el-select>
        </div>
      </div>
    </el-dialog>

    <!-- 批量审核 -->
    <el-dialog :title="$t('userManager.identityVerification')" class="dialog-edit" :visible.sync="dialogFormVisible1">
      <el-form :model="form" class="demo-form-inline">
        <el-form-item :label="$t('userManager.audit')" :label-width="formLabelWidth">
          <el-radio v-if="!batchCheckStatus" v-model="radio" label="1">{{ $t('userManager.resolve') }}</el-radio>
          <el-radio v-model="radio" label="2">{{ $t('userManager.reject') }}</el-radio>
        </el-form-item>
        <el-form-item v-if="radio == 2" :label="$t('userManager.reason')" :label-width="formLabelWidth">
          <el-input v-model="form.failReason" />
          <el-select v-model="verifyData" style="margin-top: 20px;" placeholder="$t('common.pleaseChoose')" :popper-append-to-body="false" popper-class="select-edit">
            <el-option
              v-for="item in verifyDataList"
              :key="item.id"
              :label="item.template"
              :value="item.template"
            />
            <el-option
              label="其他"
              value="-1"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible1 = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleRejectsAudit">{{ $t('common.sure') }}</el-button>
      </div>
    </el-dialog>

    <!-- 客户标签 -->
    <el-dialog :title="$t('userManager.addUserTag')" :visible.sync="dialogStatus" width="500px" :before-close="cancel" :close-on-click-modal="false">
      <el-form
        ref="digform"
        :model="digform"
        :rules="rules"
        class="form-grid"
        label-width="130px"
      >
        <el-form-item class="grid-item" :label="$t('dwmanager.userUID')" prop="uids">
          <el-input v-model="digform.uids" style="width:187px" placeholder="" clearable disabled />
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('userManager.tagType')" prop="parentId">
          <el-select v-model="digform.parentId" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')" @change="selectParentLabel">
            <el-option
              v-for="item in parentLableList"
              :key="item.id"
              :label="item.parentName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="grid-item" :label="$t('userManager.userTag')" prop="id">
          <el-select v-model="digform.id" filterable clearable size="small" :placeholder="$t('common.pleaseChoose')">
            <el-option
              v-for="item in labelArr"
              :key="item.id"
              :label="item.labelName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="mini" type="primary" @click="save">{{ $t('userManager.save') }}</el-button>
      </div>
    </el-dialog>

    <!-- 多选审核 -->
    <MultipleAudits
      v-if="currentSelectList"
      :verifyDataList="verifyDataList"
      ref="multipleAudits"
      :currentRow="currentRow"
      :lastAuditId="lastAuditId"
      :currentRowimgSrc="currentRowimgSrc"
      :multipleLoading="multipleLoading"
      :parentLableList="parentLableList"
      @handleClick="handleClick"
      @multipleClose="multipleClose"
      @multipleAuditAddTag="multipleAuditAddTag"
    />
  </div>
</template>

<script>
import { listCertifacation, accept, reject, getCountryList, exportCertifacation, batchReject, findUserNameNum, rejectKYCAll, checkAuditState } from '@/api/user'
import { getVerifyDataList } from '@/api/auditTemplate/auditTemplate.js'
import { readString } from '@/api/upload/uploadAwsImg.js'
import * as API from '@/api/labelSetting'
import * as commonAPI from '@/api/labelClass'
import MultipleAudits from './components/multiple-audits'

export default {
  components: {
    MultipleAudits
  },
  filters: {
    imageUrlIsNull: function(value) {
      if (value && value.indexOf('/filesUpload') > 0) {
        return value
      }
      return 'https://coinstore-sg.s3.ap-southeast-1.amazonaws.com/filesUpload/ex1/setting/29b3c0cf03094258ab816e48b5d284b3_1624363759992.jpg'
    }
  },
  data() {
    return {
      detailTableData: [],
      parentLabelData: [],
      dialogStatus: false,
      digform: {
        parentId: '',
        id: '',
        uids: ''
      },
      rules: {
        parentId: [
          { required: true, message: this.$t('userManager.errorTip4'), trigger: 'blur' }
        ],
        id: [
          { required: true, message: this.$t('userManager.errorTip5'), trigger: 'blur' }
        ],
        uids: [
          { required: true, message: this.$t('userManager.errorTip6'), trigger: 'blur' }
        ]
      },
      batchRejectUserIds: '',
      batchCheckStatus: false,
      countryData: [],
      countrys: [],
      verifyData: '',
      verifyDataList: [],
      dialogFormVisible: false,
      dialogFormVisible1: false,
      imgSrc: { img1: '', img2: '', img3: '' },
      loading: true,
      startDate: '',
      endDate: '',
      pageShow: true,
      // 审核状态
      options: [
        {
          value: 'all',
          label: this.$t('common.all')
        },
        {
          value: '0',
          label: this.$t('userManager.notAudit')
        },
        {
          value: '1',
          label: this.$t('userManager.auditSuccess')
        },
        {
          value: '2',
          label: this.$t('userManager.auditFail')
        },
        {
          value: '3',
          label: this.$t('userManager.rejectKYC1And2')
        }
      ],
      id: '',
      like: '',
      status: undefined,
      pageSize: 100,
      radio: '1',
      isTure: true,
      form: {
        failReason: '',
        id: ''
      },
      // 日期快捷选项
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
        shortcuts: [
          {
            text: this.$t('userManager.today'),
            onClick(picker) {
              picker.$emit('pick', new Date())
            }
          },
          {
            text: this.$t('userManager.yesterday'),
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', date)
            }
          },
          {
            text: this.$t('userManager.lastOntWeek'),
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', date)
            }
          }
        ]
      },
      pageNum: 1,
      photitle: '',
      tableData: [],
      total: 0,
      formLabelWidth: '40px',
      countrySelectAll: false, // country是否全选
      auditState: false, // 是否审核过 默认未审核
      currentSelectList: [], // 当前多选的列表 用于多选审核
      currentRow: null, // 多选审核中，当前审核的数据
      lastAuditId: '', // 上一条审核UID
      currentAuditIndex: 0, // 多选审核当前索引
      currentRowimgSrc: {
        img1: '',
        img2: '',
        img3: ''
      },
      multipleLoading: false // 加载状态
    }
  },
  computed: {
    parentLableList() {
      const list = this.parentLabelData.filter(item => item.parentId === 0)
      return list
    },
    labelArr() {
      const list = this.parentLabelData.filter(item => item.parentId === this.digform.parentId)
      return list
    }
  },
  created() {
    this.load()
    this.countryList()
    this.labelList()
  },
  methods: {
    // 加载
    load() {
      getVerifyDataList().then(response => {
        if (response.code == 200) {
          this.verifyDataList = response.rows
        }
      }).catch(error => {
        console.log(error)
      })

      this.loading = true
      this.status = this.status == 'all' ? '' : this.status
      const formData = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        id: this.id,
        like: this.like,
        status: this.status,
        startTime: this.formatDate(this.startDate),
        endTime: this.formatDate(this.endDate),
        countrys: this.countrys.join(',')
      }
      listCertifacation(formData)
        .then(response => {
          console.log('加载的数据', response)
          if (response.code == 200) {
            this.tableData = response.rows
            this.total = response.total
            this.status = this.status == '' ? 'all' : this.status
            if (this.dialogFormVisible) {
              this.updateCurretRow()
            }
          } else {
            this.tableData = []
            this.total = 0
            this.msgError(response.msg)
          }
          this.loading = false
        })
        .catch(error => {
          console.log(error)
        })
    },
    selectAll(arr) {
      const index = arr.findIndex(item => item === 'all')
      console.log('全选', index)
      if (index !== -1 && !this.countrySelectAll) {
        this.countrys = this.countryData.map(item => item.dialingCode)
        this.countrys.push('all')
        this.countrySelectAll = true
      }
      if (this.countrySelectAll && index === -1) {
        this.countrys = []
        this.countrySelectAll = false
      }
    },
    labelList() {
      commonAPI.labelList().then(res => {
        console.log('获取列表labelList', res)
        if (res.code === 200) {
          this.parentLabelData = res.data
        }
      })
    },
    selectParentLabel() {
      this.digform.id = ''
    },
    cancel() {
      this.dialogStatus = false
      this.$refs['digform'].resetFields()
    },
    // 添加标签
    add(row) {
      this.dialogStatus = true
      this.digform.uids = row.uid
    },
    save() {
      this.$refs['digform'].validate(valid => {
        if (valid) {
          const params = Object.assign({}, this.digform)
          params.uids = params.uids.split(',')
          API.add(params).then(res => {
            if (res.code == 200) {
              this.msgSuccess(this.$t('userManager.addTagSuccess'))
              this.cancel()
              this.load()
              this.dialogStatus = false
            } else {
              this.msgError(res.msg)
            }
          })
        }
      })
    },
    // 审核点击添加标签
    async auditAddTag() {
      const curTag = this.detailTableData[0].labelName || null
      if (curTag) {
        this.$message.warning(this.$t('userManager.errorTip7'))
        return
      }
      // 查找是否有符合规定的羊毛党标签
      const findTag = this.findAppointTag()
      if (findTag && findTag.id) {
        try {
          const { code } = await API.add({
            id: findTag.id,
            parentId: findTag.parentId,
            uids: [this.detailTableData[0].uid]
          })
          if (+code === 200) {
            this.msgSuccess(this.$t('userManager.addTagSuccess'))
            this.load()
          }
        } catch (error) {
          console.log(error)
        }
      }
    },
    async multipleAuditAddTag(row) {
      const curTag = row.labelName || null
      if (curTag) {
        this.$message.warning(this.$t('userManager.errorTip7'))
        return
      }

      // 查找是否有符合规定的羊毛党标签
      const findTag = this.findAppointTag(row)
      if (findTag && findTag.id) {
        try {
          const { code } = await API.add({
            id: findTag.id,
            parentId: findTag.parentId,
            uids: [row.uid]
          })
          if (+code === 200) {
            this.msgSuccess(this.$t('userManager.addTagSuccess'))
            this.currentRow = {
              ...this.currentRow,
              labelName: findTag.labelName
            }
          }
        } catch (error) {
          console.log(error)
        }
      }
    },
    // 查找是否有KYC羊毛（手动）标签，没有就打开添加标签弹窗
    findAppointTag(row) {
      const findParentItem = this.parentLableList.find(item => item.parentName === '羊毛党')
      if (!findParentItem) {
        this.add(row || this.detailTableData[0])
      } else {
        const labelList = this.parentLabelData.filter(item => item.parentId === findParentItem.id)
        if (labelList) {
          // TODO: 适配英文问题
          const findItem = labelList.find(item => item.labelName === 'KYC羊毛（手动）')
          if (!findItem) {
            this.add(row || this.detailTableData[0])
          } else {
            return findItem
          }
        } else {
          this.add(row || this.detailTableData[0])
        }
      }
    },
    // 审核时，添加完标签更新当前审核数据
    updateCurretRow() {
      const id = this.detailTableData[0].id
      if (id) {
        const currentRow = this.tableData.find(item => item.id === id)
        if (currentRow) {
          this.detailTableData[0] = currentRow
        }
      }
    },
    selectChange(arr) {
      this.currentSelectList = arr
      this.batchRejectUserIds = arr.map(item => item.user_id).join(',')
    },
    // 批量审核
    batchCheck() {
      if (!this.batchRejectUserIds) {
        this.$message.warning(this.$t('userManager.selectAuditItem'))
        return
      }
      this.batchCheckStatus = true
      this.dialogFormVisible1 = true
      this.form.failReason = ''
      this.verifyData = this.verifyDataList[0].template
      this.radio = '2'
    },
    // 导出
    exportCertifacation() {
      const formData = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        like: this.like,
        status: this.status === 'all' ? '' : this.status,
        startTime: this.formatDate(this.startDate),
        endTime: this.formatDate(this.endDate),
        countrys: this.countrys.join(',')
      }
      exportCertifacation(formData).then(res => {
        if (res.code === 200) {
          this.download(res.msg)
        }
      })
    },
    // 国家编码
    countryList() {
      getCountryList()
        .then((response) => {
          if (response.code == 200) {
            this.countryData = response.data
          } else {
            this.msgError(response.msg)
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    // 替换图片
    replacePictureStream(s, take) {
      const params = {}
      params.url = s[take]
      return new Promise((resolve, reject) => {
        readString(params).then(res => {
          const msg = res.msg
          let url = ''
          if (msg == '' || msg == null || msg == undefined) {
            url = 'https://coinstore-sg.oss-accelerate.aliyuncs.com/filesUpload/1626323598251_c19b584f9e594fd19ee04bb2d9a08947.jpg'
          } else {
            url = msg
          }
          resolve(url)
        }).catch(error => {
          console.log(error.data)
          reject()
        })
      })
    },
    // 表格单独点击审核
    async handleEdit(index, row) {
      this.batchCheckStatus = false // 不是批量审核
      this.form.id = row.user_id
      this.dialogFormVisible = true
      this.form.failReason = ''
      this.auditState = false // 未审核
      this.verifyData = this.verifyDataList[0].template
      this.detailTableData = []
      this.detailTableData.push(row)
      console.log('row', row)
      // 查询图片
      this.imgSrcShow(row)
      // 查询是否重名
      // /coinbull/user/findUserNameNum 入参
      findUserNameNum({ userName: row.id_name }).then(res => {
        if (res.code === 200) {
          this.$set(row, 'nameNum', res.data)
        }
      })
      // 校验是否已经审核
      try {
        const { data } = await checkAuditState(row.id)
        this.auditState = !data.result
      } catch (error) {
        console.log(error)
      }
    },
    // 拒绝KYC 2
    async rejectKYC2(row, isMultiple = false) {
      const handleFun = async() => {
        try {
          await reject({
            userId: row.user_id,
            reason: this.verifyData
          })
          if (!isMultiple) {
            this.dialogFormVisible = false
            this.load()
            this.auditState = false
          }
          this.$message({
            showClose: true,
            message: this.$t('userManager.rejectKYC2Success'),
            type: 'success'
          })
          // 操作成功后，如果是多选审核，则自动进行下一项
          if (isMultiple) {
            this.nextAudit()
          }
        } catch (error) {
          console.log(error)
          this.multipleLoading = false
        }
      }
      if (this.auditState) {
        this.resetAuditState(async() => {
          handleFun()
        })
      } else {
        // 如果是多选，需要先判断是否审核过
        if (isMultiple) {
          if (row.auditState) {
            this.resetAuditState(async() => {
              handleFun()
            })
          } else {
            handleFun()
          }
        } else {
          handleFun()
        }
      }
    },
    // 拒绝 KYC 1 & 2
    async rejectKYC2AndKYC1(row, isMultiple = false) {
      const handleFun = async() => {
        try {
          await rejectKYCAll({
            userId: row.user_id,
            reason: this.verifyData
          })
          if (!isMultiple) {
            this.dialogFormVisible = false
            this.load()
            this.auditState = false
          }
          this.$message({
            showClose: true,
            message: this.$t('userManager.rejectKYC2And1Success'),
            type: 'success'
          })
          // 操作成功后，如果是多选审核，则自动进行下一项
          if (isMultiple) {
            this.nextAudit()
          }
        } catch (error) {
          console.log(error)
          this.multipleLoading = false
        }
      }
      if (this.auditState) {
        this.resetAuditState(handleFun)
      } else {
        // 如果是多选，需要先判断是否审核过
        if (isMultiple) {
          if (row.auditState) {
            this.resetAuditState(async() => {
              handleFun()
            })
          } else {
            handleFun()
          }
        } else {
          handleFun()
        }
      }
    },
    // 通过KYC2
    async applyKYC2(row, isMultiple = false) {
      const handleFun = async() => {
        try {
          await accept({ userId: row.user_id })
          if (!isMultiple) {
            this.dialogFormVisible = false
            this.load()
            this.auditState = false
          }
          this.$message({
            showClose: true,
            message: this.$t('userManager.auditKYC2Success'),
            type: 'success'
          })
          // 操作成功后，如果是多选审核，则自动进行下一项
          if (isMultiple) {
            this.nextAudit()
          }
        } catch (error) {
          console.log(error)
        }
      }

      if (this.auditState) {
        this.resetAuditState(handleFun)
      } else {
        // 如果是多选，需要先判断是否审核过
        if (isMultiple) {
          if (row.auditState) {
            this.resetAuditState(async() => {
              handleFun()
            })
          } else {
            handleFun()
          }
        } else {
          handleFun()
        }
      }
    },
    // 如果已经审核过，需要提示覆盖
    async resetAuditState(cb) {
      this.$confirm(this.$t('userManager.confirmTip1'), this.$t('userManager.tip'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        cb()
      }).catch(() => {})
    },
    // 替换审核图
    async replaceImagesStream(row) {
      await Promise.allSettled([
        this.replacePictureStream(row, 'take_one').then(data => {
          this.currentRowimgSrc.img1 = data
        }),
        this.replacePictureStream(row, 'take_four').then(data => {
          this.currentRowimgSrc.img2 = data
        }),
        this.replacePictureStream(row, 'hand_take_one').then(data => {
          this.currentRowimgSrc.img3 = data
        })
      ])
    },
    // 构建一条多选审核项目
    async buildCurrentRow(row) {
      return new Promise(async(resolve) => {
        try {
          let auditState = false
          let nameNum = ''
          const { data: findName } = await findUserNameNum({ userName: row.id_name })
          nameNum = findName
          const { data: auditStateResult } = await checkAuditState(row.id)
          auditState = !auditStateResult.result
          row = {
            auditState,
            nameNum,
            ...row
          }
          resolve(row)
        } catch (error) {
          console.log(error)
          resolve(row)
        }
      })
    },
    // 在多选模式下，当前条操作完后，自己切换到下一条
    async nextAudit() {
      this.multipleLoading = true
      this.currentAuditIndex++
      // 是否列表中还有未审核项
      if (this.currentSelectList.length - 1 >= this.currentAuditIndex) {
        const row = this.currentSelectList[this.currentAuditIndex]
        const prevRow = this.currentSelectList[this.currentAuditIndex - 1]
        this.lastAuditId = prevRow && prevRow.uid || '--'
        const [{ value: curRow }] = await Promise.allSettled([await this.buildCurrentRow(row), await this.replaceImagesStream(row)])
        this.currentRow = curRow
        this.multipleLoading = false
      } else {
        this.$refs.multipleAudits.dialogFormVisible = false
      }
    },

    // 点击多选审核
    async openMultipleAudit() {
      if (!this.currentSelectList.length) {
        this.$message({
          type: 'warning',
          message: this.$t('userManager.selectAuditItem')
        })
        return
      }

      // 初始化状态
      this.currentAuditIndex = 0
      this.currentRow = null
      this.lastAuditId = ''
      this.currentRowimgSrc = {
        img1: '',
        img2: '',
        img3: ''
      }

      this.multipleLoading = true
      const row = this.currentSelectList[this.currentAuditIndex]

      try {
        this.$refs.multipleAudits.dialogFormVisible = true
        const [{ value: curRow }] = await Promise.allSettled([await this.buildCurrentRow(row), await this.replaceImagesStream(row)])
        this.currentRow = curRow
        this.multipleLoading = false
      } catch (error) {
        this.currentRow = row
        this.$refs.multipleAudits.dialogFormVisible = true
        this.multipleLoading = false
      }
    },

    handleClick({ type, row, verifyData }) {
      // type 1: 拒绝KYC2 2: 拒绝KYC2 1 3: 通过KYC2
      this.verifyData = verifyData
      if (type === 1) {
        this.rejectKYC2(row, true)
      } else if (type === 2) {
        this.rejectKYC2AndKYC1(row, true)
      } else if (type === 3) {
        this.applyKYC2(row, true)
      }
    },
    multipleClose() {
      // 初始化状态
      this.currentAuditIndex = 0
      this.currentRow = null
      this.lastAuditId = ''
      this.multipleLoading = false
      this.verifyData = ''
      this.currentRowimgSrc = {
        img1: '',
        img2: '',
        img3: ''
      }
      this.load()
    },
    imgSrcShow(row) {
      // this.dialogFormVisible1 = true;
      this.photitle = '认证图片 UID' + row.uid +
          ' 姓名 ' + row.id_name +
          ' 证件号 ' + row.id_number
      this.imgSrc = { img1: '', img2: '', img3: '' }
      this.replacePictureStream(row, 'take_one').then(data => {
        this.imgSrc.img1 = data
      })
      this.replacePictureStream(row, 'take_four').then(data => {
        this.imgSrc.img2 = data
      })
      this.replacePictureStream(row, 'hand_take_one').then(data => {
        this.imgSrc.img3 = data
      })
    },
    // 批量审核  ==== 批量拒绝
    async handleRejectsAudit() {
      // 批量拒绝
      try {
        if (this.batchCheckStatus) {
          const { code } = await batchReject({ userId: this.batchRejectUserIds })
          console.log('批量拒绝成功', code)
          if (+code === 200) {
            this.$message({
              showClose: true,
              message: this.$t('userManager.rejectSuccess'),
              type: 'success'
            })
            this.load()
          }
        }
      } catch (error) {
        console.log(error)
      } finally {
        this.dialogFormVisible1 = false
      }
    },
    // 详情跳转
    toUserInfo(row) {
      // 后端返回数据 UID、 userId返回值相反，故存储取反纠正过来
      sessionStorage.setItem('uid', row.uid)
      sessionStorage.setItem('userId', row.user_id)
      this.$router.push({ name: 'lookInfo2' })
    },
    handleEditTure() {
      if (this.radio == 1) {
        const data = {
          userId: this.form.id
        }
        accept(data)
          .then(response => {
            this.$message({
              showClose: true,
              message: this.$t('userManager.authSuccess'),
              type: 'success'
            })
            this.dialogFormVisible = false
            this.load()
          })
          .catch(error => {
            console.log(error)
          })
      } else {
        let reason = this.form.failReason

        if (this.verifyData == '其他') {
          if (this.form.failReason.length == 0) {
            this.$message({
              showClose: true,
              message: this.$t('userManager.errorTip2'),
              type: 'error'
            })
            return
          }
        } else {
          if (this.verifyData != '') {
            reason = this.verifyData
          }
        }
        // 批量拒绝
        if (this.batchCheckStatus) {
          batchReject({ userId: this.batchRejectUserIds }).then(res => {
            console.log('批量拒绝成功', res)
            if (res.code === 200) {
              this.$message({
                showClose: true,
                message: this.$t('userManager.rejectSuccess'),
                type: 'success'
              })
              this.dialogFormVisible = false
              this.load()
            }
          })
        } else {
          const data = { userId: this.form.id, reason: reason }
          reject(data)
            .then(response => {
              this.$message({
                showClose: true,
                message: this.$t('userManager.rejectSuccess'),
                type: 'success'
              })
              this.dialogFormVisible = false
              this.load()
            })
            .catch(error => {
              console.log(error)
            })
        }
      }
    },
    // 索引值
    indexMethod(index) {
      return index + (this.pageNum - 1) * this.pageSize + 1
    },
    // 日期处理
    formatDate(time) {
      if (time) {
        const date = new Date(time)
        const year = date.getFullYear()
        let month = date.getMonth() + 1
        let day = date.getDate()
        if (month < 10) {
          month = '0' + month
        }
        if (day < 10) {
          day = '0' + day
        }
        return year + '-' + month + '-' + day
      } else {
        return ''
      }
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" scoped>
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}
.top {
  margin-top: 20px;
}
.dialogimg {
  text-align: center;
}

::v-deep .select-edit {
  .el-scrollbar {
    max-width: 1000px;
  }
}
.table-wrpaer {
  margin-right: 25px;
  min-width: 70%;
}
.handle-wraper {
  min-width: 30%;
  h3 {
    i {
      margin-right: 10px;
      font-size: 14px;
      cursor: pointer;
    }
    span {
      font-size: 12px;
      font-weight: 500;
    }
  }
  .label-item {
    margin: 15px 0;
  }
  .button-wraper {
    >>> .el-button {
      display: block;
      margin-bottom: 15px;
      margin-left: 0;
    }
  }
}
</style>
