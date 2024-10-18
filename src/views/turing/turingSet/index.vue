<template>
  <div class="app-container">
    <!--form-->
    <el-row :gutter="20">
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-input v-model="currency" placeholder="请输入币种" />
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-input v-model="rate" placeholder="请输入比例" />
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-select v-model="type" placeholder="请选择类型">
            <el-option
              v-for="(item,index) in optionsStatus"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-input v-model="min_amount" placeholder="请输入最小限制" />
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-input v-model="max_amount" placeholder="请输入最大限制" />
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-input v-model="day_max_amount" placeholder="请输入每天最多提现" />
        </div>
      </el-col>
      <el-col :xs="12" :span="3">
        <div class="grid-content bg-purple">
          <el-button type="primary" icon="el-icon-search" @click="add()">添加</el-button>
        </div>
      </el-col>
    </el-row>
    <!--table-->
    <el-tag
      v-for="(tag,index) in dynamicTags"
      :key="index"
      style="margin: 10px;"
      closable
      :disable-transitions="false"
      @close="handleClose(tag)"
    >{{ '币种：'+ tag.currency + '比例：'+ tag.rate + '最小限制：'+ tag.min_amount + '最大限制 ：'+ tag.max_amount + '每日最大提现：'+ tag.day_max_amount + '类型：'+ typeInner(tag.type) }}</el-tag>
  </div>
</template>

<script>
import {
  listWithdrawalType,
  addWithdrawalType,
  delWithdrawalType
} from '@/api/turing'

export default {
  data() {
    return {
      loading: true,
      // 日期快捷选项
      // 币种下拉
      type: '',
      currency: '',
      rate: '',
      min_amount: '',
      max_amount: '',
      day_max_amount: '',
      optionsStatus: [
        {
          value: '1',
          label: '虚拟币'
        },
        {
          value: '2',
          label: '人民币'
        }
      ],
      dynamicTags: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    handleClose(index) {
      this.$confirm('此操作将永久删除该, 是否继续?', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      })
        .then(() => {
          const formData = {
            id: index.id
          }
          delWithdrawalType(formData)
            .then(response => {
              this.load()
            })
            .catch(error => {
              console.log(error)
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    typeInner(index) {
      if (index == 1) {
        return '虚拟币'
      } else {
        return '人民币'
      }
    },
    add() {
      const formData = {
        type: this.type,
        currency: this.currency,
        rate: this.rate,
        min_amount: this.min_amount,
        max_amount: this.max_amount,
        day_max_amount: this.day_max_amount
      }
      console.log()
      for (const key in formData) {
        if (formData[key].length == 0) {
          this.$message({
            showClose: true,
            message: '请填写全部信息',
            type: 'error'
          })
          return
        }
      }
      addWithdrawalType(formData)
        .then(response => {
          this.load()
        })
        .catch(error => {
          console.log(error)
        })
    },
    load() {
      this.loading = true
      const formData = {}
      listWithdrawalType(formData)
        .then(response => {
          if (response.code == 200) {
            this.dynamicTags = response.rows
          } else {
            this.dynamicTags = []
            this.msgError(response.msg)
          }
          this.loading = false
        })
        .catch(error => {
          console.log(error)
        })
    },
    // 日期处理
    formatDate(time) {
      if (time) {
        const date = new Date(time)
        const year = date.getFullYear()
        let month = date.getMonth() + 1
        let day = date.getDate()
        if (month < 10) {
          month = '0' + month
        }
        if (day < 10) {
          day = '0' + day
        }
        return year + '-' + month + '-' + day
      } else {
        return ''
      }
    }
  }
}
</script>
<style scoped>
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}

.top {
  margin-top: 20px;
}
</style>
