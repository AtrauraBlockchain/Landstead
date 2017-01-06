function citizenRegisterConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.LandsteadCitizenRegister', {
            url: '/citizen/register',
            controller: 'citizenRegisterCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/landstead/citizenRegister/citizenRegister.html',
            title: 'Register citizen'
        });

};

export default citizenRegisterConfig;