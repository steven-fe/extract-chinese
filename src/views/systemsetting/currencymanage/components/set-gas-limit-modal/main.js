import { getChainProtocolList, getChainGasList, updateChainGasList } from '@/api/systemsetting/currencymanage'
import { Message } from 'element-ui'
import styles from './index.module.scss'

let updateList = () => {}

export default {
  name: 'SetGasLimitModal',
  data() {
    return {
      show: false,

      chainProtocolList: [],
      currentChainProtocol: '',

      chainGasFilterText: '',
      originalChainGasList: [],

      submitBtnLoading: false
    }
  },
  computed: {
    chainGasList() {
      return this.originalChainGasList.filter(({ currencyCode }) => currencyCode.toLowerCase().includes(this.chainGasFilterText.toLowerCase()))
    }
  },
  methods: {
    async setChainProtocolList() {
      const { data } = await getChainProtocolList()
      this.chainProtocolList = (data || []).map(name => ({ id: name, name }))
    },
    setDefaultCurrentChainProtocol() {
      this.$watch('chainProtocolList', (chainProtocolList) => {
        this.currentChainProtocol = chainProtocolList[0] ? chainProtocolList[0].id : ''
      }, { immediate: true })
    },
    initOriginalChainGasList() {
      this.$watch('currentChainProtocol', async() => {
        if (!this.currentChainProtocol) return
        const { data } = await getChainGasList({ chainProtocol: this.currentChainProtocol })
        this.originalChainGasList = data || []
      }, { immediate: true })
    },
    async open(_, callback = () => {}) {
      await this.setChainProtocolList()

      updateList = callback
      this.show = true
    },
    close() {
      this.show = false
    },
    async submit() {
      try {
        this.submitBtnLoading = true

        await updateChainGasList({ chainGasList: this.originalChainGasList })
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
    this.setDefaultCurrentChainProtocol()
    this.initOriginalChainGasList()
  },
  render() {
    return <el-dialog
      title="链上手续费关联"
      width="460px"
      close-on-click-modal={false}
      close-on-press-escape={false}
      show-close={false}
      visible={this.show}
      on={{ 'update:visible': (visible) => !visible && this.close() }}
    >
      <div class={styles.content}>
        <el-row>
          <el-col span={12} style="line-height:36px">当前已支持链类型</el-col>
          <el-col span={12}>
            <el-select value={this.currentChainProtocol} filterable onInput={currentChainProtocol => (this.currentChainProtocol = currentChainProtocol)}>
              { this.chainProtocolList.map(({ id, name }) => (<el-option key={id} label={name} value={id} />)) }
            </el-select>
          </el-col>
        </el-row>

        <br /><br /><br />
        <el-input placeholder="输入关键字进行过滤" value={this.chainGasFilterText} onInput={chainGasFilterText => (this.chainGasFilterText = chainGasFilterText)} />

        <ol class={styles.chainGasList}>
          { this.chainGasList.map((item) => <li key={item.id} class={styles.chainGasItem}>
            <span style="width:120px;text-align:right;">{item.currencyCode}</span>&nbsp;&nbsp;&nbsp;

            <el-switch value={!!item.status} onInput={status => (item.status = +status)} />

            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;GasLimit&nbsp;&nbsp;&nbsp;

            <el-input-number
              value={item.chainGasLimit}
              min={1}
              placeholder="请输入GasLimit"
              onInput={chainGasLimit => (item.chainGasLimit = chainGasLimit)}
            />
          </li>) }
        </ol>

      </div>

      <div slot="footer" style="text-align: right;">
        <el-button onClick={this.close}>取 消</el-button>
        <el-button type="primary" loading={this.submitBtnLoading} onClick={this.submit}>确 定</el-button>
      </div>
    </el-dialog>
  }
}
