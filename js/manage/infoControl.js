/**
 * Created by 杜鹏宇 on 2015/9/13
 * Modified by 杜鹏宇 on 2015/9/15
 */

//管理信息面板显示
InfoControl = function () {
}

//更新面板信息
InfoControl.prototype.update = function (tank) {
    document.getElementById("info_name").innerHTML = tank.user;
    document.getElementById("info_life").innerHTML = "生命值: " + tank.life;
    document.getElementById("info_position").innerHTML = "坐  标: ( " + Math.round(tank.position.x) + " , " + Math.round(tank.position.z) + ")";
}