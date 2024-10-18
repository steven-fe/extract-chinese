<template>
  <div>
    <el-dialog
      :title="$t('system.pleaseEnterGACode')"
      width="400px"
      :visible.sync="gaShow.flag"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :before-close="handleClose"
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
import { gaExamine } from '@/api/finance/increase'
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
    // close(){
    //     this.$emit('close1')
    // },
    handleClose() {
      this.$emit('close1', 2)
      this.$refs['form'].resetFields()
    },
    submit() {
      const params = {
        id: this.gaShow.loginForm.id,
        examineRemarks: this.gaShow.loginForm.examineRemarks,
        googleCode: this.form.ga,
        capitalStatus: this.gaShow.loginForm.capitalStatus
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          gaExamine(params).then(res => {
            if (res.code === 200) {
              this.$message({
                message: `${res.msg}`,
                type: 'success'
              })
              this.$emit('close1', 1)
              this.$refs['form'].resetFields()
            } else {
              this.$message.error(`${res.msg}`)
            }
          })
        }
      })
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
