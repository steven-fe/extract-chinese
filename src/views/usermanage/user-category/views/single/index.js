import { getUserCategoryDetail, addUserCategory, updateUserCategory, checkUserCategoryData } from '@/api/user'
import { getPairList } from '@/api/systemsetting/common'
import styles from './index.module.scss'

const formLabelWidth = '80px'

const typeList = [{ id: 0, name: '全部币对统一' }, { id: 1, name: '指定币对统一' }]

const maxGroupLength = 5

const createGroup = (type, index = 0) => ({ id: null, classId: null, groupName: type ? `分组${index + 1}` : null, businessType: 1, makerRate: null, takerRate: null, symbolList: type ? [] : null /* { symbolId: number, symbolName: string }[] */ })

const formRuleCheckText = async({ name, maxLen, disabled, originalText }, { field }, value, callback) => {
  if (disabled) return callback()
  if (!value) return callback(new Error(`请输入${name}`))
  if (value.length >= maxLen) return callback(new Error(`请输入${maxLen}个字符以内的${name}`))

  try {
    if (value !== originalText) await checkUserCategoryData({ [field]: value })
  } catch (e) {
    return callback(new Error(e.msg))
  }

  return callback()
}

const formRuleCheckRate = (_, value, callback) => {
  if (!value || !/^\+?0\.\d+$/.test(value) || +value >= 0.002) return callback(new Error('请输入大于 0，小于 0.002 的数值'))
  return callback()
}

const getRules = (vm, singleType) => {
  return {
    className: [
      { required: true, validator: formRuleCheckText.bind(null, { name: '分类名称', maxLen: 20, originalText: vm.originalClassName }), trigger: 'blur' }
    ],
    classCode: [
      { required: true, validator: formRuleCheckText.bind(null, { name: '分类ID', maxLen: 20, disabled: singleType === 'edit' }), trigger: 'blur' }
    ],
    makerRate: [
      { required: true, validator: formRuleCheckRate, trigger: 'blur' }
    ],
    takerRate: [
      { required: true, validator: formRuleCheckRate, trigger: 'blur' }
    ],
    symbolList: [
      { required: true, type: 'array', min: 1, message: '请添加币对', trigger: 'change' }
    ]
  }
}

export default {
  name: 'Single',
  data() {
    const initType = 0

    return {
      singleType: 'create', // 'create', 'edit', 'copy'
      singleStatus: 'pre-prepare', // 'pre-prepare', 'preparing', 'ready'

      pairMap: new Map(),

      originalClassName: '',
      form: {
        id: null,
        className: '',
        classCode: '',
        classDesc: '',
        type: initType,
        groupList: [createGroup(initType)]
      }
    }
  },
  methods: {
    processTypeChange() {
      this.$watch('form.type', (type) => {
        if (this.singleStatus === 'ready') this.form.groupList = [createGroup(type)]
      })
    },
    async setPairMap() {
      const { data } = await getPairList()

      this.pairMap = new Map(
        (data || []).map(({ id, name }) => ([id, { key: id, label: name }]))
      )
    },
    async processSingleStatus() {
      const prefixRouteName = 'userCategory'

      if (!this.$route.name.startsWith(prefixRouteName)) throw new Error(`sinle component open with prefix routeName: ${prefixRouteName}`)

      const { id } = this.$route.query
      this.singleType = this.$route.name.slice(prefixRouteName.length).toLowerCase()

      if (this.singleType === 'create') return this.singleStatus = 'ready'

      /** below is edit and copy */

      this.singleStatus = 'preparing'

      const { data } = await getUserCategoryDetail(+id)

      for (const key in data) {
        if (key in this.form) this.form[key] = data[key]
      }

      /** record original className */
      if (this.singleType === 'edit') {
        this.originalClassName = this.form.className
      }

      /** remove id for detail */
      if (this.singleType === 'copy') {
        this.form.id = null
        this.form.groupList.forEach(group => (group.id = null, group.classId = null))
        this.form.classCode = ''
      }

      this.$nextTick(() => (this.singleStatus = 'ready'))
    },
    addGroup() {
      if (this.form.groupList.length < maxGroupLength) this.form.groupList.push(createGroup(this.form.type, this.form.groupList.length))
    },
    removeGroup() {
      this.form.groupList.pop()
    },
    async submit() {
      try {
        await this.$refs.form.validate()

        if (this.singleType === 'edit') {
          await updateUserCategory(this.form)
          this.msgSuccess('编辑成功')
        } else {
          await addUserCategory(this.form)
          this.msgSuccess('创建成功')
        }

        this.$router.go(-1)
      } catch (e) {
      }
    },
    cancel() {
      this.$router.go(-1)
    }
  },
  async created() {
    this.processTypeChange()
    await this.setPairMap()
    await this.processSingleStatus()
  },
  render() {
    const SetRate = ({ props: { index = 0 }}) => (
      <el-row>
        <el-col span={7}>
          <el-form-item label="Maker 手续费率" label-width="124px" prop={`groupList.${index}.makerRate`} rules={rules.makerRate}>
            <el-input placeholder="请输入大于 0，小于 0.002 的数值" value={this.form.groupList[index].makerRate} onInput={ $event => this.form.groupList[index].makerRate = $event } />
          </el-form-item>
        </el-col>

        <el-col span={7}>
          <el-form-item label="Taker 手续费率" label-width="124px" prop={`groupList.${index}.takerRate`} rules={rules.takerRate}>
            <el-input placeholder="请输入大于 0，小于 0.002 的数值" value={this.form.groupList[index].takerRate} onInput={ $event => this.form.groupList[index].takerRate = $event } />
          </el-form-item>
        </el-col>
      </el-row>
    )

    const GlobalRate = SetRate

    const PartialRate = () => {
      const getValue = (index) => {
        const symbolList = this.form.groupList[index].symbolList
        return symbolList && symbolList.map(({ symbolId }) => symbolId) || []
      }

      const setValue = (index, selectedList) => {
        this.form.groupList[index].symbolList = selectedList.map(symbolId => ({ symbolId, symbolName: this.pairMap.get(symbolId).label }))
      }

      const getPairList = (index) => {
        return [...this.pairMap.values()].map((pair) => {
          const { key } = pair
          const disabled = this.form.groupList
            .filter((_, curIndex) => curIndex !== index)
            .some(group => {
              return group.symbolList && group.symbolList.some(({ symbolId }) => symbolId === key)
            })

          return { ...pair, disabled }
        })
      }

      return (
        <ul class={styles.groupList}>
          {
            this.form.groupList.map(({ groupName }, index) => (
              <li class={styles.group} key={index}>
                <h4 class={styles.title}>
                  {groupName}
                  {
                    !index
                      ? <el-button type="primary" plain onClick={this.addGroup}>+新增分组（{this.form.groupList.length}/{maxGroupLength}）</el-button>
                      : <el-button type="danger" plain onClick={this.removeGroup}>删除分组</el-button>
                  }
                </h4>

                <el-form-item prop={`groupList.${index}.symbolList`} rules={rules.symbolList} required>
                  <el-transfer
                    filterable
                    value={getValue(index)}
                    data={getPairList(index)}
                    onInput={setValue.bind(this, index)}
                  />
                </el-form-item>
                <br />

                <SetRate index={index} />
              </li>
            ))
          }
        </ul>
      )
    }

    const rules = getRules(this, this.singleType)

    if (this.singleStatus !== 'ready') return null

    return <div class="app-container" style="width: 1400px;">
      <el-form ref="form" props={ { model: this.form } } rules={rules} validateOnRuleChange={false}>
        <h2>基础信息</h2>

        <el-row>
          <el-col span={10}>
            <el-form-item label="分类名称" label-width={formLabelWidth} prop="className">
              <el-input value={this.form.className} onInput={ $event => this.form.className = $event } />
            </el-form-item>
          </el-col>

          <el-col span={10}>
            <el-form-item label="分类ID" label-width={formLabelWidth} prop="classCode">
              <el-input disabled={this.singleType === 'edit'} value={this.form.classCode} onInput={ $event => this.form.classCode = $event } />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col span={20}>
            <el-form-item label="分类说明" label-width={formLabelWidth} prop="classDesc">
              <el-input type="textarea" maxlength={200} value={this.form.classDesc} onInput={ $event => this.form.classDesc = $event } />
            </el-form-item>
          </el-col>
        </el-row>

        <h2>权限范围</h2>

        <h3>现货手续费率</h3>

        <el-form-item>
          <el-radio-group value={this.form.type} onInput={$event => this.form.type = $event}>
            {
              typeList.map(({ id, name }) => (
                <el-radio label={id}>{name}</el-radio>
              ))
            }
          </el-radio-group>
        </el-form-item>

        <el-row>
          <p style={ { display: 'inline-block', backgroundColor: '#fff7e6', padding: '10px 20px 10px 10px', fontSize: '12px' } }>{
            this.form.type === 0
              ? '提示：该类用户在所有币对享受特殊手续费率，不使用该币对的默认手续费率。'
              : '提示：除了被选中的币对用户享受特殊手续费率，其余币对用户使用该币对的默认手续费率。'
          }</p>
        </el-row>

        { this.form.type === 0 ? <GlobalRate /> : <PartialRate /> }

      </el-form>

      <div class="footer">
        <el-button type="primary" onClick={this.submit}>确 定</el-button>
        <el-button onClick={this.cancel}>取 消</el-button>
      </div>
    </div>
  }
}
