# mongoscripter.js
A MongoDB Script Version Manager

## Purpose

If you are looking for similar too as fluentmigrator for MongoDB.

## Dependency
* mongoose
* jQuery
* Node.Js

## How to Use?

 Create file version-1.js
```javascript
//Put path of mongoscripter.js
var mongoscripter = require('../../tools/mongoscripter.js');

mongoscripter.version
        .scriptVersion(1) // Version No of the script you done.
        .up(function (ms) {
            console.log("Version 1 Up");
            var Cat = ms.model('Cat', { name: String });
        
            var kitty = new Cat({ name: 'Zildjian' });
             kitty.save(function (err) {
             if (err) // ...
               console.log('meow');
            });
        }).down(function (ms) {
         console.log("Version 1 down");
        });
```

Create another comman file for all version file to refrance file.

```javascript
//Put path of file you have created for you versions.
require('./versions/version-1.js');
require('./versions/version-2.js');// more you have added.
```
Put this code in server.js File
```javascript
require('./scriptor/refreance.js');
var mongoscripter = require('./tools/mongoscripter.js');

mongoscripter.bootstrap("mongodb://localhost:27017/Back2School"); // this line should be before  "app.listen(port);"
```
