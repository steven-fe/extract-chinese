<template>
  <div class="app-container">
    <!--form-->
    <el-row :gutter="20">
      <el-form label-width="160px">
        <el-form-item label="绑定手机号">
          <el-input v-model="reward" />
        </el-form-item>
        <el-form-item label="绑定邮箱">
          <el-input v-model="reward_commission" />
        </el-form-item>
      </el-form>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-button type="primary" @click="add()">保存</el-button>
        </div>
      </el-col>
    </el-row>
    <!--table-->
    <!--分页组件-->
  </div>
</template>
<script>
import { getSysSet, updateSysSet } from '@/api/otc'

export default {
  data() {
    return {
      loading: true,
      reward: '',
      reward_commission: '',
      formLabelWidth: '140px'
    }
  },
  created() {
    this.load()
  },
  methods: {
    // 加载
    load() {
      this.loading = true
      const formData = {}
      getSysSet(formData).then(response => {
        if (response.code == 200) {
          this.reward = response.sysPhone
          this.reward_commission = response.sys_email
        } else {
          this.reward = ''
          this.reward_commission = ''
        }
      }).catch(error => {
        console.log(error)
      })
    },
    add() {
      this.$confirm('此操作将覆盖设置, 是否继续?', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        const formData = {
          'sysPhone': this.reward,
          'sys_email': this.reward_commission
        }
        updateSysSet(formData).then(response => {
          this.$message({
            type: 'success',
            message: '更新成功!'
          })
          this.load()
        }).catch(error => {
          console.log(error)
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消保存'
        })
      })
    }
  }
}
</script>
<style scoped>
  .el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 100%;
  }

  .top {
    margin-top: 20px;
  }
</style>
