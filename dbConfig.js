let mysql = require("mysql");
let db;
let i=0;
function handleMySql(){
  i+=1;
  db = mysql.createConnection(sqlCont);
  db.connect(function(error){
    if(error){
      console.log(error);
      if(i<50){
        // handleMySql();
        setInterval(handleMySql(),200)
      }
    }else{
      i=0;
      console.log('已连接数据库')
    }
  });
}
handleMySql();

module.exports = db
