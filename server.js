const express = require("express");
const bodyParser=require("body-parser");
const jwt = require("./tokenFuc"); //生成token

const https = require("https");
const qs = require("querystring");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

let app = express();
let sqlCont={
  host:'47.95.1.44',        // ip
  user:'root',      //用户名
  password:'123456',  //密码
  database:'blog_webServer'   //数据库名
}

//设置session相关
app.use(cookieSession({
 //session的秘钥，防止session劫持。 这个秘钥会被循环使用，秘钥越长，数量越多，破解难度越高。
 keys: ['shitou', 'toretto', 'message'],
 //session过期时间，不易太长。php默认20分钟
 maxAge: 60*10*1000,
 resive: false,
 //可以改变浏览器cookie的名字
 name: 'session'
}));
app.use(cookieParser());


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 白名单
let whiteList = ['/login','/register','/checkUser','/province','/city','/county','/profession','/tast']

app.all('*', function(req, res, next) {
    if (req.method == "OPTIONS") {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,BLOG_TOKEN");
      res.send();
    }else{
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,BLOG_TOKEN");
      res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
      res.header("X-Powered-By", ' 3.2.1')
      res.header("Content-Type", "application/json;charset=utf-8");
        if (whiteList.indexOf('/checkUser') > -1) {
          next();
        } else {
          jwt.verifyToken(req,res,next)
        }
    }
});

let hostName = 'localhost';
let port = 1234;
app.listen(port,function(){
  // console.log("node服务已启动");
  console.log(`服务器运行在http://${hostName}:${port}`);
 });

module.exports = {
  app,
  sqlCont
};
const register = require('./port/user.js');


//测试使用 supervisor (npm install -g supervisor) 启动server.js