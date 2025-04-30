// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()
const dishesCollection = db.collection('dishes') // 假设您的集合名为dishes

// 云函数入口函数
exports.main = async (event, context) => {
  const { kind } = event // 可接收可选的kind参数，用于筛选特定分类的菜品
  
  try {
    // 构建查询条件
    let query = dishesCollection
    
    // 如果指定了kind，则按kind筛选
    if (kind !== undefined) {
      query = query.where({
        kind: kind
      })
    }
    
    // 获取所有菜品数据
    const MAX_LIMIT = 100 // 单次最多获取100条记录
    
    // 获取数据总数
    const countResult = await query.count()
    const total = countResult.total
    
    // 计算需要分几次获取
    const batchTimes = Math.ceil(total / MAX_LIMIT)
    
    // 批量获取数据
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = query.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
      tasks.push(promise)
    }
    
    // 等待所有数据获取完成
    const allData = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg,
      }
    })
    
    const dishes = allData.data
    
    // 如果指定了kind，直接返回菜品列表
    if (kind !== undefined) {
      return dishes.map(dish => ({
        id: dish._id, // 使用数据库自动生成的_id作为唯一标识
        name: dish.title,
        price: dish.price,
        description: dish.description || "", // 防止没有描述字段
        image: dish.source,
        count: 0 // 初始购买数量为0
      }))
    }
    
    // 如果没有指定kind，按菜品类型分组
    // 首先获取所有菜品类型
    const kindResult = await db.collection('dishes').aggregate()
      .group({
        _id: '$kind'
      })
      .end()
    
    const kinds = kindResult.list.map(item => item._id)
    
    // 创建前端需要的数据结构
    const kindMap = {
      '汤品': 0,
      '川菜': 1,
      '素菜': 2,
      '肉菜': 3,
      '主食': 4,
      '饮料': 5
    }
    
    // 按菜品类型分组
    const groupedDishes = {}
    
    // 初始化所有分类
    for (let i = 0; i < 6; i++) {
      groupedDishes[i] = []
    }
    
    // 将菜品添加到对应分类
    dishes.forEach(dish => {
      let categoryId = kindMap[dish.kind]
      // 如果没找到对应的分类，放入默认分类
      if (categoryId === undefined) {
        categoryId = 0
      }
      
      groupedDishes[categoryId].push({
        id: dish._id,
        name: dish.title,
        price: dish.price,
        description: dish.description || "",
        image: dish.source,
        count: 0
      })
    })
    
    return groupedDishes
    
  } catch (error) {
    console.error('获取菜品数据失败', error)
    return {
      success: false,
      error: error.message
    }
  }
} 