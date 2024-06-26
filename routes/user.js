const { Router } = require("express");
const z = require('zod');
const { User, Account } = require("../db");
const userRouter = Router();

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../config");
const { AuthorizedUser } = require("../middleware");



const signUpBodySchema= z.object({
    username : z.string().email(),
    password : z.string(),
    firstName : z.string(),
    lastName : z.string()

})


const signInBodySchema= z.object({
    username : z.string().email(),
    password : z.string()
})


const updateBodySchema = z.object({
    firstName : z.string().optional(),
    lastName : z.string().optional(),
    password : z.string().optional(),
}).strict()



userRouter.post('/signup' , async(req ,res)=>{
    const {body} = req;
    const {success} = signUpBodySchema.safeParse(body);
    console.log(success);

    if(!success){
        return res.status(411).json({
            message : 'Invalid Inputs'
        }); 
    
    }

    const user  = await User.findOne({username : body.username});
    console.log(user);
    if(user?._id){
        return res.status(411).json({
            message : 'Email already taken'
        })
    
    }
    
    const UserCreated = await User.create(body);
    console.log(UserCreated);

    await Account.create({
        userId : UserCreated._id,
        balance : 1 + Math.random()*1000
    })
    //creating token 
    const token = jwt.sign({
        userId : UserCreated._id
    } , JWT_SECRET);



    return res.json({
        message : "User Created Successfully",
        token : token
    })
})



userRouter.post('/signin' , async(req ,res)=>{
    const {success} = signInBodySchema.safeParse(req.body);
    if(!success){
        return res.status(403).json({
            message : 'Invalid Req Body'
        })
    }

    const AccountFound = await User.findOne({
        username : req.body.username ,
        password : req.body.password
    })

    if(!AccountFound){
        return res.status(404).json({
            message : 'Account not Found / Invalid Password'
        })
    }

    const token = jwt.sign({
        userId : AccountFound._id
    },JWT_SECRET)

    return res.json({
        token : token
    })
    

})

userRouter.get('/auth' , AuthorizedUser ,async(req ,res)=>{
    const user = await User.findById(req.userId);
    const {firstName} = user;
    
    return res.json({
      firstName
    });
})

userRouter.put('/' , AuthorizedUser , async(req ,res , next)=>{
    
    const {success} = updateBodySchema.safeParse(req.body);
    
    if(!success){
        return res.json({
            message : 'Invalid Update Body'
        }).status(411);
    }
    const UpdatedUser = await User.findByIdAndUpdate(req.userId ,req.body);
    
    return res.json({
        message : 'Updated Successfully'
    })


})

userRouter.get('/bulk' ,AuthorizedUser, async (req , res)=>{
    const filter = req.query.filter || '';

    const users = await User.find({
    $or: [
        { firstName: { $regex: filter, $options: 'i' } },
        { lastName: { $regex: filter, $options: 'i' } }
    ]
    });

    return res.json({
        users: users.map((user)=> ({
            username : user.username,
            firstName : user.firstName,
            lastName : user.lastName,
            _id : user._id
        }))
    })

})




module.exports={
    userRouter
}