const express = require("express");
const bodyParser=require("body-parser");
const jwt = require("./tokenFuc"); //生成token

let app = express();
let sqlCont={
  host:'47.95.1.44',        // ip
  user:'root',              //用户名
  password:'123456',        //密码
  database:'blog_webServer' //数据库名
}


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 白名单
let whiteList = ['/login','/register','/checkUser','/province','/city','/county','/profession','/tast','/aothCode']

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
  sqlCont,
  // transport
};
const register = require('./port/user.js');


//测试使用 supervisor (npm install -g supervisor) 启动server.js