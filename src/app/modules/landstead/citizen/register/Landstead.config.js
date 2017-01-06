function LandsteadConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.Landstead.citizen.register', {
            url: '/citizen/register',
            controller: 'LandsteadCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/landstead/citizen/register/Landstead.html',
            title: 'Register Citizen'
        });

};

export default LandsteadConfig;