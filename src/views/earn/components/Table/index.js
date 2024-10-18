import styles from './index.module.scss'
export default {
  name: 'Table',
  props: {
    tableOptions: {
      type: Object,
      default: {}
    },
    tableData: {
      type: Array,
      default: []
    },
    columns: {
      type: Array,
      default: []
    }
  },
  data() {
    return {}
  },
  render() {
    const { border } = this.tableOptions
    return (
      <div class={styles.iTabelWraper}>
        <el-table border={border} data={this.tableData}>
          {this.columns.map((col) => {
            return col.prop === 'operation' ? (
              <el-table-column
                prop={col.prop}
                width={col.width}
                label={col.label}
                fixed={col.fixed}
                scopedSlots={{
                  default: ({ row }) => {
                    return col.renderOperations(row)
                  }
                }}
              />
            ) : (
              <el-table-column
                prop={col.prop}
                width={col.width}
                label={col.label}
                formatter={col.formatter}
              />
            )
          })}
        </el-table>
      </div>
    )
  }
}
