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

module.exports = router;
