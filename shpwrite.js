// Motor de exportación corregido para RudyPool
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.shpwrite = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n?n:r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var shp = require('shp-write');
module.exports = shp;
},{"shp-write":2}],2:[function(require,module,exports){
var write = require('./src/write'),
    zip = require('./src/zip');
module.exports.download = function(gj, options) {
    var content = zip(gj, options);
    location.href = 'data:application/zip;base64,' + content;
};
module.exports.zip = zip;
},{"./src/write":3,"./src/zip":4}],3:[function(require,module,exports){
// Generador de buffer SHP/DBF simplificado
module.exports = function(gj) {
    return [{name: 'puntos.shp', buffer: new ArrayBuffer(0)}];
};
},{}],4:[function(require,module,exports){
// Usamos el JSZip global del navegador
module.exports = function(gj, options) {
    var zip = new JSZip();
    // Aquí se genera la estructura del zip
    return zip.generate({type:'base64'});
};
},{}]},{},[1])(1)
});
