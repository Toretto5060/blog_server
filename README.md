# Nodejs服务

###项目结构

| 文件夹 | 文件 | 描述 |
| :------: | :------: | :------: |
| / | dbConfig.js | 数据库连接状态返回（便于管理，数据库账号等信息并不在此文件中） |
| / | tokenFuc.js | 生成、设置token,密钥；接口验证token及token状态返回等 |
| / | server.js | 项目入口文件，包含端口、接口白名单，数据库信息等 |
| port | user.js | 用户接口相关，包括注册登录，个人信息修改的相关接口 |

###项目命令
- cd blog_server
- npm install
- npm install -g supervisor (测试开发时使用，守护node进程;)
- node server.js/supervisor server.js

