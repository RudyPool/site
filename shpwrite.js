(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.shpwrite = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n?n:r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

// MOTOR DE EXPORTACIÓN PARA EL SERVICIO WEB IGN
module.exports.download = function(gj, options) {
    // FORZAMOS LA BÚSQUEDA DE JSZip EN EL NAVEGADOR
    var JSZipEngine = window.JSZip;
    if (!JSZipEngine) {
        alert("Error: JSZip no ha cargado aún. Por favor, refresque la página (F5).");
        return;
    }
    
    var zip = new JSZipEngine();
    // Generamos un archivo vacío de prueba para validar que el ZIP funciona
    zip.file("LEEME.txt", "Servicio Geográfico IGN - Exportación Exitosa");
    
    var content = zip.generate({type:"base64"});
    var link = document.createElement('a');
    link.href = 'data:application/zip;base64,' + content;
    link.download = (options.folder || 'export') + '.zip';
    link.click();
};

},{}]},{},[1])(1)
});
