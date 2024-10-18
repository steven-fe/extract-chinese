import { addTradingContest, getTradingContestDetail, editTradingContest } from '@/api/trading-contest'
import { Message, MessageBox } from 'element-ui'
import { uploadImage } from '@/views/operatemanager/vote-for-listing/utils'
import Editor from '@/components/wangEditor'
import DatePicker from './components/date-picker'
import SymbolSelect from './components/symbol-select'
import CustomerSymbolSelect from './components/customer-symbol-select'
import $pageData from '../../data'
import $data from './data'
import styles from './index.module.scss'

export const clientTypes = (() => {
  const map = new Map([['1', { id: '1', name: 'H5' }], ['2', { id: '2', name: 'Web' }]])
  return {
    map,
    idsList: [...map.keys()],
    valuesList: [...map.values()]
  }
})()

const tradeTypes = (() => {
  const map = new Map([['1', { id: '1', name: '现货' }], ['2', { id: '2', name: '合约' }]])
  return {
    map,
    idsList: [...map.keys()],
    valuesList: [...map.values()]
  }
})()

const DEFAULT_CLIENT_TYPE_IDS_LIST = [...clientTypes.idsList] // ['1', '2']
const DEFAULT_LANGUAGE_ID = 'en_US'
const DEFAULT_TRADE_TYPE_IDS_LIST = [...tradeTypes.idsList] // ['1', '2']

const toNumberOrNull = value => (typeof value === 'number') ? value : null

const getKeyListOfBanner = (clientTypeIdsList, languageIdsList) => {
  return clientTypeIdsList.reduce((list, clientTypeId) => {
    return list.concat(languageIdsList.map(languageId => `banner/${clientTypeId}/${languageId}`))
  }, [])
}

const genReqForm = model => {
  const {
    id,
    clientTypeIdsList,
    languageIdsList,
    dateRange,
    tradeTypeIdsList,
    spotEffectiveSymbols,
    contractEffectiveSymbols,
    defaultTradingSymbol,
    customerSelectSymbols,
    weight,
    addCalendar
  } = model

  const bannerMap = getKeyListOfBanner(clientTypeIdsList, languageIdsList).reduce((bannerMap, bannerKey) => {
    const [clientTypeId, languageId] = bannerKey.split('/').slice(1)
    if (!bannerMap.has(clientTypeId)) bannerMap.set(clientTypeId, new Map())
    bannerMap.get(clientTypeId).set(languageId, model[bannerKey].value)
    return bannerMap
  }, new Map())

  const nameMap = languageIdsList.reduce((map, languageId) => {
    const key = `name/${languageId}`
    map.set(languageId, model[key].value)
    return map
  }, new Map())

  const ruleMap = languageIdsList.reduce((map, languageId) => {
    const key = `rule/${languageId}`
    map.set(languageId, model[key].value)
    return map
  }, new Map())

  const ruleUrlMap = languageIdsList.reduce((map, languageId) => {
    const key = `ruleUrl/${languageId}`
    map.set(languageId, model[key].value)
    return map
  }, new Map())

  const clientType = clientTypeIdsList.join(',')

  const contentList = clientTypeIdsList.reduce((list, clientTypeId) => {
    return list.concat(languageIdsList.map(languageId => ({
      clientType: clientTypeId,
      languageCode: languageId,
      banner: bannerMap.get(clientTypeId).get(languageId),
      name: nameMap.get(languageId),
      rule: ruleMap.get(languageId),
      ruleUrl: ruleUrlMap.get(languageId)
    })))
  }, [])

  const backgroundImg = clientTypeIdsList.reduce((list, clientTypeId) => {
    const key = `backgroundImageUrl/${clientTypeId}`
    return list.concat({ clientType: clientTypeId, backgroundImg: model[key].value })
  }, [])

  const [startTime, endTime] = dateRange

  const tradeType = tradeTypeIdsList.length > 1 ? '3' : tradeTypeIdsList[0]
  const showSymbol = customerSelectSymbols.switch === 'on' ? 1 : 0

  const competitionExt = {
    spotEffectiveSymbols,
    contractEffectiveSymbols,
    spotSymbols: customerSelectSymbols.spot,
    contractSymbols: customerSelectSymbols.contract,
    defSpotSymbol: defaultTradingSymbol.type === 'spot' ? defaultTradingSymbol.symbol : null,
    defContractSymbol: defaultTradingSymbol.type === 'contract' ? defaultTradingSymbol.symbol : null
  }

  return {
    id,
    clientType,
    contentList,
    backgroundImg,
    startTime,
    endTime,
    tradeType,
    showSymbol,
    competitionExt,
    weight,
    addCalendar
  }
}

const genResForm = data => {
  const {
    id,
    clientType,
    contentList,
    backgroundImg,
    startTime,
    endTime,
    tradeType,
    competitionExt,
    weight,
    addCalendar
  } = data

  const clientTypeIdsList = clientType.split(',')

  const languageIdsList = [...(new Set(contentList.map(({ languageCode }) => languageCode)))]
    .sort((id1, id2) => ($pageData.languages.idsList.indexOf(id1) - $pageData.languages.idsList.indexOf(id2)))

  const contentObj = contentList.reduce((contentObj, { clientType: clientTypeId, languageCode: languageId, banner, name, rule, ruleUrl }) => {
    contentObj[`banner/${clientTypeId}/${languageId}`] = { clientTypeId, languageId, value: banner }
    contentObj[`name/${languageId}`] = { languageId, value: name }
    contentObj[`rule/${languageId}`] = { languageId, value: rule }
    contentObj[`ruleUrl/${languageId}`] = { languageId, value: ruleUrl }
    return contentObj
  }, {})

  const backgroundImageUrlObj = backgroundImg.reduce((backgroundImageUrlObj, { clientType: clientTypeId, backgroundImg: value }) => {
    backgroundImageUrlObj[`backgroundImageUrl/${clientTypeId}`] = { clientTypeId, value }
    return backgroundImageUrlObj
  }, {})

  const dateRange = [startTime, endTime]

  const {
    onLine: onlineFromData,
    spotEffectiveSymbols,
    contractEffectiveSymbols,
    spotSymbols,
    contractSymbols,
    defSpotSymbol,
    defContractSymbol
  } = competitionExt

  const online = onlineFromData || false

  const tradeTypeIdsList = +tradeType === 3 ? ['1', '2'] : [String(tradeType)]

  const defaultTradingSymbol = {
    type: defContractSymbol ? 'contract' : 'spot',
    symbol: defContractSymbol || defSpotSymbol || ''
  }

  const customerSelectSymbols = {
    switch: (Array.isArray(spotSymbols) && spotSymbols.length > 0) || (Array.isArray(contractSymbols) && contractSymbols.length > 0) ? 'on' : 'off',
    spot: spotSymbols || [],
    contract: contractSymbols || []
  }

  return {
    id,
    clientTypeIdsList,
    languageIdsList,
    ...contentObj,
    ...backgroundImageUrlObj,
    dateRange,
    online,
    tradeTypeIdsList,
    spotEffectiveSymbols: spotEffectiveSymbols || [],
    contractEffectiveSymbols: contractEffectiveSymbols || [],
    defaultTradingSymbol,
    customerSelectSymbols,
    weight,
    addCalendar
  }
}

let updateList = () => {}

export default {
  name: 'Single',
  data() {
    const modelFactory = () => ({
      id: null,

      clientTypeIdsList: [...DEFAULT_CLIENT_TYPE_IDS_LIST],
      languageIdsList: [DEFAULT_LANGUAGE_ID],
      // banner/1/en_US => { clientTypeId: "1", languageId: "en_US", value:"" }
      // name/en_US => { languageId: "en_US", value:"" }
      // rule/en_US => { languageId: "en_US", value:"" }
      // ruleUrl/en_US => { languageId: "en_US", value:"" }
      // backgroundImageUrl/1 => { clientTypeId: "1", value:"" }
      dateRange: [null, null],
      online: false, // Activities have been online
      tradeTypeIdsList: [...DEFAULT_TRADE_TYPE_IDS_LIST],

      spotEffectiveSymbols: [], // ['symbol']
      contractEffectiveSymbols: [], // ['symbol']

      defaultTradingSymbol: { symbol: '', type: 'spot' }, // type: 'spot'/'contract'

      customerSelectSymbols: { switch: 'off', spot: [], contract: [] }, // switch: 'on'/'off'
      weight: 1,
      addCalendar: 1
    })

    return {
      show: false,
      type: 'create', // 'create', 'edit', 'view'

      modelFactory,
      model: modelFactory(),

      submitBtnLoading: false
    }
  },
  computed: {
    dialogTitle() {
      if (this.type === 'create') return '添加交易赛'
      if (this.type === 'edit') return '编辑交易赛'
      if (this.type === 'view') return '查看交易赛'
    }
  },
  methods: {
    async setModel(id) {
      const { data } = await getTradingContestDetail(id)
      const model = genResForm(data)

      for (const key in model) {
        const value = model[key]
        if (key in this.model) this.model[key] = model[key]
        else this.$set(this.model, key, value) // handle reactive data
      }
    },
    async open(info, callback = () => {}) {
      const { id, type } = info || { type: 'create' }

      this.type = type

      updateList = callback

      if (this.type !== 'create') await this.setModel(id)

      this.show = true
    },
    close() {
      this.show = false
    },
    closed() {
      this.model = this.modelFactory()
      this.$nextTick(() => this.$refs.form.clearValidate())
    },
    async autofillContent() {
      const { clientTypeIdsList, languageIdsList, defaultTradingSymbol, spotEffectiveSymbols, contractEffectiveSymbols } = this.model

      // for 'banner', 'name', 'rule', 'ruleUrl'
      const completed = ['banner', 'name', 'rule', 'ruleUrl'].every(id => {
        if (id === 'banner') return getKeyListOfBanner(clientTypeIdsList, languageIdsList).every(key => !!this.model[key].value)
        return languageIdsList.every(languageId => !!this.model[`${id}/${languageId}`].value)
      })

      if (!completed) {
        await MessageBox.confirm('将英文语种配置应用到其他语种上（保留其他语种已填写的配置）', { type: 'warning' });

        ['banner', 'name', 'rule', 'ruleUrl'].forEach(id => {
          if (id === 'banner') {
            return getKeyListOfBanner(clientTypeIdsList, languageIdsList).forEach(bannerKey => {
              const defaultValue = this.model[bannerKey.replace(/(?<=^\w+\/\w+\/).+?$/, DEFAULT_LANGUAGE_ID)].value
              if (!this.model[bannerKey].value) this.model[bannerKey].value = defaultValue
            })
          }

          return languageIdsList.forEach(languageId => {
            const key = `${id}/${languageId}`
            const defaultValue = this.model[key.replace(/(?<=^\w+\/).+?$/, DEFAULT_LANGUAGE_ID)].value
            if (!this.model[key].value) this.model[key].value = defaultValue
          })
        })
      }

      // for defaultTradingSymbol
      if (!defaultTradingSymbol.symbol) {
        if (spotEffectiveSymbols.length) {
          const sortedSpotEffectiveSymbols = [...spotEffectiveSymbols].sort((symbol1, symbol2) => ($data.spotSymbols.idsList.indexOf(symbol1) - $data.spotSymbols.idsList.indexOf(symbol2)))
          Object.assign(defaultTradingSymbol, { symbol: sortedSpotEffectiveSymbols[0], type: 'spot' })
        } else if (contractEffectiveSymbols.length) {
          const sortedContractEffectiveSymbols = [...contractEffectiveSymbols].sort((symbol1, symbol2) => ($data.contractSymbols.idsList.indexOf(symbol1) - $data.contractSymbols.idsList.indexOf(symbol2)))
          Object.assign(defaultTradingSymbol, { symbol: sortedContractEffectiveSymbols[0], type: 'contract' })
        }
      }
    },
    async submit() {
      try {
        this.submitBtnLoading = true

        await this.$refs.form.validate()

        await this.autofillContent()

        await (this.type === 'edit' ? editTradingContest : addTradingContest)(
          genReqForm(this.model)
        )

        updateList()
        this.close()
        Message.success('操作成功！')
      } catch (e) {
        console.log(e)
      } finally {
        this.submitBtnLoading = false
      }
    }
  },
  created() {
  },
  render() {
    return <el-dialog
      title={this.dialogTitle}
      width="900px"
      close-on-click-modal={false}
      close-on-press-escape={false}
      show-close={false}
      visible={this.show}
      onClosed={this.closed}
      on={{ 'update:visible': (visible) => !visible && this.close() }}
    >
      <el-form ref="form" disabled={this.type === 'view'} props={ { model: this.model } } label-width="auto">
        <el-form-item prop="clientTypeIdsList" label="客户端类型">
          <el-checkbox-group
            value={this.model.clientTypeIdsList}
            onInput={clientTypeIdsList => {
              this.model.clientTypeIdsList = [...clientTypeIdsList].sort((id1, id2) => (clientTypes.idsList.indexOf(id1) - clientTypes.idsList.indexOf(id2)))
            }}
          >{
              clientTypes.valuesList.map(({ id, name }) => <el-checkbox label={id} key={id} disabled={this.model.clientTypeIdsList.join('') === id}>{name}</el-checkbox>)
            }</el-checkbox-group>
        </el-form-item>

        <el-form-item prop="languageCodeList" label="语言">
          <el-checkbox-group
            value={this.model.languageIdsList}
            onInput={languageIdsList => {
              this.model.languageIdsList = [...languageIdsList].sort((id1, id2) => ($pageData.languages.idsList.indexOf(id1) - $pageData.languages.idsList.indexOf(id2)))
            }}
          >
            { $pageData.languages.valuesList.map(({ id, name }) => <el-checkbox label={id} key={id} disabled={DEFAULT_LANGUAGE_ID === id}>{name}</el-checkbox>) }
          </el-checkbox-group>
        </el-form-item>

        {
          (() => {
            const { clientTypeIdsList, languageIdsList, ...otherModel } = this.model
            const bannerKeyList = getKeyListOfBanner(clientTypeIdsList, languageIdsList)

            // remove extra bannerKey in model
            Object.keys(otherModel).forEach(key => {
              if (key.startsWith('banner/') && !bannerKeyList.includes(key)) this.$delete(this.model, key)
            })

            return bannerKeyList.map((bannerKey) => {
              const [clientTypeId, languageId] = bannerKey.split('/').slice(1)

              if (!(bannerKey in this.model)) {
                this.$set(this.model, bannerKey, { clientTypeId, languageId, value: '' })
              }

              const clientTypeName = clientTypes.map.get(clientTypeId).name
              const languageName = ($pageData.languages.map.get(languageId) || {}).name || ''
              const banner = this.model[bannerKey]
              const rules = DEFAULT_CLIENT_TYPE_IDS_LIST.includes(clientTypeId) && languageId === DEFAULT_LANGUAGE_ID
                ? [{ trigger: 'change', type: 'object', required: true, fields: { value: { type: 'string', required: true, message: '请上传图片' }}}]
                : []
              const intrinsicSize = clientTypeName === 'H5' ? '690*240' : '750*400'
              const placeholder = clientTypeName === 'H5'
                ? (languageId === DEFAULT_LANGUAGE_ID ? '' : '选填，没有上传Banner图片，在保存时会将H5英文Banner图复用至此')
                : (languageId === DEFAULT_LANGUAGE_ID ? '' : '选填，没有上传Banner图片，在保存时会将Web英文Banner图复用至此')

              return <el-form-item
                key={bannerKey}
                prop={bannerKey}
                label={`${clientTypeName}-${languageName}-Banner`}
                rules={rules}
              >
                <div style="display:flex">
                  <el-input
                    value={banner.value}
                    placeholder={placeholder}
                    nativeOnClick={async(event) => {
                      try {
                        if (event.target.getAttribute('disabled')) return
                        banner.value = await uploadImage({ intrinsicSize })
                      } catch (e) {
                        if (e.message === '[UploadImage-WrongImageSize]') Message.warning('请上传指定尺寸的图片')
                      }
                    }}
                  />
                  <span style="display:block;width:190px;text-align:right;">图片尺寸：{intrinsicSize}</span>
                </div>
              </el-form-item>
            })
          })()
        }

        {
          (() => {
            const { languageIdsList, ...otherModel } = this.model
            const nameKeyList = languageIdsList.map(languageId => `name/${languageId}`)

            // remove extra bannerKey in model
            Object.keys(otherModel).forEach(key => {
              if (key.startsWith('name/') && !nameKeyList.includes(key)) this.$delete(this.model, key)
            })

            return nameKeyList.map((nameKey) => {
              const [languageId] = nameKey.split('/').slice(1)

              if (!(nameKey in this.model)) {
                this.$set(this.model, nameKey, { languageId, value: '' })
              }

              const languageName = ($pageData.languages.map.get(languageId) || {}).name || ''
              const name = this.model[nameKey]
              const rules = languageId === DEFAULT_LANGUAGE_ID
                ? [{ trigger: 'change', type: 'object', required: true, fields: { value: { type: 'string', required: true, message: '请填写交易赛名称' }}}]
                : []
              const wordLimit = 100
              const placeholder = languageId === DEFAULT_LANGUAGE_ID ? '' : '选填，没有输入交易赛名称，在保存时会将英文交易赛名称复用至此'

              return <el-form-item
                key={nameKey}
                prop={nameKey}
                label={`${languageName}-交易赛名称`}
                rules={rules}
              >
                <Editor disabled={this.type === 'view'} value={name.value} wordLimit={wordLimit} placeholder={placeholder} onInput={text => (name.value = text)} />
              </el-form-item>
            })
          })()
        }

        {
          (() => {
            const { languageIdsList, ...otherModel } = this.model
            const ruleKeyList = languageIdsList.map(languageId => `rule/${languageId}`)

            // remove extra bannerKey in model
            Object.keys(otherModel).forEach(key => {
              if (key.startsWith('rule/') && !ruleKeyList.includes(key)) this.$delete(this.model, key)
            })

            return ruleKeyList.map((ruleKey) => {
              const [languageId] = ruleKey.split('/').slice(1)

              if (!(ruleKey in this.model)) {
                this.$set(this.model, ruleKey, { languageId, value: '' })
              }

              const languageName = ($pageData.languages.map.get(languageId) || {}).name || ''
              const rule = this.model[ruleKey]
              const rules = languageId === DEFAULT_LANGUAGE_ID
                ? [{ trigger: 'change', type: 'object', required: true, fields: { value: { type: 'string', required: true, message: '请填写交易赛规则' }}}]
                : []
              const wordLimit = 1000
              const placeholder = languageId === DEFAULT_LANGUAGE_ID ? '' : '选填，没有输入交易赛规则，在保存时会将英文交易赛规则复用至此'

              return <el-form-item
                key={ruleKey}
                prop={ruleKey}
                label={`${languageName}-交易赛规则`}
                rules={rules}
              >
                <Editor disabled={this.type === 'view'} value={rule.value} wordLimit={wordLimit} placeholder={placeholder} onInput={text => (rule.value = text)} />
              </el-form-item>
            })
          })()
        }

        {
          (() => {
            const { languageIdsList, ...otherModel } = this.model
            const ruleUrlKeyList = languageIdsList.map(languageId => `ruleUrl/${languageId}`)

            // remove extra bannerKey in model
            Object.keys(otherModel).forEach(key => {
              if (key.startsWith('ruleUrl/') && !ruleUrlKeyList.includes(key)) this.$delete(this.model, key)
            })

            return ruleUrlKeyList.map((ruleUrlKey) => {
              const [languageId] = ruleUrlKey.split('/').slice(1)

              if (!(ruleUrlKey in this.model)) {
                this.$set(this.model, ruleUrlKey, { languageId, value: '' })
              }

              const languageName = ($pageData.languages.map.get(languageId) || {}).name || ''
              const ruleUrl = this.model[ruleUrlKey]
              const rules = languageId === DEFAULT_LANGUAGE_ID
                ? [{ trigger: 'change', type: 'object', required: true, fields: { value: { type: 'string', required: true, message: '请填写交易赛规则跳转链接' }}}]
                : []
              const placeholder = languageId === DEFAULT_LANGUAGE_ID ? '' : '选填，没有输入交易赛规则跳转链接，在保存时会将英文交易赛规则跳转链接复用至此'

              return <el-form-item
                key={ruleUrlKey}
                prop={ruleUrlKey}
                label={`${languageName}-交易赛规则跳转链接`}
                rules={rules}
              >
                <el-input value={ruleUrl.value} placeholder={placeholder} onInput={text => (ruleUrl.value = text)} />
              </el-form-item>
            })
          })()
        }

        {
          (() => {
            const { clientTypeIdsList, ...otherModel } = this.model
            const backgroundImageUrlKeyList = clientTypeIdsList.map(clientTypeId => `backgroundImageUrl/${clientTypeId}`)

            // remove extra bannerKey in model
            Object.keys(otherModel).forEach(key => {
              if (key.startsWith('backgroundImageUrl/') && !backgroundImageUrlKeyList.includes(key)) this.$delete(this.model, key)
            })

            return backgroundImageUrlKeyList.map((backgroundImageUrlKey) => {
              const [clientTypeId] = backgroundImageUrlKey.split('/').slice(1)

              if (!(backgroundImageUrlKey in this.model)) {
                this.$set(this.model, backgroundImageUrlKey, { clientTypeId, value: '' })
              }

              const clientTypeName = clientTypes.map.get(clientTypeId).name
              const backgroundImageUrl = this.model[backgroundImageUrlKey]
              const rules = [{ trigger: 'change', type: 'object', required: true, fields: { value: { type: 'string', required: true, message: '请上传图片' }}}]
              const intrinsicSize = clientTypeName === 'H5' ? '750*400' : '1920*350'

              return <el-form-item
                key={backgroundImageUrlKey}
                prop={backgroundImageUrlKey}
                label={`${clientTypeName}-顶部背景`}
                rules={rules}
              >
                <div style="display:flex">
                  <el-input
                    value={backgroundImageUrl.value}
                    nativeOnClick={async(event) => {
                      try {
                        if (event.target.getAttribute('disabled')) return
                        backgroundImageUrl.value = await uploadImage({ intrinsicSize })
                      } catch (e) {
                        if (e.message === '[UploadImage-WrongImageSize]') Message.warning('请上传指定尺寸的图片')
                      }
                    }}
                  />
                  <span style="display:block;width:190px;text-align:right;">图片尺寸：{intrinsicSize}</span>
                </div>
              </el-form-item>
            })
          })()
        }

        <el-form-item
          prop="dateRange"
          label="交易赛时间"
          rules={[{
            trigger: 'change', type: 'array', required: true, fields: {
              0: { type: 'number', required: true, message: '请选择交易赛开始时间' },
              1: { type: 'number', required: true, message: '请选择交易赛结束时间' }
            }
          }]}
        >
          <DatePicker
            dateRange={this.model.dateRange}
            disabled={this.type === 'create' ? false : (this.type === 'view' ? true : 'startTime')}
            onInput={(dateRange) => (this.model.dateRange = dateRange)}
          />
        </el-form-item>

        <el-form-item label="业务选择">
          <el-checkbox-group
            value={this.model.tradeTypeIdsList}
            disabled={this.type === 'view' || this.type === 'edit' && this.model.online}
            onInput={tradeTypeIdsList => {
              this.model.tradeTypeIdsList = [...tradeTypeIdsList].sort((id1, id2) => (tradeTypes.idsList.indexOf(id1) - tradeTypes.idsList.indexOf(id2)))
            }}
          >{
              tradeTypes.valuesList.map(({ id, name }) => <el-checkbox label={id} key={id} disabled={this.model.tradeTypeIdsList.join('') === id}>{name}</el-checkbox>)
            }</el-checkbox-group>
        </el-form-item>

        {(() => {
          const showSpotEffectiveSymbols = this.model.tradeTypeIdsList.includes('1')
          const { spotEffectiveSymbols, defaultTradingSymbol } = this.model

          if (!showSpotEffectiveSymbols) {
            if (defaultTradingSymbol.type === 'spot' && defaultTradingSymbol.symbol) defaultTradingSymbol.symbol = ''
            if (spotEffectiveSymbols.length) this.model.spotEffectiveSymbols = []
            return null
          }

          return <el-form-item
            label="现货-有效交易币对"
            prop="spotEffectiveSymbols"
            rules={[{ required: true, type: 'array', min: 1, max: Infinity, message: '请选择现货-有效交易币对' }]}
          >
            <SymbolSelect
              defaultTradingSymbol={defaultTradingSymbol.type === 'spot' ? defaultTradingSymbol.symbol : ''}
              value={spotEffectiveSymbols}
              list={$data.spotSymbols.valuesList}
              disabled={this.type === 'view' || this.type === 'edit' && this.model.online}
              onInput={spotEffectiveSymbols => (this.model.spotEffectiveSymbols = spotEffectiveSymbols)}
              onSetDefaultSymbol={symbol => (this.model.defaultTradingSymbol = { symbol, type: 'spot' })}
            />
          </el-form-item>
        })()}

        {(() => {
          const showContractEffectiveSymbols = this.model.tradeTypeIdsList.includes('2')
          const { contractEffectiveSymbols, defaultTradingSymbol } = this.model

          if (!showContractEffectiveSymbols) {
            if (defaultTradingSymbol.type === 'contract' && defaultTradingSymbol.symbol) defaultTradingSymbol.symbol = ''
            if (contractEffectiveSymbols.length) this.model.contractEffectiveSymbols = []
            return null
          }

          return <el-form-item
            label="合约-有效交易币对"
            prop="contractEffectiveSymbols"
            rules={[{ required: true, type: 'array', min: 1, max: Infinity, message: '请选择合约-有效交易币对' }]}
          >
            <SymbolSelect
              defaultTradingSymbol={defaultTradingSymbol.type === 'contract' ? defaultTradingSymbol.symbol : ''}
              value={contractEffectiveSymbols}
              list={$data.contractSymbols.valuesList}
              disabled={this.type === 'view' || this.type === 'edit' && this.model.online}
              onInput={contractEffectiveSymbols => (this.model.contractEffectiveSymbols = contractEffectiveSymbols)}
              onSetDefaultSymbol={symbol => (this.model.defaultTradingSymbol = { symbol, type: 'contract' })}
            />
          </el-form-item>
        })()}

        { !!this.model.defaultTradingSymbol.symbol && <el-form-item label="默认跳转币对">{ this.model.defaultTradingSymbol.symbol }({this.model.defaultTradingSymbol.type})</el-form-item> }

        {(() => {
          const { spotEffectiveSymbols, contractEffectiveSymbols, customerSelectSymbols } = this.model
          const showCustomerSelectSymbols = (spotEffectiveSymbols.length || contractEffectiveSymbols.length)
          const disabled = this.type === 'view' || this.type === 'edit' && this.model.online

          if (!showCustomerSelectSymbols) {
            if (customerSelectSymbols.switch === 'on') customerSelectSymbols.switch = 'off'
            if (customerSelectSymbols.spot.length) customerSelectSymbols.spot = []
            if (customerSelectSymbols.contract.length) customerSelectSymbols.contract = []
            return null
          }

          return <el-form-item label="客户端展示有效交易对">
            <el-switch
              disabled={disabled}
              value={customerSelectSymbols.switch === 'on'}
              onInput={value => (customerSelectSymbols.switch = (value ? 'on' : 'off')) }
            />
            {
              (() => {
                const open = customerSelectSymbols.switch === 'on'

                if (!open) {
                  if (customerSelectSymbols.spot.length) customerSelectSymbols.spot = []
                  if (customerSelectSymbols.contract.length) customerSelectSymbols.contract = []
                  return null
                }

                // remove invalid symbol
                const spotValue = customerSelectSymbols.spot.filter(symbol => spotEffectiveSymbols.includes(symbol))
                if (spotValue.length !== customerSelectSymbols.spot.length) customerSelectSymbols.spot = spotValue

                // remove invalid symbol
                const contractValue = customerSelectSymbols.contract.filter(symbol => contractEffectiveSymbols.includes(symbol))
                if (contractValue.length !== customerSelectSymbols.contract.length) customerSelectSymbols.contract = contractValue

                return <CustomerSymbolSelect
                  spotValue={customerSelectSymbols.spot}
                  contractValue={customerSelectSymbols.contract}
                  spotList={spotEffectiveSymbols.map(symbol => ({ id: symbol, name: symbol }))}
                  contractList={contractEffectiveSymbols.map(symbol => ({ id: symbol, name: symbol }))}
                  disabled={disabled}
                  onInput={({ spot, contract }) => {
                    customerSelectSymbols.spot = spot
                    customerSelectSymbols.contract = contract
                  }}
                />
              })()
            }
          </el-form-item>
        })()}

        <el-form-item label="权重">
          <el-input-number min={0} step-strictly value={this.model.weight} onInput={ weight => (this.model.weight = toNumberOrNull(weight)) } />
        </el-form-item>

        {(() => {
          if (this.model.clientTypeIdsList.indexOf('1') === -1) {
            this.model.addCalendar = 0
            return null
          }
          return <el-form-item label="是否添加到日历" prop="addCalendar">
            <el-tooltip class="item" effect="dark" content="将此次活动日程添加到市场————日历" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
            <el-radio-group class={styles.radio} value={this.model.addCalendar} onInput={addCalendar => { this.model.addCalendar = addCalendar }}>
              {
                [{ id: 1, name: '是' }, { id: 0, name: '否' }].map(({ id, name }) => (<el-radio label={id}>{name}</el-radio>))
              }
            </el-radio-group>
          </el-form-item>
        })()}
      </el-form>

      <div slot="footer" style="text-align: right;">
        { this.type === 'view' && <el-button onClick={this.close}>关 闭</el-button> }

        { this.type !== 'view' && <el-button onClick={this.close}>取 消</el-button> }
        { this.type !== 'view' && <el-button type="primary" loading={this.submitBtnLoading} onClick={this.submit}>确 定</el-button> }
      </div>
    </el-dialog>
  }
}
