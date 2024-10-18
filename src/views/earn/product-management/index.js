import {
  getList,
  judgeIsSame,
  updateState,
  updateProductDesc,
  getProductDetail,
  editProduct
} from '@/api/earn/product-management'
import Query from './components/query'

import single from './components/single'
import iTable from '../components/Table/index'
import { parseTime } from '@/utils/ruoyi'
import Editor from '@/components/wangEditor'
import $data, {
  tableOptions,
  typeMap,
  paymentWayMap,
  productsStateMap,
  shelfStateMap
} from './data'
import { Message, MessageBox } from 'element-ui'
import Dialog from '@/components/iDialog/index'
import CopyIcon from '@/components/CopyIcon/index'
import styles from './index.module.scss'
export default {
  name: 'ProductManagement',
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

      queryParams: {
        id: null,
        inputCurrency: null,
        type: null,
        productsState: null,
        shelfState: null,
        createWay: null, // 创建方式 0 手动 1复制
        noviceExclusive: null, // 是否新手专享
        startTime: null,
        endTime: null,

        pageNum: 1,
        pageSize: 20
      },

      total: 0,
      list: [],
      columns: [
        {
          prop: 'operation',
          label: '操作',
          width: '420',
          fixed: 'left',
          renderOperations: (row, e) => {
            const { shelfState, id } = row
            const nextShelfState = +!shelfState
            const nextShelfStateText = nextShelfState ? '上架' : '下架'

            return (
              <div class="table-operation-wrapper">
                <el-button
                  type="primary"
                  size="mini"
                  onClick={() => single.open({ id, type: 'view' })}
                >
                  详情
                </el-button>
                {/* {state === 0 && (
                  <el-button
                    type="primary"
                    size="mini"
                    onClick={() =>
                      single.open({ id, type: 'edit', row }, () =>
                        this.getList()
                      )
                    }
                  >
                    修改
                  </el-button>
                )} */}
                {shelfState !== 2 && (<el-button
                  type={nextShelfState ? 'success' : 'danger'}
                  size="mini"
                  onClick={() => {
                    this.handleProduct(row, nextShelfStateText, nextShelfState)
                  }}
                >
                  {nextShelfStateText}
                </el-button>)}
                <el-button
                  type="primary"
                  size="mini"
                  onClick={() =>
                    single.open({ id, type: 'copy' }, () => {
                      this.getList()
                    }

                    )
                  }
                >
                  复制
                </el-button>

                <el-button
                  type="primary"
                  size="mini"
                  onClick={() => {
                    this.curUpdateItem = row
                    this.setForm(row)
                    this.intorDialogVisible = true
                  }}
                >
                  修改理财产品
                </el-button>
              </div>
            )
          }
        },
        {
          prop: 'id',
          label: '创建方式',
          width: '160',
          formatter: ({ copyTaskId, createWay }) => {
            const stateMap = {
              0: '手动上架',
              1: '自动上架任务创建'
            }
            return createWay === 1 ? (
              <a
                style={{ textDecoration: 'underline' }}
                onClick={() => {
                  this.dialogProductItem = copyTaskId
                  this.dialogVisible = true
                }}
              >
                {stateMap[createWay]}
              </a>
            ) : (
              stateMap[createWay]
            )
          }
        },
        {
          prop: 'id',
          label: '产品ID'
        },
        {
          prop: 'productInsideName',
          label: '产品内部名称',
          width: '220'
        },
        {
          prop: 'productName',
          label: '产品显示名称（英文）',
          width: '220'
        },
        {
          prop: 'productType',
          label: '产品类型',
          width: '80',
          formatter: ({ productType }) => {
            return typeMap.get(productType).name
          }
        },
        {
          prop: 'investmentCurrency',
          label: '投资币种',
          width: '80'
        },
        {
          prop: 'noviceExclusive',
          label: '新手专享',
          width: '80',
          formatter: ({ noviceExclusive }) => {
            return noviceExclusive === 1 ? '是' : '否'
          }
        },
        {
          prop: 'applyAmount',
          label: '已申购额度/募集金额',
          width: '150',
          formatter: ({ applyAmount, raiseTotalAmount }) => {
            return `${applyAmount}/${raiseTotalAmount}`
          }
        },
        {
          prop: 'incomeCurrency',
          label: '收益币种',
          width: '80'
        },
        {
          prop: 'raiseStartTs',
          label: '募集周期（UTC+8）',
          width: '280',
          formatter: ({ raiseStartTs, raiseEndTs }) => {
            return `${parseTime(
              raiseStartTs,
              '{y}-{m}-{d} {h}:{i}'
            )} ~ ${parseTime(raiseEndTs, '{y}-{m}-{d} {h}:{i}')}`
          }
        },
        {
          prop: 'investmentCycle',
          label: '投资期限和年化收益率',
          width: '180',
          formatter: ({ investmentCycle, annualizedIncome }) => {
            return `${investmentCycle}天 | APR:${annualizedIncome}%`
          }
        },
        {
          prop: 'paymentWay',
          label: '回款方式',
          width: '80',
          formatter: ({ paymentWay }) => {
            return paymentWayMap.get(paymentWay).name
          }
        },
        {
          prop: 'paymentTs',
          label: '到账时间（UTC+8）',
          width: '180',
          formatter: ({ paymentTs }) => {
            return parseTime(paymentTs, '{y}-{m}-{d} {h}:{i}')
          }
        },
        {
          prop: 'state',
          label: '产品状态',
          width: '80',
          formatter: ({ state }) => {
            return productsStateMap.get(state).name
          }
        },
        {
          prop: 'shelfState',
          label: '上架状态',
          width: '80',
          formatter: ({ shelfState }) => {
            return shelfStateMap.get(shelfState).name
          }
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: '160',
          formatter: ({ createTime }) => {
            return parseTime(createTime)
          }
        },
        {
          prop: 'createTime',
          label: '上架时间',
          width: '180',
          formatter: ({ shelvingTs, shelvingMode }) => {
            return (
              <span>
                { shelvingTs ? parseTime(shelvingTs) : '-' }
                {
                  shelvingMode === 3 ? <i
                    style={{ marginLeft: '5px', color: '#409EFF' }}
                    class="el-icon-time"
                  /> : null
                }
              </span>
            )
          }
        }
      ],
      dialogVisible: false,
      dialogProductItem: null,
      intorDialogVisible: false,
      form: formFactory(),
      curUpdateItem: null,
      productintorRules: {
        productDescription_en_US: [
          {
            required: true,
            validator: (_1, _2, callback) => {
              const { desc } = this.form
              const { value } = desc.find(({ key }) => key === 'en_US')
              if (!value || value === '<p><br></p>') return callback(new Error('请输入产品说明'))
              callback()
            },
            trigger: 'change'
          }
        ],
        shelvingTs: [
          {
            required: true,
            validator: (_1, _2, callback) => {
              const { shelvingMode, shelvingTs } = this.form
              // 如果选择的不是定时上架则时间选择无效
              if (shelvingMode === 2 && shelvingTs) {
                this.form.shelvingTs = null
                return callback()
              }
              if (shelvingMode === 2 && !shelvingTs) return callback()
              if (!shelvingTs) return callback(new Error('请选择上架时间'))
              // 如果是查看或者已经上架的产品，处于不可编辑状态，不做校验
              if (this.curUpdateItem && this.curUpdateItem.shelfState === 1) {
                return callback()
              }
              if (shelvingTs < +new Date()) {
                return callback(new Error('上架时间不能早于当前时间'))
              }
              callback()
            },
            trigger: 'change'
          }
        ]
      },
      intorBtnLoading: false,
      screenHeight: 0
    }
  },
  methods: {
    changeQueryParams(options) {
      for (const key in options) {
        this.queryParams[key] = options[key]
      }
    },
    async getList() {
      const { rows, total } = await getList(this.queryParams)
      this.list = rows
      this.total = total
    },
    /**
     * @param {*} row - 行数据
     * @param {*} nextShelfStateText - 理财产品状态文字
     * @param {*} nextShelfState - 理财产品状态
     */
    async handleProduct(
      {
        id,
        productInsideName,
        productType,
        investmentCurrency,
        investmentCycle
      },
      nextShelfStateText,
      nextShelfState
    ) {
      try {
        await MessageBox.confirm(
          `
            产品名称：${productInsideName} <br/>
            产品 ID：${id} <br/>
            产品类型：${typeMap.get(productType).name}
          `,
          `确定${nextShelfStateText}该产品？`,
          {
            type: 'warning',
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定',
            cancelButtonText: '取消'
          }
        )

        if (nextShelfState) {
          const { data: sameId } = await judgeIsSame({ id })

          if (sameId) {
            await MessageBox.confirm(
              `当前已上架 ${investmentCurrency} ${
                typeMap.get(productType).name
              } ${investmentCycle}天 理财产品(ID：${sameId})，是否上架本产品(ID：${id})，替换旧产品？`,
              '',
              {
                type: 'warning',
                dangerouslyUseHTMLString: true,
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }
            )
          }
        }
        await updateState({ id, state: nextShelfState })
        Message.success('操作成功！')
        this.getList()
      } catch (e) {
        console.log(e)
      }
    },
    copyText(text) {
      return new Promise((resolve, reject) => {
        try {
          const input = document.createElement('textarea')
          input.value = text
          document.body.appendChild(input)
          input.select()
          document.execCommand('copy')
          input.parentElement.removeChild(input)
          this.msgSuccess('复制成功')
          resolve(text)
        } catch (e) {
          reject(e)
        }
      })
    },
    async setForm(row) {
      const { data } = await getProductDetail(row.id)
      if (data.fshelvingMode === 2) {
        data.shelvingTs = null
      }
      for (const _key in data) {
        const key = _key.startsWith('f') ? _key.slice(1) : _key
        if (key in this.form) this.form[key] = data[_key]
      }
      this.intorDialogVisible = true
    },
    /**
     * 修改理财产品
     */
    async submit() {
      try {
        this.intorBtnLoading = true
        await this.$refs.intorForm.validate()
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
            if (this.curUpdateItem.shelfState !== 1 && this.curUpdateItem.state === 0) {
              await editProduct(this.form)
            }
            await updateProductDesc({ productId: this.curUpdateItem.id, desc: this.form.desc })
            this.getList()
            Message.success('操作成功!')
            this.intorDialogVisible = false
          }).catch(() => {})
        } else {
          // 未上架，并且是为开始的 才能修改上架方式
          if (this.curUpdateItem.shelfState !== 1 && this.curUpdateItem.state === 0) {
            await editProduct(this.form)
          }
          await updateProductDesc({ productId: this.curUpdateItem.id, desc: this.form.desc })
          this.getList()
          Message.success('操作成功!')
          this.intorDialogVisible = false
        }
      } catch (err) {
        console.log('err', err)
        //  校验不通过定位到错误位置
        const el = this.$refs['intorForm'].$el
        const errors = el.getElementsByClassName('is-error')
        if (errors.length > 0) {
          errors[0].scrollIntoView(true)
        }
      } finally {
        this.intorBtnLoading = false
      }
    }
  },
  async created() {
    await this.getList()
  },
  render() {
    return (
      <div class="app-container">
        <Query
          params={this.queryParams}
          onChange={this.changeQueryParams}
          onQuery={this.getList}
          onAdd={() => single.open(undefined, () => this.getList())}
        />

        <div class={styles.tableWraper}>
          <iTable
            tableOptions={tableOptions}
            tableData={this.list}
            columns={this.columns}
          />
        </div>

        {this.total > 0 && (
          <Pagination
            total={this.total}
            page={this.queryParams.pageNum}
            limit={this.queryParams.pageSize}
            on={{
              'update:page': ($event) => (this.queryParams.pageNum = $event),
              'update:limit': ($event) => (this.queryParams.pageSize = $event)
            }}
            onPagination={this.getList}
          />
        )}

        {/* 自动上架任务 复制弹窗 */}
        <Dialog
          title="该产品通过自动上架任务创建"
          visible={this.dialogVisible}
          width="550px"
        >
          <div>
            自动上架任务编号：<span>{this.dialogProductItem}</span>
            <CopyIcon
              iconStyles={{ marginLeft: '7px', fontSize: '14px' }}
              text={this.dialogProductItem}
            />
          </div>
          <div slot="footer">
            <el-button
              type="primary"
              size="mini"
              onClick={() => {
                this.dialogVisible = false
              }}
            >
              知道了
            </el-button>
          </div>
        </Dialog>

        {/* 修改理财产品说明 */}
        <Dialog
          title="修改理财产品"
          visible={this.intorDialogVisible}
          width="1200px"
          top="0"
        >
          <el-form ref="intorForm" props={{ model: this.form }} label-width="120px" rules={this.productintorRules}>
            <el-row>
              <el-form-item prop="shelvingMode">
                <div slot="label">上架方式：</div>

                <el-radio-group
                  value={this.form.shelvingMode}
                  disabled={!!((this.curUpdateItem && this.curUpdateItem.shelfState === 1) || (this.curUpdateItem && this.curUpdateItem.state !== 0))}
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
                        disabled={!!(this.curUpdateItem && this.curUpdateItem.shelfState === 1) || (this.curUpdateItem && this.curUpdateItem.state !== 0)}
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
                        value={desc.value || ''}
                        placeholder=""
                        onInput={text => (desc.value = text)}
                      />
                    </el-form-item>
                  </el-col>
                )
              })}
            </el-row>
          </el-form>
          <div class={styles.intorTips}>
            <div >在保存时，可选择是否将英文简介复用到其他所有其他语言简介配置中。</div>
            <div >（将会保留其他语言已填写的内容，只将内容复用至空输入框）</div>
          </div>
          <div slot="footer">
            <el-button onClick={() => { this.intorDialogVisible = false }}>取消</el-button>
            <el-button
              type="primary"
              loading={this.intorBtnLoading}
              onClick={() => this.submit()}
            >
              确 定
            </el-button>
          </div>
        </Dialog>
      </div>
    )
  }
}
