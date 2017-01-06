function propertyRevokeConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.LandsteadPropertyRevoke', {
            url: '/property/revoke',
            controller: 'propertyRevokeCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/landstead/propertyRevoke/propertyRevoke.html',
            title: 'Revoke property'
        });

};

export default propertyRevokeConfig;