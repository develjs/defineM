/**
 * defineM - Loading modules in AMD style with support for asynchronous module load waiting.  
 * 
 * @author lexab <develjs@gmail.com>
 * @description  
 * Basic syntax: defineM([name], func, [deps]) or defineM([name], deps, func);  
 * 
 * Example:
 * 
 *      // define you module in separete file in path 'some/module/path.js'
 *      defineM('module name', ['module1', 'module2()', 'module2'], function(mod1, wraped_module2_value, original_module2_func) { // mod1 - module1 value
 *          // this == {name: 'module name', path: 'some/module/path.js', deps:['module1'] ...} // module instance
 *          
 *          var result={};
 *          // ...
 *          return result; // return as module-value
 *      });
 *
 *      // module1 definition
 *      defineM('module1', function() { 
 *          var module1_value={};
 *          // ...
 *          return module1_value; // return as module-value
 *      });
 *
 *      // module2 definition
 *      defineM('module2', function() { // mod1 - module1 value
 *          // this == {name: 'module name', path: 'module/path', deps:['module1'] ...} // module instance
 *          return new Promise(function(resolve, reject){ // resolve result return as module-value
 *              ...
 *              var wraped_module2_value = { // may be some type, for examale function
 *                  // ... 
 *              }; 
 * 
 *              resolve(function(unit) { // this function is the returned module-value
 *                  // if recieve a some unit then this call is wapped call as 'module2()'
 *                  if ((typeof unit=='object') && unit.func) { 
 *                      return wraped_module2_value;
 *                  }
 *                  else 
 *                      return original_module2_func.apply(this, arguments); // if module 
 *              }) 
 * 
 *              function original_module2_func(some,args) {
 *                  ...
 *              }
 * 
 *          })
 *      });
 *
 * 
 * Module function return value that passed to childs modules as module-value.  
 * Module function may be standart or jQuery Promise, that resolve result is module-value.  
 * Modules identiying by "name" or "path".  
 */
(function() {
    var modules = []; // modules is not runed 
    var ready_results = {}; // ready results
    
    /** 
     * define([name], func, [deps]);
     * @param {String} name - name of unit
     * @param {Function} func - init description function
     * @param {String[]} deps - modules list dependence from
     * @return {Any|Promise|undefined} - module instance value, if return Promise then wait for module loaded and return promise result as module instance.
     */
    function defineM(name, deps, func) {
        var unit = {};
        for (var i=0; i<3; i++) {
            if (typeof arguments[i]=='string')
                unit.name = arguments[i];
            else if (typeof arguments[i]=='function')
                unit.func = arguments[i];
            else if ((typeof arguments[i]=='object') && (arguments[i] instanceof Array)) {
                unit.deps = arguments[i];
            }
        }
        if (!unit.func) {
            console.error("Error: no function while module define", arguments);
            return;
        }
            
        // path and name
        unit.path = getCurrentPath();
        unit.name = unit.name || unit.path.replace(/\.js$/,'');
        
        // store and run;
        modules.push(unit);
        runAllReady();
        
        return unit;
    }
    
    // check for ready all units
    var is_runned;
    var do_rerun;
    function runAllReady() {
        if (is_runned) {
            do_rerun = true;
            return;
        }
        is_runned = true;
        do_rerun = false;
        
        
        // run circle
        var im = 0;
        while (im < modules.length) {
            if (runUnit(modules[im])) 
                modules.splice(im, 1);
            else
                im++;
        }
        
        
        if (do_rerun) 
            setTimeout(runAllReady, 1);
            
        is_runned = false;
        do_rerun = false;
    }
    
    // check unit is ready to run and run it
    function runUnit(unit) {
        // check ready deps
        var args = [];
        if (unit.deps) {
            for (var i=0; i<unit.deps.length; i++) {
                var dep = unit.deps[i].replace(/\(\)$/,'');
                if (dep in ready_results) 
                    args.push(ready_results[dep]);
                else 
                    return; // pass module if some depens is unfinished
            }
            
            // exec runable include module with name 'module_name()'
            for (var i=0; i<unit.deps.length; i++) 
                if (/\(\)$/.test(unit.deps[i]))
                    try {
                        args[i] = args[i](unit);
                    }
                    catch(e) {
                        console.error('Error while execute include', unit.deps[i], 'for module', unit, e);
                    }
        }
            
        
        // execute
        var result;
        try {
            result = unit.func.apply(unit, args);
        }
        catch(e) {
            console.error('Error while execute module ', unit.path || unit.name, e);
        }
        
        // check if promise then ready to result
        if ((typeof result == 'object') && result.then) // && ((result instanceof Promise) || jQuery)
            result.then(
                function(result) { // Promise.onFulfilled==jQuery.doneFilter
                    done(unit, result)
                },
                function(reason) { // Promise.onRejected==jQuery.failFilter
                    console.error('Error while execute module ', unit.path || unit.name, reason);
                    done(unit);
                }
            );
        else
            done(unit, result);
        
        return true; // unit is runed!
    }
    
    // save and check ready
    function done(unit, result) {
        // console.log('done', unit.name, result);
        unit.result = result;
        
        if (unit.name || unit.path){  // pass result of unnamed unit
            // save result to ready and re-run check
            if (unit.name) ready_results[unit.name] = result;
            if (unit.path) ready_results[unit.path] = result;
            runAllReady();
        }
    }

    // found script
    function getCurrentPath() {
        var scripts = document.getElementsByTagName('script');
        var myScript = scripts[scripts.length - 1];
        var path = myScript && myScript.src || '';
        
        // remove base path
        var base = /^([^?]*)\/[^?]*/.exec(window.location.href)[1] + '/';
        if (path.startsWith(base))
            path = path.replace(base, '');
        return path;
    }

    // exports
    window.defineM = defineM;
})()