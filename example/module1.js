defineM(function(mod2) {
    console.log('module1 started!', this);
    console.log('used', mod2);
    console.log('module1 done!');
    return this;
},['module2']);