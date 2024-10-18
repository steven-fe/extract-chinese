import { opTypeMap } from '../../data'

export default {
  name: 'Table',
  props: {
    data: {
      type: Array
    }
  },
  render() {
    return <el-table data={this.data} border on={{ 'selection-change': selectedIds => this.$emit('selectionChange', selectedIds) }}>
      <el-table-column type="selection" width="55" />

      <el-table-column prop="batchNumber" label="批次号" />

      <el-table-column prop="exetime" label="执行时间" formatter={({ exetime }) => this.parseTime(exetime)} />

      <el-table-column prop="uidStr" label="用户UID" />

      <el-table-column prop="opType" label="操作类型" formatter={({ opType }) => opTypeMap.get(opType).name} />

      <el-table-column prop="volume" label="执行数量" />

      <el-table-column prop="exeVolume" label="执行完成后票数" />

      <el-table-column prop="operator" label="操作人" />

    </el-table>
  }
}
