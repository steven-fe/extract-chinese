import { setTopTrading, updateTradingContestState, deleteTradingContest } from '@/api/trading-contest'
import { Message, MessageBox } from 'element-ui'
import $router from '@/router'
import { stateMap } from '../../data'
import single from '../single'

const CurrencyPair = ({ props }) => {
  const { symbolString } = props
  const spotSymbol = (!symbolString || symbolString === '--') ? (symbolString || '--') : symbolString.split(',')
  const showType = (Array.isArray(spotSymbol) && spotSymbol.length > 1) ? 'popover' : 'text'

  return (showType === 'popover')
    ? <el-popover placement="top-start" width="200" trigger="hover">
      <ul>
        {
          spotSymbol.map(symbol => <li key={symbol}>{symbol}</li>)
        }
      </ul>
      <el-button slot="reference" size="mini" plain>{spotSymbol.length}</el-button>
    </el-popover>
    : <span>{spotSymbol}</span>
}

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
        width="520"
        fixed
        align="center"
        scopedSlots={{
          default: ({ row }) => {
            const { id, showState, topping, endTime } = row

            return (
              <div>
                <el-button type="primary" size="mini" onClick={() => single.open({ id, type: 'view' })}>查看</el-button>

                {
                  (() => {
                    const nextState = +!showState
                    const nextStateText = stateMap.get(nextState).name

                    return <el-button
                      type={nextState ? 'success' : 'danger'}
                      size="mini"
                      onClick={async() => {
                        try {
                          await MessageBox.confirm(`确定要${nextStateText}该交易赛吗？`, { type: 'warning' })
                          await updateTradingContestState({ id, state: nextState })
                          Message.success('操作成功！')
                          this.$emit('updateList')
                        } catch (e) {
                          console.log(e)
                        }
                      }}
                    >{ nextStateText }</el-button>
                  })()
                }

                <el-button
                  type="primary"
                  size="mini"
                  onClick={async() => {
                    try {
                      if (showState === 1) {
                        const msg = '交易赛处于上线状态，请下线后进行修改!'
                        Message.error(msg)
                        throw new Error(msg)
                      }

                      single.open({ id, type: 'edit' }, () => this.$emit('updateList'))
                    } catch (e) {
                      console.error(e.message)
                    }
                  }}
                >修改</el-button>

                <el-button type="primary" size="mini" onClick={() => $router.push({ name: 'tradingContestData', query: { id }}) }>查看交易数据</el-button>

                {
                  (() => {
                    const handleTopping = async() => {
                      if (Date.now() > endTime) {
                        const msg = '已结束的交易赛不支持置顶'
                        Message.error(msg)
                        throw new Error(msg)
                      }

                      if (showState === 0) {
                        const msg = '只有交易赛处于上线状态时，才能置顶'
                        Message.error(msg)
                        throw new Error(msg)
                      }

                      await MessageBox.confirm('确定要置顶该交易赛吗？（将会取消现有的置顶交易赛，同时只能置顶一项交易赛）', { type: 'warning' })
                      await setTopTrading(id, 1)
                      Message.success('置顶成功')
                    }

                    const handleUntopping = async() => {
                      await MessageBox.confirm('确定要取消置顶该交易赛吗？', { type: 'warning' })
                      await setTopTrading(id, 0)
                      Message.success('取消置顶成功')
                    }

                    return <el-button
                      type={topping ? 'danger' : 'success'}
                      size="mini"
                      onClick={async() => {
                        try {
                          await (topping ? handleUntopping : handleTopping)()
                          this.$emit('updateList')
                        } catch (e) {
                          console.log(e)
                        }
                      }}
                    >{ topping ? '取消置顶交易赛' : '置顶交易赛' }</el-button>
                  })()
                }

                <el-button type="danger" size="mini" onClick={async() => {
                  try {
                    if (showState === 1) {
                      const msg = '交易赛处于上线状态，请下线后进行删除'
                      Message.error(msg)
                      throw new Error(msg)
                    }

                    await MessageBox.confirm('确定要删除该交易赛吗？', { type: 'warning' })
                    await deleteTradingContest(id)
                    Message.success('操作成功！')
                    this.$emit('updateList')
                  } catch (e) {
                    console.log(e)
                  }
                }}>删除</el-button>
              </div>
            )
          }
        }}
      />

      <el-table-column label="交易赛ID" align="center" prop="id" width="80px" />

      <el-table-column label="交易赛链接（H5）" align="center" prop="h5Url" width="300px" />

      <el-table-column label="交易赛链接（web）" align="center" prop="webUrl" width="300px" />

      <el-table-column label="交易赛名称" align="center" prop="showName" width="260px"
        scopedSlots={{
          default: ({ row }) => <div domPropsInnerHTML={row.showName} />
        }}
      />

      <el-table-column label="现货-有效交易币对" align="center" prop="symbol" width="150px"
        scopedSlots={{
          default: ({ row: { symbol: symbolString }}) => <CurrencyPair symbolString={symbolString} />
        }}
      />

      <el-table-column label="合约-有效交易币对" align="center" prop="contractSymbol" width="150px"
        scopedSlots={{
          default: ({ row: { contractSymbol: symbolString }}) => <CurrencyPair symbolString={symbolString} />
        }}
      />

      <el-table-column label="交易赛开始时间" align="center" width="170px" formatter={({ startTime }) => this.parseTime(startTime)} />

      <el-table-column label="交易赛结束时间" align="center" width="170px" formatter={({ endTime }) => this.parseTime(endTime)} />

      <el-table-column label="交易赛状态" align="center" width="100px" formatter={({ showState }) => stateMap.get(showState).name} />
    </el-table>
  }
}
