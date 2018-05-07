/**
 * 地图前提
 * 1 只能按照站的顺序选择以后的站
 * 2 每次选完 下一站就是刚选的站点 转态为还有几分钟到达 
 * 3 只给6个站点
 * 
    音频前提
    1 fm style phone 只支持 上下切换，只有歌曲支持左右 切换音频
 *
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

    $('.nav-tab>a').on('touchend', function(e){
        e.preventDefault();
        e.stopPropagation();
        document.body.className = 'pg'+$(this).index()+'show';
    });
    $('.tiplock').on('touchend', function(e){
        e.preventDefault();
        e.stopPropagation();
        $('.tip').toggle();
        $('.tiplock').toggleClass('sel');
    });

    // $('.back').on('touchend', function(e){
    //     document.body.className = 'pg0show';
    //     init0();
    // });


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

    var wsc = $stateCircle.width();
    var scarr = [(wh-wsc)/2, (ww+wsc)/2, (wh+wsc)/2, (ww-wsc)/2];
    var map= ['颐和园东宫门', '海淀公园', '中关村', '北京大学东门', '五道口', '清华东路西口', '清华大学二校门', '圆明园南门'];
    var mapTip = ['1公里，约2分钟','2公里，约4分钟','3公里，约6分钟','4公里，约8分钟','5公里，约10分钟','6公里，约12分钟','7公里，约14分钟','8公里，约16分钟'];
    $div01.on('scroll', _.debounce(function(e){
        $spot.each(function(i, e){
            var cr = e.getBoundingClientRect();
            if (cr['top']>scarr[0] && cr['right']<scarr[1]  && cr['bottom']<scarr[2] && cr['left']>scarr[3]) {
                $('#circleImg').attr('src', 'img/state/'+i+'.png');
                $('#circleAddr').html(map[i]);
                $('#mapTip').html(mapTip[i]);
                tempSC = i;
            }
        });
    },30));

    var init0 = function(){
        
        //轴线
        if (axisAdrr.length>0) {
            var html = '';
            for(var i=0; i<axisAdrr.length; i++){
                if (i==axisAdrr.length-1) {
                    html += '<div class="cir nextcir">' +
                            '<p class="retime">剩余<b>' + (axisAdrr[i]+1)*2 + '</b>分钟</p>' +
                            '<p class="nci">' +
                                '<span class="cell">' +
                                    '<b>' + map[axisAdrr[i]] + '</b>' +
                                '</span>' +
                            '</p>' +
                        '</div>';
                }else{
                    html += '<div class="cir">' +
                            '<span>' + map[axisAdrr[i]] + '</span>' +
                        '</div>';
                }
            }
            $('#axis0').html(html);
        }

        //地图位置
        
        var l = $div01.scrollLeft(), 
            t = $div01.scrollTop();
            console.log(l ,t );
            $div0.css({'background-position': l/100 + 'rem ' + t/100 +'rem'}); 
    };

    var scmove = {};
    $stateCircle.on({
        touchstart: function(e){
            e.preventDefault();
            e.stopPropagation();
            scmove.y0 = e.changedTouches[0].pageY;
        },
        touchmove: function(e){
            e.preventDefault();
            //e.stopPropagation();
            scmove.y1 = e.changedTouches[0].pageY;
            scmove.yt = scmove.y1 - scmove.y0;
            if (scmove.yt && scmove.yt>60) {
                $div01.addClass('active');
            }
        }
    });
 
    $('#stateCircle .yes').on('touchend', function(){
        //console.log(axisAdrr,tempSC);
        if (axisAdrr.indexOf(tempSC)<0 && (axisAdrr.length==0 || axisAdrr[axisAdrr.length-1]<tempSC)){

            $div01.removeClass('active');
            axisAdrr.push(tempSC);
            $('.addcir').remove();
            $axis01.append('<div class="addcir1 ct"><span><em>'+map[tempSC]+'</em></span></div>');

            setTimeout(function(){
                document.body.className = 'pg0show';
                init0();
            }, 1000);

        }else{
            tools.toast('您选的站点已经路过了哦～');
        }
        
    });
    $('#stateCircle .no').on('touchend', function(){
        $div01.removeClass('active');
    });

    $('.sub-div0').on('touchend', function(e){
        document.body.className = 'pg0show pg0sub';
    });

    //删除功能
    $('#div0 .cir').on({
        touchstart: function(e){
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
            }else{

                if (this.classList.contains('nc')) {
                    this.className = 'cir nextcir';
                }

                $div0.removeClass('delete');
                $(this).css({'transform': 'translate3d(0, 0, 0)', '-webkit-transform':  'translate3d(0, 0, 0)'});
            }
 
        }
    });

    /*第1屏==================================================================================*/

    $('.sitmap span').on('touchend', function(e){
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('sel').siblings().removeClass('sel');
        $('.sub11 .mc, .sub10 .mc')[0].className = ('mc m'+$(this).index());
    });

    var hammer1 = new Hammer(document.getElementById("div1"));
        hammer1.get("pinch").set({ enable: true });

        // hammer1.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
        // hammer1.add( new Hammer.Tap({ event: 'singletap' }) );

        // hammer1.get('doubletap').recognizeWith('singletap');
        // hammer1.get('singletap').requireFailure('doubletap');

        hammer1.on("pinchend", function (e) {
            document.body.className = 'pg1show pg1sub1';
        });
        
        // hammer1.on("panleft panright", function (e) {
        //     document.body.className = 'pg1show pg1sub0';
        // });

        // hammer1.on("doubletap", function (e) {
        //     alert(1);
        //     document.body.className = 'pg1show pg1sub2';
        // });

//     $('.div1').bind('swipeone', function(e){
//         e.preventDefault();
//         e.stopPropagation();
//         document.body.className = 'pg1show pg1sub0';
//     });

//     $('.div1').bind('pinch', function(e){
//         e.preventDefault();
//         e.stopPropagation();
//         alert('pinch');
//         document.body.className = 'pg1show pg1sub1';
//     });
// alert('1');
//     $('.div1').bind('swipetwo', function(e){
//         e.preventDefault();
//         e.stopPropagation();
//         alert('swipetwo');
//         document.body.className = 'pg1show pg1sub2';
//     });


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
            }

        },
        touchend: function(e){
            e.preventDefault();
            tools.timer(false, function(){
                document.body.className = 'pg1show';
                tools.timer(true);
            }, 2000);
        }
    });

    /*第2屏==================================================================================*/




    /*页面对浏览器默认事件做的各种兼容=======================================================*/
    $('.div0, .pg1, .pg2').on('touchstart touchmove touchend', function(e){
        e.preventDefault();
        // e.stopPropagation();
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