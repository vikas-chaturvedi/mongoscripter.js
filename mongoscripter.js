module.exports = (function () {
    
    var mongoose = require('mongoose');
    var db = mongoose.connection;
    
    var _isInitilize = false;
    var _connectionString = "";
    var _database = "";
    var _MS = [];
    var exec = require('child_process').execFile;
    var versionManager = function () {
        
        this.versionNumber = 0;
        this.upScript = function (ms) { };
        this.downScript = function (ms) { };

    };
    
    versionManager.prototype.scriptVersion = function (versionNumber) {
        if (typeof versionNumber === "number") {
            this.versionNumber = versionNumber;
            if (isExists(_MS, versionNumber)) {
                throw "version already exists.";
            }
            else {
                
                var versionObject = new versionManager();
                versionObject.versionNumber = versionNumber;
                _MS.push(versionObject);
            }
        }
        else {
            throw "version number should be numeric value.";
        }
        return this;
    };
    
    versionManager.prototype.up = function (upCallback) {
        if (typeof upCallback === "function") {
            var vn = this.versionNumber;
            findAssigenScript(_MS, vn, upCallback, undefined);
        }
        else {
            throw "upCallback should be a function.";
        }
        return this;
    };
    
    
    
    versionManager.prototype.down = function (downCallback) {
        if (typeof downCallback === "function") {
            var vn = this.versionNumber;
            findAssigenScript(_MS, vn, undefined, downCallback);
        }
        else {
            throw "downCallback should be a function.";
        }
        return this;
    };
    
    var isExists = function (vArray, number) {
        var msObject = vArray.filter(function (ms) {
            return ms.versionNumber === number;
        });
        return msObject != undefined && msObject.length > 0;
    };
    
    var findAssigenScript = function (vArray, number, up, down) {
        if (isExists(vArray, number)) {
            var msObject = vArray.filter(function (ms) {
                return ms.versionNumber === number;
            });
            if (msObject != undefined && msObject.length > 0) {
                var indx = vArray.indexOf(msObject[0]);
                
                msObject[0].downScript = down != undefined && typeof down === "function"? down:msObject[0].downScript;
                msObject[0].upScript = up != undefined && typeof up === "function"? up:msObject[0].upScript;
                vArray[indx] = msObject[0];
            }
        }
    };
    
    var getAllScript = function (latestVersion) {
        var msObject = _MS.filter(function (ms) {
            return ms.versionNumber > latestVersion;
        });
        return msObject;
    };
    
    var _init = function (connectionString) {
        _isInitilize = true;
        _connectionString = connectionString;
        mongoose.connect(connectionString);
    };
    
    var validateVersions = function () {
        
        var dbVersionSchema = new mongoose.Schema({
            version: { type: Number }
            , date: Date
        });
        var Versions = mongoose.model('Versions', dbVersionSchema);
        
        var upgradeVersion = function (scriptVersion) {
            var currentVersion = new Versions({
                version: scriptVersion
                , date: Date.now()
            });
            
            currentVersion.save(function (err, currentVersion) {
                if (err) return console.error(err);
                    //console.dir(firstVersion);
            });
        };
        
        var latestVersion = null;
        Versions.find({}).limit(1).sort("-version").exec(function (err, ver) {
            if (err) return console.error(err);
            
            if (ver && ver.length > 0) {
                latestVersion = ver[0];
            }
            
            if (latestVersion === undefined || latestVersion === null) {
                latestVersion = { version: 0 };
            }
            var scripts = getAllScript(latestVersion.version);
            
            if (scripts != undefined && scripts.length > 0) {
                scripts.forEach(function (s) {
                    if (s != undefined) {
                        try {
                            s.upScript(mongoose);
                            upgradeVersion(s.versionNumber);
                        }
                        catch (err) {
                            console.error(err);
                        }
                        
                    }
                });
            }

            else {
                
                
            }
        });
    };
    
    var bootstrap = function (connectionString) {
        _init(connectionString);
        validateVersions();
    };
    
    var runDownForVersion = function (versionNo) {
        var msObject = _MS.filter(function (ms) {
            return ms.versionNumber == versionNo;
        });
        
        if (msObject != null || msObject != undefined) {
            msObject.forEach(function (s) {
                if (s != undefined) {
                    try {
                        s.downScript(mongoose);
                    }
                        catch (err) {
                        console.error(err);
                    }
                        
                }
            });
        }
    };
    
    return {
        bootstrap: bootstrap,
        version: new versionManager(),
        runDownFor: new runDownForVersion
    };
    
    

}());
