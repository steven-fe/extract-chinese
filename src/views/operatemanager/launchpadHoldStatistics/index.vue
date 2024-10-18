<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">

      <el-form-item label="活动id:" prop="aid">
        <el-input v-model="queryParams.aid" placeholder="活动id" clearable size="mini" />
      </el-form-item>

      <el-form-item label="UID:" prop="uid">
        <el-input v-model="queryParams.uid" placeholder="UID" clearable size="mini" />
      </el-form-item>

      <el-form-item
        label="持仓币种:"
        prop="cid"
      >
        <el-select
          v-model="queryParams.cid"
          size="mini"
          clearable
          placeholder="请选择持仓币种"
          filterable
        >
          <el-option
            v-for="item in currencyOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <!-- <el-button type="primary" size="mini" :disabled="!enableSearch" @click="handleQuery">查询</el-button> -->
        <el-button type="primary" size="mini" @click="handleQuery">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      :data="dataList"
      border
    >
      <el-table-column
        label="Launchpad活动ID"
        align="center"
        prop="activityId"
      />
      <el-table-column
        label="UID"
        align="center"
        prop="uid"
      />
      <el-table-column
        label="第1天持仓量"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.list[0] ? scope.row.list[0].amount : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        label="第2天持仓量"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.list[1] ? scope.row.list[1].amount : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        label="第3天持仓量"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.list[2] ? scope.row.list[2].amount : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        label="第4天持仓量"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.list[3] ? scope.row.list[3].amount : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        label="第5天持仓量"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.list[4] ? scope.row.list[4].amount : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        label="第6天持仓量"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.list[5] ? scope.row.list[5].amount : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        label="第7天持仓量"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.list[6] ? scope.row.list[6].amount : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        label="平均持仓"
        align="center"
        prop="avg"
      />
      <el-table-column
        label="持仓任务提额"
        align="center"
        prop="promote"
      />
    </el-table>
  </div>
</template>

<script>
import { positionStatistics, positionCurrencyList } from '@/api/launchpad'

// const handleDayList = (data, totalDays = 7) => {
//   const { list } = data

//   const responseDayMap = list
//     ? list.reduce((days, day) => {
//         const { day: index, amount } = day
//         days[`day${index}`] = amount
//         return days
//       }, {})
//     : {}

//   /**
//    * { day1: '-', day2: '-', day3: '-', ...  day7: '-' }
//    */
//   return Array(totalDays).fill(0).reduce((defaultDayMap, _, index) => {
//     const key = `day${index + 1}`
//     defaultDayMap[key] = responseDayMap[key] || '-'
//     return defaultDayMap
//   }, {})
// }

export default {
  name: 'Launchpad',
  data() {
    return {
      // 遮罩层
      loading: false,

      dataList: [],
      query: {},

      // 查询参数
      queryParams: {
        aid: undefined,
        uid: undefined,
        cid: undefined
      },

      currencyOptions: [
        // {
        //   value: '',
        //   label: this.$t('common.all'),
        // }
      ]
    }
  },
  computed: {
    // enableSearch () {
    //   return Object.keys(this.queryParams).every(key => {
    //     const value = this.queryParams[key]
    //     return !(value === undefined || value === '')
    //   })
    // }
  },
  created() {
    this.getPositionCurrencyList()
  },
  methods: {
    // 活动币种列表
    getPositionCurrencyList() {
      positionCurrencyList()
        .then((response) => {
          if (response.code == 200) {
            const currencyOptions = response.data ? response.data.map(({ currencyId, currencyName }) => ({ label: currencyName, value: currencyId })) : []
            this.currencyOptions = currencyOptions
          } else {
            this.msgError(response.msg)
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    /** 列表 */
    // getList () {
    //   this.loading = true
    //   this.dataList = []

    //   positionStatistics(this.queryParams).then(response => {
    //     const { code, data } = response

    //     if ((+code === 0 || +code === 200) && data && data.activityId) {
    //       const dayMap = handleDayList(data)
    //       this.dataList = [{
    //         ...data,
    //         ...dayMap
    //       }]
    //     }

    //     this.loading = false;
    //   }).catch((err) => {
    //     this.loading = false;
    //     console.log(err)
    //   });
    // },
    getList() {
      if (this.queryParams.aid !== '') {
        this.loading = true
        if (this.queryParams.aid !== '' && this.queryParams.uid !== '' && this.queryParams.cid !== '') {
          const params = {
            aid: this.queryParams.aid,
            uid: this.queryParams.uid,
            cid: this.queryParams.cid
          }
          this.query = params
        }

        if (this.queryParams.aid !== '' && this.queryParams.uid !== '' && this.queryParams.cid === '') {
          const params = {
            aid: this.queryParams.aid,
            uid: this.queryParams.uid
          }
          this.query = params
        }

        if (this.queryParams.aid !== '' && this.queryParams.uid === '' && this.queryParams.cid !== '') {
          const params = {
            aid: this.queryParams.aid,
            cid: this.queryParams.cid
          }
          this.query = params
        }

        if (this.queryParams.aid !== '' && this.queryParams.uid === '' && this.queryParams.cid === '') {
          const params = {
            aid: this.queryParams.aid
          }
          this.query = params
        }
        positionStatistics(this.query).then(response => {
          if (response.code === 200) {
            this.dataList = response.data
          }
          this.loading = false
        })
      } else {
        this.msgError('请输入活动id进行查询')
        this.dataList = []
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
