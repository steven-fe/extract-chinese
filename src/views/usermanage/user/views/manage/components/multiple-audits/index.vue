<template>
  <el-dialog
    :title="$t('userManager.identityVerification')"
    :visible.sync="dialogFormVisible"
    :custom-class="$style.dialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="$emit('multipleClose')"
  >
    <div v-loading="multipleLoading" style="display: flex; gap: 25px;">
      <div class="table-wrpaer" style="flex: 1 1 auto; min-width: 0px;">
        <el-table border class="top" :data="[currentRow]" style="width: 100%">
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
              {{ scope.row && scope.row.nameNum ? scope.row.nameNum === 1 ? $t('userManager.not') : scope.row.nameNum -
                1 : $t('userManager.not') }}
            </template>
          </el-table-column>
        </el-table>
        <!-- 身份证 -->
        <img :src="currentRowimgSrc.img1" style="width: 49%; margin-top: 20px;" alt="">
        <!-- KYC人像 -->
        <img :src="currentRowimgSrc.img3" style="width: 49%; margin-top: 20px;" alt="">
      </div>

      <div class="handle-wraper" style="flex: 0 0 360px;">
        <!-- 操作 -->
        <h3>
          {{ $t('common.operation') }}
          <el-tooltip effect="dark" :content="$t('userManager.errorTip3')" placement="top">
            <i class="el-icon-warning" />
          </el-tooltip>
          <span>{{ $t('userManager.preAuditID') }}{{ lastAuditId || '--' }}</span>
        </h3>
        <!-- 账户 -->
        <div class="label-item">{{ $t('userManager.accountHandle') }}</div>
        <el-button type="warning" size="mini" @click="$emit('multipleAuditAddTag', currentRow)">{{
          $t('userManager.addTag')
        }}</el-button>
        <!-- KYC -->
        <div class="label-item">KYC：</div>
        <div class="button-wraper">
          <el-button type="danger" size="mini" @click="handleClick(1)">{{ $t('userManager.rejectKYC2') }}</el-button>
          <el-button type="danger" size="mini" @click="handleClick(2)">{{ $t('userManager.rejectKYC1And2')
          }}</el-button>
          <el-button type="success" size="mini" @click="handleClick(3)">{{ $t('userManager.successKYC2') }}</el-button>
        </div>
        <!-- 拒绝模版 -->
        <div class="label-item">{{ $t('userManager.rejectTamplateSelect') }}</div>
        <el-select
          v-model="verifyData"
          :placeholder="$t('common.pleaseChoose')"
          :popper-append-to-body="false"
          popper-class="select-edit"
        >
          <el-option v-for="item in verifyDataList" :key="item.id" :label="item.template" :value="item.template" />
        </el-select>
      </div>
    </div>
  </el-dialog>
</template>

<script>

export default {
  props: {
    // 当前审核的数据
    currentRow: {
      type: Object,
      default: () => {
        return {}
      }
    },
    verifyDataList: {
      type: Array,
      default: () => []
    },
    lastAuditId: {
      type: [Number, String],
      default: ''
    },
    currentRowimgSrc: {
      type: Object,
      default: () => {
        return {
          img1: '',
          img2: '',
          img3: ''
        }
      }
    },
    multipleLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogFormVisible: false,
      verifyData: ''
    }
  },
  watch: {
    dialogFormVisible(n) {
      this.verifyData = this.verifyDataList[0].template
    }
  },
  methods: {
    handleClick(type) {
      this.$emit('handleClick', { type, row: this.currentRow, verifyData: this.verifyData })
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

.el-table ::v-deep .mySelection .cell:after {
  content: "全选";
  margin-left: 5px;
}

::v-deep .select-edit {
  .el-scrollbar {
    max-width: 1000px;
  }
}

.handle-wraper {

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
    >>>.el-button {
      display: block;
      margin-bottom: 15px;
      margin-left: 0;
    }
  }
}
</style>

<style lang="scss" module>
.dialog {
  width: 90%;
  min-width: 1200px;
}
</style>
