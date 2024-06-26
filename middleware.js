const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config');
const { User } = require('./db');



async function AuthorizedUser(req ,res , next){

    const authHeader = req?.headers?.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer')){        
        return res.status(403).json({
            message : 'Invalid Headers Token'
        })
    }

    try {
        const token = authHeader.split(' ')[1];
        const verified=jwt.verify(token , JWT_SECRET);
        if(verified.userId){
            req.userId= verified.userId;
        }
        else{
            return res.status(403).json({
                message : 'Invalid Headers Token'
            })
        }
        
       next();
    } catch (error) {
        
        return res.status(403).json({
            message : 'Invalid Headers Token'
        })

    }
    
}


module.exports= {
    AuthorizedUser
}