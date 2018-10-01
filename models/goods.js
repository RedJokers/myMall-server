var mongoose = require('mongoose')
var productSchema = new mongoose.Schema({
  "productId" : String,
  "productName" : String,
  "salePrice" : Number,
  "productImage" : String,
})

module.exports = mongoose.model('Good',productSchema);
