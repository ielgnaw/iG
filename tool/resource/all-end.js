
var ig = require('ig');

/** for: ${parts} as ${mod} */
var modName = '${mod.name}';
var refName = '${mod.refName}';
var folderName = '${mod.folder}';

var tmp;
if (folderName) {
    if (!ig[folderName]) {
        tmp = {};
        tmp[refName] = require(modName);
        ig[folderName] = tmp;
    }
    else {
        ig[folderName][refName] = require(modName);
    }
}
else {
    tmp = require(modName);
    if (refName) {
        ig[refName] = tmp;
    }
}
/** /for */

_global['ig'] = ig;

})(window);
