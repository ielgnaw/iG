###各个模块的描述

#####IG.js 主文件入口
包括了：
1. 对requestAnimationFrame和cancelAnimationFrame的兼容性处理
2. 一些游戏里的状态和参数的设定
3. 游戏循环

#####Game.js 游戏的主启动文件
1. 声明Game类

#####Util.js 工具函数
* extend函数：讲多个对象object或者对象与数组进行融合


#####config.js 配置
config参数用来存储整个游戏的设定。定义setConfig和getConfig方法，来设定或者获取配置

疑问：
+ extend函数的第一个参数如果是数组将会出现问题？