function ShowAccountData(DataBridge, $filter) {
    'ngInject';

    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.DataBridge = DataBridge;

            scope.$watch('DataBridge.accountData', function(val) {
                if (val) {
                    if (attrs.showAccountData === 'balance') {
                        element.html("<span><b>" + $filter('fmtNemValue')(val.account.balance) + " XEM</b></span>")
                    } else if (attrs.showAccountData === 'importance') {
                        element.html("<span>" + $filter('fmtNemImportanceScore')(val.account.importance) + "* 10<sup>(-5)</sup></span>")
                    } else if (attrs.showAccountData === 'harvestedBlocks') {
                        element.html("<span>" + val.account.harvestedBlocks + "</span>")
                    } else if (attrs.showAccountData === 'address') {
                        element.html("<span>" + $filter('fmtAddress')(val.account.address) + "</span>")
                    } else if (attrs.showAccountData === 'publicKey') {
                        if (null === val.account.publicKey) {
                            element.html("<span>You need to make a transaction to get a public key</span>")
                        } else {
                            element.html("<span>" + val.account.publicKey + "</span>")
                        }
                    } else if (attrs.showAccountData === 'vestedBalance') {
                        element.html("<span>" + $filter('fmtNemValue')(val.account.vestedBalance) + "</span>")
                    }
                } else {
                    if (attrs.showAccountData === 'balance') {
                        element.html("<span><b>" + $filter('fmtNemValue')(0) + " XEM</b></span>")
                    } else if (attrs.showAccountData === 'importance') {
                        element.html("<span><b>" + $filter('fmtNemImportanceScore')(0) + "* 10<sup>(-5)</sup></b></span>")
                    } else if (attrs.showAccountData === 'harvestedBlocks') {
                        element.html("<span><b>0</b></span>")
                    }
                }
            });

            scope.$watch('DataBridge.mosaicDefinitionMetaDataPairSize', function(val) {
                if (val) {
                    if (attrs.showAccountData === 'mosaicsOwned') {
                        element.html("<span><b>" + val + "</b></span>")
                    }
                }
            });

        }
    };
}

export default ShowAccountData;