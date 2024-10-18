<template>
  <div class="dialogMain">
    <el-dialog
      title="h5预览"
      :visible.sync="dialogVisible"
      width="375px"
      @closed="closed"
      @opened="opened"
    >
      <div class="selectlang">
        <el-select v-model="value1" clearable placeholder="请选择语言">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="dialog-content">
        <div class="banner">
          <img :src="bannerImg" alt="" class="img-bg">
          <img src="./imges/alert.svg" alt="" class="alert">
          <img src="./imges/share.svg" alt="" class="share">
        </div>
        <div class="taskList">
          <ul class="taskInfoList">
            <li
              v-for="(item, index) in taskList"
              :key="index"
              class="taskInfoListItem"
            >
              <div class="left"><img :src="item.rewardIcon" alt=""></div>
              <div class="mid">
                <p class="title">{{ computedTask(item.taskType) }}  {{ item | compuetdTaskProcess }}</p>
                <p class="desc">{{ compuetdTaskDesk(item) }}</p>
              </div>
              <div class="btn">去使用</div>
            </li>
          </ul>

          <div class="bottomBanner">
            <img :src="bottomBanner" alt="">
          </div>
        </div>
      </div>

      <!-- <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="dialogVisible = false"
          >{{$t('common.sure')}}</el-button
        >
      </span> -->
    </el-dialog>
  </div>
</template>

<script>
export default {
  filters: {
    compuetdTaskProcess(val) {
      if ([2, 3, 5].includes(val.taskType)) {
        return `(0/${val.taskFactor})`
      }
      return ''
    }

  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    taskList: {
      type: Array,
      default: () => []
    },
    dialogInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      dialogVisible: false,
      value1: 'zh_CN',
      options: [
        { value: 'zh_CN', label: '中文' },
        { value: 'en_US', label: '英文' },
        { value: 'ja_JP', label: '日文' },
        { value: 'ko_KR', label: '韩文' }
      ]
    }
  },
  computed: {
    taskListInfo() {
      return [
        {
          label: {
            zh_CN: '注册任务zh',
            en_US: '注册任务en',
            ja_JP: '注册任务ja',
            ko_KR: '注册任务ko'
          },
          value: 1
        },
        {
          label: {
            zh_CN: '邀请好友zh',
            en_US: '邀请好友en',
            ja_JP: '邀请好友ja',
            ko_KR: '邀请好友ko'
          },
          value: 2
        },
        {
          label: {
            zh_CN: '邀请好友kyczh',
            en_US: '邀请好友kycen',
            ja_JP: '邀请好友kycja',
            ko_KR: '邀请好友kycko'
          },
          value: 3
        },
        {
          label: {
            zh_CN: 'kyc任务zh',
            en_US: 'kyckyc任务en',
            ja_JP: 'kyckyc任务ja',
            ko_KR: 'kyckyc任务ko'
          },
          value: 4
        },
        {
          label: {
            zh_CN: '充值任务zh',
            en_US: '充值任务en',
            ja_JP: '充值任务ja',
            ko_KR: '充值任务ko'
          },
          value: 5
        }
      ]
    },
    bannerImg() {
      if (this.dialogInfo.banners) {
        return this.dialogInfo.banners[this.value1]
      }
      return ``
    },
    bottomBanner() {
      if (this.dialogInfo.desks) {
        return this.dialogInfo.desks[this.value1]
      }
      return ``
    }

  },
  watch: {
    value(val) {
      this.dialogVisible = val
    }
  },
  created() {
    this.dialogVisible = this.value
  },
  methods: {
    closed() {
      this.$emit('input', this.dialogVisible)
    },
    opened() {
      this.$emit('input', this.dialogVisible)
    },
    compuetdTaskDesk(val) {
      if (val && val.taskTarget) {
        return val.taskTarget[this.value1]
      }
      return ``
    },
    computedTask(taskType) {
      const item = this.taskListInfo.find((el) => el.value === taskType)
      const langObj = item.label
      return langObj ? langObj[this.value1] : ''
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" scoped>
::v-deep .el-dialog__body {
  padding: 0px;

  .dialog-content {
    margin-top: 20px;
    background: rgba(247, 247, 248, 1);

    .banner {
      height: 300px;
      position: relative;
      background: linear-gradient(180deg, #ffc507 0%, #feda3d 100%);

      .alert {
        position: absolute;
        top: 10px;
        right: 6px;
      }
      .share {
        position: absolute;
        top: 56px;
        right: 6px;
      }
      .img-bg{
        width: 100%;
        height: 100%;
      }
    }
    .taskList {
      position: relative;
      width: 375px;
      background: #f4f7f8;
      border-radius: 20px 20px 0px 0px;
      padding: 25px 15px;
      margin-top: -25px;
      z-index: 999;

      .taskInfoList {
        margin: 0;
        padding: 0;
        .taskInfoListItem {
          width: 100%;
          background: #ffffff;
          border-radius: 15px;
          padding: 19px 15px;
          list-style: none;
          display: flex;
          align-items: center;

          .left {
            background: #f4f7f8;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            img {
              width: 100%;
              height: 100%;
              border-radius: 50%;
            }
          }

          .mid {
            flex: 1;
            margin-left: 13px;
            .title {
              height: 20px;
              font-size: 15px;
              font-family: DINPro-Medium, DINPro;
              font-weight: 500;
              color: #14171e;
              line-height: 20px;
            }
            .desc {
              margin-top: 6px;
              height: 15px;
              font-size: 12px;
              font-family: DINPro-Medium, DINPro;
              font-weight: 500;
              color: #a7b1bb;
              line-height: 15px;
            }
          }
          .btn {
            padding: 6px 17px;
            background: linear-gradient(270deg, #ffc420 0%, #fee981 100%);
            border-radius: 16px;
            text-align: center;
            font-size: 14px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #14171e;
          }
        }
      }
    }
    .bottomBanner {
      width: 100%;
      height: 80px;
      margin-top: 20px;
      border-radius: 15px;
      padding: 0 15px;
      background: cornsilk;

      img {
        width: 100%;
        height: 100%;
        border-radius: 15px;
      }
    }
  }
}
</style>
