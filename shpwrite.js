(function(f){
    if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}
    else if(typeof define==="function"&&define.amd){define([],f)}
    else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.shpwrite = f()}
})(function(){
    return {
        download: function(gj, options) {
            if (!window.JSZip) return alert("Error: JSZip no cargó.");
            const zip = new window.JSZip();
            const fileName = options.types.point || 'puntos_ign';
            
            const coords = gj.features.map(f => f.geometry.coordinates);
            const props = gj.features.map(f => f.properties);

            // --- 1. GENERAR SHP (Geometría) ---
            const shpSize = 100 + (coords.length * 28);
            const shp = new DataView(new ArrayBuffer(shpSize));
            shp.setInt32(0, 9994); // File Code
            shp.setInt32(24, shpSize / 2); // File Length (16-bit words)
            shp.setInt32(28, 1000, true); // Version
            shp.setInt32(32, 1, true); // Shape Type (Point)
            
            coords.forEach((c, i) => {
                let off = 100 + (i * 28);
                shp.setInt32(off, i + 1); // Record Number
                shp.setInt32(off + 4, 10); // Content Length (10 words = 20 bytes)
                shp.setInt32(off + 8, 1, true); // Type: Point
                shp.setFloat64(off + 12, c[0], true); // X
                shp.setFloat64(off + 20, c[1], true); // Y
            });

            // --- 2. GENERAR SHX (Índice) ---
            const shxSize = 100 + (coords.length * 8);
            const shx = new DataView(new ArrayBuffer(shxSize));
            shx.setInt32(0, 9994);
            shx.setInt32(24, shxSize / 2);
            shx.setInt32(28, 1000, true);
            shx.setInt32(32, 1, true);
            coords.forEach((c, i) => {
                let off = 100 + (i * 8);
                shx.setInt32(off, (100 + (i * 28)) / 2); // Offset
                shx.setInt32(off + 4, 10); // Content Length
            });

            // --- 3. GENERAR DBF (Atributos - Crítico para ArcMap) ---
            // Campo ID (N)
            const dbfHeaderSize = 32 + 32 + 1; // Header + 1 Field + Terminator
            const recordSize = 1 + 10; // Delete flag + 10 chars for ID
            const dbfSize = dbfHeaderSize + (props.length * recordSize);
            const dbf = new DataView(new ArrayBuffer(dbfSize));
            
            dbf.setUint8(0, 0x03); // Version: dBase III
            dbf.setUint8(1, 126); // Year
            dbf.setUint8(2, 1); // Month
            dbf.setUint8(3, 1); // Day
            dbf.setUint32(4, props.length, true); // Number of records
            dbf.setUint16(8, dbfHeaderSize, true); // Header length
            dbf.setUint16(10, recordSize, true); // Record length

            // Field Descriptor: "ID"
            "ID".split('').forEach((char, i) => dbf.setUint8(32 + i, char.charCodeAt(0)));
            dbf.setUint8(32 + 11, 78); // Field Type: N (Number)
            dbf.setUint8(32 + 16, 10); // Field Length: 10
            dbf.setUint8(64, 0x0D); // Terminator

            props.forEach((p, i) => {
                let off = dbfHeaderSize + (i * recordSize);
                dbf.setUint8(off, 0x20); // Not deleted
                const val = String(p.ID || i+1).padStart(10, ' ');
                val.split('').forEach((char, j) => dbf.setUint8(off + 1 + j, char.charCodeAt(0)));
            });

            // --- 4. EMPAQUETAR ---
            zip.file(fileName + ".shp", shp.buffer);
            zip.file(fileName + ".shx", shx.buffer);
            zip.file(fileName + ".dbf", dbf.buffer);
            zip.file(fileName + ".prj", 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]');

            const content = zip.generate({type: "base64"});
            const link = document.createElement('a');
            link.href = 'data:application/zip;base64,' + content;
            link.download = (options.folder || 'IGN_EXPORT') + '.zip';
            link.click();
        }
    };
});
