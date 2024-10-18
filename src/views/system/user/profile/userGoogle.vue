<template>
  <div class="app-container">

    <div id="qrcode" ref="qrcode" />

    <el-input
      v-model="verifyData.googleCode"
      placeholder="Authenticator"
      clearable
    />

    <el-input
      v-model="verifyData.passWord"
      placeholder="密码"
      clearable
    />

    <el-button
      type="primary"
      @click="bind()"
    >提交</el-button>
  </div>
</template>

<script>
import QRCode from 'qrcodejs2'
import { authGoogle, bindGoogle } from '@/api/userSecurity/userSecurity.js'

export default {
  data() {
    return {
      // 谷歌验证绑定校验
      verifyData: {
        googleCode: '',
        passWord: ''
      },
      // 验证前生成GoogleKey
      authGoogle: {
        googleUser: '',
        googleKey: ''
      }
    }
  },
  watch: {

  },
  created() {
    this.load()
  },
  methods: {
    load() {
      authGoogle().then(response => {
        if (response.code == 200) {
          this.authGoogle = response.data
          const url = 'otpauth://totp/' + this.authGoogle.googleUser + '?secret=' + this.authGoogle.googleKey
          this.qr = new QRCode(this.$refs.qrcode, {
            text: url,
            width: 100,
            height: 100,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
          })
        }
      })
    },
    bind() {
      const params = {}
      params.passWord = this.verifyData.passWord
      params.googleKey = this.authGoogle.googleKey
      params.googleCode = this.verifyData.googleCode
      bindGoogle(params).then(response => {
        if (response.code == 200) {
          console.log('绑定成功')
        }
        this.verifyData.passWord = ''
        this.verifyData.googleCode = ''
        this.load()
      })
    }
  }
}
</script>
