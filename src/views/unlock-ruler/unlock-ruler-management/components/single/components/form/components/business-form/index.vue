<template>
  <SingleForm
    ref="form"
    :type="type"
    :form-data="formData"
    :form-items="formItems"
    label-position="top"
    @input="changeFormData"
  />
</template>

<script>
import _ from 'lodash'
import SingleForm from '@/components/list-single/form'
import { parseTime } from '@/utils/ruoyi'
import LimitUid from '../limit-uid'
import BillFile from '../bill-file'
import { ruleTypes, unlockFirstTypes } from '../../data'
import { lockScenes, whether, unlockWays } from '../../../../../../../data'
import { getOnlineCurrencies } from '../../../../../../../data'

export default {
  name: 'NotAccountedForForm',
  components: {
    SingleForm
  },
  props: {
    type: {
      type: String, // 'create', 'edit', 'view'
      required: true
    },
    // eslint-disable-next-line vue/require-default-prop
    id: {
      type: [String, Number]
    },
    // eslint-disable-next-line vue/require-default-prop
    responseFormData: {
      type: Object
    }
  },
  data() {
    const createFormData = () => ({
      id: null,
      ruleType: 'notAccountedFor', // 'notAccountedFor', 'alreadyAccountedFor'
      remarks: null,
      currencyCode: null,
      lockScene: null,
      time: null,
      // limitUid: ['no', { uidFile: null /* uidFilePath: null */ }],
      limitUid: { type: 'no' }, // { type: 'yes' | 'no', value?: { uidFile: File } | { uidFilePath: string }},
      billFile: null, // null | { billFile: File } | { billFilePath: string }
      unlockWay: null,
      unlockQty: null,
      unlockTimes: null,
      intervalTime: 1,
      unlockFirstType: 'unifiedTime',
      unlockFirstTimeOfNotAccountedFor: null,
      unlockFirstTimeOfAlreadyAccountedFor: null,
      firstIntervalTime: 1
    })

    return {
      createFormData: Object.freeze(createFormData),
      formData: _.pick(createFormData(), [
        /**
         * There are fixed fields
         */
        'id',
        'ruleType',
        'remarks',
        'unlockWay',
        'unlockQty',
        'unlockTimes',
        'intervalTime'
      ]),

      currencies: {},
      currencyList: []
    }
  },
  computed: {
    formItems() {
      const initialFormData = this.createFormData()

      return Object.freeze([
        {
          prop: 'ruleType',
          label: '规则器类型：',
          component: 'radioGroup',
          attrs: { options: ruleTypes.list }
        },
        {
          prop: 'remarks',
          label: '备注名：',
          rules: [{ required: true, message: '请输入备注名' }],
          component: 'input',
          attrs: { trim: true }
        },
        (() => {
          const PROP = 'billFile'
          const { ruleType } = this.formData

          // hide
          if (ruleType !== 'alreadyAccountedFor') {
            this.$delete(this.formData, PROP)
            return null
          }

          // show
          if (!(PROP in this.formData)) this.$set(this.formData, PROP, initialFormData[PROP])

          return {
            prop: PROP,
            label: '上传锁仓账单ID：',
            rules: [{
              required: true,
              validator: (rule, value, callback) => {
                const { billFile, billFilePath } = value || {}
                if (!!billFile || !!billFilePath) return callback()
                callback(new Error('请上传文件'))
              }
            }],
            component: 'custom',
            attrs: { component: BillFile }
          }
        })(),
        (() => {
          const PROP = 'currencyCode'
          const { ruleType } = this.formData

          // hide
          if (ruleType !== 'notAccountedFor') {
            this.$delete(this.formData, PROP)
            return null
          }

          // show
          if (!(PROP in this.formData)) this.$set(this.formData, PROP, initialFormData[PROP])

          return {
            prop: PROP,
            label: '解锁币种：',
            rules: [{ required: true, message: '请选择解锁币种' }],
            component: 'select',
            attrs: { options: this.currencyList }
          }
        })(),
        (() => {
          const PROP = 'lockScene'
          const { ruleType } = this.formData

          // hide
          if (ruleType !== 'notAccountedFor') {
            this.$delete(this.formData, PROP)
            return null
          }

          // show
          if (!(PROP in this.formData)) this.$set(this.formData, PROP, initialFormData[PROP])

          return {
            prop: PROP,
            label: '锁仓入账场景：',
            rules: [{ required: true, message: '请选择锁仓入账场景' }],
            component: 'select',
            attrs: { options: lockScenes.list }
          }
        })(),
        (() => {
          const PROP = 'time'
          const { ruleType } = this.formData

          // hide
          if (ruleType !== 'notAccountedFor') {
            this.$delete(this.formData, PROP)
            return null
          }

          // show
          if (!(PROP in this.formData)) this.$set(this.formData, PROP, initialFormData[PROP])

          return {
            prop: PROP,
            label: '入账时间：',
            rules: [{
              type: 'array',
              required: true,
              message: '请选择入账时间',
              fields: {
                0: { type: 'number', min: Date.now(), message: '入账时间不能早于当前时间' }
              }
            }],
            component: 'dateRangePicker',
            attrs: { limit: 'startingToday' }
          }
        })(),
        (() => {
          const PROP = 'limitUid'
          const { ruleType } = this.formData

          // hide
          if (ruleType !== 'notAccountedFor') {
            this.$delete(this.formData, PROP)
            return null
          }

          // show
          if (!(PROP in this.formData)) this.$set(this.formData, PROP, initialFormData[PROP])

          return {
            prop: PROP,
            label: '是否指定UID：',
            rules: [{
              validator: (rule, { type, value }, callback) => {
                if (type === 'no' || type === 'yes' && value && (!!value.uidFile || !!value.uidFilePath)) return callback()
                callback(new Error('请上传文件'))
              }
            }],
            component: 'custom',
            attrs: { component: LimitUid }
          }
        })(),
        {
          prop: 'unlockWay',
          label: '解锁方式：',
          rules: [{ required: true, message: '请选择解锁方式' }],
          component: 'select',
          attrs: { options: unlockWays.list }
        },
        {
          prop: 'unlockQty',
          label: '单次解锁量（个/百分比）：',
          rules: [{
            required: true,
            validator: (rule, value, callback) => {
              if (!/^-?\d+\.?(\d+)?$/.test(value)) return callback(new Error('请输入正确的数字'))
              else if (+value < 0) return callback(new Error('请输入非负数'))
              else if (value.split('.')[1] && value.split('.')[1].length > 12) return callback(new Error('小数精度最多12位'))

              else if (this.formData.unlockWay === 'fixedPercentage' && +value > 100) return callback(new Error('请勿超过100%'))

              else return callback()
            }
          }],
          component: 'input',
          attrs: { trim: true }
        },
        {
          prop: 'unlockTimes',
          label: '解锁次数：',
          rules: [{ required: true, message: '请输入正整数', pattern: /^[1-9]\d*$/ }],
          component: 'input',
          attrs: { trim: true }
        },
        {
          prop: 'intervalTime',
          label: '解锁时间间隔：',
          component: 'inputNumber',
          attrs: { appendText: '小时', min: 1 }
        },
        (() => {
          const PROP = 'unlockFirstType'
          const { ruleType } = this.formData

          // hide
          if (ruleType !== 'notAccountedFor') {
            this.$delete(this.formData, PROP)
            return null
          }

          // show
          if (!(PROP in this.formData)) this.$set(this.formData, PROP, initialFormData[PROP])

          return {
            prop: PROP,
            label: '首次解锁时间：',
            component: 'select',
            attrs: { clearable: false, options: unlockFirstTypes.list }
          }
        })(),
        (() => {
          const PROP = 'unlockFirstTimeOfNotAccountedFor'
          const { ruleType, time, unlockFirstType } = this.formData

          // hide
          if (ruleType !== 'notAccountedFor' || unlockFirstType !== 'unifiedTime') {
            this.$delete(this.formData, PROP)
            return null
          }

          // show
          if (!(PROP in this.formData)) this.$set(this.formData, PROP, initialFormData[PROP])

          const startTime = time === null ? -Infinity : time[1]
          return {
            prop: PROP,
            label: '距入账时间间隔（解锁时间距离入账时间的间隔）：',
            rules: [
              { type: 'integer', required: true, message: '请选择时间' },
              { type: 'integer', required: true, message: `请选择晚于 ${parseTime(startTime)} 的时间`, min: startTime }
            ],
            component: 'datePicker',
            attrs: { limit: [startTime, Infinity] }
          }
        })(),
        (() => {
          const PROP = 'firstIntervalTime'
          const { ruleType, unlockFirstType } = this.formData

          // hide
          if (ruleType !== 'notAccountedFor' || unlockFirstType !== 'timeInterval') {
            this.$delete(this.formData, PROP)
            return null
          }

          // show
          if (!(PROP in this.formData)) this.$set(this.formData, PROP, initialFormData[PROP])

          return {
            prop: PROP,
            label: '距入账时间间隔（解锁时间距离入账时间的间隔）：',
            rules: [{ type: 'integer', required: true, message: '请选择时间间隔' }],
            component: 'inputNumber',
            attrs: { appendText: '小时', min: 1 }
          }
        })(),
        (() => {
          const PROP = 'unlockFirstTimeOfAlreadyAccountedFor'
          const { ruleType } = this.formData

          // hide
          if (ruleType !== 'alreadyAccountedFor') {
            this.$delete(this.formData, PROP)
            return null
          }

          // show
          if (!(PROP in this.formData)) this.$set(this.formData, PROP, initialFormData[PROP])

          return {
            prop: PROP,
            label: '首次解锁时间：',
            rules: [
              { type: 'integer', required: true, message: '请选择时间' },
              { type: 'integer', required: true, message: `请选择晚于当前的时间`, min: Date.now() }
            ],
            component: 'datePicker',
            attrs: { limit: 'startingToday' }
          }
        })()
      ])
    }
  },
  async created() {
    await this.setOptions()
    this.initFormData()
  },
  methods: {
    async setOptions() {
      // currencyList
      this.currencies = await getOnlineCurrencies()
      this.currencyList = this.currencies.list
    },
    initFormData() {
      if (this.type === 'create') return

      const {
        id,
        type,
        remarks,
        currencyId,
        lockScene,
        startTime,
        endTime,
        limitUid,
        billFilePath,
        uidFilePath,
        unlockWay,
        unlockQty,
        unlockTimes,
        intervalTime,
        unlockFirstType: _unlockFirstType,
        unlockFirstTime,
        firstIntervalTime
      } = this.responseFormData

      const ruleType = ruleTypes.mapByValue.get(type).type
      const unlockFirstType = unlockFirstTypes.mapByValue.get(_unlockFirstType) ? unlockFirstTypes.mapByValue.get(_unlockFirstType).type : null

      const formData = {
        id,
        ruleType,
        remarks,
        currencyCode: this.currencies.mapByValue.get(currencyId) ? this.currencies.mapByValue.get(currencyId).type : null,
        lockScene: lockScenes.mapByValue.get(lockScene) ? lockScenes.mapByValue.get(lockScene).type : null,
        time: [startTime, endTime],
        limitUid: { type: whether.mapByValue.get(limitUid) ? whether.mapByValue.get(limitUid).type : null, value: { uidFilePath }},
        billFile: { billFilePath },
        unlockWay: unlockWays.mapByValue.get(unlockWay).type,
        unlockQty,
        unlockTimes,
        intervalTime,
        unlockFirstType,
        unlockFirstTimeOfNotAccountedFor: unlockFirstTime,
        unlockFirstTimeOfAlreadyAccountedFor: unlockFirstTime,
        firstIntervalTime
      }

      for (const key in formData) {
        const value = formData[key]
        if (key in this.formData) this.formData[key] = formData[key]
        else this.$set(this.formData, key, value) // handle reactive data
      }
    },
    changeFormData(options) {
      for (const key in options) {
        this.formData[key] = options[key]
      }
    },
    async validate() {
      await this.$refs.form.validate()
    },
    getRequestFormData() {
      const { id } = this.formData

      const getBasicFormData = () => {
        const {
          ruleType,
          remarks,
          currencyCode,
          lockScene: _lockScene,
          time,
          limitUid: _limitUid,
          billFile: _billFile,
          unlockWay: _unlockWay,
          unlockQty,
          unlockTimes,
          intervalTime,
          unlockFirstType: _unlockFirstType,
          unlockFirstTimeOfNotAccountedFor,
          unlockFirstTimeOfAlreadyAccountedFor,
          firstIntervalTime
        } = this.formData

        const type = ruleTypes.mapByType.get(ruleType).value
        const unlockWay = unlockWays.mapByType.get(_unlockWay).value
        const unlockFirstTime = ruleType === 'notAccountedFor' ? unlockFirstTimeOfNotAccountedFor : unlockFirstTimeOfAlreadyAccountedFor

        const formData = {
          type,
          remarks,
          unlockWay,
          unlockQty,
          unlockTimes,
          intervalTime
        }

        if (ruleType === 'notAccountedFor') {
          const currencyId = this.currencies.mapByType.get(currencyCode).value
          const [startTime, endTime] = time
          const { type: limitUidType, value: limitUidValue } = _limitUid || {}
          const { uidFilePath, uidFile } = limitUidValue || {}
          return {
            ...formData,
            currencyId,
            lockScene: lockScenes.mapByType.get(_lockScene).value,
            startTime,
            endTime,
            limitUid: whether.mapByType.get(limitUidType).value,
            ...(uidFilePath ? { uidFilePath } : { uidFile }),
            unlockFirstType: unlockFirstTypes.mapByType.get(_unlockFirstType).value,
            ...(_unlockFirstType === 'unifiedTime' ? { unlockFirstTime } : { firstIntervalTime })
          }
        }

        if (ruleType === 'alreadyAccountedFor') {
          const { billFilePath, billFile } = _billFile || {}
          return {
            ...formData,
            ...(billFilePath ? { billFilePath } : { billFile }),
            unlockFirstTime
          }
        }

        throw new Error('[unlock-ruler-management-form-getRequestFormData]: not such ruleType!')
      }

      switch (this.type) {
        case 'create': {
          return getBasicFormData()
        }
        case 'edit': {
          const formData = getBasicFormData()
          return { ...formData, id }
        }
        default: {
          throw new Error('[unlock-ruler-management-form-getRequestFormData]: not such type!')
        }
      }
    }
  }
}
</script>
