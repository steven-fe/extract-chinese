import { changeOnlineState, exportVoteRecords } from '@/api/operate/vote-for-listing'
import { stateMap, voteResultMap, lookStatusMap } from '../../data'
import increaseVote from './components/increase-vote'
import signle from '../single'

export default {
  name: 'Table',
  props: {
    data: {
      type: Array
    }
  },
  methods: {
    async changeOnlineState(id, state) {
      await changeOnlineState(id, state)
      this.$emit('updateList')
    },
    async exportVoteRecords(id) {
      const { msg } = await exportVoteRecords(id)
      this.download(msg)
    }
  },
  render() {
    return <el-table data={this.data} border>
      <el-table-column
        prop="operation"
        label="操作"
        width="230"
        fixed
        scopedSlots={{
          default: ({ row }) => {
            const { id, lookStatus, activityStatus } = row
            const updateList = () => this.$emit('updateList')

            return (
              <div>
                <el-button type="text" size="mini" disabled={activityStatus === 2} onClick={() => signle.open({ id, type: 'edit' }, updateList)}>修改</el-button>
                <el-button type="text" size="mini" onClick={() => this.changeOnlineState(id, +!lookStatus)}>{lookStatusMap.get(+!lookStatus).name}</el-button>
                <el-button type="text" size="mini" disabled={activityStatus === 2} onClick={() => increaseVote.open(id, updateList)}>虚增票数</el-button>
                <el-button type="text" size="mini" onClick={() => this.exportVoteRecords(id)}>导出投票记录</el-button>
              </div>
            )
          }
        }}
      />

      <el-table-column prop="id" label="活动id" />

      <el-table-column prop="startTime" label="活动开启时间" formatter={({ startTime }) => this.parseTime(startTime)} />

      <el-table-column prop="currencyCode" label="项目币种" />

      <el-table-column prop="activityStatus" label="活动状态" formatter={({ activityStatus }) => stateMap.get(activityStatus).name} />

      <el-table-column prop="voteResult" label="投票结果" formatter={({ activityStatus, voteResult }) => activityStatus === 2 ? voteResultMap.get(voteResult).name : '--'} />

      <el-table-column prop="lookStatus" label="上线状态" formatter={({ lookStatus }) => lookStatusMap.get(lookStatus).name} />

      <el-table-column prop="threshold" label="上币门槛票数" />

      <el-table-column prop="votePepoleNum" label="参与投票人数" />

      <el-table-column prop="cumulativeVote" label="累计投票数" />

      <el-table-column prop="registerVotePepoleNum" label="新增注册用户投票人数" />

      <el-table-column prop="kycVotePepoleNum" label="新增KYC用户投票人数" />

      <el-table-column prop="increaseVote" label="虚增票数" />

    </el-table>
  }
}
