import { getUserCategoryDetail } from '@/api/user'
import UserList from './components/user-list'

export default {
  name: 'Detail',
  data() {
    return {
      curTabName: this.$route.query.curTabName || 'categoryInfo',

      id: this.$route.query.id && +this.$route.query.id,
      detail: null
    }
  },
  methods: {
    async getDetail() {
      const { data } = await getUserCategoryDetail(this.id)
      this.detail = data
    },
    edit() {
      this.$router.push({ name: 'userCategoryEdit', query: { id: this.id }})
    }
  },
  async created() {
    await this.getDetail()
  },
  render() {
    const CategoryInfo = () => {
      const dataIsReady = !!this.detail

      if (!dataIsReady) return null

      return (
        <div class="category-info" style="display: flex; justify-content: space-between; align-items: flex-start; ">
          <div class="left" style="width: 1000px">
            <h3>基础信息</h3>
            <p>
              分类名称：<strong>{this.detail.className}</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              分类代码：<strong>{this.detail.classCode}</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              分类用户总数：<strong>{this.detail.userCount}</strong>
            </p>

            <br/>

            <h3>权限范围</h3>
            <h3>现货手续费率</h3>

            {
              !Array.isArray(this.detail.groupList[0].symbolList) || !this.detail.groupList[0].symbolList.length
                ? <div>
                  <h5>全部币对统一</h5>
                  <p>
                    Maker 手续费率：{this.detail.groupList[0].makerRate}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    Taker 手续费率：{this.detail.groupList[0].takerRate}
                  </p>
                </div>
                : <div>
                  <h5>指定币对统一</h5>
                  <el-table data={this.detail.groupList} border>
                    <el-table-column prop="groupName" label="分组" />
                    <el-table-column prop="groupName" label="币对" formatter={({ symbolList }) => `${symbolList.map(({ symbolName }) => symbolName).join(', ')}`} />
                    <el-table-column prop="groupName" label="现货手续费率" formatter={({ makerRate, takerRate }) => `Maker 手续费率：${makerRate}，Taker 手续费率：${takerRate}`} />
                  </el-table>
                </div>
            }
          </div>
          <el-button class="right" type="primary" onClick={this.edit}>编辑信息</el-button>
        </div>
      )
    }

    return <div class="app-container">
      <h2>{this.detail && this.detail.classCode} 的用户分类详情</h2>

      <el-tabs value={this.curTabName} on={{ 'tab-click': tab => this.curTabName = tab.name }}>
        <el-tab-pane label="分类信息" name="categoryInfo">
          <CategoryInfo />
        </el-tab-pane>

        <el-tab-pane label="分类用户列表" name="categoryUserList">
          { this.id && <UserList classId={ this.id } /> }
        </el-tab-pane>
      </el-tabs>
    </div>
  }
}
