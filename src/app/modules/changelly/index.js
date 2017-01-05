import angular from 'angular';

// Create the module where our functionality can attach to
let ChangellyModule = angular.module('app.changelly', []);

// Include our UI-Router config settings
import ChangellyConfig from './changelly.config';
ChangellyModule.config(ChangellyConfig);

// Controllers
import ChangellyCtrl from './changelly.controller';
ChangellyModule.controller('ChangellyCtrl', ChangellyCtrl);

export default ChangellyModule;
