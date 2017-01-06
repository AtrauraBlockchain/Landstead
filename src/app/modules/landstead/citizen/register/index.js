import angular from 'angular';

// Create the module where our functionality can attach to
let LandsteadCitizenRegister = angular.module('app.Landstead.citizen.register', []);

// Include our UI-Router config settings
import LandsteadCitizenRegisterConfig from './LandsteadCitizenRegister.config';
LandsteadCitizenRegister.config(LandsteadCitizenRegisterConfig);

// Controllers
import LandsteadCitizenRegisterCtrl from './LandsteadCitizenRegister.controller';
LandsteadCitizenRegister.controller('LandsteadCitizenRegisterCtrl', LandsteadCitizenRegisterCtrl);

export default LandsteadCitizenRegister;
