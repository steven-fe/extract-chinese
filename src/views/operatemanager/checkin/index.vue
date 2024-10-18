<template>
  <div class="app-container">
    <!--form-->
    <el-row :gutter="20">
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-input v-model="reward" placeholder="签到奖励" />
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-input v-model="reward_commission" placeholder="推荐用户奖励提成" />
        </div>
      </el-col>
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
import { getCheckinConfig, updateCheckinConfig } from '@/api/coin'

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

      getCheckinConfig(formData).then(response => {
        if (response.code == 200) {
          this.reward = response.reward
          this.reward_commission = response.reward_commission
        } else {
          this.reward = ''
          this.reward_commission = ''
          this.msgError(response.msg)
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
          'reward': this.reward,
          'reward_commission': this.reward_commission
        }
        updateCheckinConfig(formData).then(response => {
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
