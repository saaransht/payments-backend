const { Router } = require("express");
const { AuthorizedUser } = require("../middleware");
const { Account, User, TransactionRecord } = require("../db");
const mongoose = require("mongoose");

const accountRouter = Router();

const z = require('zod');




accountRouter.get('/balance' , AuthorizedUser , async(req ,res)=>{
    const {userId} = req;

    const UserAccount = await Account.findOne({userId : userId });

    return res.json({
        balance : UserAccount.balance
    })
})


accountRouter.post('/transfer' , AuthorizedUser , async(req ,res)=>{
    const session = await mongoose.startSession();
    
    session.startTransaction();
    const {amount , to} = req.body;

    // check if user has sufficient balance
    const fromAccount = await Account.findOne({
        userId : req.userId
    });

    if(fromAccount.balance < amount){
        await session.abortTransaction();
        return res.status(400).json({
            message : 'Insufficient balance'
        })
    }

    const toAccount = await Account.findOne({
        userId : to
    });


    //check if sender exists
    if(!toAccount){
        await session.abortTransaction();

        return res.status(400).json({
            message : 'Invalid Sender Id'
        })
    }


    await Account.updateOne({
        userId:req.userId
    }, {
        $inc : {
            balance : -amount
        }
    })

    await Account.updateOne({
        userId:to
    }, {
        $inc : {
            balance : amount
        }
    })

    const record = await TransactionRecord.create({
        from : req.userId ,
        to : to,
        amount : amount
    })

    await session.commitTransaction();
    
    return res.json({
        message : 'Transfer Successful',
        TxnId : record._id,
    })

})


module.exports = {
    accountRouter
}