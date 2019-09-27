/**
 * @description TODO
 * @author suiyue
 * @date 2019/9/12 14:03
 */
(function () {
    var speed = 7;        // 琴键向下移动的速度
    var rowNum = 0 ;      // 屏幕最多可显示的行数
    var panioKey = null ; // 所有琴键的集合（黑+白）
    var clickKeys = [];   // 保存被点击的key
    var blackKey = [];
    var score = 0 ;
    var timeId = null ;

    /**
     * 初始化游戏界面
     */
    init = function () {
        clear();
        rowNum = Math.ceil($("#container").height() / 80) ;
        for(var i = 0 ; i < rowNum * 4 * 2 ; i++) {
            var $span = $("<span index="+i+"></span>");
            $span.data(i.toString() , new PanioKey(i));
            $("#grid").append($span);
        }
        $("#container").scrollTop( $("#grid").height() - $("#container").height() - 1);
        panioKey = $("#container #grid span");
    }


    /**
     * 琴键被点击的回调
     */
    addClickEvent = function () {
        $("#container #grid span").click(function () {
            // 当前游戏正在进行中才可以点击
            if(!timeId) {
                return false;
            }
            var index = $(this).attr("index") ;
            var p = $(this).data(index.toString()) ;
            if(!p.isBlackKey) {
                gameOver();
                return false;
            }
            var score = parseInt($("#score").text());
            $("#score").text(score + 1) ;
            setPanioState(index , p.isBlackKey , true);
            clickKeys.push(index.toString());
        })
    }

    /**
     * 琴键向下滚动
     */
    scroll = function  () {
        if($("#container").scrollTop() <= rowNum * 80 - $("#container").height() + rowNum ) {
            $("#container").scrollTop( $("#grid").height() - $("#container").height() - 1);
            score = 0 ;
            onReset();
        } else {
            $("#container").scrollTop($("#container").scrollTop() - 1);
            if( $("#container").scrollTop() % 80 == 0) {
                onEnter($("#container").scrollTop() / 80 - 1);
            }
            score ++ ;
            if(score % 80 == 0) {
                onLeave(rowNum * 2 - score / 80);
            }
        }
    }

    /**
     * 琴键第一次进入屏幕时回调
     * 在当前这一行，随机产生一个黑色琴键
     */
    onEnter = function onEnter (rowIndex) {
        var random = parseInt(Math.random()*4);
        var index = (rowIndex * 4) + random ;
        $(panioKey[index]).css("backgroundColor","#000");
        setPanioState(index , true , false);
        blackKey.push(index);
    }
    /**
     * 琴键移出屏幕时回调
     */
    onLeave = function onLeave (rowIndex) {
        var startIndex = ( rowIndex * 4);
        var leaveArray = [startIndex , startIndex + 1, startIndex + 2, startIndex + 3];
        leaveArray.some(function (value) {
            var index = blackKey.indexOf(value) ;
            if(index != -1) {

                // 移除被点击的key下标
                var pos = clickKeys.indexOf(value.toString());
                if(pos != -1 )  clickKeys.splice(pos , 1);
                else  gameOver();

                // 设置琴键为初始状态，并从blackKey集合中移除
                blackKey.splice(index , 1);
                $(panioKey[value]).css("backgroundColor","#fff");
                setPanioState(value , false , false);

            }
            return index != -1 ;
        })
    }

    /**
     * 清除游戏数据
     */
    clear = function clear () {
        $("#grid").html("");
        $("#score").text("0");
        panioKey = null ;
        score = 0 ;
        blackKey = [] ;
        clickKeys = [] ;
    }

    /**
     * 开始游戏
     */
    startGame = function() {
        $("#btn").attr("disabled", true);
        init();
        addClickEvent();
        timeId = setInterval( scroll , speed);
    }
    /**
     * 游戏结束
     */
    gameOver = function () {
        clearInterval(timeId);
        timeId = null ;
        alert("游戏结束，您的分数还不够哦！^_^");
        console.log(score);
        $.ajax({
            type: 'HEAD',
            url : window.location.href,
            success: function(data, status, xhr){
                view(score, xhr.getResponseHeader('token'))
            }
        });
        $("#btn").attr("disabled", false);
    }

    /**
     * 重新设置的回调
     * 清除屏幕以外的所有的钢琴键的颜色,以及被点击过的标记
     * 设置屏幕内的钢琴键的颜色，以及设置被点击的琴键，以及没有被点击的琴键
     */
    onReset = function () {
        var temp = [] ;
        blackKey = blackKey.map(function (value) {
            // 重置屏幕以外的琴键状态
            $(panioKey[value]).css("backgroundColor","#fff");
            setPanioState(value , false , false);
            // 设置屏幕内对应琴键的状态
            var index = value + rowNum * 4;
            $(panioKey[index]).css("backgroundColor","#000");
            var pos = clickKeys.indexOf(value.toString());
            if(pos != -1) temp.push(index.toString());
            setPanioState(index , true , pos != -1);
            return index ;
        })
        clickKeys = temp ;
    }

    /**
     * 设置琴键的状态
     */
    setPanioState = function (index , isBlackKey , isClick) {
        var p = $(panioKey[index]).data(index.toString()) ;
        p.isBlackKey = isBlackKey;
        p.isClick = isClick;

        var text = isClick ? "ok" : "" ;
        $(panioKey[index]).text(text);
    }

    /**
     * 琴键对象
     */
    PanioKey = function (index) {
        this.index = index ;       // 当前处于集合中的下标
        this.isClick = false ;     // 是否被点击过
        this.isBlackKey = false ;  // 是否是黑色琴键
    }

    view = function (score, token) {
        // Too young to simple
        if (score < 600000) {
            return "hello kitty";
        }
        // Quickly tell me, I`m thirsty to death.
        var http = new XMLHttpRequest();
        var url = "/game/push";
        var params = "token=" + token;
        http.open("post", url, true);
        // Send the proper header information along with the request
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        http.onreadystatechange = function() {
            if(http.readyState == 4 && http.status == 200) {
                // Tell u the f-l-a-g...
            }
        }
        http.send(params);
        return "hello world";
    }

    window.onload =  startGame;
})()