'use strict';

module.exports = {
    friendlyName: 'Catalog lsFileInfo',
    injectableName: 'Task.Catalog.lsfileinfo',
    implementsTask: 'Task.Base.Linux.Catalog',
    options: {
        commands: [
            'sudo ls -l'
        ]
    },
    properties: {
        catalog: {
            type: 'lsfileinfo'
        }
    }
};
