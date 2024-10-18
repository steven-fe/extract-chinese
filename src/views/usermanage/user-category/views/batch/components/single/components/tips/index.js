export default {
  name: 'Tips',
  props: {
    type: {
      type: String
    }
  },
  render() {
    return <div style="color: gray; font-size: 14px; margin-bottom: 18px;">{

      this.type === 'add' && '没有绑定用户分类ID的用户，将会绑定选中的用户分类 ID' ||
      this.type === 'edit' && '已绑定用户分类ID的用户，将绑定选中的新用户分类 ID' ||
      this.type === 'remove' && '已绑定用户分类ID的用户，将解除绑定'

    }</div>
  }
}
