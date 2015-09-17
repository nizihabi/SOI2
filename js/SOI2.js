/**
 * Created by 杜鹏宇 on 2015/7/8
 * Modified by 杜鹏宇 on 2015/9/15
 */

//钢铁之魂
SOI2 = function () {
    this.canvas = null;//网页画布
    this.engine = null;//游戏引擎

    this.scene = null;//场景
    this.camera = null;//相机
    this.light = null;//光照

    this.userName = null;//玩家名称
    this.userCamp = null;//玩家阵营
    this.tankType = null;//坦克类型
    this.battlefield = null;//战场名称
    this.isHost = null;//是否为游戏主机

    this.infoControl = null;//信息项
    this.mapControl = null;//地图项
    this.shellControl = null;//炮弹项
    this.tankControl = null;//坦克项
    this.commandControl = null;//指令项
    this.commControl = null;//通信项
    this.soundControl = null;//声音项
}

//游戏初始化
SOI2.prototype.init = function () {
    //加载玩家信息
    this.userName = window.localStorage.getItem("username");
    this.tankType = window.localStorage.getItem("tanktype");
    this.battlefield = window.localStorage.getItem("roomname");
    if (window.localStorage.getItem("host") == "true") {
        this.isHost = true;
    } else {
        this.isHost = false;
    }
    window.localStorage.removeItem("username");
    window.localStorage.removeItem("tanktype");
    window.localStorage.removeItem("roomname");
    window.localStorage.removeItem("host");
    //加载游戏引擎
    this.canvas = document.getElementById("gameCanvas");
    this.engine = new BABYLON.Engine(this.canvas, true);
    //初始化场景
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.gravity = new BABYLON.Vector3(0, -9.18, 0);
    this.scene.collisionsEnabled = true;
    //初始化灯光
    this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
    //初始化加载项
    this.infoControl = new InfoControl();
    this.mapControl = new MapControl();
    this.shellControl = new ShellControl();
    this.tankControl = new TankControl();
    this.commandControl = new CommandControl();
    this.commControl = new CommControl();
    this.soundControl = new SoundControl();
    //连接战场
    this.commControl.run();
    setTimeout(function () {
        //加载游戏内容
        game.load();
        //建立60FPS的游戏循环
        game.engine.runRenderLoop(function () {
            game.update();
            game.draw();
        });
    }, 500);
}

//游戏内容加载
SOI2.prototype.load = function () {
    //加载天空盒
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 2000.0, this.scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("../asset/image/skybox/skybox", this.scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    skybox.position.y = 100;
    //加载地板
    var ground = BABYLON.Mesh.CreateGround("ground", 2010, 2010, 2, this.scene);
    ground.checkCollisions = true;
    var materialPlane = new BABYLON.StandardMaterial("texturePlane", this.scene);
    materialPlane.diffuseTexture = new BABYLON.Texture("../asset/image/map/soil.jpg", this.scene);
    materialPlane.diffuseTexture.uScale = 50;//Repeat 50 times on the Vertical Axes
    materialPlane.diffuseTexture.vScale = 50;//Repeat 50 times on the Horizontal Axes
    materialPlane.backFaceCulling = false;//Allways show the front and the back of an element
    ground.material = materialPlane;

    //加载地图
    if (this.isHost) {
        this.mapControl.createRandomMap();
        this.mapControl.drawMap();
    }

    //设置出生点
    var startPoint;
    if (this.userCamp == "R")
        startPoint = new BABYLON.Vector3(Math.random() * 200 - 100, 3, 500);
    else
        startPoint = new BABYLON.Vector3(Math.random() * 200 - 100, 3, -500);
    //新建玩家坦克
    this.tankControl.addTank(this.userName, this.userCamp, startPoint, this.tankType);
    //Todo 临时代码
    this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(startPoint.x, 7, startPoint.z), this.scene);
    this.camera.setTarget(new BABYLON.Vector3(0, 7, 0));
    this.camera.attachControl(this.canvas);
    this.camera.ellipsoid = new BABYLON.Vector3(3, 3, 3);
    this.camera.checkCollisions = true;
    this.camera.applyGravity = true;
    this.camera.keysUp = [87];
    this.camera.keysDown = [83];
    this.camera.keysLeft = [65];
    this.camera.keysRight = [68];
    this.camera.inertia = 0.9;
    this.camera.speed = this.tankControl.myTank.moveSpeed;
    this.camera.angularSensibility = this.tankControl.myTank.rotateSpeed;

    //加载交互命令
    this.commandControl.run();
    //加载背景音乐
    this.soundControl.playBackgroundMusic();
}

//游戏逻辑更新
SOI2.prototype.update = function () {
    this.tankControl.myTankMove();
    this.infoControl.update(this.tankControl.myTank);
    if (this.isHost) {
        this.shellControl.fly();
        //采用60Hz的同步频率
        if (Math.random() * (60 / 60) < 1) {
            this.tankControl.serverUpdate();
            this.shellControl.serverUpdate();
        }
    } else {
        //采用60Hz的同步频率
        if (Math.random() * (60 / 60) < 1) {
            game.commControl.send("Server", game.userName, "updateTankPosition", game.tankControl.myTank.position);
        }
    }
}

//游戏画面绘制
SOI2.prototype.draw = function () {
    this.tankControl.draw();
    this.shellControl.draw();
    this.scene.render();
}