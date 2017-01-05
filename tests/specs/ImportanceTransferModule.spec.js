import WalletFixture from '../data/wallet';
import AccountDataFixture from '../data/accountData';


describe('Importance transfer module tests', function() {
    let $controller, $rootScope, Wallet, DataBridge, $q, $filter;

    beforeEach(angular.mock.module('app'));

    beforeEach(angular.mock.inject(function(_$filter_, _$controller_, _$rootScope_, _Wallet_, _DataBridge_, _$q_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        Wallet = _Wallet_;
        DataBridge = _DataBridge_;
        $q = _$q_;
        $filter = _$filter_;
    }));

    function createDummyWalletContextTestnet(Wallet) {
        Wallet.setWallet(WalletFixture.testnetWallet);
        Wallet.setDefaultNode();
        DataBridge.accountData = AccountDataFixture.testnetAccountData;
    }


    it("Default properties initialized", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('ImportanceTransferCtrl', {
            $scope: scope
        });

        // Assert
        expect(ctrl.formData).toEqual({
            remoteAccount: Wallet.currentAccount.child,
            mode: 1,
            fee: 6000000,
            innerFee: 0,
            isMultisig: false,
            multisigAccount: ''
        });
        expect(ctrl.modes).toEqual([{
            name: "Activate",
            key: 1
        }, {
            name: "Deactivate",
            key: 2
        }]);
        expect(ctrl.okPressed).toBe(false);
        expect(ctrl.common).toEqual({
            'password': '',
            'privateKey': '',
        });
    });

    it("Can update remote account if custom key enabled", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('ImportanceTransferCtrl', {
            $scope: scope
        });

        // Act
        ctrl.customKey = true;
        ctrl.updateRemoteAccount();

        // Assert
        expect(ctrl.formData.remoteAccount).toEqual('');
    });

    it("Can update remote account if custom key enabled then disabled", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('ImportanceTransferCtrl', {
            $scope: scope
        });

        // Act
        ctrl.customKey = true;
        ctrl.updateRemoteAccount();
        ctrl.customKey = false;
        ctrl.updateRemoteAccount();

        // Assert
        expect(ctrl.formData.remoteAccount).toEqual(Wallet.currentAccount.child);
    });

    it("Can set mode to deactivate", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('ImportanceTransferCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.mode = 2;

        // Assert
        expect(ctrl.formData).toEqual({
            remoteAccount: Wallet.currentAccount.child,
            mode: 2,
            fee: 6000000,
            innerFee: 0,
            isMultisig: false,
            multisigAccount: ''
        });
    });

    it("Can set mode to 'activate' after 'deactivate'", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('ImportanceTransferCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.mode = 2;
        ctrl.formData.mode = 1;

        // Assert
        expect(ctrl.formData).toEqual({
            remoteAccount: Wallet.currentAccount.child,
            mode: 1,
            fee: 6000000,
            innerFee: 0,
            isMultisig: false,
            multisigAccount: ''
        });
    });

    describe('Importance transfer module delegation tests', function() {

        it("Pass right parameters to prepareImportanceTransfer in send() method", function() {
            // Arrange:
            let scope = $rootScope.$new();
            createDummyWalletContextTestnet(Wallet)
            let ctrl = $controller('ImportanceTransferCtrl', {
                $scope: scope
            });
            // Override
            ctrl.updateFees = function() {
                // Otherwise it calls prepareImportanceTransfer from here first and then spy is on the wrong function
            }
            spyOn(ctrl._Transactions, 'prepareImportanceTransfer').and.callThrough();
            spyOn(ctrl._Transactions, 'serializeAndAnnounceTransaction').and.returnValue($q.when({}));
            ctrl.common = {
                "privateKey": "",
                "password": "TestTest11"
            }

            // Act
            ctrl.send();

            // Assert
            expect(ctrl._Transactions.prepareImportanceTransfer).toHaveBeenCalledWith(ctrl.common, ctrl.formData);
        });

        it("Can't call prepareImportanceTransfer in send() method if wrong password", function() {
            // Arrange:
            let scope = $rootScope.$new();
            createDummyWalletContextTestnet(Wallet)
            let ctrl = $controller('ImportanceTransferCtrl', {
                $scope: scope
            });
            // Override
            ctrl.updateFees = function() {
                // Otherwise it calls prepareImportanceTransfer from here first and then spy is on the wrong function
            }
            spyOn(ctrl._Transactions, 'prepareImportanceTransfer').and.callThrough();
            spyOn(ctrl._Transactions, 'serializeAndAnnounceTransaction').and.returnValue($q.when({}));
            ctrl.common = {
                "privateKey": "",
                "password": "TestTest"
            }

            // Act
            ctrl.send();

            // Assert
            expect(ctrl._Transactions.prepareImportanceTransfer).not.toHaveBeenCalled();
        });

        it("Pass right parameters to serializeAndAnnounceTransaction in send() method", function() {
            // Arrange:
            let scope = $rootScope.$new();
            createDummyWalletContextTestnet(Wallet)
            let ctrl = $controller('ImportanceTransferCtrl', {
                $scope: scope
            });
            spyOn(ctrl._Transactions, 'serializeAndAnnounceTransaction').and.returnValue($q.when({}));
            ctrl.common = {
                "privateKey": "",
                "password": "TestTest11"
            }

            // Act
            ctrl.send();

            // Assert
            expect(ctrl._Transactions.serializeAndAnnounceTransaction).toHaveBeenCalledWith(jasmine.any(Object), ctrl.common);
        });

        it("Can't call serializeAndAnnounceTransaction in send() method if wrong password", function() {
            // Arrange:
            let scope = $rootScope.$new();
            createDummyWalletContextTestnet(Wallet)
            let ctrl = $controller('ImportanceTransferCtrl', {
                $scope: scope
            });
            spyOn(ctrl._Transactions, 'serializeAndAnnounceTransaction').and.returnValue($q.when({}));
            ctrl.common = {
                "privateKey": "",
                "password": "TestTest"
            }

            // Act
            ctrl.send();

            // Assert
            expect(ctrl._Transactions.serializeAndAnnounceTransaction).not.toHaveBeenCalled();
        });
    });

});