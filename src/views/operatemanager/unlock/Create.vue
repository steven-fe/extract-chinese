<template>
  <el-dialog :title="$t('financemanager.tokenUnlock')" :visible.sync="show" width="30%" :close-on-click-modal="false">
    <el-form ref="createForm" :model="createForm" :rules="createRules">
      <el-form-item :label="$t('financemanager.tokenName')" prop="coin">
        <el-select v-model="createForm.coin" filterable clearable style="width: 100%" :placeholder="$t('common.pleaseChoose')">
          <el-option
            v-for="item in codeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('financemanager.unlockRemarks')" prop="remark">
        <el-input v-model="createForm.remark" />
      </el-form-item>
      <el-form-item :label="$t('financemanager.unlockUUidsAndQuantities')" prop="ids">
        <el-input v-model="createForm.ids" :placeholder="$t('financemanager.uidsAndQuantities')" />
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="show = false">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="unlockAdd">{{ $t('common.sure') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { unlockAdd } from '@/api/operate/lock'
import { mapState } from 'vuex'

export default {
  name: 'Create',
  data() {
    const checkJobName = (rule, value, callback) => {
      if (!Number.isNaN(+value)) {
        return callback(new Error(this.$t('financemanager.pleaseEnterTheCorrectReleaseRemarks')))
      }
      callback()
    }
    return {
      show: false,
      createForm: {
        coin: '', // 币种id
        ids: '',
        remark: ''
      },
      createRules: {
        coin: [
          { required: true, message: this.$t('financemanager.tokenNameCannotBeEmpty'), trigger: 'change' }
        ],
        ids: [
          { required: true, message: this.$t('financemanager.unlockUIDAndNumberCannotBeEmpty'), trigger: 'blur' }
        ],
        remark: [
          { required: true, message: this.$t('financemanager.unlockingRemarksCannotBeEmpty'), trigger: 'blur' },
          { required: true, validator: checkJobName, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList', 'protocolList']),
    codeOptions() {
      return this.currencyList
    }
  },
  methods: {
    init() {
      this.show = true
    },
    unlockAdd() {
      this.$refs['createForm'].validate(valid => {
        if (valid) {
          console.log('提交参数', this.createForm)
          this.$confirm(this.$t('financemanager.makeSureToUnlockTheUserlockTokenImmediately'), this.$t('common.prompt'), {
            confirmButtonText: this.$t('common.sure'),
            cancelButtonText: this.$t('common.cancel'),
            type: 'warning'
          }).then(() => {
            unlockAdd(this.createForm).then(res => {
              if (res.code === 200) {
                this.$message.success(res.msg)
                this.$emit('success')
                this.show = false
              }
            })
          }).catch(() => {
            // this.show = false
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.tips {
    margin-top: 30px;
    div{
        padding: 10px 0;
    }
}
</style>
