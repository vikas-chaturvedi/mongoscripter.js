# mongoscripter.js
A MongoDB Script Version Manager

## Purpose

If you are looking for 

## Dependency
* mongoose
* jQuery
* Node.Js

## How to Use?


```javascript
var mongoscripter = require('../../tools/mongoscripter.js');

mongoscripter.version
        .scriptVersion(1)
        .up(function (ms) {
    console.log("Version 1 Up");
})
        .down(function (ms) {
    console.log("Version 1 down");
});
```
