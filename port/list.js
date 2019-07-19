const server = require('../server');
const mysql = require("mysql");
const jwt = require("jsonwebtoken"); //生成token

server.app.get("/list", (req, res) => {
	// res.send('哈哈哈')
  let token = req.headers['blog_token'];
  console.log(jwt.decode(token,'shitou5698'))
})

module.exports = server;
