function TransferApostilleConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.transferApostille', {
            url: '/apostille/transfer',
            controller: 'TransferApostilleCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/apostille/manage/transfer/transferApostille.html',
            title: 'Transfer / Split ownership',
            params: {
			    address: "",
			    privateKey: ""
			 }
        });

};

export default TransferApostilleConfig;