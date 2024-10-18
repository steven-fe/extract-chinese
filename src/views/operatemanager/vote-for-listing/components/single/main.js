import { watchRouteChangeOnce } from '@/utils'
import { getVoteCurrencyList, addOrUpdate, getVoteDetail } from '@/api/operate/vote-for-listing'
import $store from '@/store'
import { uploadImage } from '../../utils'

let callbackOnSubmit = () => {}

const formRuleCheckStartTime = ({ vm }, key, _, value, callback) => {
  const { startTime, endTime } = vm.form
  const name = key === 'startTime' ? '开始' : '结束'

  if (!value) return callback(new Error(`请选择${name}时间`))
  if (key === 'startTime' && endTime && value >= endTime) return callback(new Error('开始时间不能大于或等于结束时间'))
  if (key === 'endTime' && startTime && startTime >= value) return callback(new Error('结束时间不能小于或等于开始时间'))
  return callback()
}

const getRules = (() => {
  const argsWrap = { vm: null, type: null }

  const rules = {
    currencyId: [{ required: true, message: '请选择币种', trigger: 'change' }],
    threshold: [{ required: true, message: '请填写上币门槛票数', trigger: 'change' }],
    logo: [{ required: true, message: '请上传logo', trigger: 'change' }],
    sort: [{ required: true, message: '请填写排序权重', trigger: 'change' }],
    poolCurrencyId: [{ required: true, message: '请选择币种', trigger: 'change' }],
    poolNumber: [{ required: true, message: '请填写奖池数量', trigger: 'change' }],
    startTime: [{ required: true, validator: formRuleCheckStartTime.bind(null, argsWrap, 'startTime'), trigger: 'change' }],
    endTime: [{ required: true, validator: formRuleCheckStartTime.bind(null, argsWrap, 'endTime'), trigger: 'change' }]
  }

  return (vm, type) => {
    argsWrap.vm = vm
    argsWrap.type = type
    return rules
  }
})()

export default {
  name: 'Single',
  data() {
    return {
      activityStatus: 0,
      show: false,
      type: 'create', // 'create', 'edit'
      voteCurrencyList: [],

      form: {
        id: null,
        currencyId: null,
        currencyCode: null,
        threshold: null,
        logo: null,
        sort: null,
        poolCurrencyId: null,
        poolCurrencyCode: null,
        poolNumber: null,
        addCalendar: 1,
        startTime: null,
        endTime: null
      }
    }
  },
  methods: {
    async setForm() {
      const { data } = await getVoteDetail(this.form.id)
      for (const key in data) {
        if (key in this.form) this.form[key] = data[key]
      }
      return data
    },
    async open({ id, type } = { type: 'create', id: null }, callback = () => {}) {
      this.show = true
      this.type = type
      this.form.id = id
      this.voteCurrencyList = (await getVoteCurrencyList({ activityId: id })).data

      callbackOnSubmit = callback
      watchRouteChangeOnce(() => this.close())

      if (type === 'edit') {
        const { activityStatus } = await this.setForm()
        this.activityStatus = activityStatus
      }
    },
    close() {
      this.show = false
      this.activityStatus = 0
      this.$refs.form.resetFields()
      this.$nextTick(() => this.$refs.form.clearValidate())
    },
    async submit() {
      try {
        await this.$refs.form.validate()
        await addOrUpdate(this.form)
        callbackOnSubmit()
        this.close()
        this.msgSuccess('操作成功')
      } catch (e) {
      }
    }
  },
  render() {
    const currencyMap = $store.getters['systemsetting/currencyMap']

    return (<el-dialog title={`${this.type === 'create' ? '添加' : '编辑'}活动`} width="800px" visible={this.show} on={{ 'update:visible': () => this.close() }}>
      <el-form ref="form" props={ { model: this.form } } rules={getRules(this, this.type)} label-width="140px">

        <el-row>
          <el-col span={12}>
            <el-form-item label="币种" prop="currencyId">
              <el-select value={this.form.currencyId} size="mini" filterable clearable placeholder="请选择币对" onInput={currencyId => (this.form.currencyId = currencyId, this.form.currencyCode = currencyMap.get(currencyId).name)}>
                { this.voteCurrencyList.map(({ id, name }) => (<el-option key={id} label={name} value={id} />)) }
              </el-select>
            </el-form-item>
          </el-col>

          <el-col span={12}>
            <el-form-item label="上币门槛票数" prop="threshold">
              <el-input-number min={1} step-strictly value={this.form.threshold} onInput={ threshold => this.form.threshold = threshold } />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col span={12}>
            <el-form-item label="logo图" prop="logo">
              <el-input
                style="width: 200px"
                value={this.form.logo}
                nativeOnClick={async(event) => {
                  event.stopPropagation()
                  const logo = await uploadImage()
                  this.form.logo = logo
                }}
              />
            </el-form-item>
          </el-col>

          <el-col span={12}>
            <el-form-item label="排序权重" prop="sort">
              <el-input-number min={0} step-strictly value={this.form.sort} onInput={ sort => this.form.sort = sort } />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col span={12}>
            <el-form-item label="奖池币种" prop="poolCurrencyId">
              <el-select value={this.form.poolCurrencyId} size="mini" filterable clearable placeholder="请选择币对" onInput={poolCurrencyId => (this.form.poolCurrencyId = poolCurrencyId, this.form.poolCurrencyCode = currencyMap.get(poolCurrencyId).name)}>
                { Array.from(currencyMap.values()).map(({ id, name }) => (<el-option key={id} label={name} value={id} />)) }
              </el-select>
            </el-form-item>
          </el-col>

          <el-col span={12}>
            <el-form-item label="奖池数量" prop="poolNumber">
              <el-input-number min={1} step-strictly value={this.form.poolNumber} onInput={ poolNumber => this.form.poolNumber = poolNumber } />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col span={12}>
            <el-form-item label="投票活动开启时间" prop="startTime">
              <el-date-picker
                value={this.form.startTime}
                type="datetime"
                disabled={this.activityStatus === 1}
                placeholder="选择日期时间"
                value-format="timestamp"
                onInput={startTime => this.form.startTime = startTime}
              />
            </el-form-item>
          </el-col>

          <el-col span={12}>
            <el-form-item label="投票活动结束时间" prop="endTime">
              <el-date-picker
                value={this.form.endTime}
                type="datetime"
                placeholder="选择日期时间"
                value-format="timestamp"
                onInput={endTime => this.form.endTime = endTime}
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col span={12}>
            <el-form-item label="是否添加到日历" prop="addCalendar">
              <el-radio-group value={this.form.addCalendar} onInput={addCalendar => this.form.addCalendar = addCalendar}>
                {
                  [{ id: 1, name: '是' }, { id: 0, name: '否' }].map(({ id, name }) => (<el-radio label={id}>{name}</el-radio>))
                }
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>

      <div slot="footer" style="text-align: right;">
        <el-button onClick={this.close}>取 消</el-button>
        <el-button type="primary" onClick={this.submit}>确 定</el-button>
      </div>
    </el-dialog>)
  }
}
