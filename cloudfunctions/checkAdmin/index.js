// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 数据库引用
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = event.openid || wxContext.OPENID

  try {
    // 查询管理员列表
    const adminResult = await db.collection('admins').where({
      openid: openid
    }).get()

    // 检查是否是管理员
    const isAdmin = adminResult.data && adminResult.data.length > 0

    return {
      code: 200,
      isAdmin: isAdmin,
      openid: openid
    }
  } catch (error) {
    console.error('检查管理员状态失败：', error)
    return {
      code: 500,
      message: '检查管理员状态失败',
      error: error
    }
  }
} 