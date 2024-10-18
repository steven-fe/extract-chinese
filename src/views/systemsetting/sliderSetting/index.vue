<template>
  <!-- 大额充提提醒设置 -->
  <div class="app-container">
    <el-form ref="ruleForm" :inline="true" :model="params" :rules="rules" class="demo-form-inline">
      <el-form-item label="">
        同一用户连续登陆验证密码错误超过
      </el-form-item>
      <el-form-item label="" prop="userPwdErrorNumber">
        <el-input v-model="params.userPwdErrorNumber" style="width: 100px" />
        次，需要滑块
      </el-form-item>
      <br>
      <el-form-item label="">
        平台
      </el-form-item>
      <el-form-item label="" prop="unit">
        <el-input v-model="params.unit" style="width: 100px" />
        分钟内，
      </el-form-item>
      <el-form-item label="">
        累计校验密码错误超过
      </el-form-item>
      <el-form-item label="" prop="errorTotal">
        <el-input v-model="params.errorTotal" style="width: 100px" />
        次，需要滑块
      </el-form-item>
    </el-form>
    <el-button type="primary" size="mini" style="margin-top: 30px" @click="setConfig">保存</el-button>
  </div>
</template>
<script>
import * as API from '@/api/slider'

export default {
  name: 'SliderSetting',
  data() {
    const validateNum = (rule, value, callback) => {
      if (!Number.isInteger(+value) || +value <= 0) {
        callback(new Error('只能输入正整数'))
      } else {
        callback()
      }
    }
    return {
      params: {
        unit: '',
        errorTotal: '',
        userPwdErrorNumber: ''
      },
      rules: {
        unit: [
          { validator: validateNum, trigger: 'blur' }
        ],
        errorTotal: [
          { validator: validateNum, trigger: 'blur' }
        ],
        userPwdErrorNumber: [
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
      API.getConfig().then(res => {
        console.log('获取列表', res)
        if (res.code === 200) {
          Object.keys(this.params).forEach(item => {
            this.params[item] = res.data[item]
          })
        }
      })
    },
    setConfig() {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          API.setConfig(this.params).then(res => {
            console.log('获取列表', res)
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
  padding-top: 100px;
  padding-left: 300px;
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
