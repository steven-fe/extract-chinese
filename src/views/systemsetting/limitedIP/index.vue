<template>
  <!-- 大额充提提醒设置 -->
  <div class="app-container">
    <el-tabs v-model="activeName" type="border-card" style="width: 700px;margin: 0 auto" :stretch="true">
      <el-tab-pane label="未知用户身份" name="first">
        <div class="paneClass">
          <el-form ref="unclearInfoForm" :inline="true" :model="unclearInfo" :rules="unclearInfoRules" class="demo-form-inline">
            <el-form-item label="">
              相同手机号
            </el-form-item>
            <el-form-item label="" prop="sameUserHour">
              <el-input v-model="unclearInfo.sameUserHour" style="width: 100px" />
              分钟内，
            </el-form-item>
            <el-form-item label="">
              最多发送
            </el-form-item>
            <el-form-item label="" prop="sameUserCount">
              <el-input v-model="unclearInfo.sameUserCount" style="width: 100px" />
              条验证码
            </el-form-item>
            <br>
            <el-form-item label="">
              相同IP
            </el-form-item>
            <el-form-item label="" prop="sameIPHour">
              <el-input v-model="unclearInfo.sameIPHour" style="width: 100px" />
              分钟内，
            </el-form-item>
            <el-form-item label="">
              最多发送
            </el-form-item>
            <el-form-item label="" prop="sameIPCount">
              <el-input v-model="unclearInfo.sameIPCount" style="width: 100px" />
              条验证码
            </el-form-item>
            <br>
            <el-form-item label="">
              相同网段
            </el-form-item>
            <el-form-item label="" prop="sameGatewayHour">
              <el-input v-model="unclearInfo.sameGatewayHour" style="width: 100px" />
              分钟内，
            </el-form-item>
            <el-form-item label="">
              最多发送
            </el-form-item>
            <el-form-item label="" prop="sameGatewayCount">
              <el-input v-model="unclearInfo.sameGatewayCount" style="width: 100px" />
              条验证码
            </el-form-item>
          </el-form>
          <el-form ref="emailDataForm" :inline="true" :model="emailData" :rules="emailDataRules" class="demo-form-inline">
            <el-form-item label="">
              相同邮箱
            </el-form-item>
            <el-form-item label="" prop="sameUserHour">
              <el-input v-model="emailData.sameUserHour" style="width: 100px" />
              分钟内，
            </el-form-item>
            <el-form-item label="">
              最多发送
            </el-form-item>
            <el-form-item label="" prop="sameUserCount">
              <el-input v-model="emailData.sameUserCount" style="width: 100px" />
              条验证码
            </el-form-item>
          </el-form>
          <el-form ref="ipInfo" :inline="true" :model="ipInfo" :rules="ipInfoRules" class="demo-form-inline">
            <el-form-item label="">
              相同邮箱ip
            </el-form-item>
            <el-form-item label="" prop="duration">
              <el-input v-model="ipInfo.duration" style="width: 100px" />
              分钟内，
            </el-form-item>
            <el-form-item label="">
              最多发送
            </el-form-item>
            <el-form-item label="" prop="count">
              <el-input v-model="ipInfo.count" style="width: 100px" />
              条验证码
            </el-form-item>
          </el-form>
          <el-button type="primary" size="mini" @click="setUnclearInfo">保存</el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane label="已知用户身份" name="second">
        <div class="paneClass">
          <el-form ref="clearInfoForm" :inline="true" :model="clearInfo" :rules="clearInfoRules" class="demo-form-inline">
            <el-form-item label="">
              相同手机号
            </el-form-item>
            <el-form-item label="" prop="sameUserHour">
              <el-input v-model="clearInfo.sameUserHour" style="width: 100px" />
              分钟内，
            </el-form-item>
            <el-form-item label="">
              最多发送
            </el-form-item>
            <el-form-item label="" prop="sameUserCount">
              <el-input v-model="clearInfo.sameUserCount" style="width: 100px" />
              条验证码
            </el-form-item>
          </el-form>
          <el-button type="primary" size="mini" @click="setClearInfo">保存</el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane label="滑块关闭" name="third">
        <div class="paneClass">
          <el-form ref="sliderDataForm" :inline="true" :model="sliderData" :rules="sliderDataRules" class="demo-form-inline">
            <el-form-item label="">
              平台
            </el-form-item>
            <el-form-item label="" prop="sameExchangeHour">
              <el-input v-model="sliderData.sameExchangeHour" style="width: 100px" />
              分钟内，
            </el-form-item>
            <el-form-item label="">
              最多发送
            </el-form-item>
            <el-form-item label="" prop="sameExchangeCount">
              <el-input v-model="sliderData.sameExchangeCount" style="width: 100px" />
              条验证码
            </el-form-item>
          </el-form>
          <el-button type="primary" size="mini" @click="setSliderInfo">保存</el-button>
        </div>
      </el-tab-pane>
      <!--      <el-tab-pane label="邮箱验证码限制" name="four">-->
      <!--        <div class="paneClass">-->
      <!--          <el-form :inline="true" :model="emailData" :rules="emailDataRules" ref="emailDataForm" class="demo-form-inline" >-->
      <!--            <el-form-item label="">-->
      <!--              相同邮箱-->
      <!--            </el-form-item>-->
      <!--            <el-form-item label="" prop="sameUserHour">-->
      <!--              <el-input style="width: 100px" v-model="emailData.sameUserHour" />-->
      <!--              分钟内，-->
      <!--            </el-form-item>-->
      <!--            <el-form-item label="">-->
      <!--              最多发送-->
      <!--            </el-form-item>-->
      <!--            <el-form-item label="" prop="sameUserCount">-->
      <!--              <el-input style="width: 100px" v-model="emailData.sameUserCount" />-->
      <!--              条验证码-->
      <!--            </el-form-item>-->
      <!--          </el-form>-->
      <!--          <el-button type="primary" size="mini" @click="setEmailInfo">保存</el-button>-->
      <!--        </div>-->
      <!--      </el-tab-pane>-->
    </el-tabs>
  </div>
</template>
<script>
import * as API from '@/api/limitIP'

export default {
  name: 'BignumRemind',
  data() {
    const validateNum = (rule, value, callback) => {
      if (!Number.isInteger(+value) || +value <= 0) {
        callback(new Error('只能输入正整数'))
      } else {
        callback()
      }
    }
    return {
      activeName: 'first',
      unclearInfo: {
        sameUserHour: '',
        sameUserCount: '',
        sameUserState: 1, // 1,开启，0，关闭
        sameIPHour: '',
        sameIPCount: '',
        sameIPState: 1, // 1,开启，0，关闭
        sameGatewayHour: '',
        sameGatewayCount: '',
        sameGatewayState: 1 // 1,开启，0，关闭
      },
      unclearInfoRules: {
        sameUserHour: [
          { validator: validateNum, trigger: 'blur' }
        ],
        sameUserCount: [
          { validator: validateNum, trigger: 'blur' }
        ],
        sameIPHour: [
          { validator: validateNum, trigger: 'blur' }
        ],
        sameIPCount: [
          { validator: validateNum, trigger: 'blur' }
        ],
        sameGatewayHour: [
          { validator: validateNum, trigger: 'blur' }
        ],
        sameGatewayCount: [
          { validator: validateNum, trigger: 'blur' }
        ]
      },
      clearInfo: {
        sameUserHour: '',
        sameUserCount: '',
        sameUserState: 1 // 1,开启，0，关闭
      },
      clearInfoRules: {
        sameUserHour: [
          { validator: validateNum, trigger: 'blur' }
        ],
        sameUserCount: [
          { validator: validateNum, trigger: 'blur' }
        ]
      },
      sliderData: {
        sameExchangeHour: '',
        sameExchangeCount: '',
        sameExchangeState: 1 // 1,开启，0，关闭
      },
      sliderDataRules: {
        sameExchangeHour: [
          { validator: validateNum, trigger: 'blur' }
        ],
        sameExchangeCount: [
          { validator: validateNum, trigger: 'blur' }
        ]
      },
      emailData: {
        sameUserHour: '',
        sameUserCount: '',
        sameUserState: '1'
      },
      emailDataRules: {
        sameUserHour: [
          { validator: validateNum, trigger: 'blur' }
        ],
        sameUserCount: [
          { validator: validateNum, trigger: 'blur' }
        ]
      },
      ipInfo: {
        duration: '',
        count: ''
      },
      ipInfoRules: {
        duration: [
          { validator: validateNum, trigger: 'blur' }
        ],
        count: [
          { validator: validateNum, trigger: 'blur' }
        ]
      }

    }
  },
  created() {
    this.search()
  },
  methods: {
    search() {
      API.getUnclearInfo().then(res => {
        if (res.code === 200) {
          Object.keys(this.unclearInfo).forEach(item => {
            this.unclearInfo[item] = res.data[item]
          })
        }
      })
      API.getClearInfo().then(res => {
        if (res.code === 200) {
          Object.keys(this.clearInfo).forEach(item => {
            this.clearInfo[item] = res.data[item]
          })
        }
      })
      API.getSliderInfo().then(res => {
        if (res.code === 200) {
          Object.keys(this.sliderData).forEach(item => {
            this.sliderData[item] = res.data[item]
          })
        }
      })
      API.getEmailInfo().then(res => {
        if (res.code === 200) {
          Object.keys(this.emailData).forEach(item => {
            this.emailData[item] = res.data[item]
          })
        }
      })
      API.getIPInfo().then(res => {
        if (res.code === 200) {
          Object.keys(this.ipInfo).forEach(item => {
            this.ipInfo[item] = res.data[item]
          })
        }
      })
    },
    setUnclearInfo() {
      let flag1 = false
      let flag2 = false
      let flag3 = false
      this.$refs['emailDataForm'].validate((valid) => {
        if (valid) {
          flag2 = true
        }
      })
      this.$refs['unclearInfoForm'].validate((valid) => {
        if (valid) {
          flag1 = true
        }
      })
      this.$refs['ipInfo'].validate((valid) => {
        if (valid) {
          flag3 = true
        }
      })
      if (flag1 && flag2 && flag3) {
        API.setEmailInfo(this.emailData).then(res => {
          if (res.code === 200) {
            this.search()
          }
        })
        API.setUnclearInfo(this.unclearInfo).then(res => {
          if (res.code === 200) {
            this.search()
          }
        })
        API.setIPInfo(this.ipInfo).then(res => {
          if (res.code === 200) {
            this.search()
          }
        })
        this.$message.success('保存成功')
      }
    },
    setClearInfo() {
      this.$refs['clearInfoForm'].validate((valid) => {
        if (valid) {
          API.setClearInfo(this.clearInfo).then(res => {
            if (res.code === 200) {
              this.$message.success('保存成功')
              this.search()
            }
          })
        }
      })
    },
    setSliderInfo() {
      this.$refs['sliderDataForm'].validate((valid) => {
        if (valid) {
          API.setSliderInfo(this.sliderData).then(res => {
            if (res.code === 200) {
              this.$message.success('保存成功')
              this.search()
            }
          })
        }
      })
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped lang="scss">
.app-container {
  text-align: center;
}
.paneClass {
  width: 750px;
  margin: 0 auto;
  text-align: right;
  padding-right: 150px;
  //border: 1px solid red;
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
