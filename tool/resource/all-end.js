
var ig = require('ig');

/** for: ${parts} as ${mod} */
var modName = '${mod.name}';
var refName = '${mod.refName}';
var folderName = '${mod.folder}';

if (folderName) {
    var tmp = {};
    tmp[refName] = require(modName);
    ig[folderName] = tmp;
}
else {
    ig[refName] = require(modName);
}
/** /for */

_global['ig'] = ig;

})(window);
