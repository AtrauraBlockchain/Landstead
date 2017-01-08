import angular from 'angular';

/***************** Citizen Register ****************/
// Create the module where our functionality can attach to
let citizenRegisterModule = angular.module('app.LandsteadCitizenRegister', []);

// Include our UI-Router config settings
import citizenRegisterConfig from './citizenRegister/citizenRegister.config';
citizenRegisterModule.config(citizenRegisterConfig);

// Controllers
import citizenRegisterCtrl from './citizenRegister/citizenRegister.controller';
citizenRegisterModule.controller('citizenRegisterCtrl', citizenRegisterCtrl);


/***************** property Register ****************/
// Create the module where our functionality can attach to
let propertyRegisterModule = angular.module('app.LandsteadPropertyRegister', []);

// Include our UI-Router config settings
import propertyRegisterConfig from './propertyRegister/propertyRegister.config';
propertyRegisterModule.config(propertyRegisterConfig);

// Controllers
import propertyRegisterCtrl from './propertyRegister/propertyRegister.controller';
propertyRegisterModule.controller('propertyRegisterCtrl', propertyRegisterCtrl);



/***************** Property Ownership Register ****************/
// Create the module where our functionality can attach to
let propertyOwnershipRegisterModule = angular.module('app.LandsteadPropertyOwnershipRegister', []);

// Include our UI-Router config settings
import propertyOwnershipRegisterConfig from './propertyOwnershipRegister/propertyOwnershipRegister.config';
propertyOwnershipRegisterModule.config(propertyOwnershipRegisterConfig);

// Controllers
import propertyOwnershipRegisterCtrl from './propertyOwnershipRegister/propertyOwnershipRegister.controller';
propertyOwnershipRegisterModule.controller('propertyOwnershipRegisterCtrl', propertyOwnershipRegisterCtrl);


/***************** Citizen Revoke ****************/
// Create the module where our functionality can attach to
let citizenRevokeModule = angular.module('app.LandsteadCitizenRevoke', []);

// Include our UI-Router config settings
import citizenRevokeConfig from './citizenRevoke/citizenRevoke.config';
citizenRevokeModule.config(citizenRevokeConfig);

// Controllers
import citizenRevokeCtrl from './citizenRevoke/citizenRevoke.controller';
citizenRevokeModule.controller('citizenRevokeCtrl', citizenRevokeCtrl);


export default citizenRegisterModule;