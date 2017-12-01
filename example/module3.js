// module3 with Promise
defineM(['module1','module2','module4'], function(mod1,mod2,mod4) {
    var _this = this;
    console.log('module3 started!', this);
    console.log('used', mod1,mod2,mod4);
    return new Promise(function(resolve, reject) { 
        setTimeout(function(){
            console.log('module3 done!');
            resolve(_this)
        },500)
    })
});