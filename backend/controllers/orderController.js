const Order = require("../models/orderModel")
const Product = require("../models/productModel")
const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")

// create new order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {

    const {
        shippingInfo,
        orderItem,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body

    const order = await Order.create({
        shippingInfo,
        orderItem,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(201).json({
        success: true,
        order
    })

})


// get Single order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {

    const order = await Order.findById(req.params.id).populate("user", "email name")

    if (!order) {
        return next(new ErrorHandler("Order not found with this ID", 404))
    }

    res.status(200).json({
        success: true,
        order
    })

})

// get Logged in user orders
exports.myOrders = catchAsyncErrors(async (req, res, next) => {

    const orders = await Order.find({user: req.user._id})

    res.status(200).json({
        success: true,
        orders
    })

})


// get All orders --- Admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {

    const orders = await Order.find()

    let totalAmount = 0;

    orders.forEach((item) => {totalAmount += item.totalPrice})

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})


// Update Orders status --- Admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {

    const order = await Order.findById(req.params.id)

    if (!order) {
        return next(new ErrorHandler("Order not found with this ID", 404))
    }

    if (!order.orderStatus === "Delivered") {
        return next(new ErrorHandler("You have already deliverd this order", 400))
    }

    order.orderItem.forEach(async(item) => {
        await updateStock(item.product, item.quantity)
    })

    order.orderStatus = req.body.status

    if (req.body.status === "Delivered") {
      order.devliveredAt = Date.now()
    }

    await order.save({validateBeforeSave: false})

    res.status(200).json({
        success: true
    })
})

async function updateStock(id, quantity){

    const product = await Product.findById(id)
    if(product.stock > 0){
        product.stock -= quantity;
    }
    
    await product.save({validateBeforeSave: false})

}


// delete order --- Admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {

    const order = await Order.findById(req.params.id)
    
    if (!order) {
        return next(new ErrorHandler("Order not found with this ID", 404))
    }

    order.save()

    res.status(200).json({
        success: true,
    })
})