import { removeSingleUserCategory } from '@/api/user'
import { Message, MessageBox } from 'element-ui'
import { watchRouteChangeOnce } from '@/utils'

export default async(info, callback) => {
  try {
    watchRouteChangeOnce(() => MessageBox.close())

    await MessageBox.confirm('删除后该用户，将不再拥有分类用户专属的配置', '确认将该用户从这个分类中删除？', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await removeSingleUserCategory(info)
    if (callback) callback()

    Message.success('删除成功')
  } catch (e) {
    console.error(e)
  }
}
