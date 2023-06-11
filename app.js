const express = require('express');
const app = express();
var path = require('path');

const multer = require('multer');
const aws = require('aws-sdk');

const PORT = process.env.PORT || 5000

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended:false}));






var publicPath = path.resolve(__dirname, 'views');
app.use(express.static(publicPath));

app.use('/',require('./router.js'));
app.listen(PORT)