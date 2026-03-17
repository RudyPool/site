(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.shpwrite = f()}})(function(){
    // MOTOR BINARIO SHP-WRITE INTEGRADO
    var shpwrite = (function() {
        var exports = {};
        exports.download = function(gj, options) {
            var content = exports.zip(gj, options);
            var link = document.createElement('a');
            link.href = 'data:application/zip;base64,' + content;
            link.download = (options.folder || 'export') + '.zip';
            link.click();
        };
        exports.zip = function(gj, options) {
            var zip = new window.JSZip();
            var out = exports.write(gj.features.map(function(f) { return f.geometry.coordinates; }), 
                                   gj.features.map(function(f) { return f.properties; }));
            
            var name = options.types.point || 'puntos';
            zip.file(name + '.shp', out.shp.buffer);
            zip.file(name + '.shx', out.shx.buffer);
            zip.file(name + '.dbf', out.dbf.buffer);
            zip.file(name + '.prj', 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]');
            return zip.generate({type: 'base64'});
        };
        exports.write = function(coords, props) {
            // LÓGICA DE ESCRITURA DE BYTES (Simplificada para puntos)
            var shp = new DataView(new ArrayBuffer(100 + (coords.length * 28)));
            var shx = new DataView(new ArrayBuffer(100 + (coords.length * 8)));
            var dbf = new DataView(new ArrayBuffer(100 + (props.length * 32))); // Muy simplificado

            // Cabecera SHP estándar (File Code 9994)
            shp.setInt32(0, 9994); shp.setInt32(24, (100 + coords.length * 28) / 2); shp.setInt32(28, 1000, true); shp.setInt32(32, 1, true);

            coords.forEach(function(c, i) {
                var offset = 100 + (i * 28);
                shp.setInt32(offset, i + 1); shp.setInt32(offset + 4, 10, true); // Numero de record
                shp.setInt32(offset + 8, 1, true); // Tipo punto
                shp.setFloat64(offset + 12, c[0], true); shp.setFloat64(offset + 20, c[1], true);
            });

            return { shp: shp, shx: shx, dbf: dbf };
        };
        return exports;
    })();
    return shpwrite;
});
