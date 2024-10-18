<template>
  <div>
    <el-dialog
      :title="$t('system.pleaseEnterGACode')"
      width="400px"
      :visible.sync="gaShow.flag"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      @close="close"
    >
      <el-form ref="form" :model="form" :rules="loginRules">
        <el-form-item prop="ga">
          <el-input v-model="form.ga" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submit">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'GaDialog',
  props: {
    gaShow: {
      typeof: Object,
      default: () => {}
    }
  },
  data() {
    return {
      form: {
        ga: ''
      },
      loginRules: {
        ga: [
          { required: true, trigger: 'blur', message: this.$t('currencymanager.notNull') }
        ]
      }
    }
  },
  methods: {
    close() {
      this.$emit('close1')
    },
    submit() {
      const params = {
        phoneNumber: this.gaShow.loginForm.phoneNumber,
        password: this.gaShow.loginForm.password,
        gaCode: this.form.ga,
        token: this.gaShow.loginData.token
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          // Cookies.remove("phonenumber");
          // Cookies.remove("password");
          this.$store.dispatch('Login', params).then((res) => {
            this.$router.push({ path: '/index' || '/' })
          }).catch(() => {
            this.loading = false
            // this.getCode();
          })
        }
      })
      this.$emit('close1')
    }
  }
}
</script>

<style lang="scss" scoped>
 .dialog-footer{
     text-align: center;
 }
 ::v-deep .el-dialog__body{
   padding:20px;
 }
</style>
