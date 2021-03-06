/**
 * 地图前提
 * 1 只能按照站的顺序选择以后的站
 * 2 每次选完 下一站就是刚选的站点 转态为还有几分钟到达 
 * 3 只给6个站点
 * 
    音频前提
    1 fm style phone 只支持 上下切换，只有歌曲支持左右 切换音频
 *
 * 把 2指改成 3指
 */
$(function(){

    /*公共方法==================================================================================*/

    var ww = window.innerWidth;
    var wh = window.innerHeight;
    var roots = Math.max(window.innerWidth, window.innerHeight)/19.2;

    var tools= {
        toast : function(text, fn){
            var id = _.uniqueId('toast_');
            var $el = $('<div class="toast" id="'+ id +'">'+ text +'</div>');
            if ($('.toast').length) {
                $('.toast').remove();
            }
            $el.appendTo(document.body);

            $el.css({
                left: '50%',
                marginLeft: -1 * $el.outerWidth()/2
            });
            $el.fadeIn('fast');

            setTimeout(function(){
                $el.fadeOut('fast', function(){
                    $el.remove();
                    fn && fn();
                });
            },1200);
        },
        timer : function(clear, cb, time){
             
            //tools.timer.t;
            if (clear) {
                clearTimeout(tools.timer.t);
            }else{
                tools.timer.t = setTimeout(function(e){
                    cb && cb();
                }, time);
            }
        }  
    };

    //var $video = $('#video')[0];
    $('.nav-tab>a').on('touchend', function(e){
        e.preventDefault();
        e.stopPropagation();
        var index = $(this).index();
        document.body.className = 'pg'+ index +'show';
        // if (index==3) {
        //     $video.play();
        // }else{
        //     $video.pause();
        //     $video.currentTime = 0;
        // }
    });
    $('.tiplock').on('touchend', function(e){
        e.preventDefault();
        e.stopPropagation();
        $('.tip').toggle();
        $('.tiplock').toggleClass('sel');
    });
    //重置页面
    $('.reload').on('touchend', function(e){
        e.preventDefault();
        e.stopPropagation();
        location.reload();
    });



    /*第0屏==================================================================================*/
    //地图
    var $stateCircle = $('#stateCircle');
    var $div0 = $('#div0');
    var $div01 = $('#div01');
    var $spot = $('.spot');
    var $axis01 = $('#axis01');
    
    //初始化记忆
    var axisAdrr = []; 
    var tempSC = 0;

    //预加载地点
    var previmg = [];  
    for (i = 0; i < 8; i++) {
        previmg[i] = new Image();
        previmg[i].src = './img/state/'+i+'.jpg';
        // console.log(previmg);
    }  

    var wsc = $stateCircle.width();
    var scarr = [(wh-wsc)/2, (ww+wsc)/2, (wh+wsc)/2, (ww-wsc)/2];
    var map= ['颐和园东宫门', '海淀公园', '中关村', '北京大学东门', '五道口', '清华东路西口', '清华大学二校门', '圆明园南门'];
    var mapTip = ['1公里，约2分钟','2公里，约4分钟','3公里，约6分钟','4公里，约8分钟','5公里，约10分钟','6公里，约12分钟','7公里，约14分钟','8公里，约16分钟'];
    
    $div01.on('scroll', function(e){
        $spot.each(function(i, e){
            var cr = e.getBoundingClientRect();
            if (cr.top>scarr[0] && cr.right<scarr[1]  && cr.bottom<scarr[2] && cr.left>scarr[3]) {
                $('#circleImg').attr('src', './img/state/'+i+'.jpg');
                $('#circleAddr').html(map[i]);
                $('#mapTip').html(mapTip[i]);
                tempSC = i;
            }
        });
    });
    
    var init0 = function(){
        
        //轴线
        if (axisAdrr.length>0) {
            var html = '';
            for(var i=0; i<axisAdrr.length; i++){
                if (i==axisAdrr.length-1) {
                    html += '<div class="cir nextcir" data-sid="'+ axisAdrr[i] +'">' +
                            '<p class="retime">剩余<b>' + (axisAdrr[i]+1)*2 + '</b>分钟</p>' +
                            '<p class="nci">' +
                                '<span class="cell">' +
                                    '<b>' + map[axisAdrr[i]] + '</b>' +
                                '</span>' +
                            '</p>' +
                        '</div>';
                }else{
                    // html += '<div class="cir">' +
                    //         '<span>' + map[axisAdrr[i]] + '</span>' +
                    //     '</div>';
                    html += '<div class="cir" data-sid="'+ axisAdrr[i] +'"><span><em>' + map[axisAdrr[i]] + '</em></span></div>';
                }
            }
            $('#axis0').html(html);

            //绑定事件
            $('#div0 .cir').on(deleteFn);
        }

        //地图位置
        
        var l = $div01.scrollLeft(), 
            t = $div01.scrollTop();
            console.log(l ,t );
            $div0.css({'background-position': -l/100 + 'rem -' + t/100 +'rem'}); 
    };
    //第一屏的附属屏
    var init01 = function(){

        //copy一份
        var temparr = axisAdrr.slice(0);

        //轴线
        var len = axisAdrr.length;
        var pice = 1;
        if (len%2==0) {
            temparr.splice(len/2, 0, 'temp');
            pice = len;
        }else{
            temparr.splice((len+1)/2, 0, 'temp');
            pice = len+1;
        }

        var pl = 11.4/pice;

        var html = '';
        var templen = temparr.length;
        for (var i=0; i<templen; i++){
            if (temparr[i]=='temp') {
                html += '<div class="addcir ct"><span>+</span></div>';
            }else{
                var left = i*pl + 0.7;
                html += '<div class="cir" style="left: '+ left +'rem;"><span><em>' + map[temparr[i]] + '</em></span></div>';
            }

        }
        $('#axis01').html(html);
 
    };

    var scmove = {};
    $stateCircle.on({
        touchstart: function(e){
            e.preventDefault();
            e.stopPropagation();
            if($('#circleAddr').html()=='') return false;

            scmove.y0 = e.changedTouches[0].pageY;
        },
        touchmove: function(e){
            e.preventDefault();
            //e.stopPropagation();
            if($('#circleAddr').html()=='') return false;

            scmove.y1 = e.changedTouches[0].pageY;
            scmove.yt = scmove.y1 - scmove.y0;
            if (scmove.yt && scmove.yt>60) {
                $div01.addClass('active');
            }
        }
    });
 
    $('#stateCircle .yes').on('touchend', function(){

        //if (axisAdrr.indexOf(tempSC)<0 && (axisAdrr.length==0 || axisAdrr[axisAdrr.length-1]<tempSC)){

            $div01.removeClass('active');
            axisAdrr.push(tempSC);
            axisAdrr.sort();
            axisAdrr = _.uniq(axisAdrr);
            //console.log(axisAdrr, 'axisAdrr');
            $('.addcir').remove();
            $axis01.append('<div class="addcir1 ct"><span><em>'+map[tempSC]+'</em></span></div>');

            setTimeout(function(){
                document.body.className = 'pg0show';
                init0();
                
            }, 500);

        // }else{
        //     tools.toast('您选的站点已经路过了哦～');
        // }
        
    });
    $('#stateCircle .no').on('touchend', function(){
        $div01.removeClass('active');
    });

    $('.sub-div0').on('touchend', function(e){
        //if ($div0.hasClass('delete')) return false
        document.body.className = 'pg0show pg0sub';
        init01();
    });

    $('.div01 .back').on('touchend', function(e){
        document.body.className = 'pg0show';
        init0();
    });

    //删除功能
    var deleteFn = {
        touchstart: function(e){
            console.log('touchstart');
            e.preventDefault();
            e.stopPropagation();
            this.x0 = e.changedTouches[0].pageX;
            this.y0 = e.changedTouches[0].pageY;
             
            var sw = this.style.webkitTransform;
            this.xsw = sw ? sw.match(/\d+/g)[0] : 0;
            this.ysw = sw ? sw.match(/\d+/g)[1] : 0;
        },
        touchmove: function(e){
            e.preventDefault();
            e.stopPropagation();
            this.x1 = e.changedTouches[0].pageX;
            this.xt = this.x1 - this.x0 + parseInt(this.xsw);
            this.y1 = e.changedTouches[0].pageY;
            this.yt = this.y1 - this.y0 + parseInt(this.ysw);

            $(this).css({'transform': 'translate3d('+ this.xt +'px,'+this.yt+'px, 0)', '-webkit-transform': 'translate3d('+ this.xt +'px,'+this.yt+'px, 0)'});
            if (this.classList.contains('nextcir')) {
                if (Math.abs(this.yt)>1.625*roots) {
                    $div0.addClass('delete');
                    this.className = 'cir nc';
                }
            }else{
                if (Math.abs(this.yt)>0.615*roots) {
                    $div0.addClass('delete');
                }
            }


        },
        touchend: function(e){
            e.preventDefault();
            e.stopPropagation();
            var $laggy = $('.laggy');
            var bt = $laggy[0].getBoundingClientRect();
            var bb = $laggy[1].getBoundingClientRect();
            var c = this.getBoundingClientRect();

            var con1 = bt.left<=c.left && bt.right>=c.right && bt.top<=c.top && bt.bottom>=c.bottom;
            var con2 = bb.left<=c.left && bb.right>=c.right && bb.top<=c.top && bb.bottom>=c.bottom;
            console.log($(this), con1 ,con2)
            if (con1 || con2) {
                $(this).remove();
                $div0.removeClass('delete');

                var v = parseInt($(this).data('sid'));
                var index = axisAdrr.indexOf(v);
                    axisAdrr.splice(index, 1);

                console.log(axisAdrr, '剩余站点');
            }else{

                if (this.classList.contains('nc')) {
                    this.className = 'cir nextcir';
                }

                $div0.removeClass('delete');
                $(this).css({'transform': 'translate3d(0, 0, 0)', '-webkit-transform':  'translate3d(0, 0, 0)'});
            }
 
        }
    };

    /*第1屏==================================================================================*/

    var siteNum = 0;

    // $('.sitmap span').on('touchend', function(e){
    //     e.preventDefault();
    //     e.stopPropagation();
    //     $(this).addClass('sel').siblings().removeClass('sel');
    //     var cn = ('mc m'+$(this).index());
    //     $('.win-box .mc')[0].className = cn;
    //     $('.sub10 .mc')[0].className = cn;

    //     siteNum = $(this).index();
    // });

// 不同手势  进入相应模块
function sitmapstatus(i){
    console.log(i)
    var i = parseInt(i);
    $('.sitmap span').removeClass('sel');
    $('.sitmap span').eq(i).addClass('sel');
    var cn = ('mc m'+i);
    $('.win-box .mc')[0].className = cn; //风速
    $('.sub10 .mc')[0].className = cn; //温度
    $('#rz')[0].className = 'rz rz'+i; //风向

    siteNum = i;
}
    var hammerdiv = [];
    for(var i=0;i<3;i++){

        hammerdiv[i] = new Hammer(document.getElementById("part"+i));
        hammerdiv[i].get("pinch").set({ enable: true });

        hammerdiv[i].on('panstart panend panmove', function(e) {

            //console.log(e, 'ee')
            if (e.maxPointers ==1) {
                if (e.type == 'panstart') {
                    sitmapstatus((e.target.id).slice(4));

                    tools.timer(true);
                }
                if (e.type == 'panend') {
                     tools.timer(false, function(){
                        document.body.className = 'pg1show';
                        tools.timer(true);
                    }, 3000);
                }

                if (e.additionalEvent=="panleft" || e.additionalEvent=="panright") {

                    document.body.className = 'pg1show pg1sub0';
                    initSubdata(0);
 
                }else if(e.additionalEvent=="panup" || e.additionalEvent=="pandown"){
                    
                    document.body.className = 'pg1show pg1sub2';
                    initSubdata(2);

                }
            }
        });

        hammerdiv[i].on("pinchstart", function (e) {

            sitmapstatus((e.target.id).slice(4));

            document.body.className = 'pg1show pg1sub1';
            initSubdata(1);

        });

        // hammerdiv[i].on('panend', function(e) {
        //     if (e.maxPointers ==1) {

        //         document.body.className = 'pg1show pg1sub0';
        //         initSubdata(0);

        //         tools.timer(false, function(){
        //             document.body.className = 'pg1show';
        //             tools.timer(true);
        //         }, 2000);

        //     }else if(e.maxPointers ==3){

        //         document.body.className = 'pg1show pg1sub2';
        //         initSubdata(2);

        //         tools.timer(false, function(){
        //             document.body.className = 'pg1show';
        //             tools.timer(true);
        //         }, 4000);

        //     }
        // });

        // hammerdiv[i].on("pinchend", function (e) {

        //     document.body.className = 'pg1show pg1sub1';
        //     initSubdata(1);

        //     // tools.timer(false, function(){
        //     //     document.body.className = 'pg1show';
        //     //     tools.timer(true);
        //     // }, 2000);

        // });
    }

    var div1sub = {};    
        
    //温度调控    
    var degbox = $('.deg-box');
    var degmove = {};
    $('.div10').on({
        touchstart: function(e){
            e.preventDefault();
            e.stopPropagation();
            degmove.x0 = e.changedTouches[0].pageX;
            var sw = degbox[0].style.webkitTransform;
            degmove.sw = sw ? sw.match(/\d+/g)[0] : 0;

            tools.timer(true);

        },
        touchmove: function(e){
            e.preventDefault();
            e.stopPropagation();
            degmove.x1 = e.changedTouches[0].pageX;
            degmove.xt = degmove.x1 - degmove.x0 + parseInt(degmove.sw);
            if (degmove.xt<=12*roots && degmove.xt>=0) {
                degbox.css({'transform': 'translateX('+ degmove.xt +'px)', '-webkit-transform': 'translateX('+ degmove.xt +'px)'})
                var rate = degmove.xt*13/(12*roots);
                var n = Math.ceil(rate);
                $('.deg-num>em').removeClass('sel');
                $('.deg-num>em')[n].className = 'sel';
                $('.deg-num').scrollLeft(rate*0.8*roots);

                //存数据
                subdata[siteNum][0].xt = degmove.xt;
                subdata[siteNum][0].n = n;
                subdata[siteNum][0].sl = rate*0.8*roots;

            }

        },
        touchend: function(e){
            e.preventDefault();
            e.stopPropagation();

            tools.timer(false, function(){
                document.body.className = 'pg1show';
                tools.timer(true);
            }, 1000);
        }
    });

    //风向调控
    var fxmv = {};
    var $mc2 = $('.div12 .mc2');
    $('.div12').on({
        touchstart: function(e){

            e.preventDefault();
            e.stopPropagation();
            fxmv.y0 = e.changedTouches[0].pageY;
            fxmv.down = 0;
            fxmv.up = 0;
            tools.timer(true);

        },
        touchmove: function(e){
            e.preventDefault();
            e.stopPropagation();

            fxmv.y1 = e.changedTouches[0].pageY;
            fxmv.yt = fxmv.y1 - fxmv.y0;
            var h = 0;
            if (fxmv.yt>0) {
                if (fxmv.up) return false;
                $mc2[0].className = 'mc2 down';
                h = Math.min( 4.18*roots, fxmv.yt);
                fxmv.down = 1;
            }else if (fxmv.yt<0) {
                if (fxmv.down) return false;
                $mc2[0].className = 'mc2 up';
                h = -Math.max(-4.18*roots, fxmv.yt);
                fxmv.up = 1;
            }

            $mc2.css({'height': h/roots + 'rem'});

            //存数据
            subdata[siteNum][2] = h/roots;

        },
        touchend: function(e){
            e.preventDefault();
            e.stopPropagation();
            fxmv.down = 0;
            fxmv.up = 0;

            tools.timer(false, function(){
                document.body.className = 'pg1show';
                tools.timer(true);
            }, 1000);

        }
    });

    //缩放调节风速
    var $fannum = $('#fannum'), 
        $fan = $('#fan');
    var hmsub11 = new Hammer(document.getElementById("div11"));
        hmsub11.get("pinch").set({ enable: true });

        var fannum = 0;
        hmsub11.on("pinchstart pinchin pinchout pinchend", function (e) {
            if(e.type == 'pinchstart') {
                fannum = parseInt($fannum.html());
                tools.timer(true);
            }
            else if (e.type == 'pinchin') {
                //console.log(e);
                var num = Math.max(0, fannum - parseInt(e.scale*10));

                $fannum.html(num);
                //$fannum.html(e.scale);
                $fan.addClass('sel');

                

                subdata[siteNum][1] = num;
            }
            else if (e.type == 'pinchout') {
                var num = Math.min(100, fannum + parseInt((e.scale-1)*10));
                $fannum.html(num);
                //$fannum.html(e.scale);
                $fan.addClass('sel');
                
                subdata[siteNum][1] = num;

            }
            else if (e.type == 'pinchend') {
                $fan.removeClass('sel');

                tools.timer(false, function(){
                    document.body.className = 'pg1show';
                    tools.timer(true);
                }, 1000);

            }

        });
     

    //数据记录
    var subdata = [[{xt:0,n:0,sl:0},0,0],[{xt:0,n:0,sl:0},0,0],[{xt:0,n:0,sl:0},0,0]]; // 温度  风速 风向

    //初始化subdata
    var initSubdata = function(x){

        if (x==0) {
            //温度
            degbox.css({'transform': 'translateX('+ subdata[siteNum][0].xt +'px)', '-webkit-transform': 'translateX('+ subdata[siteNum][0].xt +'px)'})
            $('.deg-num>em')[subdata[siteNum][0].n].className = 'sel';
            $('.deg-num').scrollLeft(subdata[siteNum][0].sl);

        }else if (x==2) {
            //风向调控
            $mc2.css({'height': subdata[siteNum][2] + 'rem'});

        }else if (x==1) {
            //缩放调节风速
            $fannum.html(subdata[siteNum][1]);
        }




    };

    /*第2屏==================================================================================*/

    //当前播放音频信息
    var audioObj = {
        num: 0,
        voice: 1,
        ct: 0,
        bzd: 0
    };

    var AudioFn = function(option){
        this.src = option.src;
        this.ad = new Audio();
        this.init();
    };
    AudioFn.prototype = {
        constructor: AudioFn,
        init: function(){
            this.ad.src = this.src;
            this.ad.preload = 'auto'; 
        },
        reset: function(src){
            this.ad.src = src;
            this.ad.preload = 'auto';
            this.ad.play();
        },
        reset2: function(src, cover){
            this.ad.src = src;
            $('#cover').attr('src', cover);
            this.ad.preload = 'auto';
            this.ad.play();
        },
        play: function(){
            this.ad.play();
        },
        pause: function(){
            this.ad.pause();
        },
        stop: function(){
            this.ad.currentTime = 0;
            this.ad.pause();
        },
        go: function(scale){
            this.ad.currentTime = scale;
            this.ad.play();
        },
        voice: function(scale){
            this.ad.volume = scale;
            this.ad.play();
        },
        currentTime: function(){
            return this.ad.currentTime;
        },
        duration: function(){
            return this.ad.duration;
        },
        progress: function(val){
            this.ad.currentTime = val;
            this.ad.play();
        }
    };

    var $raybox = $('.ray-box');
    var $div2 = $('#div2');

    var myAudio = new AudioFn({
        src: 'img/2/sc/0.mp3'
    });
    $('#stop').on('touchend', function(e){
        e.preventDefault();
        e.stopPropagation();
        $div2[0].className = 'div2 sec play';
        myAudio.play();
    });

    $('#pause').on('touchend', function(e){
        e.preventDefault();
        e.stopPropagation();

        // if ($div2.hasClass('goback')){
        //     $div2.removeClass('goback');
        //     return false;
        // } 

        if ($div2.hasClass('play')) {
            myAudio.pause();
            $div2[0].className = 'div2 sec pause';
        }
    });


    //调节音量
    var hm2 = new Hammer(document.getElementById("div2"));
        hm2.get("pinch").set({ enable: true });

        hm2.on("pinchin pinchout pinchend", function (e) {
            
            if (!$div2.hasClass('play')) return false;
            if (!e.target.classList.contains('div2')) return false;

            if (e.type == 'pinchin') {
                audioObj.voice = Math.max(0, audioObj.voice - e.scale/100);
                $div2[0].className = 'div2 sec play loudy';
                $('#vnum').html(Math.floor(audioObj.voice*10));
            }else if(e.type == 'pinchout'){
                audioObj.voice = Math.min(1, audioObj.voice + e.scale/100);
                $div2[0].className = 'div2 sec play loudy';
                $('#vnum').html(Math.floor(audioObj.voice*10));
            }else if (e.type == 'pinchend') {
                $div2[0].className = 'div2 sec play';
            }
            myAudio.voice(audioObj.voice);

        });
        
        //切换歌曲
        function swiperFn(){
            var html = '<div class="swiper-container"><div class="swiper-wrapper">';
            for(var i = 0; i<5; i++){
                var cl = 'swiper-slide';
                if (i==audioObj.num) {

                    console.log(audioObj.num, 'eeee', i);

                    //cl = 'swiper-slide swiper-slide-active';
                }
                html +=  '<div class="' + cl + '" >' +
                            '<div class="ray-box">' +
                                '<div class="gif2-box">' +
                                    '<div class="black-box ct">' +
                                        '<img src="img/2/sc/'+i+'.jpg" class="ct">' +
                                    '</div>' +
                                    '<div class="o ct"></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>';
            }

            html += '</div></div>';
            $('#myswipercon').html(html);
            var myswiper = new Swiper('.swiper-container',{
                initialSlide: audioObj.num,
                // speed: 1000, 
                loop: true,
                centeredSlides : true,
                slidesPerView: 5,
                slidePrevClass : 'slide-active-prev',
                slideNextClass : 'slide-active-next',
                on: {
                    slideChangeTransitionStart: function(){
                        tools.timer(true);
                    },
                    slideChangeTransitionEnd: function(){
                        var ri = this.realIndex;
                        // if (this.realIndex==4) {
                        //     ri = 0;
                        // }else {
                        //     ri = ri+1;
                        // }
                        audioObj.num = ri;
                        //console.log(audioObj.num, this.realIndex, 'this.realIndex');
                        //console.log(this.realIndex, 'realIndex', this.previousIndex, 'previousIndex', this.activeIndex, 'activeIndex')
                        
                        //切了立马播
                        myAudio.reset2('img/2/sc/'+ ri +'.mp3', 'img/2/sc/'+ ri +'.jpg');
                        tools.timer(false, function(){
                            //console.log(ri ,'tt');
                            initVoiceResource();
                            document.body.className = 'pg2show';
                            $('#myswipercon').html('');
                            tools.timer(true);
                        }, 2000);
                    }
                }
            });

        }

        //切换音源    
        var $word = $('.word');
        var xid = 0;
        hm2.on('panstart panmove panend', function(e) {
            if(e.maxPointers ==1){

                if (e.type=='panmove') {
                  

                    if (e.additionalEvent=='pandown' || e.additionalEvent=='panup') {
                        $div2[0].className = 'div2 sec black play';
                    }
                    
                    //$('#pause').trigger('touchend');

                }else if(e.type=='panend'){
                    //console.log(e, 'panend')

                    if(e.additionalEvent=='panleft'||e.additionalEvent=='panright'){
                        document.body.className = 'pg2show pg2sub';
                        swiperFn();
                    }else{
                        tools.timer(true);
                    
                        if (e.additionalEvent=='pandown') {
                            xid = Math.min(1,  xid+1);
                            $('.word').css({ 
                                '-webkit-transform': 'translateY('+xid*100/3+'%)'
                            });

                        }else if (e.additionalEvent=='panup') {
                            xid = Math.max(-1, xid-1);
                            $('.word').css({
                                '-webkit-transform': 'translateY('+xid*100/3+'%)'
                            }); 
                        }

                        $('#blackbox')[0].className = 'black-box ct sel'+(xid+1);

                        if (xid==-1) {
                            myAudio.reset('img/2/sc/ph.mp3');
                        }else if (xid==1) {
                            myAudio.reset('img/2/sc/fm.mp3');
                        }else{
                            myAudio.reset('img/2/sc/'+audioObj['num']+'.mp3');
                        }

                        tools.timer(false, function(){
                            $div2[0].className = 'div2 sec play';
                            tools.timer(true);
                        }, 2000);

                    }
                    


                    
                    
                    // if (e.additionalEvent=='pandown') {
                    //     xid = Math.min(1,  xid+1);
                    //     $('.word').css({ 
                    //         '-webkit-transform': 'translateY('+xid*100/3+'%)'
                    //     });

                    // }else if (e.additionalEvent=='panup') {
                    //     xid = Math.max(-1, xid-1);
                    //     $('.word').css({
                    //         '-webkit-transform': 'translateY('+xid*100/3+'%)'
                    //     }); 
                    // }else if (e.additionalEvent=='panleft'||e.additionalEvent=='panright'){
                        
                    //     document.body.className = 'pg2show pg2sub';
                    //     swiperFn();
                    //     //myswiper.slideToLoop(audioObj.num, 1000, false);

                    // }
                    // $('#blackbox')[0].className = 'black-box ct sel'+(xid+1);

                    // if (xid==-1) {
                    //     myAudio.reset('img/2/sc/ph.mp3');
                    //     $div2[0].className = 'div2 sec play';
                    // }else if (xid==1) {
                    //     myAudio.reset('img/2/sc/fm.mp3');
                    //     $div2[0].className = 'div2 sec play';
                    // }else{
                    //     myAudio.reset('img/2/sc/'+audioObj['num']+'.mp3');
                    //     $div2[0].className = 'div2 sec play';
                    // }
                }
            }
        });
        //音源初始化
        function initVoiceResource(){
            xid = 0;
            
            //fm style phone 图片还原
            $('#blackbox')[0].className = 'black-box ct';
            $div2[0].className = 'div2 sec play';

            //fm style phone 文字还原
            $('.word').css({
                '-webkit-transform': 'translateY(0)'
            }); 
        }

    //快进 快退    
    var hmraybox = new Hammer(document.getElementById("raybox"));
        hmraybox.get('rotate').set({ enable: true });

    var rotatePa = {};  
        hmraybox.on("rotatestart rotatemove rotateend", function(e){
             
            if(e.type == 'rotatestart') {
                rotatePa.d0 =  e.rotation ;
                //$div2.addClass('goback');
            }else if(e.type == 'rotatemove') {
                rotatePa.dt =  e.rotation - rotatePa.d0;
                var ct = myAudio.currentTime();
                
                if (rotatePa.dt>0) {
                    myAudio.progress(Math.min(myAudio.duration(), ct + rotatePa.dt/50));
                    $div2[0].className = 'div2 sec go';
                }else{
                    myAudio.progress(Math.max(0, ct + rotatePa.dt/50));
                    $div2[0].className = 'div2 sec back';
                }

            }else if(e.type == 'rotateend') {
                $div2[0].className = 'div2 sec play';
            }

        });

    // 第3屏=========================================================

    $('#tishow').on('touchend', function(e){
        $(this).toggleClass('sel');
        $('.tipimg').toggle();
    });
 

    /*页面对浏览器默认事件做的各种兼容=======================================================*/
    $('.div0, .pg1, .pg2, .pg3, .tools0b').on('touchstart touchmove touchend', function(e){
        e.preventDefault();
        e.stopPropagation();
    });
    
    $('.nav-tab').on('touchend', function(e){
        e.preventDefault();
        e.stopPropagation();
    });

    window.onresize = function(){
        document.documentElement.style.fontSize = Math.max(window.innerWidth, window.innerHeight)/19.2 + 'px';
        roots = Math.max(window.innerWidth, window.innerHeight)/19.2;
    };

});