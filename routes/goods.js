var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Goods = require('../models/goods')
var User = require('../models/users')

//连接数据库
mongoose.connect('mongodb://suhang:614962270@67.209.179.246:27017/myMall')

mongoose.connection.on('connected',() => {
  console.log('mongodb connected');
});

mongoose.connection.on('error',(error) => {
  console.log(`mongodb connect error {${error}}`);
  
});

mongoose.connection.on('disconnected',() => {
  console.log('mongodb disconnected')
});

//获取商品信息
router.get('/list',(req, res, next) => {
  let page = parseInt(req.query.page); //获取分页码
  let pageSize = parseInt(req.query.pageSize); //获取每页大小
  let sort = parseInt(req.query.sort); //获取sort进行排序
  let priceLevel = req.query.priceLevel; // 获取价格区间
  let priceGt = 0; //定义价格区间大于多少
  let priceLte = 0; //定义价格区间小于等于多少
  let params = {}; //定义查找数据裤参数
  let skip = (page- 1) * pageSize; //定义跳过多少数据

  if (priceLevel !== 'all') { // 判断价格区间
    switch (priceLevel) {
      case '0': {
        priceGt = 0;
        priceLte = 500;
        break;
      }
      case '1': {
        priceGt = 500;
        priceLte = 1000;
        break;
      }
      case '2': {
        priceGt = 1000;
        priceLte = 2000;
        break;
      }
      case '3': {
        priceGt = 2000;
        priceLte = null;
        break;
      }
    }
    
    params = { //给查找参数赋值
      'salePrice': {
        $gt:priceGt,
        $lte: priceLte
      }
    }
  }


  let goodsModel = Goods.find(params).skip(skip).limit(pageSize); //分页
  goodsModel.sort({'salePrice': sort});
  goodsModel.exec((err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: {
          count: doc.length,
          list: doc
        }
      })
    }
  })
});

//加入到购物车
router.post('/addCart', (req, res, next) => {
  let userId = '100000077';
  let productId = req.body.productId;

  User.findOne({userId: userId}, (err1, userDoc) => {
    if (err1) {
      res.json({
        status: '1',
        msg: err1.msg
      })
    } else{
      // console.log('userDoc'+ userDoc);

      //判断是否找到用户
      if (userDoc) {
        let goodsItem = ""; // 用于存入已经存在的商品
        userDoc.cartList.forEach((item) => { //遍历userDoc，判断商品是否存在
          if (item.productId === productId) {
            item.productNum++ // 增加商品数量
            goodsItem =  item
          }
        })

        if (goodsItem) { // 购物车已存在该商品
          userDoc.save((err,doc) => {

            if (err) {
              res.json({
                status: '1',
                msg: err.message
              })
            } else {
              res.json({
                status: '0',
                message: '',
                result: 'success(exist)'
              })
            }

          });
        } else { // 购物车不存在此商品
          Goods.findOne({
            "productId": productId
          }, (err2, productDoc) => {
            if (err2) {
              res.json({
                status: '1',
                msg: err2.msg
              })
            } else {
              //判断产品是否为空(是否存在)
              if (productDoc) {
  
                // 克隆到新对象
                let newProductDoc = {
                  productId:productDoc.productId,
                  productName:productDoc.productName,
                  productImage:productDoc.productImage,
                  salePrice:productDoc.salePrice,
                  checked:1,
                  productNum:1
                }
  
                userDoc.cartList.push(newProductDoc);
    
                
                //保存
                userDoc.save( (err3, doc) => {
                  
                  
                  if (err3) {
                    res.json({
                      status: '1',
                      msg: err3.message
                    })
                  } else {
                    res.json({
                      status: '0',
                      msg: '',
                      result: 'success'
                    })
                  }
  
                })
              }
  
            }
  
          })
        }


      } else {
        console.log('未找到用户');
        
      }

    }
  })
})

module.exports = router;
