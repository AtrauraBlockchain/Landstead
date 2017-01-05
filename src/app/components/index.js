import angular from 'angular';

// Create the module where our functionality can attach to
let componentsModule = angular.module('app.components', []);

// Set read-wallet-files directive
import ReadWalletFiles from './readWalletFiles.directive';
componentsModule.directive('readWalletFiles', ReadWalletFiles);

// Set show-authed directive
import ShowAuthed from './show-authed.directive';
componentsModule.directive('showAuthed', ShowAuthed);

// Set show-network-status directive
import ShowNetworkStatus from './showNetworkStatus.directive';
componentsModule.directive('showNetworkStatus', ShowNetworkStatus);

// Set show-block-height directive
import ShowBlockHeight from './showBlockHeight.directive';
componentsModule.directive('showBlockHeight', ShowBlockHeight);

// Set show-account-data-directive
import ShowAccountData from './showAccountData.directive';
componentsModule.directive('showAccountData', ShowAccountData);

// Set tag-transaction directive
import TagTransaction from './tagTransaction.directive';
componentsModule.directive('tagTransaction', TagTransaction);

// Set app-background directive
import AppBackground from './appBackground.directive';
componentsModule.directive('appBackground', AppBackground);

// Set tag-levy directive
import TagLevy from './tagLevy.directive';
componentsModule.directive('tagLevy', TagLevy);

// Set read-wallet-files directive
import ImportApostilleFiles from './importApostilleFiles.directive';
componentsModule.directive('importApostilleFiles', ImportApostilleFiles);

// Set import-nty-file directive
import ImportNtyFile from './importNtyFile.directive';
componentsModule.directive('importNtyFile', ImportNtyFile);



export default componentsModule;