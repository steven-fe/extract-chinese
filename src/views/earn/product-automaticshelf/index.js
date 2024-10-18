import { getTaskList, getProductList, create, taskStop } from '@/api/earn/product-automaticshelf'
import { getProductDetail } from '@/api/earn/product-management'
import Query from './components/query'
import { parseTime } from '@/utils/ruoyi'
import Table from '../components/Table/index'
import styles from './index.module.scss'
import Dialog from '@/components/iDialog/index'
import { MessageBox } from 'element-ui'
import Select from '@/components/Select/index'
export default {
  name: 'productAutomaticshelf',
  components: {},
  data() {
    return {
      queryParams: {
        productId: null,
        taskStatus: null,
        searchType: 'id',
        searchValue: null,
        productName: null,
        startTs: null,
        endTs: null,
        pageNum: 1,
        pageSize: 20
      },
      queryProductParams: {
        id: null,
        productName: null,
        pageNum: 1,
        pageSize: 20
      },
      productTotal: 0,
      productList: [],
      productOptions: [],
      total: 0,
      list: [],

      columns: [
        {
          prop: 'operation',
          label: '操作',
          width: '120',
          renderOperations: (row, e) => {
            return (
              <div class="table-operation-wrapper">
                {row.status === 0 ? (
                  <el-button
                    type="text"
                    style={{ color: '#F56C6C' }}
                    size="mini"
                    onClick={() => this.stopTask(row)}
                  >
                    停止
                  </el-button>
                ) : null}

                <el-button
                  type="text"
                  size="mini"
                  onClick={async() => {
                    Object.assign(this.handleProductParams, {
                      ...row,
                      firstCopyTs: null
                    })
                    const { data } = await getProductDetail(row.productId)
                    this.currentSelectProduct = { ...row,
                      productName: row.productEnName,
                      shelvingTs: data.fshelvingTs
                    }
                    this.productInOptions(row)
                    this.dialogVisible = true
                  }}
                >
                  复制
                </el-button>
              </div>
            )
          }
        },
        {
          prop: 'id',
          label: '任务编号'
        },
        {
          prop: 'productId',
          label: '复制产品ID'
        },
        {
          prop: 'createTime',
          label: '任务创建时间',
          formatter: ({ createTs }) => {
            return `${parseTime(createTs, '{y}-{m}-{d} {h}:{i}')}`
          }
        },
        {
          prop: 'taskStatus',
          label: '任务状态',
          formatter: ({ status }) => {
            return status === 0 ? '进行中' : '已结束'
          }
        },
        {
          prop: 'productEnName',
          label: '复制产品显示名称（英文）',
          width: '220'
        },
        {
          prop: 'firstCopyTs',
          label: '初次复制时间',
          formatter: ({ firstCopyTs }) => {
            return `${parseTime(firstCopyTs, '{y}-{m}-{d} {h}:{i}')}`
          }
        },
        {
          prop: 'lastCopyTs',
          label: '最近复制时间',
          formatter: ({ lastCopyTs }) => {
            return `${parseTime(lastCopyTs, '{y}-{m}-{d} {h}:{i}')}`
          }
        },
        {
          prop: 'copyInterval',
          label: '复制时间间隔（H）'
        },
        {
          prop: 'copynum',
          label: '自动复制次数/剩余次数',
          width: '180',
          formatter: ({ currentCopyNum, copyTotalNum }) => {
            return `${currentCopyNum}/${copyTotalNum - currentCopyNum}`
          }
        }
      ],
      dialogVisible: false,
      handleProductParams: {
        productEnName: null,
        productId: null,
        firstCopyTs: null,
        copyInterval: null,
        copyTotalNum: null
      },
      rules: {
        productId: [
          {
            required: true,
            message: '请选择理财产品',
            trigger: 'change'
          }
        ],
        firstCopyTs: [
          {
            required: true,
            trigger: 'change',
            validator: (_r, value, callback) => {
              if (!value) return callback(new Error('请选择上架时间'))
              if (value < +new Date()) {
                return callback(new Error('初次复制时间不能早于当前时间'))
              }
              // todo 需要等选择完复制的产品之后，再次进行判断 -> 当前选择复制时间是否小于产品上架时间
              if (this.currentSelectProduct && this.currentSelectProduct.shelvingTs) {
                if (value < this.currentSelectProduct.shelvingTs) {
                  return callback(new Error('初次复制时间不能早于被复制理财产品的上架时间'))
                }
              }
              callback()
            }
          }
        ],
        copyInterval: [
          {
            required: true,
            trigger: 'change',
            validator: (_r, value, callback) => {
              if (value < 0 || value > 720 || value === null) {
                return callback(new Error('请输入0~720之间整数'))
              }
              callback()
            }
          }
        ],
        copyTotalNum: [
          {
            required: true,
            trigger: 'change',
            validator: (_r, value, callback) => {
              if (value < 0 || value > 1000 || value === null) {
                return callback(new Error('请输入0~1000之间整数'))
              }
              callback()
            }
          }
        ]
      },
      handleType: 'add',
      comVisible: true,
      currentSelectProduct: null,
      catchCopyProductOption: null,
      onSelectInput: false
    }
  },
  methods: {
    changeQueryParams(options) {
      for (const key in options) {
        this.queryParams[key] = options[key]
      }
    },
    // 获取任务列表
    async getTaskList() {
      try {
        const { rows, total } = await getTaskList(this.setParams(this.queryParams))
        this.list = rows
        this.total = total
      } catch (error) {
        console.log(error)
      }
    },
    // 获取产品列表 分页, 下拉框需要滚动加载
    async getProductList() {
      const { rows, total } = await getProductList(this.queryProductParams)
      const newList = rows.map(item => {
        return {
          productId: item.id,
          productName: item.productName,
          key: item.id,
          label: item.productName,
          value: item.id
        }
      })

      const options = [...this.productOptions, ...newList]
      if (this.catchCopyProductOption) {
        const index = options.findIndex(item => item.key === this.catchCopyProductOption.key)
        if (index !== -1) {
          options.splice(index, 1)
        }
        this.catchCopyProductOption = null
      }
      this.productOptions = options
      this.productList = [...this.productList, ...rows]
      this.productTotal = total
    },
    setParams() {
      const { searchType, searchValue, productId, productName, taskStatus, startTs, endTs, pageNum, pageSize } = this.queryParams
      const params = {
        pageNum,
        pageSize,
        productId,
        productName,
        taskStatus,
        startTs,
        endTs
      }
      if (searchValue) {
        if (searchType && searchType === 'id') {
          params.productId = searchValue
        }
        if (searchType && searchType === 'name') {
          params.productName = searchValue
        }
      }
      return params
    },
    async submit() {
      try {
        await this.$refs['productForm'].validate()
        await create(this.handleProductParams)
        this.dialogVisible = false
        this.msgSuccess('操作成功')
        this.getTaskList()
        this.currentSelectProduct = null
        this.onSelectInput = false
      } catch (error) {
        console.log(error)
        this.productOptions = []
        this.productList = []
        this.queryProductParams = {
          id: null,
          productName: null,
          pageNum: 1,
          pageSize: 20
        }
        this.getProductList()
        this.onSelectInput = false
      }
    },
    clearFromValidate() {
      this.$refs['productForm'] && this.$refs['productForm'].resetFields()
    },
    productSelectChange(id) {
      // 不存在id 说明是删除内容了,重新搜索即可
      if (!id) {
        this.productList = []
        this.productOptions = []
        this.queryProductParams = {
          pageNum: 1,
          pageSize: 20,
          id: null
        }

        this.getProductList()
        return
      }
      this.currentSelectProduct = this.productList.find(item => item.id === id)
      this.handleProductParams.productId = id
      this.handleProductParams.productEnName = this.currentSelectProduct && this.currentSelectProduct.productName || ''
    },
    searchProduct(val) {
      this.onSelectInput = true
      const exp = /^[+-]?\d*(\.\d*)?(e[+-]?\d+)?$/
      if (exp.test(val)) {
        this.queryProductParams = {
          id: val,
          productName: String(val),
          pageNum: 1,
          pageSize: 20
        }
      } else {
        this.queryProductParams = {
          id: null,
          productName: val,
          pageNum: 1,
          pageSize: 20
        }
      }
      this.productList = []
      this.productOptions = []
      this.getProductList()
    },
    selectFocus() {
      if (this.onSelectInput) {
        this.productOptions = []
        this.productList = []
        this.queryProductParams = {
          id: null,
          productName: null,
          pageNum: 1,
          pageSize: 20
        }
        this.getProductList()
        this.onSelectInput = false
      }
    },
    selectBlur() {
      // 当失去焦点时，如果不存在数据，则再去请求一次看看
      if (this.productOptions.length <= 0 || !this.currentSelectProduct) {
        // 失去焦点重置数据时避免闪烁情况
        setTimeout(() => {
          this.productOptions = []
          this.productList = []
          this.queryProductParams = {
            id: null,
            productName: null,
            pageNum: 1,
            pageSize: 20
          }
          this.getProductList()
        }, 500)
      }
    },
    productInOptions({ productId, productEnName }) {
      const index = this.productOptions.findIndex(item => item.value === productId)
      if (index === -1) {
        this.catchCopyProductOption = {
          productId,
          productName: productEnName,
          key: productId,
          label: productEnName,
          value: productId
        }
        this.productOptions.push(this.catchCopyProductOption)
      }
    },
    // 停止任务
    async stopTask(row) {
      await MessageBox.confirm(
        `停止任务后，可能发生用户无法复投的情况。请及时发布新的自动上架任务`,
        `确认停止该自动上架任务？`,
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      ).then(async() => {
        await taskStop(row.id)
        this.msgSuccess('操作成功')
        this.getTaskList()
      }).catch(() => {})
    },
    selectLoadMore() {
      this.queryProductParams.pageNum += 1
      this.getProductList()
    }
  },
  computed: {
    isMoreProduct() {
      const page = Math.ceil(parseInt(this.productTotal) / this.queryProductParams.pageSize)
      return this.queryProductParams.pageNum < page
    }
  },
  async created() {
    this.getProductList()
    this.getTaskList()
  },
  render() {
    return (
      <div class="app-container">
        <Query
          params={this.queryParams}
          onChange={this.changeQueryParams}
          onQuery={this.getTaskList}
          onAdd={() => {
            this.dialogVisible = true
            this.handleProductParams = {
              productEnName: null,
              productId: null,
              firstCopyTs: null,
              copyInterval: null,
              copyTotalNum: null
            }
            this.clearFromValidate()
          }}
        />

        <Table
          tableOptions={{ border: true }}
          tableData={this.list}
          columns={this.columns}
        />

        {this.total > 0 && (
          <Pagination
            total={this.total}
            page={this.queryParams.pageNum}
            limit={this.queryParams.pageSize}
            on={{
              'update:page': ($event) => (this.queryParams.pageNum = $event),
              'update:limit': ($event) => (this.queryParams.pageSize = $event)
            }}
            onPagination={this.getTaskList}
          />
        )}

        <Dialog
          title="新增-定期理财产品自动上架任务"
          visible={this.dialogVisible}
          width={'700px'}
          onSubmit={() => this.submit()}
          onCancel={() => {
            this.dialogVisible = false
            this.currentSelectProduct = null
            this.clearFromValidate()
          }}
        >
          <el-form
            ref="productForm"
            props={{ model: this.handleProductParams }}
            inline
            rules={this.rules}
            label-width="120px"
          >
            <el-row>
              <el-form-item
                class={styles.dialogItem}
                label="复制产品ID："
                prop="productId"
              >
                <div class={styles.dialogFlex}>
                  <Select
                    ref="select"
                    size="mini"
                    value={this.handleProductParams.productId}
                    isSetWhiteSpace={false}
                    onChange={this.productSelectChange}
                    onClear={() => { this.currentSelectProduct = null }}
                    options={this.productOptions}
                    onLoadmore={this.selectLoadMore}
                    isMoreData={this.isMoreProduct}
                    onFocus={this.selectFocus}
                    onBlur={this.selectBlur}
                    filterable
                    clearable
                    filter-method={(value) => this.searchProduct(value)}
                  />
                  <div class={styles.dialogToolTip}>
                    <p>
                      理财产品名称：
                      {this.currentSelectProduct && this.currentSelectProduct.productName || '-'}
                    </p>
                    <p>
                      上架时间：
                      {this.currentSelectProduct && parseTime(
                        this.currentSelectProduct.shelvingTs,
                        '{y}-{m}-{d} {h}:{i}'
                      ) || '-'}
                    </p>
                  </div>
                </div>
              </el-form-item>
            </el-row>
            <el-row>
              <el-form-item
                class={styles.dialogItem}
                label="初次复制时间(UTC+8)："
                prop="firstCopyTs"
              >
                <div class={styles.dialogFlex}>
                  <el-date-picker
                    style={{ width: '200px' }}
                    props={{
                      clearable: true,
                      size: 'mini',
                      value: this.handleProductParams.firstCopyTs
                        ? new Date(this.handleProductParams.firstCopyTs)
                        : null,
                      type: 'datetime',
                      format: 'yyyy-MM-dd HH:mm',
                      'value-format': 'timestamp',
                      'default-time': '00:00:00',
                      disabled: this.type === 'view'
                    }}
                    onInput={(date) =>
                      (this.handleProductParams.firstCopyTs = date)
                    }
                  />
                </div>
              </el-form-item>
            </el-row>
            <el-row>
              <el-form-item
                class={styles.dialogItem}
                label="复制时间间隔："
                prop="copyInterval"
              >
                <div class={styles.dialogFlex}>
                  <span style={{ marginLeft: '-27px' }}>每隔&nbsp;</span>
                  <el-input
                    style={{ width: '200px' }}
                    size="mini"
                    value={this.handleProductParams.copyInterval}
                    onInput={(value) =>
                      (this.handleProductParams.copyInterval =
                        value.replace(/\D/g, '') === '' ? '' : parseInt(value))
                    }
                    placeholder="最小0，最大720"
                  />
                  <span>&nbsp;H，自动复制理财产品并上架</span>
                </div>
              </el-form-item>
            </el-row>
            <el-row>
              <el-form-item
                class={styles.dialogItem}
                label="自动复制次数："
                prop="copyTotalNum"
              >
                <div class={styles.dialogFlex}>
                  <el-input
                    style={{ width: '200px' }}
                    size="mini"
                    value={this.handleProductParams.copyTotalNum}
                    onInput={(value) =>
                      (this.handleProductParams.copyTotalNum =
                        value.replace(/\D/g, '') === '' ? '' : parseInt(value))
                    }
                    placeholder="最小0，最大1000"
                  />
                  <span>
                    &nbsp;自动复制次数消耗完后，该自动上架任务状态变为已结束
                  </span>
                </div>
              </el-form-item>
            </el-row>
          </el-form>
        </Dialog>
      </div>
    )
  }
}
