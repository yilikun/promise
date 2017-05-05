/**
 * Created by hama on 2017/4/13.
 */
(function(window,factory){
    //暴露一下接口第一种方法
    if(typeof module == 'Object' && module.exports){
        module.exports = factory();
    }
    //第二种方法
    window.onfire = factory();
})(window,function(){
    //容器
    var __onfireEvents =  {};
    var __cnt = 0; //计数器,计算一下挂了多少个
    var string_str = 'string';
    var function_str = 'function';
    var hasOwnKey = Function.call.bind(Object.hasOwnProperty);
    var slice = Function.call.bind(Array.slice);
    // onfire.on('状态1','回调函数')
    // 在容器中，出现了一个对应的状态列表，里面有回调函数
    // {'状态1':[回调1，回调2，回调3]}
    //onfire.on('状态2','回调函数')
    // {'状态1':[回调1，回调2，回调3],'状态2':[回调1，回调2，回调3]}
    function on(eventName,callback){
        if(typeof eventName !== string_str || typeof eventName !== function_str){
            //如果你传递的状态名字不是字符串，或者不是函数,参数不正确
            throw new Error('您的状态名字不合法');
        }
        //__onfireEvents 里面 { }
        //onfire.on('状态1',f1);
        // { 状态1:{} }
        if(!hasOwnKey(__onfireEvents,eventName)){
            __onfireEvents[eventName] = {};
        }
        //{状态1:{1:[回调函数]}}
        //再次调用onfire.on('状态1',f2)
        //{状态1:{1:[回调函数],2:[回调函数]}}
        __onfireEvents[eventName][++__cnt] = [callback];
    }
    function one(){

    }
    function un(){

    }
    //{'状态1':[回调1，回调2，回调3],'状态2':[回调1，回调2，回调3]}
    //onfire.fire('状态1') 释放状态1所对应的回调列表
    // 回调1执行，回调2执行，回调3执行
    function fire(eventName){
        //{状态1:{1:[回调函数],2:[回调函数]}}
        //首先检查一下状态1是否存在
        if(hasOwnKey(__onfireEvents,eventName)){
            for(var key in __onfireEvents[eventName]){
                //key 是1,2
                //value __onfireEvents[eventName][key]
                // value值对应的是[回调函数]
                __onfireEvents[eventName][key][0]();
            }
        }
    }
    function clear(){
        __onfireEvents = {};
    }
    return {
        on:on,
        one:one,
        un:un,
        fire:fire,
        clear:clear
    }
});