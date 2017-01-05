import angular from 'angular';

// Create the module where our functionality can attach to
let createApostilleModule = angular.module('app.createApostille', []);

// Include our UI-Router config settings
import CreateApostilleConfig from './create/createApostille.config';
createApostilleModule.config(CreateApostilleConfig);

// Controllers
import CreateApostilleCtrl from './create/createApostille.controller';
createApostilleModule.controller('CreateApostilleCtrl', CreateApostilleCtrl);

// Create the module where our functionality can attach to
let auditApostilleModule = angular.module('app.auditApostille', []);

// Include our UI-Router config settings
import AuditApostilleConfig from './audit/auditApostille.config';
auditApostilleModule.config(AuditApostilleConfig);

// Controllers
import AuditApostilleCtrl from './audit/auditApostille.controller';
auditApostilleModule.controller('AuditApostilleCtrl', AuditApostilleCtrl);

// Create the module where our functionality can attach to
let apostilleHistoryModule = angular.module('app.apostilleHistory', []);

// Include our UI-Router config settings
import ApostilleHistoryConfig from './history/apostilleHistory.config';
apostilleHistoryModule.config(ApostilleHistoryConfig);

// Controllers
import ApostilleHistoryCtrl from './history/apostilleHistory.controller';
apostilleHistoryModule.controller('ApostilleHistoryCtrl', ApostilleHistoryCtrl);

// Create the module where our functionality can attach to
let apostilleMessageModule = angular.module('app.apostilleMessage', []);

// Include our UI-Router config settings
import ApostilleMessageConfig from './manage/message/apostilleMessage.config';
apostilleMessageModule.config(ApostilleMessageConfig);

// Controllers
import ApostilleMessageCtrl from './manage/message/apostilleMessage.controller';
apostilleMessageModule.controller('ApostilleMessageCtrl', ApostilleMessageCtrl);

// Create the module where our functionality can attach to
let transferApostilleModule = angular.module('app.transferApostille', []);

// Include our UI-Router config settings
import TransferApostilleConfig from './manage/transfer/transferApostille.config';
transferApostilleModule.config(TransferApostilleConfig);

// Controllers
import TransferApostilleCtrl from './manage/transfer/transferApostille.controller';
transferApostilleModule.controller('TransferApostilleCtrl', TransferApostilleCtrl);

// Create the module where our functionality can attach to
let updateApostilleModule = angular.module('app.updateApostille', []);

// Include our UI-Router config settings
import UpdateApostilleConfig from './manage/update/updateApostille.config';
updateApostilleModule.config(UpdateApostilleConfig);

// Controllers
import UpdateApostilleCtrl from './manage/update/updateApostille.controller';
updateApostilleModule.controller('UpdateApostilleCtrl', UpdateApostilleCtrl);

export default createApostilleModule;
