/**
 * Created by hama on 2017/4/14.
 */
//自己创建一个Promise对象
var Promise = (function(){
    function Promise(resolver){
        //首先判断一下传递过来的是否是合法的函数
        if(typeof resolver !== 'function'){
            throw new TypeError('Promise resolver ' + resolver + 'is not a function')
        }
        //看里面的this指向是否正确，如果不正确，则返回一个新的promise对象
        if(!(this instanceof Promise)) return new Promise(resolver);
        this.callbacks = [];
        this.status = 'pending';
        //成功的释放函数
        function resolve(value){
            //如果当前传递的值是一个promise对象的话,则直接调用这个对象上的then方法
            if(value instanceof Promise){
                return value.then(resolve,reject)
            }
            //这里面的代码是异步的
            setTimeout(function(){
                if(this.status !== 'pending'){
                    return;
                }
                this.status = 'resolved';
                this.data = value;
                //如果成功了，则调用回调函数列表中的函数，并传递value值
                for (var i = 0; i < this.callbacks.length; i++) {
                    this.callbacks[i].onResolved(value)
                }
            })
        }
        //失败的调用函数
        function reject(reason){
            setTimeout(function(){
                if(this.status !== 'pending'){
                    return;
                }
                this.status = 'rejected';
                this.data = reason;
                for (var i = 0; i < this.callbacks.length; i++) {
                    this.callbacks[i].onRejected(reason)
                }
            })
        }
        try {
            //往这个函数中扔两个方法,resolve成功，reject失败
            resolver(resolve,reject);
        }catch(e){
            //如果在这个过程中发生任何问题，都将错误对象扔给reject
            reject(e)
        }
    }
    //支持高级链式操作，如果在then方法中返回一个异步任务的话
    //那么接下来你再调用then方法就是处理这个异步任务
    //.then(任务1结束,return 任务2).then(处理任务2)
    function resolvePromise(promise,x,resolve,reject){
        var then;
        var thenCalledOrThrow = false;
        if(promise === x){
            return reject(new TypeError('Chaining cycle detected for promise!'));
        }
        //如果返回的是一个异步的任务2对象,再次调用.then方法的时候
        //直接调用任务中的.then方法.
        if (x instanceof Promise) {
            //如果这个异步任务2的状态依然是pending状态
            //也就是在这个异步任务中并没有resolve和reject
            //则依然是直接调用这个任务的resolve,reject
            //不同的是成功时候的处理变成了抛出一个错误对象.
            if (x.status === 'pending') {
                x.then(function(v) {
                    resolvePromise(promise, v, resolve, reject);
                }, reject);
            } else {
                x.then(resolve, reject)
            }
            return
        }
        //如果返回的是一个对象或者是一个函数
        if ((x !== null) && ((typeof x === 'object') || (typeof x === 'function'))) {
            try {
                then = x.then
                if (typeof then === 'function') {
                    then.call(x, function rs(y) {
                        if (thenCalledOrThrow) return
                        thenCalledOrThrow = true
                        return resolvePromise(promise, y, resolve, reject)
                    }, function rj(r) {
                        if (thenCalledOrThrow) return
                        thenCalledOrThrow = true
                        return reject(r)
                    })
                } else {
                    return resolve(x)
                }
            } catch(e) {
                if (thenCalledOrThrow) return
                thenCalledOrThrow = true
                return reject(e)
            }
        } else {
            return resolve(x)
        }
    }
    Promise.prototype.then = function(onResolved,onRejected){
        // then方法中可以传递两个函数，一个是成功的时候调用的函数，另外一个是失败的时候调用的函数
        onResolved = typeof onResolved === 'function' ? onResolved : function(v){return v}
        onRejected = typeof onRejected === 'function' ? onRejected : function(r){throw r}
        //判断的依据是在resolver中你调的是resolved就执行onResolved ,反之onRejected
        //并且then方法应该是可以进行链式调用的，所以，then方法应该返回一个promise对象
        var promise2 ;
        if(this.status === 'resolved'){
            //说明调用了成功
            //then方法返回一个新的promise对象，这个promise对象
            //
            return promise2 = new Promise(function(resolve,reject){
                setTimeout(function(){
                    try {
                        //value可能返回下一个异步的任务
                        var value = onResolved(this.data);
                        //新的promise对象和下一个异步任务
                        resolvePromise(promise2,value,resolve,reject);
                    }catch (e){
                        return reject(e);
                    }
                })
            })
        }
        if (self.status === 'rejected') {
            return promise2 = new Promise(function(resolve, reject) {
                setTimeout(function() {
                    try {
                        var value = onRejected(this.data)
                        resolvePromise(promise2, value, resolve, reject)
                    } catch(e) {
                        return reject(e)
                    }
                })
            })
        }
        if (self.status === 'pending') {
            return promise2 = new Promise(function(resolve, reject) {
                this.callbacks.push({
                    onResolved: function(value) {
                        try {
                            var value = onResolved(value)
                            resolvePromise(promise2, value, resolve, reject)
                        } catch(e) {
                            return reject(e)
                        }
                    },
                    onRejected: function(reason) {
                        try {
                            var value = onRejected(reason)
                            resolvePromise(promise2, value, resolve, reject)
                        } catch(e) {
                            return reject(e)
                        }
                    }
                })
            })
        }
    }


    //在这个自执行的函数中返回一个用于管理异步的promise构造函数
    return Promise;

})()
//在外部调用的时候直接使用var promise = new Promise(function(){})来进行管理就可以了.

