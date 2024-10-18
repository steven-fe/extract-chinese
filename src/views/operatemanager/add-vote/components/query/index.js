import { importData, exportErrorData } from '@/api/operate/add-vote'
import { download } from '@/utils/ruoyi'
import { opTypeMap } from '../../data'
import batch from '../batch'

export default {
  name: 'Query',
  props: {
    params: {
      type: Object
    }
  },
  methods: {
    change(options) {
      this.$emit('change', options)
    }
  },
  render() {
    return <el-form ref="queryForm" props={ { model: this.params } } inline>
      <el-form-item label="执行时间">
        <el-date-picker
          props={{
            clearable: true,
            size: 'mini',
            value: this.params.startTime && this.params.endTime ? [new Date(this.params.startTime), new Date(this.params.endTime)] : null,
            type: 'datetimerange',
            format: 'yyyy-MM-dd HH:mm:ss',
            'start-placeholder': '开始时间',
            'range-separator': '至',
            'end-placeholder': '结束时间',
            'value-format': 'timestamp',
            'default-time': ['00:00:00', '23:59:59']
          }}
          onInput={$event => this.change(Array.isArray($event) ? { startTime: $event[0], endTime: $event[1] } : { startTime: null, endTime: null })}
        />
      </el-form-item>

      <el-form-item label="批次号">
        <el-input value={this.params.batchNumber} placeholder="请输入批次号" clearable size="mini" onInput={batchNumber => this.change({ batchNumber: batchNumber || null })} />
      </el-form-item>

      <el-form-item label="操作类型">
        <el-select value={this.params.opType} size="mini" filterable clearable placeholder="全部" onInput={opType => this.change({ opType })}>
          { Array.from(opTypeMap.values()).map(({ id, name }) => (<el-option key={id} label={name} value={id} />)) }
        </el-select>
      </el-form-item>

      <el-form-item label="用户UID">
        <el-input value={this.params.uId} placeholder="请输入用户UID" clearable size="mini" onInput={uId => this.change({ uId })} />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" size="mini" onClick={this.$emit.bind(this, 'query')}>查询</el-button>
        <el-button type="primary" size="mini" onClick={this.$emit.bind(this, 'export')}>导出</el-button>
        <el-button
          type="primary"
          size="mini"
          onClick={() => {
            batch.open({
              templateUrl: 'https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/AirDropUserVotesTemplate.xlsx',
              title: '空投票',
              tips: '注意：<br />1.导入数据为增量导入，系统将在现有数量上增加新导入的数量<br/>2.编辑模板时，请确保填入有效的UID<br/>3.空投数量必须为正数',
              uploadApi: async(file) => {
                const res = await importData({ opType: 0, file })
                if (res.data.sucCount) this.$emit('query')
                return res
              },
              downloadErrorApi: async({ batchNumber }) => {
                const { msg } = await exportErrorData(batchNumber)
                download(msg)
              }
            })
          }}
        >空投</el-button>
        <el-button
          type="primary"
          size="mini"
          onClick={() => {
            batch.open({
              templateUrl: 'https://coinstore-sg-encryption.coinstore.com/filesUpload/ex1/public/RecoveryUserVotesTemplate.xlsx',
              title: '回收票',
              tips: '注意：<br />1.回收数量不能大于用户当前持有量<br/>2.编辑模板时，请确保填入有效的UID<br/>3.空投数量必须为正数',
              uploadApi: async(file) => {
                const res = await importData({ opType: 1, file })
                if (res.data.sucCount) this.$emit('query')
                return res
              },
              downloadErrorApi: async({ batchNumber }) => {
                const { msg } = await exportErrorData(batchNumber)
                download(msg)
              }
            })
          }}
        >回收</el-button>
      </el-form-item>
    </el-form>
  }
}
