require('dotenv').config();


const express = require("express");


const mongoose = require('mongoose');
const {mainRouter} = require('./routes/index')

const cors = require('cors')

const PORT = process.env.PORT;

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL)
.then(()=> console.log('DB CONNECTION SUCCESS'))
.catch((err)=> console.log(err));


const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/v1' , mainRouter);





app.listen(PORT , ()=>{
    console.log(`Server Running on 3000`);
})



