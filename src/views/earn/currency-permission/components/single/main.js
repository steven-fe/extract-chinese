import $store from '@/store'
import { addCurrencySort, getCurrencySort, editCurrencySort } from '@/api/earn/currency-permission'
import { commonData } from '../../data'

let callbackOnSubmit = () => {}

const rules = {
  currency: [{ required: true, message: '请选择币种', trigger: 'change' }],
  sort: [{ required: true, message: '请输入排序权重', trigger: 'change' }]
}

export default {
  name: 'Single',
  data() {
    return {
      show: false,
      type: 'create', // 'create', 'edit'

      form: {
        currency: '',
        sort: null
      }
    }
  },
  methods: {
    async setForm() {
      const { data } = await getCurrencySort(this.form.id)

      for (const key in data) {
        if (key in this.form) this.form[key] = data[key]
      }

      this.form.sort = data.fsort
      this.form.currency = data.fcurrency
    },
    async open({ id, type } = { type: 'create', id: null }, callback = () => {}) {
      this.show = true
      this.type = type
      this.form.id = id

      callbackOnSubmit = callback

      if (type === 'edit') await this.setForm()
    },
    close() {
      this.show = false
      this.$refs.form.resetFields()
      this.$nextTick(() => this.$refs.form.clearValidate())
    },
    async submit() {
      try {
        await this.$refs.form.validate()
        await (this.type === 'edit' ? editCurrencySort : addCurrencySort)(this.form)
        callbackOnSubmit()
        this.close()
        this.msgSuccess('操作成功')
      } catch (e) {
        console.log(e)
      }
    }
  },
  render() {
    const currencyMap = $store.getters['systemsetting/currencyMap']

    return (<el-dialog title={`${this.type === 'create' ? '新增' : '修改'}理财币种`} width="600px" visible={this.show} on={{ 'update:visible': () => this.close() }}>
      <el-form ref="form" props={ { model: this.form } } rules={rules} label-width="240px">

        <el-row>
          <el-form-item label="选择币种" prop="currency">
            <el-select value={this.form.currency} disabled={this.type === 'edit'} size="mini" filterable clearable placeholder="请选择币种" onInput={currency => (this.form.currency = currency)}>
              { Array.from(currencyMap.values()).map(({ id, name }) => (<el-option key={id} label={name} value={name} />)) }
            </el-select>
          </el-form-item>
        </el-row>

        <el-row>
          <el-form-item label={`排序权重（当前最大权重 ${commonData.maxSort}）`} prop="sort">
            <el-input-number min={1} step-strictly value={this.form.sort} onInput={ sort => (this.form.sort = sort) } />
          </el-form-item>
        </el-row>

      </el-form>

      <div slot="footer" style="text-align: right;">
        <el-button onClick={this.close}>取 消</el-button>
        <el-button type="primary" onClick={this.submit}>确 定</el-button>
      </div>
    </el-dialog>)
  }
}
