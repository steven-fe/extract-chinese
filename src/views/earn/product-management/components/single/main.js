import {
  addProduct,
  getProductDetail,
  editProduct
} from '@/api/earn/product-management'
import { parseTime } from '@/utils/ruoyi'
import Editor from '@/components/wangEditor'
import { Message, MessageBox } from 'element-ui'
import { throttle } from 'throttle-debounce'
import single from './index'
import $data, { typeMap } from '../../data'
import styles from './index.module.scss'

const getRules = (() => {
  const rulesOfCheckLimit = (_1, _2, callback) => {
    const { minLimit, maxLimit } = _vm.form
    if (minLimit <= 0) return callback(new Error('个人限额最低必需 > 0'))
    if (minLimit > maxLimit) {
      return callback(new Error('个人限额最高值必需 ≥ 个人限额最低值'))
    }
    callback()
  }

  const rulesOfCheckRaiseAmount = (_1, _2, callback) => {
    const { maxLimit, raiseAmountSwitch, raiseTotalAmount } = _vm.form
    if (
      raiseAmountSwitch &&
      typeof maxLimit === 'number' &&
      maxLimit > raiseTotalAmount
    ) {
      return callback(new Error('募集总额必需 ≥ 个人限额最低值'))
    }
    callback()
  }

  const rulesOfCheckRaiseStartTs = (_1, _2, callback) => {
    const { raiseStartTs } = _vm.form
    if (!raiseStartTs) return callback(new Error('请选择时间'))
    if (raiseStartTs < +new Date()) {
      return callback(new Error('开始时间不能早于当前时间'))
    }
    callback()
  }

  const rulesOfCheckProductDescription = (language, _1, _2, callback) => {
    const { desc } = _vm.form
    const { value } = desc.find(({ key }) => key === language)
    // wangEditor 问题，输入内容删除后，获取内容会有空标签
    if (!value || value === '<p><br></p>') return callback(new Error('请输入产品说明'))
    callback()
  }
  const rulesOfCheckShelvingMode = (_1, _2, callback) => {
    const { shelvingMode } = _vm.form
    if (shelvingMode === 2) {
      _vm.$refs['form'].clearValidate('shelvingTs')
      _vm.form.shelvingTs = null
      return callback()
    }
    callback()
  }
  const rulesOfCheckSetTimeoutTime = (_1, _2, callback) => {
    const { shelvingMode, shelvingTs } = _vm.form
    // 如果选择的不是定时上架则时间选择无效
    if (shelvingMode === 2 && shelvingTs) {
      _vm.form.shelvingTs = null
      return callback()
    }
    if (shelvingMode === 2 && !shelvingTs) return callback()
    if (!shelvingTs) return callback(new Error('请选择上架时间'))
    // 如果是查看或者已经上架的产品，处于不可编辑状态，不做校验
    if (_vm.type === 'view' || _vm.row && _vm.row.shelfState === 1) {
      return callback()
    }
    if (shelvingTs < +new Date()) {
      return callback(new Error('上架时间不能早于当前时间'))
    }
    callback()
  }
  let _vm = null

  const rules = {
    productInsideName: [
      { required: true, message: '请输入产品内部名称', trigger: 'change' }
    ],
    productType: [
      { required: true, message: '请选择产品类型', trigger: 'change' }
    ],
    investmentCurrency: [
      { required: true, message: '请选择投资币种', trigger: 'change' }
    ],
    noviceExclusive: [
      { required: true, message: '请选择是否新手专享', trigger: 'change' }
    ],
    reinvest: [
      { required: true, message: '请选择是否支持复投', trigger: 'change' }
    ],
    shelvingMode: [
      { required: true, validator: rulesOfCheckShelvingMode, trigger: 'change' }
    ],
    shelvingTs: [
      {
        required: true,
        validator: rulesOfCheckSetTimeoutTime,
        trigger: 'change'
      }
    ],
    limit: [
      { required: true, validator: rulesOfCheckLimit, trigger: 'change' }
    ],
    raiseAmount: [
      { required: true, validator: rulesOfCheckRaiseAmount, trigger: 'change' }
    ],
    raiseStartTs: [
      { required: true, validator: rulesOfCheckRaiseStartTs, trigger: 'change' }
    ],
    raiseEndNumber: [
      { required: true, message: '请输入募集结束倒计时小时', trigger: 'change' }
    ],
    interestNumber: [
      { required: true, message: '请输入计息时间', trigger: 'change' }
    ],
    investmentCycle: [
      { required: true, message: '请输投资期限', trigger: 'change' }
    ],
    annualizedIncome: [
      { required: true, message: '请输入年化收益率', trigger: 'change' }
    ],
    productDescription_en_US: [
      {
        required: true,
        validator: rulesOfCheckProductDescription.bind(null, 'en_US'),
        trigger: 'change'
      }
    ]
  }

  return (vm) => {
    _vm = _vm || vm
    return _vm.type === 'view' ? {} : rules
  }
})()

const isValid = (value) =>
  !(value === '' || value === null || value === undefined)
const toNumberOrNull = (value) => (typeof value === 'number' ? value : null)

const MILLI_SECONDS_OF_ONE_HOUR = 60 * 60 * 1000
const MILLI_SECONDS_OF_ONE_DAY = 24 * MILLI_SECONDS_OF_ONE_HOUR

let updateList = () => {}

export default {
  name: 'Single',
  data() {
    const formFactory = () => ({
      id: null,
      productInsideName: '',
      productType: null,
      investmentCurrency: null,
      incomeCurrency: null,
      minLimit: null,
      maxLimit: null,
      raiseAmountSwitch: 1,
      raiseTotalAmount: null,
      raiseStartTs: null,
      raiseEndNumber: null,
      interestNumber: null,
      investmentCycle: null,
      annualizedIncome: null,
      paymentWay: 0,
      expireNumber: null,
      desc: [],
      shelvingMode: 2,
      noviceExclusive: 0,
      reinvest: 0,
      shelvingTs: null // 自动上架时间
    })

    return {
      show: false,
      type: 'create', // 'create', 'edit', 'view', 'copy'
      row: null, // 列表数据
      currencyList: [],
      detail: { fstate: null },
      formFactory,
      form: formFactory(),
      submitBtnLoading: false,
      getShelfState: false,
      tabActive: 'params'
    }
  },
  methods: {
    async setForm(id) {
      const { data } = await getProductDetail(id)
      for (const _key in data) {
        const key = _key.startsWith('f') ? _key.slice(1) : _key
        if (key in this.form) this.form[key] = data[_key]
      }
      this.detail = data
    },
    afterOpen() {
      this.tabActive = 'params'
      // 移除校验
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
        this.$refs['form-intor'].clearValidate()
      })
      if (this.type === 'edit') {
        if (this.detail.fstate !== 0) {
          this.close()
          Message({ message: '该理财产品不可修改', type: 'error' })
          updateList()
        }
      }
    },
    async open(info, callback = () => {}) {
      const { id, type, row } = info || { type: 'create' }

      this.show = true
      this.type = type
      this.row = row
      this.currencyList = Array.from($data.currencyMap.values())

      updateList = callback

      /** setForm */
      if (
        this.type === 'edit' ||
        this.type === 'view' ||
        this.type === 'copy'
      ) {
        await this.setForm(id)
      }
      /** second setForm */
      if (this.type === 'copy') this.form.id = this.formFactory().id

      if (this.form.shelvingMode === 2) this.form.shelvingTs = null
      this.afterOpen()
    },
    close() {
      this.show = false
    },
    edit() {
      const { id } = this.form

      this.close()
      setTimeout(() => single.open({ id, type: 'edit' }, updateList), 500)
    },
    async submit() {
      try {
        this.submitBtnLoading = true
        if (this.form.shelvingMode === 2) {
          this.form.shelvingTs = null
        }
        await this.$refs.form.validate()
        await this.$refs['form-intor'].validate()
        // 创建和复制需要提示
        if (this.type === 'create' || this.type === 'copy') {
          //  所以语言都填充完了不需要弹窗确认了
          const desc = this.form.desc
          const isEmptyValue = desc.findIndex(item => !item.value)
          if (isEmptyValue !== -1) {
            MessageBox.confirm(
              `将英文语种配置复用至其他语种？（保留其他语种已填写的配置）`,
              `提示`,
              {
                type: 'warning',
                dangerouslyUseHTMLString: true,
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }
            ).then(async() => {
              let desc = this.form.desc
              const { value } = desc.find(({ key }) => key === 'en_US')
              desc = desc.map(item => {
                if (!item.value || item.value.length === 0) {
                  item.value = value
                }
                return item
              })
              this.form.desc = desc
              await this.handleProduct()
            }).catch(() => {})
          } else {
            await this.handleProduct()
          }
        } else {
          await this.handleProduct()
        }
      } catch (err) {
        console.log('err', err)
        //  校验不通过定位到错误位置 - 切换到检验不通过的面板
        const el = this.$refs['form'].$el
        const errors = el.getElementsByClassName('is-error')
        if (errors.length > 0) {
          this.tabActive = 'params'
          errors[0].scrollIntoView(true)
        } else {
          this.tabActive = 'intor'
          this.$nextTick(() => {
            const el = this.$refs['form-intor'].$el
            const errors = el.getElementsByClassName('is-error')
            if (errors.length > 0) {
              errors[0].scrollIntoView(true)
            }
          })
        }
      } finally {
        this.submitBtnLoading = false
      }
    },
    async handleProduct() {
      await (this.type === 'edit' ? editProduct : addProduct)(this.form)
      updateList()
      this.close()
      this.msgSuccess('操作成功')
    },
    // 渲染复投弹窗提示内容
    renderToolTip() {
      return (
        <div slot="content">
          1.开启自动复投功能，用户单次申购成功的理财订单到期后会自动申购相同周期的产品并开始计息。<br />
          ·复投金额：默认为用户单次成功申购理财产品的本息总额。<br />
          ·复投时间：默认为用户单次成功申购理财产品的到账时间+48H。<br />
          2.以下场景会导致复投失败：<br />
          ·复投时，线上不存在用户之前申购的相同币种与周期的定期产品。<br />
          ·复投时，如果现货账户可用余额小于复投金额。<br />
          ·复投时，复投金额大于个人剩余额度或者项目剩余额度。<br />
          3.复投失败后，需要用户手动重新认购。<br />
          4.用户可以在本页面开启自动复投。如用户需要关闭某笔订单的复投，请到理财订单-订单详情-复投详情处进行关闭。若您关闭后需要重新开启，重新进入理财页面，选择新的投资标的进行申购与复投。
        </div>
      )
    }
  },
  mounted() {
    /** when scroll, blur */
    this.$el.addEventListener(
      'scroll',
      throttle(50, () => {
        if (
          this.show &&
          document.activeElement &&
          this.$el.contains(document.activeElement)
        ) {
          document.activeElement.blur()
        }
      })
    )
  },
  render() {
    const raiseEndTs =
      isValid(this.form.raiseStartTs) && isValid(this.form.raiseEndNumber)
        ? this.form.raiseStartTs +
          this.form.raiseEndNumber * MILLI_SECONDS_OF_ONE_HOUR
        : null

    const investStartTs =
      isValid(raiseEndTs) && isValid(this.form.interestNumber)
        ? raiseEndTs + this.form.interestNumber * MILLI_SECONDS_OF_ONE_HOUR
        : null

    const investEndTs =
      isValid(raiseEndTs) && isValid(this.form.investmentCycle)
        ? investStartTs + this.form.investmentCycle * MILLI_SECONDS_OF_ONE_DAY
        : null

    return (
      <el-dialog
        title={`${
          this.type === 'create' || this.type === 'copy'
            ? '新增'
            : this.type === 'edit'
              ? '修改'
              : '查看'
        }理财币种`}
        width="1200px"
        close-on-click-modal={false}
        close-on-press-escape={false}
        show-close={false}
        visible={this.show}
        class={styles.productDialog}
        onClosed={() => {
          this.form = this.formFactory()
          this.$nextTick(() => this.$refs.form.resetFields())
        }}
        on={{ 'update:visible': (visible) => !visible && this.close() }}
      >

        <el-tabs class={this.type !== 'create' && this.type !== 'copy' && this.type !== 'view' ? 'product_tabHide' : ''} style={{ marginTop: '-20px' }} value={this.tabActive} on={
          { 'tab-click': (e) => { this.tabActive = e.name } }
        }>
          <el-tab-pane label="产品参数" name="params">
            <el-form
              class={styles.iForm}
              ref="form"
              props={{ model: this.form }}
              rules={getRules(this)}
              label-width="120px"
            >

              <el-row>
                <el-form-item label="产品内部名称：" prop="productInsideName">
                  <el-input
                    value={this.form.productInsideName}
                    disabled={['edit', 'view'].includes(this.type)}
                    onInput={(productInsideName) =>
                      (this.form.productInsideName = productInsideName || null)
                    }
                  />
                </el-form-item>
              </el-row>

              <el-row>
                <el-form-item label="产品类型：" prop="productType">
                  <el-select
                    value={this.form.productType}
                    size="mini"
                    filterable
                    clearable
                    placeholder="选择类型"
                    disabled={['edit', 'view'].includes(this.type)}
                    onInput={(id) =>
                      (this.form.productType =
                    typeof id === 'number' ? id : id || null)
                    }
                  >
                    {Array.from(typeMap.values()).map(({ id, name }) => (
                      <el-option key={id} label={name} value={id} />
                    ))}
                  </el-select>
                </el-form-item>
              </el-row>

              <el-row>
                <el-form-item label="投资币种：" prop="investmentCurrency">
                  <el-select
                    value={this.form.investmentCurrency}
                    size="mini"
                    filterable
                    clearable
                    placeholder="选择类型"
                    disabled={['edit', 'view'].includes(this.type)}
                    onInput={(name) => {
                      this.form.investmentCurrency = name || null
                      this.form.incomeCurrency = name || null
                    }}
                  >
                    {this.currencyList.map(({ id, name }) => (
                      <el-option key={id} label={name} value={name} />
                    ))}
                  </el-select>
                </el-form-item>
              </el-row>

              <el-row>
                <el-form-item prop="noviceExclusive">
                  <div slot="label" class="i-label">
                新手专享：
                    <el-tooltip
                      class="item"
                      effect="dark"
                      content="无理财记录的用户"
                      placement="top"
                    >
                      <i class="el-icon-info" />
                    </el-tooltip>
                  </div>

                  <el-radio-group
                    value={this.form.noviceExclusive}
                    disabled={['edit', 'view'].includes(this.type)}
                    onInput={(noviceExclusive) => {
                      this.form.noviceExclusive = noviceExclusive
                      // 新手专享下，不能支持复投，并且将支持复投设置为否
                      if (noviceExclusive === 1) {
                        this.form.reinvest = 0
                      }
                    }
                    }
                  >
                    <el-radio label={0}>否</el-radio>
                    <el-radio label={1}>是</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-row>

              <el-row>
                <el-form-item prop="reinvest">
                  <div slot="label">
                支持复投：
                    <el-tooltip
                      class="item"
                      popper-class={styles.repeatTooltip}
                      effect="dark"
                      placement="top"
                    >
                      {this.renderToolTip()}
                      <i class="el-icon-question" />
                    </el-tooltip>
                  </div>

                  <el-radio-group
                    value={this.form.reinvest}
                    disabled={['edit', 'view'].includes(this.type) || this.form.noviceExclusive === 1}
                    onInput={(reinvest) =>
                      (this.form.reinvest = reinvest)
                    }
                  >
                    <el-radio label={0} value={0}>否</el-radio>
                    <el-radio label={1} value={1}>是</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-row>

              <el-row>
                <el-form-item prop="shelvingMode">
                  <div slot="label">上架方式：</div>
                  <el-radio-group
                    value={this.form.shelvingMode}
                    disabled={!!(this.type === 'view' || this.row && this.row.shelfState === 1)}
                    onInput={(shelvingMode) =>
                      (this.form.shelvingMode = shelvingMode)
                    }
                  >
                    <el-radio label={2} value={2}>立即上架</el-radio>
                    <el-radio label={3} value={2}>自动定时上架</el-radio>
                    {
                      this.form.shelvingMode === 3 ? <el-form-item
                        prop="shelvingTs"
                        style={{ display: 'inline-block' }}
                      >
                        <el-date-picker
                          disabled={!!(this.type === 'view' || this.row && this.row.shelfState === 1)}
                          props={{
                            clearable: true,
                            size: 'mini',
                            value: this.form.shelvingTs
                              ? new Date(this.form.shelvingTs)
                              : null,
                            type: 'datetime',
                            format: 'yyyy-MM-dd HH:mm:ss',
                            'value-format': 'timestamp',
                            'default-time': '00:00:00'
                          }}
                          onInput={(date) => (this.form.shelvingTs = date)}
                        />
                        <span style={{ marginLeft: '10px' }}>UTC+8</span>
                      </el-form-item> : null
                    }
                  </el-radio-group>
                </el-form-item>

              </el-row>
              <el-row>
                <h2>投资限额</h2>
              </el-row>
              <el-row>
                <el-col span={12}>
                  <el-form-item label="个人限额：" prop="limit">
                    <div style="display: flex;">
                      <el-input-number
                        min={0}
                        value={this.form.minLimit}
                        disabled={['edit', 'view'].includes(this.type)}
                        onInput={(minLimit) =>
                          (this.form.minLimit = toNumberOrNull(minLimit))
                        }
                      />
                  &nbsp;&nbsp;-&nbsp;&nbsp;
                      <el-input-number
                        min={this.form.minLimit || 0}
                        value={this.form.maxLimit}
                        disabled={['edit', 'view'].includes(this.type)}
                        onInput={(maxLimit) =>
                          (this.form.maxLimit = toNumberOrNull(maxLimit))
                        }
                      />
                    </div>
                  </el-form-item>
                </el-col>
                <el-col span={12}>
                  <el-form-item label="募集总额：" prop="raiseAmount">
                    <div style="display: flex;align-items: center;">
                  设置上限&nbsp;
                      <el-switch
                        value={!!this.form.raiseAmountSwitch}
                        active-text="开"
                        inactive-text="关"
                        disabled={['edit', 'view'].includes(this.type)}
                        onInput={(raiseAmountSwitch) => {
                          this.form.raiseAmountSwitch = +raiseAmountSwitch
                          this.form.raiseTotalAmount = raiseAmountSwitch
                            ? this.form.raiseTotalAmount
                            : null
                        }}
                      />
                  &nbsp;&nbsp;
                      {this.form.raiseAmountSwitch ? (
                        <el-input-number
                          min={this.form.maxLimit || 0}
                          value={this.form.raiseTotalAmount}
                          disabled={['edit', 'view'].includes(this.type)}
                          onInput={(raiseTotalAmount) =>
                            (this.form.raiseTotalAmount = toNumberOrNull(
                              raiseTotalAmount
                            ))
                          }
                        />
                      ) : (
                        '不设上限'
                      )}
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <h2>募集时间</h2>
              </el-row>
              <el-row>
                <el-col span={12}>
                  <el-form-item label="募集开始时间：" prop="raiseStartTs">
                    <el-date-picker
                      disabled={ ['edit', 'view'].includes(this.type) }
                      props={{
                        clearable: true,
                        size: 'mini',
                        value: this.form.raiseStartTs
                          ? new Date(this.form.raiseStartTs)
                          : null,
                        type: 'datetime',
                        format: 'yyyy-MM-dd HH:mm',
                        'value-format': 'timestamp',
                        'default-time': '00:00:00'
                      }}
                      onInput={(date) => (this.form.raiseStartTs = date)}
                    />
                  </el-form-item>
                </el-col>
                <el-col span={12}>
                  <el-form-item label="募集开始后：" prop="raiseEndNumber">
                    <div style="display: flex;">
                      <el-input-number
                        min={1}
                        max={720}
                        step-strictly
                        value={this.form.raiseEndNumber}
                        disabled={['edit', 'view'].includes(this.type)}
                        onInput={(raiseEndNumber) =>
                          (this.form.raiseEndNumber = toNumberOrNull(
                            raiseEndNumber
                          ))
                        }
                      />
                  &nbsp;&nbsp; 小时，自动结束募集
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
              {isValid(raiseEndTs) && (
                <el-row>
              募集时间：
                  {parseTime(this.form.raiseStartTs, '{y}-{m}-{d} {h}:{i}')} 至{' '}
                  {parseTime(raiseEndTs, '{y}-{m}-{d} {h}:{i}')}
                </el-row>
              )}

              <el-row>
                <h2>计息时间</h2>
              </el-row>
              <el-row>
                <el-col span={12}>
                  <el-form-item label="募集结束后：" prop="interestNumber">
                    <div style="display: flex;">
                      <el-input-number
                        min={0}
                        max={720}
                        step-strictly
                        value={this.form.interestNumber}
                        disabled={['edit', 'view'].includes(this.type)}
                        onInput={(interestNumber) =>
                          (this.form.interestNumber = toNumberOrNull(
                            interestNumber
                          ))
                        }
                      />
                  &nbsp;&nbsp; 小时，自动开始计息
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
              {isValid(investStartTs) && (
                <el-row>
              计息开始时间：{parseTime(investStartTs, '{y}-{m}-{d} {h}:{i}')}
                </el-row>
              )}

              <el-row>
                <h2>投资期限与预计年化收益率</h2>
              </el-row>
              <el-row>
                <el-col span={12}>
                  <el-form-item label="投资期限：" prop="investmentCycle">
                    <div style="display: flex;">
                      <el-input-number
                        min={1}
                        max={720}
                        step-strictly
                        value={this.form.investmentCycle}
                        disabled={['edit', 'view'].includes(this.type)}
                        onInput={(investmentCycle) =>
                          (this.form.investmentCycle = toNumberOrNull(
                            investmentCycle
                          ))
                        }
                      />
                  &nbsp;&nbsp; 天
                    </div>
                  </el-form-item>
                </el-col>
                <el-col span={12}>
                  <el-form-item label="年化收益率：" prop="annualizedIncome">
                    <div style="display: flex;">
                      <el-input-number
                        min={0.5}
                        max={1000}
                        value={this.form.annualizedIncome}
                        disabled={['edit', 'view'].includes(this.type)}
                        onInput={(annualizedIncome) =>
                          (this.form.annualizedIncome = toNumberOrNull(
                            annualizedIncome
                          ))
                        }
                      />
                  &nbsp;&nbsp; %
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
              {isValid(investEndTs) && (
                <el-row>
              计息结束时间：{parseTime(investEndTs, '{y}-{m}-{d} {h}:{i}')}
                </el-row>
              )}

              <el-row>
                <h2>
                  <i style="color:#ff4949;margin-right: 4px;font-style: normal;font-size: 14px;">
                *
                  </i>
              回款方式与到账时间
                </h2>
              </el-row>
              <el-row>
                <div style="display: flex;">
                  <el-radio-group
                    value={this.form.paymentWay}
                    disabled={['edit', 'view'].includes(this.type)}
                  >
                    <el-radio
                      label={0}
                      style="height:36px;display:flex;align-items:center;"
                    >
                  自动回款
                    </el-radio>
                  </el-radio-group>
                  <ul style="margin:0;">
                    <li style="display: flex;align-items: center;height: 36px;">
                  到期后第&nbsp;
                      <el-input-number
                        min={0}
                        max={720}
                        step-strictly
                        value={this.form.expireNumber}
                        disabled={['edit', 'view'].includes(this.type)}
                        onInput={(expireNumber) =>
                          (this.form.expireNumber = toNumberOrNull(expireNumber))
                        }
                      />
                  &nbsp;小时，自动回款&nbsp;&nbsp;&nbsp;&nbsp;
                      {isValid(investEndTs) && isValid(this.form.expireNumber) && (
                        <span style="color: #ccc;">
                      到账时间：
                          {parseTime(
                            investEndTs +
                          this.form.expireNumber * MILLI_SECONDS_OF_ONE_HOUR,
                            '{y}-{m}-{d} {h}:{i}'
                          )}
                        </span>
                      )}
                    </li>
                  </ul>
                </div>
              </el-row>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="产品说明" name="intor">
            <el-form
              class={styles.iForm}
              ref="form-intor"
              props={{ model: this.form }}
              rules={getRules(this)}
              label-width="120px">
              <el-row>
                {Array.from($data.languageMap.values()).map(({ id, name }) => {
                  let desc = this.form.desc.find(({ key }) => key === id)
                  if (!desc) {
                    desc = { key: id, value: '' }
                    this.form.desc.push(desc)
                  }

                  return (
                    <el-col key={id} span={24}>
                      <el-form-item
                        label={`${name}：`}
                        prop={`productDescription_${id}`}
                      >
                        <Editor
                          placeholder=""
                          disabled={this.type === 'view'}
                          value={desc.value || ''}
                          onInput={text => (desc.value = text)}
                        />
                      </el-form-item>
                    </el-col>
                  )
                })}
              </el-row>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        {
          this.tabActive === 'intor' ? <div class={styles.intorTips}>
            <div >在保存时，可选择是否将英文简介复用到其他所有其他语言简介配置中。</div>
            <div >（将会保留其他语言已填写的内容，只将内容复用至空输入框）</div>
          </div> : ''
        }

        <div slot="footer" style="text-align: right;">

          <el-button onClick={this.close}>取消</el-button>
          {this.type === 'view' ? (
            this.detail.fstate === 0 && (
              <el-button type="primary" onClick={this.edit}>
                修 改
              </el-button>
            )
          ) : (
            <el-button
              type="primary"
              loading={this.submitBtnLoading}
              onClick={this.submit}
            >
              确 定
            </el-button>
          )}
        </div>
      </el-dialog>
    )
  }
}
