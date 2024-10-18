<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item :label="$t(`regionManage['Partition Name (English)']`)">
        <el-select v-model="queryParams.id" size="mini" filterable clearable :placeholder="$t(`regionManage['All']`)">
          <el-option v-for="item in regionNameList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t(`regionManage['Query']`)
        }}</el-button>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">{{ $t(`regionManage['Add Partition']`)
        }}</el-button>
        <el-button type="primary" icon="el-icon-sort" size="mini" @click="openRankDialog">{{ $t(`regionManage['Partition Sorting']`)
        }}</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="dataList" border>
      <el-table-column :label="$t(`regionManage['Operation']`)" align="center" min-width="350" fixed="left" class-name>
        <template slot-scope="scope">
          <el-button size="mini" :type="scope.row.state ? 'danger' : 'success'" @click="updateState(scope.row)">{{
            scope.row.state ? $t(`regionManage['Offline']`) : $t(`regionManage['Online']`) }}</el-button>
          <el-button size="mini" type="primary" @click="handleEdit(scope.row)">{{ $t(`regionManage['Modify']`) }}</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">{{ $t(`regionManage['Delete']`) }}</el-button>
          <el-button v-if="!scope.row.defaultState" size="mini" type="warning" @click="handleSetDefault(scope.row)">{{
            $t(`regionManage['Set as Default']`) }}</el-button>
        </template>
      </el-table-column>

      <el-table-column :label="$t(`regionManage['Partition Sorting']`)" align="center" min-width="120" prop="sequencer" />

      <el-table-column :label="$t(`regionManage['Partition Unique Key']`)" align="center" min-width="150" prop="keyId" />

      <el-table-column :label="$t(`regionManage['Partition Name (Chinese)']`)" align="center" min-width="120" prop="nameZh" />

      <el-table-column :label="$t(`regionManage['Partition Name (English)']`)" align="center" min-width="120" prop="nameEn" />

      <el-table-column
        :label="$t(`regionManage['Special Icon Display']`)"
        align="center"
        min-width="120"
        prop="specialIcon"
        :formatter="({ specialIcon }) => specialIcon ? $t(`regionManage['Yes']`) : $t(`regionManage['No']`)"
      />

      <el-table-column
        :label="$t(`regionManage['Is Default']`)"
        align="center"
        min-width="120"
        prop="defaultState"
        :formatter="({ defaultState }) => defaultState ? $t(`regionManage['Yes']`) : $t(`regionManage['No']`)"
      />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog
      :title="$t(`regionManage['Sort']`)"
      :visible.sync="dialogRankVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="400px"
      @closed="rankDialogClosed"
    >

      <el-form :model="rankForm">

        <el-form-item :label="$t(`regionManage['Online Partitions']`)" label-width="110px">
          <div style="display: flex;">
            <ul style="margin: 0; list-style: none;">
              <li v-for="(_, index) in dataList.filter(region => region.state)" :key="index" style="line-height: 26px;">{{ index+1 }} - </li>
            </ul>

            <el-tree
              v-if="!dialogRankHidden"
              :data="dataList
                .filter(region => region.state)
                .reduce((sortMap, region, index, originalList) => {
                  const isLastRegion = index === originalList.length - 1
                  if (typeof region.sequencer === 'number') sortMap.sorted.push(region)
                  else sortMap.unsorted.push(region)
                  return (isLastRegion) ? [...sortMap.sorted, ...sortMap.unsorted] : sortMap
                }, { sorted: [], unsorted: [] })
                .map((region, index) => ({ ...region, label: `${region.nameZh}` }))"
              node-key="id"
              default-expand-all
              draggable
              :allow-drop="(_1, _2, type) => type !== 'inner'"
              @node-drop="(node) => rankForm.sortList = node.store.data"
            />
          </div>
        </el-form-item>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-tooltip
          class="item"
          effect="dark"
          :content="$t(`regionManage['tips1']`)"
          placement="top"
        >
          <i class="el-icon-question" style="cursor: pointer;" />
        </el-tooltip>
        <el-button type="primary" size="mini" @click="handleRank">{{ $t(`regionManage['Save']`) }}</el-button>
        <el-button size="mini" @click="dialogRankVisible = false">{{ $t(`regionManage['Cancel']`) }}</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="1000px"
      @closed="formDialogClosed"
    >

      <el-form v-if="!dialogFormHidden" ref="form" :model="form" label-width="auto">

        <div style="display: flex; justify-content: space-between;">

          <div>
            <h3>{{ $t(`regionManage['Partition Name']`) }}</h3>

            <el-form-item
              v-for="(nameItem, index) of form.names"
              :key="`name_${nameItem.langKey}`"
              :label="$t(`regionManage['Partition Name ({language})']`, { language: languageMap.get(nameItem.langKey) })"
              :prop="`names.${index}.name`"
              :required="['en_US'].includes(nameItem.langKey)"
              :rules="['en_US'].includes(nameItem.langKey) ? [
                { required: true, message: $t(`regionManage['Required']`) },
              ] : []"
            >
              <el-input v-model="form.names[index].name" clearable />
            </el-form-item>

            <el-form-item :label="$t(`regionManage['Special Icon']`)" prop="specialIcon">
              <el-checkbox
                :value="!!form.specialIcon"
                @change="() => form.specialIcon = +!form.specialIcon"
              >{{ $t(`regionManage['Yes']`) }}</el-checkbox>
            </el-form-item>
          </div>

          <div>
            <h3>{{ $t(`regionManage['Partition Coin Pairs']`) }}</h3>

            <el-form-item prop="symbolIds" label-width="0px">
              <TreeTransfer
                v-if="!dialogFormHidden"
                v-model="form.symbolIds"
                :titles="[$t(`regionManage['All Coin Pair Codes']`), $t(`regionManage['Partition Coin Pair Codes']`)]"
                :data="spotSymbolList"
                node-key="id"
                search
                show-checkbox
                show-check-all
                show-check-num
                node-check
                select-max="30"
                :placeholder="[$t(`regionManage['Search Coin Pair Codes']`), $t(`regionManage['Search Coin Pair Codes']`)]"
                :props="{ label: 'label', value: 'id', children: 'children', disabled: 'disabled' }"
              />
            </el-form-item>
          </div>
        </div>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-tooltip class="item" effect="dark" placement="top">
          <p slot="content">
            {{ $t(`regionManage['New partitions are by default offline;']`) }}
            <br><br>
            {{ $t(`regionManage['Apart from English, other languages are not mandatory; empty fields will be filled in English by default;']`) }}
            <br><br>
            {{ $t(`regionManage['After saving, it takes a few minutes for the latest configuration to be applied online.']`) }}
          </p>
          <i class="el-icon-question" style="cursor: pointer;" />
        </el-tooltip>
        <el-button type="primary" size="mini" @click="handleEditForm">{{ $t(`regionManage['Confirm']`) }}</el-button>
        <el-button size="mini" @click="dialogFormVisible = false">{{ $t(`regionManage['Cancel']`) }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as api from './api'
import * as languageConfigApi from '@/api/system/languageconfig'
import treeTransfer from 'ele-tree-transfer'
import _ from 'lodash'

export default {
  name: 'RegionManage',
  components: {
    TreeTransfer: treeTransfer.TreeTransfer
  },
  data() {
    const initForm = (languageMap = new Map()) => ({
      id: null,

      names: [...languageMap.entries()].map(([key]) => ({ langKey: key, name: '' })),
      specialIcon: 0,
      symbolIds: []
    })

    return {
      regionNameList: [],

      queryParams: {
        id: null,
        pageNum: 1,
        pageSize: 50
      },

      loading: true,

      total: 0,

      dataList: [],

      /** Map([ ['en_US', '英语'], ... ]) */
      languageMap: new Map(),
      spotSymbolList: [],

      dialogRankVisible: false,
      dialogRankHidden: true,
      rankForm: { sortList: [] },

      dialogTitle: '',
      dialogFormVisible: false,
      dialogFormHidden: true,
      initForm,
      form: initForm()
    }
  },
  async created() {
    await Promise.allSettled([this.setRegionNameList(), this.getList(), this.setLanguageSelect(), this.setSpotSymbolList()])
    this.form = this.initForm(this.languageMap)
  },
  methods: {
    async setLanguageSelect() {
      const languageMap = new Map()

      const res = await languageConfigApi.listConfig();
      (res && res.rows || []).forEach(({ key, language }) => {
        languageMap.set(key, language)
      })

      this.languageMap = languageMap
    },
    async setRegionNameList() {
      try {
        const res = await api.getRegionNameList()
        this.regionNameList = res.data || []
      } catch (e) {
        console.error(e)
      }
    },
    async setSpotSymbolList() {
      const res = await api.getSpotSymbolList()
      this.spotSymbolList = res.data.map(({ id, name: label }) => ({ id, label }))
    },
    async getList() {
      try {
        this.loading = true
        const res = await api.getRegionList(this.queryParams)
        this.dataList = res.rows
        this.total = res.total || 0
      } catch (e) {
        console.error(e)
        this.dataList = []
      } finally {
        this.loading = false
      }
    },
    async handleQuery() {
      await this.getList()
    },

    async updateState({ id, state }) {
      const nextState = +!state

      try {
        await api.changeState({ id, state: nextState })
        await this.getList()
        this.$message.success(nextState ? this.$t(`regionManage['Partition successfully online']`) : this.$t(`regionManage['Partition successfully offline']`))
      } catch (e) {
        console.error(e)
      }
    },

    async handleDelete({ id }) {
      try {
        await this.$confirm(this.$t(`regionManage['After deletion, all coin pairs under this partition will be adjusted to a no-partition state']`), this.$t(`regionManage['Are you sure you want to delete the "Main" partition?']`), {
          confirmButtonText: this.$t(`regionManage['Confirm']`),
          cancelButtonText: this.$t(`regionManage['Cancel']`),
          type: 'warning'
        })

        await api.removeRegion(id)
        await this.getList()
        this.$message.success(this.$t(`regionManage['Partition deleted successfully, all coin pairs under the partition have been adjusted to a "no-partition" state']`))
      } catch (e) {
        console.error(e)
      }
    },

    async handleSetDefault({ id }) {
      try {
        await api.setDefault({ id, state: 1 })
        await this.getList()
      } catch (e) {
        console.error(e)
      }
    },

    formDialogClosed() {
      this.form = this.initForm(this.languageMap)
      setTimeout(() => {
        this.dialogFormHidden = true
      }, 100)
    },

    openRankDialog() {
      this.dialogRankVisible = true
      this.dialogRankHidden = false
      this.rankForm.sortList = this.dataList
    },
    rankDialogClosed() {
      this.dialogRankHidden = true
    },
    async handleRank() {
      await api.setListSort({ sortList: this.rankForm.sortList.map(({ id }, sequencer) => ({ id, sequencer: sequencer + 1 })) })
      this.$message.success(this.$t(`regionManage['Sorting saved successfully']`))
      this.dialogRankVisible = false
      this.getList()
    },
    handleAdd() {
      this.dialogTitle = this.$t(`regionManage['Add Partition']`)
      this.dialogFormVisible = true
      this.dialogFormHidden = false
    },
    async handleEdit({ id }) {
      const { data } = await api.getDetail(id)

      for (const key in this.form) {
        if (data.hasOwnProperty(key)) {
          this.form[key] = data[key]
        }
      }

      // eslint-disable-next-line no-lone-blocks
      {
        /** sorted this.form.names */
        this.form.names = [...this.languageMap.keys()].reduce((names, langKey) => {
          const nameItem = this.form.names.find(nameItem => nameItem.langKey === langKey)
          if (nameItem) names.push(nameItem)
          return names
        }, [])
      }

      this.dialogTitle = this.$t(`regionManage['Edit Partition']`)

      /** wait for set data */
      setTimeout(() => {
        this.dialogFormVisible = true
        this.dialogFormHidden = false
      }, 0)
    },
    handleEditForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const form = _.cloneDeep(this.form)

          {
            const enNameItem = form.names.find(({ langKey }) => langKey === 'en_US')
            if (enNameItem) {
              form.names.forEach(nameItem => {
                nameItem.name = nameItem.name || enNameItem.name
              })
            }
          }

          if (!form.id) {
            api.add(form)
              .then(async() => {
                this.$message.success(this.$t(`regionManage['Partition added successfully']`))
                this.dialogFormVisible = false
                await this.getList()
                this.setRegionNameList()
              })
              .catch(error => {
                console.log(error)
              })
          } else {
            api.edit(form)
              .then(async() => {
                this.$message.success(this.$t(`regionManage['Partition edited successfully']`))
                this.dialogFormVisible = false
                await this.getList()
                this.setRegionNameList()
              })
              .catch(error => {
                console.log(error)
              })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" module></style>
