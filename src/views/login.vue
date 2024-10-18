<template>
  <div class="login">
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
    >
      <h3 class="title">交易所管理系统</h3>
      <el-form-item prop="phoneNumber">
        <el-input
          v-model="loginForm.phoneNumber"
          type="text"
          auto-complete="off"
          placeholder="账号"
        >
          <svg-icon
            slot="prefix"
            icon-class="user"
            class="el-input__icon input-icon"
          />
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter.native="handleLogin"
        >
          <svg-icon
            slot="prefix"
            icon-class="password"
            class="el-input__icon input-icon"
          />
        </el-input>
      </el-form-item>
      <!-- <el-form-item prop="code" v-if="false">
        <el-input
          v-model="loginForm.code"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter.native="handleLogin"
        >
          <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" />
        </div>
      </el-form-item> -->
      <!-- <el-form-item prop="smsCode">
        <el-input
          v-model="loginForm.smsCode"
          auto-complete="off"
          placeholder="短信验证码"
          style="width: 63%"
          @keyup.enter.native="handleLogin"
        >
          <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
        </el-input>
        <div class="login-code">
          <el-button
            type="primary"
            style="width: 112px; padding: 10px 0px;"
            @click="sendSmsCode"
            v-if="time === 60 || time === 0"
          >短信验证码</el-button>
          <el-button
            type="primary"
            style="width: 112px; padding: 10px 0px;"
            :disabled="!show"
            v-else
          >短信验证码({{time}}s)</el-button>
        </div>
      </el-form-item> -->
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="medium"
          type="primary"
          style="width:100%; margin-top:40px;"
          @click.native.prevent="handleLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2020-COINBULL. All Rights Reserved.</span>
    </div>
    <GaDialog
      :ga-show="gaShow"
      @close1="close1"
    />
  </div>
</template>

<script>
// import { getCodeImg, getSmsCode } from "@/api/login";
import GaDialog from '../components/GaDialog/index.vue'
import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'

export default {
  name: 'Login',
  components: {
    GaDialog
  },
  data() {
    return {
      gaShow: {
        flag: false,
        loginForm: {},
        loginData: {}
      },
      show: true,
      timenum: undefined,
      codeUrl: '',
      cookiePassword: '',
      loginForm: {
        phoneNumber: '',
        password: '',
        // code: "",
        // smsCode: "",
        uuid: ''
      },
      loginRules: {
        phoneNumber: [
          { required: true, trigger: 'blur', message: '手机号不能为空' }
        ],
        password: [{ required: true, trigger: 'blur', message: '密码不能为空' }]
        // code: [
        //   { required: true, trigger: "change", message: "验证码不能为空" }
        // ],
        // smsCode: [
        //   { required: true, trigger: "change", message: "短信验证码不能为空" }
        // ]
      },
      loading: false,
      redirect: undefined
    }
  },
  computed: {
    time() {
      if ((this.timenum == 0) | (this.timenum == 60)) {
        this.show ? (this.show = false) : (this.show = true)
      }
      this.timenum = this.$store.state.common.telTime.second
      return this.timenum
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    // this.getCode();
    this.getCookie()
  },
  methods: {
    // getCode() {
    //   getCodeImg().then(res => {
    //     this.codeUrl = "data:image/gif;base64," + res.img;
    //     this.loginForm.uuid = res.uuid;
    //   });
    // },
    // sendSmsCode() {
    //   this.$store.commit("common/CLOCK");
    //   getSmsCode(this.loginForm.phonenumber);
    // },
    close1() {
      this.loading = false
      this.gaShow.flag = false
    },
    getCookie() {
      const phoneNumber = Cookies.get('phoneNumber')
      const password = Cookies.get('password')
      this.loginForm = {
        phoneNumber:
          phoneNumber === undefined ? this.loginForm.phoneNumber : phoneNumber,
        password:
          password === undefined ? this.loginForm.password : decrypt(password)
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          // Cookies.remove("phonenumber");
          // Cookies.remove("password");
          this.gaShow.loginForm = this.loginForm
          this.$store
            .dispatch('loginCheck', this.loginForm)
            .then(res => {
              const data = res
              this.gaShow.loginData = res
              this.loginForm.token = data.token
              const hasAuth = data.checkGa === 'true'
              if (hasAuth) {
                this.gaShow.flag = true
              } else {
                this.loginForm.gaCode = ''
                this.$store
                  .dispatch('Login', this.loginForm)
                  .then(res => {
                    this.$router.push({ path: '/index' || '/' })
                  })
                  .catch(() => {
                    this.loading = false
                  })
              }
            })
            .catch(() => {
              this.loading = false
              // this.getCode();
            })
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url('../assets/image/login-background.jpg');
  background-size: cover;
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 50px 25px 5px 25px;
  .el-input {
    height: 38px;
    input {
      height: 38px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  height: 38px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
</style>
