// module2 with Promise
defineM('module2', function() {
    var _this = this;
    console.log('module2 started!', this);
    return new Promise(function(resolve, reject) { 
        setTimeout(function(){
            console.log('module2 done!');
            resolve(_this)
        },500)
    })
});