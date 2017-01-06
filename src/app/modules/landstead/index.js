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

/***************** property Revoke ****************/
// Create the module where our functionality can attach to
let propertyRevokeModule = angular.module('app.LandsteadPropertyRevoke', []);

// Include our UI-Router config settings
import propertyRevokeConfig from './propertyRevoke/propertyRevoke.config';
propertyRevokeModule.config(propertyRevokeConfig);

// Controllers
import propertyRevokeCtrl from './propertyRevoke/propertyRevoke.controller';
propertyRevokeModule.controller('propertyRevokeCtrl', propertyRevokeCtrl);


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