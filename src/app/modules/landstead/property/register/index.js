import angular from 'angular';

// Create the module where our functionality can attach to
let Landstead = angular.module('app.Landstead.property.register', []);

// Include our UI-Router config settings
import LandsteadConfig from './Landstead.config';
Landstead.config(LandsteadConfig);

// Controllers
import LandsteadCtrl from './Landstead.controller';
Landstead.controller('LandsteadCtrl', LandsteadCtrl);

export default Landstead;
