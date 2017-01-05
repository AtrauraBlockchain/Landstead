function UpdateApostilleConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.updateApostille', {
            url: '/apostille/update',
            controller: 'UpdateApostilleCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/apostille/manage/update/updateApostille.html',
            title: 'Update apostille',
            params: {
			    address: "",
			    privateKey: "",
                tags: ""
			}
        });

};

export default UpdateApostilleConfig;