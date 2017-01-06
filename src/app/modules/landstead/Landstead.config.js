function LandsteadConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.Landstead', {
            url: '/citizen/register',
            controller: 'LandsteadCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/landstead/Landstead.html',
            title: 'Register Citizen'
        });

};

export default LandsteadConfig;