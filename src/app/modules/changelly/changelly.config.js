function ChangellyConfig($stateProvider) {
    'ngInject';

    $stateProvider
        .state('app.changelly', {
            url: '/changelly-buy-xem',
            controller: 'ChangellyCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'modules/changelly/changelly.html',
            title: 'Convert to XEM'
        });

};

export default ChangellyConfig;
