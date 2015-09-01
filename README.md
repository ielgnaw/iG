##Description
一个便捷动画库，可以快速的构建出游戏和动画效果

##目录结构
```
├── README.md
├── build  编译之后的IG文件
│   ├── dist  压缩之后的文件
│   └── source  source是压缩之前文件
├── examples  示例
│   ├── base  一些基础功能的展示示例
│   ├── game  使用IG写的一些几个小游戏的示例
│   ├── img   图片 
│   └── index.html  实例的入口文件
├── src  IG内部各个模块的代码
│   |   └── dep  依赖的外部库文件
│   |       └── howler.js 一个让浏览器支持audio的库
│   ├── Animation.js  动画基类
│   ├── Bitmap.js  位图精灵（矩形）
│   ├── BitmapPolygon.js  位图精灵（多边形）
│   ├── DisplayObject.js  DisplayObject 基类
│   ├── Event.js  事件基类
│   ├── Game.js  游戏的主启动和渲染模块
│   ├── Matrix.js  矩阵基类（进行矩阵操作）
│   ├── Polygon.js  多边形
│   ├── Projection.js  投影类
│   ├── Rectangle.js  矩阵
│   ├── ResourceLoader.js 资源加载
│   ├── SpriteSheet.js  精灵表类
│   ├── Stage.js  场景类
│   ├── Storage.js  存储类
│   ├── Text.js  文字基类
│   ├── Vector.js  向量
│   ├── config.js  配置
│   ├── domEvt.js  DOM事件初始化模块
│   ├── easing.js  动画缓动
│   ├── env.js  设备系统判断
│   ├── ig.js   主入口文件
│   └── util.js  工具函数
└── tool  打包工具
```


##Fast Start!
如果我们想在画布中加入一个小人图片people.jpg，并且让他沿一条直线移动，使用IG可以快速的实现这一点：

```
        var canvas = document.getElementsByTagName('canvas')[0];
             
        // 第一步：实例化Game
        var myGame = new ig.Game({
            canvas: canvas,
            name: 'firstGame',
            resource: [
                {id: 'img1',src:'/src/img/people.jpg'},
            ]
        });
            
        // 第二部：构建场景
        var stage = myGame.createStage({
            name: 'demoStage',
            bgImg: '/src/img/bg.jpg',
            bgImgRepeatPattern: 'full'
        });
        
        // 第三步：创建人的位图精灵
        var player = stage.addDisplayObject(
            new ig.Bitmap({
                name: 'player',
                image: 'img1',
                x: 20,
                y: 20,
                vx: 10
                vy:10
            })
        );
        player.step = function (dt, stepCount, requestID) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
        };
        
        // 第四步： 开始动画！
        myGame.start('demoStage');   
```