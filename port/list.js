const server = require('../server');
const mysql = require("mysql");

server.app.get("/list", (req, res) => {
	res.send('哈哈哈')
})

module.exports = server;