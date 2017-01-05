import angular from 'angular';

// Create the module where our functionality can attach to
let createMultisigModule = angular.module('app.createMultisig', []);

// Include our UI-Router config settings
import CreateMultisigConfig from './create/createMultisig.config';
createMultisigModule.config(CreateMultisigConfig);

// Controllers
import CreateMultisigCtrl from './create/createMultisig.controller';
createMultisigModule.controller('CreateMultisigCtrl', CreateMultisigCtrl);

// Create the module where our functionality can attach to
let editMultisigModule = angular.module('app.editMultisig', []);

// Include our UI-Router config settings
import EditMultisigConfig from './edit/editMultisig.config';
editMultisigModule.config(EditMultisigConfig);

// Controllers
import EditMultisigCtrl from './edit/editMultisig.controller';
editMultisigModule.controller('EditMultisigCtrl', EditMultisigCtrl);

export default createMultisigModule;
