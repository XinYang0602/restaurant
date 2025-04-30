// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化云开发环境
cloud.init({
  env: 'cloud1-0gib4wvca1828cf9'
})

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('用户登录函数被调用, event:', event)
  
  const wxContext = cloud.getWXContext()
  console.log('微信上下文:', wxContext)
  
  try {
    const db = cloud.database()
    // 查询用户是否已存在
    const userRes = await db.collection('users').where({
      openid: wxContext.OPENID
    }).get()
    
    console.log('查询用户结果:', userRes)
    
    if (userRes.data.length === 0) {
      // 新用户注册
      console.log('新用户注册')
      const addResult = await db.collection('users').add({
        data: {
          openid: wxContext.OPENID,
          createdAt: db.serverDate(),
          lastLogin: db.serverDate(),
          userInfo: event.userInfo || null
        }
      })
      console.log('新用户添加结果:', addResult)
      
      return {
        code: 200,
        message: '注册成功',
        isNewUser: true,
        openid: wxContext.OPENID
      }
    } else {
      // 老用户登录
      console.log('老用户登录')
      const updateResult = await db.collection('users').doc(userRes.data[0]._id).update({
        data: {
          lastLogin: db.serverDate(),
          userInfo: event.userInfo || userRes.data[0].userInfo
        }
      })
      console.log('更新用户登录时间结果:', updateResult)
      
      return {
        code: 200,
        message: '登录成功',
        isNewUser: false,
        openid: wxContext.OPENID
      }
    }
  } catch (err) {
    console.error('登录过程出错:', err)
    return {
      code: 500,
      message: err.message || '服务器错误',
      error: err
    }
  }
} 