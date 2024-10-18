<template>
  <div class="google">
    <div class="app-container">
      <div class="step">1.扫码或者输入KEY</div>
      <div class="qrcode-box">
        <div
          id="qrcode"
          ref="qrcode"
        />
        <div class="box-key">
          <div>key:</div>
          <div><span ref="copytext">{{ authGoogle.googleKey }}</span>
            <i
              class="el-icon-document-copy"
              @click="copy"
            />
          </div>
        </div>
      </div>
      <div class="step">2.{{ $t('system.pleaseEnterGACode') }}</div>
      <div class="input-box">
        <el-input
          v-model="verifyData.googleCode"
          :placeholder="$t('system.pleaseEnterGACode')"
          clearable
        />
      </div>
      <div class="footer-btn">
        <el-button
          type="primary"
          @click="submit"
        >确定</el-button>
        <!-- <el-button @click="cancel" type="primary"> 取消</el-button> -->
      </div>

    </div>
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
  watch: {},
  created() {
    this.load()
  },
  methods: {
    load() {
      authGoogle().then(response => {
        if (response.code == 200) {
          this.authGoogle = response.data
          const url =
            'otpauth://totp/' +
            this.authGoogle.googleUser +
            '?secret=' +
            this.authGoogle.googleKey
          document.getElementById('qrcode').innerHTML = ''
          this.qr = new QRCode('qrcode', {
            text: url,
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
          })
        }
      })
    },
    submit() {
      const params = {}
      params.googleKey = this.authGoogle.googleKey
      params.googleCode = this.verifyData.googleCode
      bindGoogle(params)
        .then(response => {
          if (response.code == 200) {
            this.$message({
              message: '绑定成功',
              type: 'success'
            })
            this.$store.dispatch('GetBinGa')
          }
          this.verifyData.passWord = ''
          this.verifyData.googleCode = ''
          this.load()
        })
        .catch(err => {
          this.$message({
            message: '谷歌验证错误',
            type: 'error'
          })
        })
    },
    copy() {
      this.copyContent = this.$refs.copytext.innerText // 也可以直接写上等于你想要复制的内容
      var input = document.createElement('input') // 直接构建input
      input.value = this.copyContent // 设置内容
      console.log(input.value)
      document.body.appendChild(input) // 添加临时实例
      input.select() // 选择实例内容
      document.execCommand('Copy') // 执行复制
      document.body.removeChild(input) // 删除临时实例
      this.$message({
        message: '复制成功',
        type: 'success'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.google {
  width: 100%;
  min-height: calc(100vh - 84px);
  color: rgb(107, 104, 104);
  display: flex;
  align-items: center;
  justify-content: center;
  .app-container {
    border: 1px solid;
    width: 80%;
    padding: 30px;
    .qrcode-box {
      display: flex;
      flex: 1;
      align-items: flex-end;
      padding-left: 10px;

      .box-key {
        margin-left: 30px;
        .el-icon-document-copy {
          cursor: pointer;
          margin-left: 20px;
          font-size: 21px;
        }
      }
    }
    .footer-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 100px;
    }
    .step {
      margin: 30px 0;
    }
    .input-box {
      width: 400px;
    }
  }
}
::v-deep .el-button--medium {
  padding: 10px 60px;
}
::v-deep .el-button + .el-button {
  margin-left: 70px;
}
::v-deep .el-input--medium .el-input__inner {
  margin-bottom: 20px;
}
</style>
