<template>
  <ListFilter
    :params="params"
    :items="items"
    :footer="footer"
    v-on="$listeners"
    @button-click-create="createSingle"
  />
</template>

<script>
import { $t } from '@/lang/index'
import ListFilter from '@/components/list-filter'
import single from '../single'
import { states, getLanguages } from '../../data'

export default {
  name: 'TableFilter',
  components: {
    ListFilter
  },
  props: {
    params: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      languageList: [],

      footer: Object.freeze([
        { id: 'search', type: 'primary', name: $t(`['common']['search']`) },
        { id: 'create', type: 'primary', name: $t(`['common']['newAdd']`) }
      ])
    }
  },
  computed: {
    items() {
      return [
        {
          label: '标题：',
          prop: 'title',
          component: 'textInput',
          attrs: {
            trim: true,
            placeholder: $t(`['common']['title']`)
          }
        },
        {
          label: '语言：',
          prop: 'language',
          component: 'select',
          attrs: {
            options: this.languageList
          }
        },
        {
          label: '上线状态：',
          prop: 'status',
          component: 'select',
          attrs: {
            options: states.list
          }
        },
        {
          label: '创建时间：',
          prop: 'createTime',
          component: 'datePicker',
          attrs: {
          }
        }
      ]
    }
  },
  async created() {
    await this.setLanguages()
  },
  methods: {
    async setLanguages() {
      {
        const { list } = await getLanguages()
        this.languageList = list
      }
    },
    createSingle() {
      single.open({ type: 'create' }, () => this.$emit('button-click-search'))
    }
  }
}
</script>
