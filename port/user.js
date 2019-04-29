const server = require('../server');
const crypto = require('crypto'); //加载md5加密文件
const mysql = require("mysql");
const jwt = require("../tokenFuc"); //生成token
var https = require('https');
var qs = require('querystring');

function handleMySql(fn){
  let db = mysql.createConnection(server.sqlCont);
  db.connect(function(error){
    if(error){
      console.log(error);
    }else{
      console.log('已连接数据库');
      if( fn ) {
        fn(db);
      }else {
        throw new Error("invalid parameter fn , parameter fn must be callback!!");
      }
    }
  });
}

//用户注册(检测用户名是否可用)
server.app.post("/checkUser", (req, res) => {
  if (!req.body.user) {
    return res.status(200).send({
      success: false,
      code: -1,
      message: '参数'
    });
    return;
  }
  handleMySql(function (db) {
    db.query(
      'select * from user where user_name = ?',
      [req.body.user],(error, rows) => {
        if (error) {

        }
        if (rows.length >0) {
          res.json({
            "code": -1,
            "message": "用户名重复"
          });
          db.end();
          console.log('已关闭数据库');
        } else {
          res.json({
            "code": 0,
            "message": "用户名可用"
          });
          db.end();
          console.log('已关闭数据库');
        }
      });
  });
}),

//获取验证码
server.app.post("/aothCode",(req,res) => {
  let nowDate = new Date().getTime();
  let randomNum = ('000000' + Math.floor(Math.random() * 999999)).slice(-6);
  let apikey = '18632d9c2e29c1f81dfc913bc6930fe1';
  let mobile = req.body.user;
  let code= "";
  let msg= "";
  // var text = '您的验证码是'+randomNum + "10分钟内有效";
  // 指定发送的模板编号
  var tpl_id = 2850978;
  // 指定发送模板的内容
  var tpl_value =  {'#code#': randomNum};
  // 查询账户信息
  var get_user_info_uri = '/v2/user/get.json';
  // 匹配模板发送https地址
  var sms_host = 'sms.yunpian.com';

  send_tpl_sms_uri = '/v2/sms/tpl_single_send.json';

  let query_user_info = (uri,apikey) => {
    var post_data = {  
    'apikey': apikey,  
    };//这是需要提交的数据
    var content = qs.stringify(post_data);  
    post(uri,content,sms_host);
  }
  let send_tpl_sms = (uri,apikey,mobile,tpl_id,tpl_value) => {
    var post_data = {  
      'apikey': apikey,
      'mobile':mobile,
      'tpl_id':tpl_id,
      'tpl_value':qs.stringify(tpl_value),  
    };//这是需要提交的数据  
    var content = qs.stringify(post_data);  
    post(uri,content,sms_host); 
  }

  let post = (uri,content,host) => {
    var options = {  
      hostname: host,
      port: 443,  
      path: uri,  
      method: 'POST',  
      headers: {  
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'  
      }  
    };
    var rq = https.request(options, (r) => {
      r.setEncoding('utf8');  
      r.on('data', function (chunk) {
        if (uri == "/v2/sms/tpl_single_send.json") {
          code = JSON.parse(chunk).code;
          if (code == 0) {
            msg = JSON.parse(chunk).msg
            handleMySql((db) => {  // 发送成功后，将此随机数保存入表中
              db.query(
                'INSERT INTO aothCode SET  ?',
                {user:req.body.user,aothCode:randomNum.toString(),time:nowDate},(error,rows) => {  // role 1 : 用户 仅对自己账户有控制权，进行文章删除增加  role 2 : 管理员 对不符合规定文章有删除权利  role 9 超级管理员 对用户、管理员有绝对权限，过敏文章删除、用户权限增加
                if(error){
                  console.log(error);
                }else{
                  console.log('aothCode保存成功');
                }
                db.end();
              });
            });
          } else if (code > 0) {
            code = -1,
            msg = "访问频繁，请稍后再试!"
          }
          res.status(200).send({
            "code": code,
            "msg": msg
          })
        }
      });
    });
    rq.write(content);
    rq.end();
  }
  query_user_info(get_user_info_uri,apikey);
  send_tpl_sms(send_tpl_sms_uri,apikey,mobile,tpl_id,tpl_value);
})

//用户注册
server.app.post("/register",(req,res) => {
  
  return;
  if (req.body.user == '' && req.body.psw =='') {
     return res.status(403).send({
       success: false,
       code: -60000,
       message: '请保证账号密码的完整性'
     });
    return;
  }
  handleMySql((db) => {
    db.query(
      'select * from user where user_name = ?',
      [req.body.user],(error,rows) => {
        if(error){

        }
        if(rows.length<1){
          inFo(req);
        }
        else
        {
          console.log('用户名重复，请换一个昵称试试');
          res.json({"code":"-30000", "message": "用户名重复"});
          db.end();
        }
    });
  });
  function inFo(setDatas){
    handleMySql((db) => {
      const hash = crypto.createHash('md5');
      hash.update(setDatas.body.psw);
      let md5Paw=hash.digest('hex');
      db.query(
        'INSERT INTO user SET  ?',
        {user_name:setDatas.body.user,password:md5Paw,role:1},(error,rows) => {  // role 1 : 用户 仅对自己账户有控制权，进行文章删除增加  role 2 : 管理员 对不符合规定文章有删除权利  role 9 超级管理员 对用户、管理员有绝对权限，过敏文章删除、用户权限增加
        if(error){
          console.log(error);
          res.send({"status":502, "message": error});
        }else{
          console.log('注册成功')
          res.json({"code":res.statusCode, "message": "注册成功"});
        }
        db.end();
        console.log("已关闭数据库")
      });
    })
  }
});


//用户登录
server.app.post("/login",(req,res) => {
  handleMySql((db) =>{
    db.query(
      'select * from user where user_name = ? or nick_name = ?',
      [req.body.user, req.body.user],(error,rows) => {
          if(error){
          };
          if(rows.length<1){
            console.log('用户不存在')
            res.json({
              "code": "-1",
              "message": "用户不存在"
            });
          }else{
            console.log("已查询到用户")
            inFo(req);
          }
          db.end();
          console.log("已关闭数据库")
        });
  });
   function inFo(datas) {
    handleMySql((db) => {
      const hash = crypto.createHash('md5');
      hash.update(datas.body.psw);
      let md5Paw=hash.digest('hex');
      db.query(
        'select * from user where ( user_name = ? or nick_name = ? ) and password = ?',
        [datas.body.user,datas.body.user, md5Paw],
        function(error,rows){
          if(error){
            throw error;
          };
          if(rows.length<1){
            res.send({'code':'-1','msg':'密码错误'})
          }else{
            let content = {
              user: datas.body.user
            }; // 要生成token的主题信息
            let token = jwt.generateToken(content);
            rows[0].token = token;
            console.log(rows[0])
            let postData = {
              id : rows[0].user_id,
              name: rows[0].user_name,
              nick_name: rows[0].nick_name,
              sex:rows[0].sex,
              birthday:rows[0].birthday,
              area:rows[0].area,
              post_position:rows[0].post_position,
              post:rows[0].post,
              role:rows[0].role,
              token:rows[0].token,

            }
            res.send({'code':'0','data':postData,'msg':'登录成功'})
            // console.log('登录成功')
            // res.send({"code":"0","msg":"登录成功"});
          }
          db.end();
          console.log("已关闭数据库")
        });

    })
  }
});


// 验证是否登录
server.app.get("/checkLogin", (req,res)=> {
  res.send({
    "code":0,
    "msg": "身份验证通过"
  })
})


function cityDataDispose(req,res){
  handleMySql((db) => {
    let postData = 0
    if (req.headers.id) {
      postData = req.headers.id
    }
    db.query('select * from cityList where pid = ?',[postData], (error,rows) => {
      if(error){
        res.status(500).send({
          code:-1,
          data:error
        })
      } else {
        for (let i in rows) {
          for(let j in rows[i]){
            if (j == 'pid') {
            delete rows[i][j]
            }
          }
        }
        res.status(200).send({
          code:0,
          data:rows,
          message:'获取成功'
        })
      }
      db.end()
      console.log("已关闭数据库")
    })
  })
}

// 获取省
server.app.get('/province',(req,res) => {
  cityDataDispose(req,res)
})

// 获取市
server.app.get('/city',(req,res) => {
  if (req.headers.id) {
    cityDataDispose(req,res)
  } else {
    res.status(200).send({
      code:-1,
      msg:'请输入省市id'
    })
  }
})

// 获取区/县
server.app.get('/county',(req,res) => {
  if (req.headers.id) {
    cityDataDispose(req,res)
  } else {
    res.status(200).send({
      code:-1,
      msg:'请输入城市id'
    })
  }
})

// 获取职业
server.app.get('/profession',(req,res) => {
  handleMySql((db) => {
    db.query('select * from industry',(error,rows) => {
      if(error){
        res.status(500).send({
          code:-1,
          data:error
        })
      } else {
        res.status(200).send({
          code:0,
          data:rows,
          message:'获取成功'
        })
      }
      db.end()
      console.log("已关闭数据库")
    })
  })
})

server.app.get("/tast", (req,res) => {
  res.send({
    "msg": "身份验证成功"
  })
})

module.exports = server;
