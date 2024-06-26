const mongoose = require('mongoose');
const { string } = require('zod');



const UserSchema = new mongoose.Schema({
    firstName : String ,
    lastName : String ,
    username : String ,
    password : String 
});

const AccountSchema = new mongoose.Schema({
    userId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    balance :{
        type : Number ,
        required : true 
    } 

})

const TransactionRecordSchema = new mongoose.Schema({
    from : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    to : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    amount : {
        type : Number,
        default : 0
    }

})


const User = mongoose.model('User', UserSchema);
const Account = mongoose.model('Account' ,AccountSchema);
const TransactionRecord= mongoose.model('TransactionRecord', TransactionRecordSchema);

module.exports={
    User,Account,TransactionRecord
}

