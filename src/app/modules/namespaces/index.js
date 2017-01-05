import angular from 'angular';

// Create the module where our functionality can attach to
let namespacesModule = angular.module('app.namespaces', []);

// Include our UI-Router config settings
import NamespacesConfig from './namespaces.config';
namespacesModule.config(NamespacesConfig);

// Controllers
import NamespacesCtrl from './namespaces.controller';
namespacesModule.controller('NamespacesCtrl', NamespacesCtrl);

export default namespacesModule;
