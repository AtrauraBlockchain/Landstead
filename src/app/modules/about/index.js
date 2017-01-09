import angular from 'angular';

// Create the module where our functionality can attach to
let dashboardModule = angular.module('app.about', []);

// Include our UI-Router config settings
import DashboardConfig from './about.config';
dashboardModule.config(DashboardConfig);


export default dashboardModule;
