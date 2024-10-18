import { judgeIsSame, updateState } from '@/api/earn/product-management'
import { Message, MessageBox } from 'element-ui'
import { parseTime } from '@/utils/ruoyi'
import { typeMap, paymentWayMap, productsStateMap, shelfStateMap } from '../../data'
import single from '../single'

export default {
  name: 'Table',
  props: {
    data: {
      type: Array
    }
  },
  render() {
    return <el-table data={this.data} border>
      <el-table-column
        prop="operation"
        label="操作"
        width="300"
        fixed
        scopedSlots={{
          default: ({ row }) => {
            const { shelfState, productInsideName, id, productType, state, investmentCurrency, investmentCycle } = row

            return (
              <div>
                <el-button type="primary" size="mini" onClick={() => single.open({ id, type: 'view' })}>详情</el-button>

                { state === 0 && <el-button type="primary" size="mini" onClick={() => single.open({ id, type: 'edit' }, () => this.$emit('updateList'))}>修改</el-button> }

                {
                  (() => {
                    const nextShelfState = +!shelfState
                    const nextShelfStateText = nextShelfState ? '上架' : '下架'

                    return <el-button
                      type={nextShelfState ? 'success' : 'danger'}
                      size="mini"
                      onClick={async() => {
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
                                `当前已上架 ${investmentCurrency} ${typeMap.get(productType).name} ${investmentCycle}天 理财产品(ID：${sameId})，是否上架本产品(ID：${id})，替换旧产品？`,
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
                          this.$emit('updateList')
                        } catch (e) {
                          console.log(e)
                        }
                      }}
                    >{ nextShelfStateText }</el-button>
                  })()
                }

                <el-button type="primary" size="mini" onClick={() => single.open({ id, type: 'copy' }, () => this.$emit('updateList'))}>复制</el-button>
              </div>
            )
          }
        }}
      />

      <el-table-column prop="createTime" label="创建时间" width="140" formatter={({ createTime }) => parseTime(createTime, '{y}-{m}-{d} {h}:{i}')} />

      <el-table-column prop="id" label="产品ID" />

      <el-table-column prop="productInsideName" label="产品内部名称" width="210" />

      <el-table-column prop="productName" label="产品显示名称（英文）" width="220" />

      <el-table-column prop="productType" label="产品类型" width="80" formatter={({ productType }) => typeMap.get(productType).name} />

      <el-table-column prop="investmentCurrency" label="投资币种" width="80" />

      <el-table-column prop="applyAmount" label="已申购额度/募集金额" width="150" formatter={({ applyAmount, raiseTotalAmount }) => `${applyAmount}/${raiseTotalAmount}`} />

      <el-table-column prop="incomeCurrency" label="收益币种" width="80" />

      <el-table-column prop="raiseStartTs" label="募集周期（UTC+8）" width="280" formatter={({ raiseStartTs, raiseEndTs }) => `${parseTime(raiseStartTs, '{y}-{m}-{d} {h}:{i}')} ~ ${parseTime(raiseEndTs, '{y}-{m}-{d} {h}:{i}')}`} />

      <el-table-column prop="investmentCycle" label="投资期限和年化收益率" width="180" formatter={({ investmentCycle, annualizedIncome }) => `${investmentCycle}天 | APR:${annualizedIncome}%`} />

      <el-table-column prop="paymentWay" label="回款方式" width="80" formatter={({ paymentWay }) => paymentWayMap.get(paymentWay).name} />

      <el-table-column prop="paymentTs" label="到账时间（UTC+8）" width="180" formatter={({ paymentTs }) => parseTime(paymentTs, '{y}-{m}-{d} {h}:{i}')} />

      <el-table-column prop="state" label="产品状态" width="80" formatter={({ state }) => productsStateMap.get(state).name} />

      <el-table-column prop="shelfState" label="上架状态" width="80" formatter={({ shelfState }) => shelfStateMap.get(shelfState).name} />

    </el-table>
  }
}
