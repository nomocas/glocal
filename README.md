# glocal

(Yet another) PromiseA+ implementation with concurrent context management.

Based on minimal standard Bram Stein implementation (https://github.com/bramstein/promis).

It has been developed to have PromiseA+ compliant tools that manage "glocal context" pattern.
So small pattern, but so powerful...;)

Still lightweight : 3.5 Ko minified, 1.3 Ko gzipped.

Version changes : 

- AMD/CommonJS/Global in place of Closure compiled
- glocal context management (the aim of this implementation)
- log familly API (for debugging facilities)
- remove polyfill (because it's more than a polyfill now)

# Main idea

As Kris Zyp says in promised-io docs (https://github.com/kriszyp/promised-io) from where I took the "glocal" pattern :

> One of the challenges with working asynchronous code is that there can be times when you wish for some contextual state information to be preserved across multiple asynchronous actions, without having to actually pass the state to each function in the asynchronous chain. Common examples of such contextual state would be tracking the current transaction or the currently logged in user. Such state information could be stored in a singleton (a module property or a global variable), but with asynchronous actions being interleaved, this is unsuitable for tracking state across asynchronous continuations of an action.
> The promised-io package's promise module provides a facility for tracking state across asynchronous operations. The promise module tracks the "currentContext" global variable, and whatever value that was in the variable at the time a promise was created will be restored when that promise is fulfilled (or rejected).


## Tests

### Under nodejs

You need to have mocha installed globally before launching test. 
```
> npm install -g mocha
```
Do not forget to install dev-dependencies. i.e. : from 'glocal' folder, type :
```
> npm install
```

then, always in 'glocal' folder simply enter :
```
> mocha
```

### In the browser

Simply serve "glocal" folder in you favorite web server then open ./index.html.

For that, you could use the provided "gulp web server" by entering :
```
> gulp serve-test
```

## Licence

Original source : (https://github.com/bramstein/promis)
Copyright (c) 2014 - Bram Stein

Modifications : replace closure by AMD/CommonJS/Global + glocal context + log familly + remove polyfill
Copyright (c) 2015 Gilles Coomans

All rights reserved.

Redistribution and use in source and binary forms, with or without 
modification, are permitted provided that the following conditions 
are met:
 
 1. Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer. 
 2. Redistributions in binary form must reproduce the above copyright 
    notice, this list of conditions and the following disclaimer in the 
    documentation and/or other materials provided with the distribution. 

THIS SOFTWARE IS PROVIDED BY THE AUTHOR "AS IS" AND ANY EXPRESS OR IMPLIED 
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF 
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO 
EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY 
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING 
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, 
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
