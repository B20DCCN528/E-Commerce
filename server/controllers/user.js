const User = require('../models/user')
const asyncHandler = require('express-async-handler')
const {generateAccessToken, generateRefreshToken} =  require('../middlewares/jwt')





const register = asyncHandler(async(req, res) => {
    const {email, password, firstname, lastname} = req.body
    if(!email || !password || !firstname || !lastname) 
    return res.status(400).json({
        success : false,
        mes: 'Missing input'
    })

    const user = await User.findOne({email})
    if(user)
        throw new Error('User has existed!')
    else {
        const newUser = await User.create(req.body)
        return res.status(200).json({
            success: newUser ? true : false,
            mes: newUser? 'Register is successfully. Please go login!' : 'Somethong went wrong!'
        })
    }
         

    // const response = await User.create(req.body)
    // return res.status(200).json({
    //     success: response ? true : false,
    //     response
    // })
})

// refresh token => cap moi access token
// access token => xac thuc nguoi dung, quan quyen nguoi dung
const login = asyncHandler(async(req, res) => {
    const {email, password} = req.body
    if(!email || !password) 
    return res.status(400).json({
        success : false,
        mes: 'Missing input'
    })

   const response = await User.findOne({email})
   if (response && await response.IsCorrectPassword(password)){
        // tach password va role ra khoi response
        const {password, role, ...userData} = response.toObject()
        // tao access token
        const accessToken = generateAccessToken(response._id, role)
        // tao refresh token
        const refreshToken = generateRefreshToken(response._id)
        // luu refresh token vao database
        await User.findByIdAndUpdate(response._id, {refreshToken}, {new:true})
        // luu refresh token vao cookie
        res.cookie('refreshToken', refreshToken, {httpOnly: true, maxAge: 7*24*60*60*1000})
        return res.status(200).json({
            success: true,
            accessToken,
            userData
        })
   }
   else {
        throw new Error('invalid credentials!')
   }
})


const getCurrent = asyncHandler(async(req, res) => {
    const {_id} = req.user

    const user = await User.findById(_id).select('-refreshToken -password -role')
   
    return res.status(200).json({
        success: false,
        rs: user? user : 'User not found!'
    })
})



module.exports = {
    register,
    login,
    getCurrent
}

