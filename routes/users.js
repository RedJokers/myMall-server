var express = require('express');
var router = express.Router();
var Users = require('./../models/users')

//登录接口
router.post('/login', (req, res, next) => {
  let userName = req.body.userName; //获取用户名
  let userPwd = req.body.userPwd; // 获取密码
  Users.findOne({
    userName,
    userPwd
  }, (err,userDoc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      })
    } else {
      // 判断userDoc是否为空，为空则账号密码不对
      if (userDoc) {
        res.cookie('userId', userDoc.userId, {
          path: '/',
          maxAge: 1000*60*60
        });
        res.cookie('userName', userDoc.userName, {
          maxAge: 1000*60*60
        })
        res.json({
          status: '0',
          msg:'',
          result: {
            userName: userDoc.userName
          }
        })
      } else {
        res.json({
          status: '1',
          msg: '账号或密码错误，请重试'
        })
      }
    }
  })
})

// 登出接口
router.post('/logout', (req, res, next) => {
  res.cookie('userId', '', {
    maxAge: -1
  });
  res.json({
    status: '0',
    msg:'',
    result: ''
  })
})

// 登录校验
router.get('/checkLogin', (req, res, next) => {
  if (req.cookies.userId) {
    res.json({
      status: '0',
      msg: '',
      result: req.cookies.userName
    })
  } else {
    res.json({
      status: '1',
      msg: '当前未登录',
      result: ''
    })
  }
})

// 获取当前用户的购物车数据
router.get('/cartList', (req, res, next) => {
  let userId = req.cookies.userId;
  Users.findOne({userId}, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      })
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: doc.cartList
        })
      } else {
        res.json({
          status: '1',
          msg: '用户不存在，请重新登录'
        })
      }
    }
  })
})

// 删除当前用户的购物车功能
router.post('/cart/del', (req, res, next) => {
  let userId = req.cookies.userId;
  let productId = req.body.productId;
  Users.updateOne({userId}, {
    $pull: {
      cartList: {
        productId: productId
      }
    }
  }, (err, doc) => {
    if(err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg:'',
          result: '删除成功'
        })
      }
    }
  })
})

// 更改购物车商品数量
router.post('/editCart/num', (req, res, next) => {
  let userId = req.cookies.userId,
      productId = req.body.productId,
      checked = req.body.checked,
      productNum = req.body.productNum;
  Users.updateOne({userId,'cartList.productId': productId}, {
    'cartList.$.productNum': productNum,
    'cartList.$.checked': checked
  }, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: 'update num success'
      })
    }
  })
})

// 购物车中商品的全选状态
router.post('/editCart/checkAll', (req, res, next) => {
  let userId = req.cookies.userId,
      checkAll = req.body.checkAll;
  Users.find({userId},(err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        doc[0].cartList.forEach((item,index) => {
          item.checked = checkAll;
        })
      }
      doc[0].save((err1, doc1) => {
        if (doc1) {
          res.json({
            status: '0',
            msg: '',
            result: 'update checkAll success'
          })
        }
      })
    }
  })
})

// 查询用户地址接口
router.get('/addressList', (req, res, next) => {
  let userId = req.cookies.userId;
  Users.findOne({userId}, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: doc.addressList
      })
    }
  })
})

// 设置默认地址接口
router.post('/setDefaultAddress', (req, res, next) => {
  let userId = req.cookies.userId,
      addressId = req.body.addressId;
  Users.findOne({userId}, (err, userDoc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result:''
      })
    } else {
      let addressList = userDoc.addressList;
      addressList.forEach((item) => {
        if (item.addressId == addressId) {
          item.isDefault = true;
        } else {
          item.isDefault = false;
        }
      })
      userDoc.save((err1) => {
        if (err1) {
          res.json({
            status: '1',
            msg: err1.message,
            result: ''
          })
        } else {
          res.json({
            status: '0',
            msg: '',
            result: 'set default address sucess'
          })
        }
      })
    }
  })
})

// 删除地址接口
router.post('/delAddress', (req, res, next) => {
  let userId = req.cookies.userId,
      addressId = req.body.addressId;
  if (!addressId) {
    return;
  }

  // // 使用findOne实现
  // Users.findOne({userId}, (err, userDoc) => {
  //   if (err) {
  //     res.json({
  //       status: '1',
  //       msg: err.message,
  //       result: ''
  //     })
  //   } else {
  //     let addressList = userDoc.addressList;
  //     addressList.forEach((item, index) => {
  //       if (item.addressId == addressId) {
  //         addressList.splice(index, 1)
  //       }
  //     })
  //     userDoc.save((err) => {
  //       if (!err) {
  //         res.json({
  //           status: '0',
  //           msg: '',
  //           result: 'del address success'
  //         })
  //       }
  //     })
  //   }
  // })

  // 使用update实现
  Users.update({userId}, {
    $pull: {
      addressList: {
        addressId
      }
    }
  }, (err) => {
    if (!err) {
      res.json({
        status: '0',
        msg: '',
        result: 'del address success'
      })
    }
  })
})

// 创建订单接口
router.post('/createOrder', (req, res, next) => {
  let userId = req.cookies.userId,
      addressId = req.body.addressId,
      orderTotal = req.body.orderTotal;
  
  Users.findOne({userId}, (err, userDoc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      let address = '',
          goodsList = [];
      
      // 获取完整地址
      userDoc.addressList.forEach((item) => {
        if (item.addressId == addressId) {
          address = item
        }
      })
      //获取选中的商品列表
      userDoc.cartList.forEach((item) => {
        if (item.checked == '1') {
          goodsList.push(item)
        }
      })

      if (!goodsList) {
        res.json({
          status: '1',
          message: 'cart is null',
          result: ''
        })
      }
      //生成订单ID和时间
      let platform = '621'
      let r1 = Math.floor(Math.random() * 10);
      let r2 = Math.floor(Math.random() * 10);
      let sysDate = new Date().Format('yyyyMMddhhmmss');
      let createDate = new Date().Format('yyyy-MM-dd hh-mm-ss');
      let orderId = platform + r1 + sysDate + r2;
      // 构造新订单
      let order = {
        orderId: orderId,
        orderTotal: orderTotal,
        addressInfo: address,
        goodsList: goodsList,
        orderStatus: '1',
        createDate: createDate
      }
      // 保存订单
      userDoc.orderList.push(order)
      // 删除购物车中已创建订单的商品
      for(i=0;i<userDoc.cartList.length;i++){
        if (userDoc.cartList[i].checked == '1') {
          userDoc.cartList.splice(i, 1);
          i = 0
        }
      }
      userDoc.save((err1) => {
        if (!err1) {
          res.json({
            status: '0',
            msg: '',
            result: {
              orderTotal: order.orderTotal,
              orderId: order.orderId
            }
          })
        }
      })
    }
  })
})

module.exports = router;
