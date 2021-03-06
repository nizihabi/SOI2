/**
 * Created by 杜鹏宇 on 2015/7/23
 * Modified by 杜鹏宇 on 2015/9/16
 */

//通信支持
CommControl = function () {
    this.socket = null;//通信实体
    this.clientId = '';//客户端ID
    this.convName = '';//房间名称
    this.isHost = false;//是否主机
}
//建立与服务器的通信
CommControl.prototype.run = function () {
    this.clientId = game.userName;
    this.convName = game.battlefield;
    this.isHost = game.isHost;

    //连接websocket后端服务器
    this.socket = io.connect(server);

    //监听新用户登录
    this.socket.on('login', function (o) {
        console.log("玩家" + o.clientId + "加入战场");
        if (game.isHost) {
            game.commControl.send(o.clientId, "Server", "initMap", game.mapControl.data);
        }
        if (o.onlineCount % 2 == 1)
            game.userCamp = "R";
        else
            game.userCamp = "B";
    });

    //告诉服务器端有用户登录
    this.socket.emit('login', {clientId: this.clientId});

    //监听用户退出
    this.socket.on('logout', function (o) {
        console.log("玩家" + o.clientId + "离开战场");
    });

    //监听消息发送
    this.socket.on('message', function (obj) {
        if (!game.isHost && obj.from == "Server") {
            if (obj.to == game.userName && obj.command == "initMap") {
                console.log("服务器通知初始化地图");
                game.mapControl.data = obj.data;
                game.mapControl.drawMap(game.scene);
            }
            if (obj.command == "updateTank") {
                game.tankControl.clientUpdate(obj.data);
            }
            if (obj.command == "updateShell") {
                game.shellControl.clientUpdate(obj.data);
            }
        }
        if (game.isHost && obj.to == "Server") {
            if (obj.command == "newTank") {
                var md = obj.data;
                game.tankControl.addTank(md.user, md.camp, md.position, md.type);
                console.log("服务器为新玩家" + md.user + "创建坦克");
            }
            if (obj.command == "updateTankPosition") {
                game.tankControl.updateTankPosition(obj.from, obj.data);
            }
            if (obj.command == "newShell") {
                var md = obj.data;
                game.shellControl.addShell(md.position, md.direction, md.speed, md.damage);
            }
        }
    });
}
//发送消息
CommControl.prototype.send = function (to, from, com, data) {
    var obj = {
        to: to,
        from: from,
        command: com,
        data: data
    };
    this.socket.emit('message', obj);
}