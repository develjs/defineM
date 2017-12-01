defineM - Loading modules in AMD style with support for asynchronous module load waiting.  
Module function return value that passed to childs modules as module-value.  
The module function can return a standard Javascript Promise or jQuery Promise, the result of which is the instance of this module.
Modules are identified by "name" or "path".

### Syntax
Basic:
    
        defineM([module name], facility, [deps])
        defineM([module name], deps, facility)

Variants of use:
    
        defineM(function(){/*... module content ...*/})
        defineM(function(){/*... module content ...*/}, ['module1','module2'])
        defineM('module_name', function(){/*... module content ...*/})
        defineM(['module1','module2'], function(){/*... module content ...*/})
        defineM(function(){/*... module content ...*/}, ['module1','module2'], 'module_name')
        ... and so on
        

### Examples
Define your module as separate file in 'some/module/path.js'
     
     defineM('module name', ['module1', 'module2()', 'module2'], function(mod1, wraped_module2_value, original_module2_func) { 
         // mod1 - module1 value
         // this == {name: 'module name', path: 'some/module/path.js', deps:['module1'] ...} // module instance
         
         var result={};
         // ...
         return result; // return as module-value
     });

**Module1 definition:**

     defineM('module1', function() { 
         var module1_value={};
         // ...
         return module1_value; // return as module-value
     });

**Module2 definition - async loading:**

     defineM('module2', function() { // mod1 - module1 value
         // this == {name: 'module name', path: 'module/path', deps:['module1'] ...} // module instance
         return new Promise(function(resolve, reject){ // resolve result return as module-value
             ...
             var wraped_module2_value = { // may be some type, for examale function
                 // ... 
             }; 

             resolve(function(unit) { // this function is the returned module-value
                 // if recieve a some unit then this call is wapped call as 'module2()'
                 if ((typeof unit=='object') && unit.func) { 
                     return wraped_module2_value;
                 }
                 else 
                     return original_module2_func.apply(this, arguments); // if module 
             }) 

             function original_module2_func(some,args) {
                 ...
             }

         })
     });


See also: [Example](/example/test.html)