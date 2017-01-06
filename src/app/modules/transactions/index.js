import angular from 'angular';

// Create the module where our functionality can attach to
let transactionsModule = angular.module('app.transactions', []);

// Include our UI-Router config settings
import TransactionsConfig from './transactions.config';
transactionsModule.config(TransactionsConfig);

// Controllers
import TransactionsCtrl from './transactions.controller';
transactionsModule.controller('TransactionsCtrl', TransactionsCtrl);


export default transactionsModule;
