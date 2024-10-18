import { parseTime } from '@/utils/ruoyi'
import BigNumber from 'bignumber.js'
import { DEFAULT_VALUE_OF_TABLE_CELL } from '@/config'

const format = (row, prop, formatter) => {
  let result = DEFAULT_VALUE_OF_TABLE_CELL
  const value = row[prop]
  const noData = [null, undefined].includes(value)

  switch (true) {
    case (formatter === 'formatTime'): {
      result = noData ? DEFAULT_VALUE_OF_TABLE_CELL : parseTime(value)
      break
    }
    case (formatter === 'formatArray'): {
      result = noData ? DEFAULT_VALUE_OF_TABLE_CELL : value.join(', ')
      break
    }
    case (formatter === 'formatNumber'): {
      result = noData ? DEFAULT_VALUE_OF_TABLE_CELL : BigNumber(value).toFormat()
      break
    }
    case (typeof formatter === 'function'): {
      result = formatter(row)
      break
    }
    case (formatter === undefined): {
      result = noData ? DEFAULT_VALUE_OF_TABLE_CELL : row[prop]
      break
    }
    default: {
      throw new Error('No such scene!')
    }
  }

  return result
}

export default {
  name: 'Cell',
  functional: true,
  props: {
    column: Object,
    scope: Object
  },
  render: (h, ctx) => {
    const { column: { renderCell, prop, formatter }, scope } = ctx.props
    const { row } = scope

    return renderCell ? renderCell(h, scope) : h('span', {}, format(row, prop, formatter))
  }
}
