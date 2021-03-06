import { api } from '../module/api';
import { ui } from '../module/ui';
import { media } from '../module/media';
import { net } from '../module/net';
import { theme } from '../module/theme';
import { storage } from '../module/storage'
import './component.scss';
import '../page/home/home.scss';

//通用接口
api();

//UI模块
(function () {
    ui.init();

    //轮播
    ui.flash.init();
    ui.flash.next(3000);

    //主界面拖动
    $('#header').on('mousedown', function (e) {
        $('#container').move(e);
    });

    //全屏
    $('#header').dblclick(ui.full);
    $('.icon-full').click(ui.full);

    //退出登录
    $('.icon-setting').click(function () {
        net.loginOut();
    });

    //tab通用
    $('.tab a').click(function () {
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
    });

    //阻止冒泡
    $('#LSmask *').click(function () {
        return false;
    });

    //点击遮罩隐藏
    $('#LSmask').click(ui.LS.hide);

    //登录框
    $('.tab a').on('click', function () {
        if ($(this).getParent(2).hasClass('front')) {
            $('.formGroup').clear();
            var id = $(this).index(); //当前操作的元素索引值 
            var num1 = 10 + id * 100;
            var num2 = -id * 330;
            $('.slider').animate({
                marginLeft: num1
            });
            $('.formGroup').animate({
                marginLeft: num2
            });
        }
    });
}());

//媒体模块
(function () {
    //为什么这么写？因为.pause是后来添加的类名，在此之前声明的方法无效
    $('.play-group').on('click', '.icon-play', function () {
        if (media.status) {
            media.continue();
        }
        else {
            var mediaInfo;
            if (media.type == 'audio') mediaInfo = media.favoriteList[0];
            else mediaInfo = media.mvList[0];
            media.star(mediaInfo);
        }
    })
    //按钮组
    $('.play-group').on('click', '.icon-pause', function () {
        media.pause();
    })
    $('.icon-next').click(function () {
        media.next();
    });
    $('.icon-prev').click(function () {
        media.prev();
    });
    //播放模式
    $('.PM').click(function () {
        var mode = $(this).attr('class').split(' ')[3].replace(/icon-/g, '');
        media.changePlayMode(mode);
    });
    //播放界面
    $('.music-pic.sm').click(function () {
        media.showInterface();
        if(media.type=='audio'){
            var id = media.statusInfo.id;
            net.getComment(id);
        }
    });
    //返回
    $('.icon-back').click(function () {
        media.hideInterface();
    });
    //点击进度条直接切换时间
    $('.progress').click(function (e) {
        media.updateProgress(e);
    });
    //调整音量
    $('.vc').on('input propertychange', function () {
        var value = $(this)[0].value;
        media.volChange(value);
    })
    //静音
    $('.icon-vol').click(function () {
        media.volToggle();
    });
    //播放歌单
    $('.favorite-list').on('click', 'tr', function () {
        var index = $(this).index() - 1;
        var mediaInfo = media.favoriteList[index];
        media.type = 'audio';
        media.star(mediaInfo);
    });
    //播放MV
    $('.mv-list').on('click', '.mv', function () {
        var index = $(this).index();
        var mediaInfo = media.mvList[index];
        media.type = 'video';
        media.star(mediaInfo);
    });
}());

//通信模块
(function () {
    net.init();
    //检测登录
    $('.user').click(function () {
        net.checkLogin().then(() => {
            var page = $('.page-userInfo');
            net.loadDone(page);
        })
            .catch(() => {
                ui.LS.show();
            })
    });
    $('.save').click(function () {
        var page = $('.page-found');
        net.loadDone(page);
    });
    //加载页面内容
    $('#slideBar li').click(function () {
        if ($(this).isActive()) return;

        var index = $(this).index();
        if ($(this).getParent(2).index() == 1) index += 4;

        var page = $('.page').eq(index);
        if (page.hasClass('loaded') || page.hasClass("N")) {
            net.loadDone(page);
        }
        else net.loadStar(page)

    });
    //滚动到底部自动刷新
    $(".page-favorite").scroll(function () {
        var page = $(".page-favorite");
        var divHight = page.height();
        var scrollHight = $(this).prop("scrollHeight");
        var scrollTop = $(this).prop("scrollTop");
        if (scrollTop + divHight >= scrollHight) {
            net.loadStar($(".page-favorite"));
        }
    });
    //提交数据
    $('.sumbit').click(function () {
        var text = $(this).text();
        var username = $(this).siblings('.username').val();
        var password = $(this).siblings('.password').val();
        var userInfo = {
            username: username,
            password: password,
            type: 'login'
        };

        //直到获取数据之前，按钮不可响应
        $(this).attr('disabled', 'true').text('提交中...');
        if ($(this).hasClass('sign')) userInfo.type = 'sign';

        //先检查正则相关问题，根据返回值进行相应处理
        setTimeout(function () {
            var prompt;
            var reg = net.checkReg(userInfo);
            switch (reg) {
                case 'null': prompt = '用户名/密码不能为空'; break;
                case "length illegal": prompt = '用户名/密码需6-15位'; break;
                case 'character illegal': prompt = '用户名为字母数字组合'; break;
                case 'legal': net.ls(userInfo); break;
            }
            if (reg != 'legal') net.lsErr(prompt, text);
        }, 500);
    });
}());

//主题模块
(function () {
    // let theme = new themeModule();
    theme.init();
    //切换主题
    $('.icon-skin').click(function () {
        theme.next();
    });
}());