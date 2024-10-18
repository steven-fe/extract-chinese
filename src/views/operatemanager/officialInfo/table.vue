<template>
  <div class="sort-table">
    <el-table
      v-if="type == 'staff'"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column
        prop="fname"
        label="姓名"
      />
      <el-table-column
        prop="fpicture"
        label="头像"
      >
        <template slot-scope="scope">
          <img
            style="width: 40px;height: 40px;"
            :src="scope.row.fpicture"
            alt
            @click="showImg(scope.row.fpicture)"
          >
        </template>
      </el-table-column>
      <el-table-column
        prop="fdepartment"
        label="部门"
      >
        <template slot-scope="scope">
          <div
            v-for="(item, index, key) in departmentOptions"
            :key="key"
          >
            <span v-if="scope.row.fdepartment == item.value">{{ item.label }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="fposition"
        label="职位"
      />
      <el-table-column
        prop="femail"
        label="邮箱"
      />
      <el-table-column
        prop="ftelegram"
        label="telegram"
      />
      <el-table-column
        prop="flinkedln"
        label="linkedln"
      />
      <el-table-column
        prop="twitter"
        label="twitter"
      />
      <el-table-column
        prop="fsort"
        label="排序权重"
      />
      <el-table-column
        fixed="right"
        :label="$t('common.operation')"
        width="180"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleEditClick(scope.row, 'staff')"
          >修改</el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelClick(scope.row, 'staff')"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-table
      v-if="type == 'media'"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column
        prop="fcontent"
        label="URL"
      />
      <el-table-column
        prop="fremark"
        :label="$t('common.remarks')"
      />
      <el-table-column
        fixed="right"
        :label="$t('common.operation')"
        width="180"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleEditClick(scope.row, 'media')"
          >修改</el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelClick(scope.row, 'media')"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-table
      v-if="type == 'host'"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column
        prop="fcontent"
        label="URL"
      />
      <el-table-column
        prop="fremark"
        :label="$t('common.remarks')"
      />
      <el-table-column
        fixed="right"
        :label="$t('common.operation')"
        width="180"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleEditClick(scope.row, 'host')"
          >修改</el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelClick(scope.row, 'host')"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title="查看图片"
      :visible.sync="imgShow"
    >
      <img
        style="display: block;margin: 0 auto;max-width: 100%;"
        :src="imgShowSrc"
        alt
      >
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SortTable',
  props: {
    tableData: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: () => 'staff'
    }

  },
  data() {
    return {
      imgShow: false,
      imgShowSrc: undefined,
      departmentOptions: [
        {
          value: '1',
          label: 'Operations'
        },
        {
          value: '2',
          label: 'Marketing'
        },
        {
          value: '3',
          label: 'Business Development'
        }
      ]
    }
  },
  methods: {
    handleEditClick(row, type) {
      this.$emit('edit', row, type)
    },
    handleDelClick(row, type) {
      this.$emit('del', row, type)
    },
    showImg(src) {
      this.imgShowSrc = undefined
      this.imgShowSrc = src
      this.imgShow = true
    }
  }
}
</script>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss" scoped>
.sort-table {
  width: 100%;
  padding-bottom: 20px;
}
</style>
