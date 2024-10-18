import setGasLimitModal from '../set-gas-limit-modal'

export default {
  name: 'SetGasLimitButton',
  render() {
    return <el-button size="mini" icon="el-icon-plus" onClick={() => setGasLimitModal.open(null, () => this.$emit('update'))}>链上手续费关联</el-button>
  }
}
