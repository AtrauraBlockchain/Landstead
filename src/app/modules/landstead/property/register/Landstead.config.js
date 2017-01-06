function LandsteadConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.Landstead.property.register', {
            url: '/property/register',
            controller: 'LandsteadCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/landstead/property/register/Landstead.html',
            title: 'Register Property'
        });

};

export default LandsteadConfig;