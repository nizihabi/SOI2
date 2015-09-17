/**
 * Created by 杜鹏宇 on 2015/9/7
 * Modified by 杜鹏宇 on 2015/9/15
 */

//指令支持
CommandControl = function () {
}

//设定指令
CommandControl.prototype.run = function () {
    document.onkeydown = function (event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if (e && e.keyCode == 87) { // 按 W

        }
        if (e && e.keyCode == 83) { // 按 S

        }
        if (e && e.keyCode == 65) { // 按 A

        }
        if (e && e.keyCode == 68) { // 按 D

        }
        if (e && e.keyCode == 32) { // 按 空格

        }
    };
}