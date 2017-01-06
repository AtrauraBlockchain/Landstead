function citizenRevokeConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.LandsteadCitizenRevoke', {
            url: '/citizen/revoke',
            controller: 'citizenRevokeCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/landstead/citizenRevoke/citizenRevoke.html',
            title: 'Revoke Citizen'
        });

};

export default citizenRevokeConfig;