import WalletFixture from '../data/wallet';
import AccountDataFixture from '../data/accountData';

describe('Mosaic supply change transaction module tests', function() {
    let $controller, $rootScope, Wallet, DataBridge, $q;

    beforeEach(angular.mock.module('app'));

    beforeEach(angular.mock.inject(function(_$controller_, _$rootScope_, _Wallet_, _DataBridge_, _$q_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        Wallet = _Wallet_;
        DataBridge = _DataBridge_;
        $q = _$q_;
    }));

    function createDummyWalletContextTestnet(Wallet) {
        Wallet.setWallet(WalletFixture.testnetWallet);
        Wallet.setDefaultNode();

        DataBridge.accountData = AccountDataFixture.testnetAccountData;
        DataBridge.namespaceOwned = AccountDataFixture.testnetNamespaceOwned;
        DataBridge.mosaicOwned =  AccountDataFixture.testnetMosaicOwned;
        DataBridge.mosaicDefinitionMetaDataPair = AccountDataFixture.testnetMosaicDefinitionMetaDataPair;

        DataBridge.nisHeight = 999999999;

    }

    function createDummyWalletContextMainnet(Wallet) {
        Wallet.setWallet(WalletFixture.mainnetWallet);
        Wallet.setDefaultNode();

        DataBridge.accountData = AccountDataFixture.mainnetAccountData;
        DataBridge.namespaceOwned = AccountDataFixture.mainnetNamespaceOwned;
        DataBridge.mosaicOwned = AccountDataFixture.mainnetMosaicOwned;
        DataBridge.mosaicDefinitionMetaDataPair = AccountDataFixture.mainnetMosaicDefinitionMetaDataPair;


        DataBridge.nisHeight = 999999999;
    }

    it("Can update current account mosaics", function() {
        // Arrange
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('EditMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.updateCurrentAccountMosaics();

        // Assert
        expect(ctrl.currentAccount).toEqual(Wallet.currentAccount.address);
        expect(ctrl.currentAccountMosaicNames).toEqual(['nano:points', 'nem:xem']);
        expect(ctrl.selectedMosaic).toEqual('nem:xem');
    });

    it("Default properties initialized (after updateCurrentAccountMosaics)", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('EditMosaicCtrl', {
            $scope: scope
        });

        // Assert
        expect(ctrl.formData).toEqual({
            mosaic: '',
            supplyType: 1,
            delta: 0,
            fee: 20 * 1000000,
            innerFee: 0,
            isMultisig: false,
            multisigAccount: {
                "address": "TBUSUKWVVPS7LZO4AF6VABQHY2FI4IIMCJGIVX3X",
                "harvestedBlocks": 0,
                "balance": 16000000,
                "importance": 0,
                "vestedBalance": 0,
                "publicKey": "671ca866718ed174a21e593fc1e250837c03935bc79e2daad3bd018c444d78a7",
                "label": null,
                "multisigInfo": {
                    "cosignatoriesCount": 1,
                    "minCosignatories": 1
                }
            }
        });
        expect(ctrl.currentAccount).toEqual(Wallet.currentAccount.address);
        expect(ctrl.currentAccountMosaicNames).toEqual(['nano:points', 'nem:xem']);
        expect(ctrl.selectedMosaic).toEqual('nem:xem');
        expect(ctrl.okPressed).toBe(false);
        expect(ctrl.common).toEqual({
            'password': '',
            'privateKey': '',
        });
    });

    it("Has right fee on testnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet);
        let ctrl = $controller('EditMosaicCtrl', {
            $scope: scope
        });

        // Act
        scope.$digest();

        // Assert
        expect(ctrl.formData.fee).toBe(20000000);
        expect(ctrl.formData.innerFee).toBe(0);
    });

    it("Has right fee on mainnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet);
        let ctrl = $controller('EditMosaicCtrl', {
            $scope: scope
        });

        // Act
        scope.$digest();

        // Assert
        expect(ctrl.formData.fee).toBe(108000000);
        expect(ctrl.formData.innerFee).toBe(0);
    });

    it("Can update transaction fee if multisig", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet);
        let ctrl = $controller('EditMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.isMultisig = true;
        ctrl.updateFees();
        scope.$digest();

        // Assert
        expect(ctrl.formData.fee).toBe(6000000);
        expect(ctrl.formData.innerFee).toBe(20000000);
    });

    it("Can set right current account address if multisig enabled", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet);
        let ctrl = $controller('EditMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.isMultisig = true;
        ctrl.updateCurrentAccountMosaics();
        scope.$digest();

        // Assert
        expect(ctrl.currentAccount).toEqual(ctrl.formData.multisigAccount.address);
    });

    it("Can set right current account address if multisig enabled then disabled", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet);
        let ctrl = $controller('EditMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.isMultisig = true;
        ctrl.updateCurrentAccountMosaics();
        scope.$digest();
        ctrl.formData.isMultisig = false;
        ctrl.updateCurrentAccountMosaics();
        scope.$digest();

        // Assert
        expect(ctrl.currentAccount).toEqual(Wallet.currentAccount.address);
    });

    it("Can update multisig account mosaics if multisig enabled", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet);
        let ctrl = $controller('EditMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.isMultisig = true;
        ctrl.updateCurrentAccountMosaics();
        scope.$digest();

        // Assert
        expect(ctrl.currentAccountMosaicNames).toEqual(['nem:xem']);
        expect(ctrl.selectedMosaic).toEqual('nem:xem');
    });

    it("Can update account mosaics if multisig enabled then disabled", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet);
        let ctrl = $controller('EditMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.isMultisig = true;
        ctrl.updateCurrentAccountMosaics();
        scope.$digest();
        ctrl.formData.isMultisig = false;
        ctrl.updateCurrentAccountMosaics();
        scope.$digest();

        // Assert
        expect(ctrl.currentAccountMosaicNames).toEqual(['nano:points', 'nem:xem']);
        expect(ctrl.selectedMosaic).toEqual('nem:xem');
    });

    it("Can set selected mosaic as mosaic to change", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet);
        let ctrl = $controller('EditMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.selectedMosaic = 'nano:points';
        ctrl.updateMosaic();
        scope.$digest();

        // Assert
        expect(ctrl.formData.mosaic).toEqual({
            "namespaceId": "nano",
            "name": "points"
        });
    });

    it("Can change supply type to delete", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet);
        let ctrl = $controller('EditMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.supplyType = 2;
        scope.$digest();

        // Assert
        expect(ctrl.formData).toEqual({
            mosaic: '',
            supplyType: 2,
            delta: 0,
            fee: 20000000,
            innerFee: 0,
            isMultisig: false,
            multisigAccount: {
                "address": "TBUSUKWVVPS7LZO4AF6VABQHY2FI4IIMCJGIVX3X",
                "harvestedBlocks": 0,
                "balance": 16000000,
                "importance": 0,
                "vestedBalance": 0,
                "publicKey": "671ca866718ed174a21e593fc1e250837c03935bc79e2daad3bd018c444d78a7",
                "label": null,
                "multisigInfo": {
                    "cosignatoriesCount": 1,
                    "minCosignatories": 1
                }
            }
        });
    });

    it("Can change supply type to create after delete", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet);
        let ctrl = $controller('EditMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.supplyType = 2;
        scope.$digest();
        ctrl.formData.supplyType = 1;
        scope.$digest();

        // Assert
        expect(ctrl.formData).toEqual({
            mosaic: '',
            supplyType: 1,
            delta: 0,
            fee: 20000000,
            innerFee: 0,
            isMultisig: false,
            multisigAccount: {
                "address": "TBUSUKWVVPS7LZO4AF6VABQHY2FI4IIMCJGIVX3X",
                "harvestedBlocks": 0,
                "balance": 16000000,
                "importance": 0,
                "vestedBalance": 0,
                "publicKey": "671ca866718ed174a21e593fc1e250837c03935bc79e2daad3bd018c444d78a7",
                "label": null,
                "multisigInfo": {
                    "cosignatoriesCount": 1,
                    "minCosignatories": 1
                }
            }
        });
    });

    describe('Mosaic supply change transaction module delegation tests', function() {

        it("Pass right parameters to prepareMosaicSupply in send() method", function() {
            // Arrange:
            let scope = $rootScope.$new();
            createDummyWalletContextTestnet(Wallet)
            let ctrl = $controller('EditMosaicCtrl', {
                $scope: scope
            });
            scope.$digest();
            // Override
            ctrl.updateFees = function() {
                // Otherwise it calls prepareMosaicDefinition from here first and then spy is on the wrong function
            }
            spyOn(ctrl._Transactions, 'prepareMosaicSupply').and.callThrough();
            spyOn(ctrl._Transactions, 'serializeAndAnnounceTransaction').and.returnValue($q.when({}));
            ctrl.common = {
                "privateKey": "",
                "password": "TestTest11"
            }

            // Act
            ctrl.send();

            // Assert
            expect(ctrl._Transactions.prepareMosaicSupply).toHaveBeenCalledWith(ctrl.common, ctrl.formData);
        });

        it("Can't call prepareMosaicSupply in send() method if wrong password", function() {
            // Arrange:
            let scope = $rootScope.$new();
            createDummyWalletContextTestnet(Wallet)
            let ctrl = $controller('EditMosaicCtrl', {
                $scope: scope
            });
            scope.$digest();
            // Override
            ctrl.updateFees = function() {
                // Otherwise it calls prepareMosaicDefinition from here first and then spy is on the wrong function
            }
            spyOn(ctrl._Transactions, 'prepareMosaicSupply').and.callThrough();
            spyOn(ctrl._Transactions, 'serializeAndAnnounceTransaction').and.returnValue($q.when({}));
            ctrl.common = {
                "privateKey": "",
                "password": "TestTest"
            }

            // Act
            ctrl.send();

            // Assert
            expect(ctrl._Transactions.prepareMosaicSupply).not.toHaveBeenCalled();
        });

        it("Pass right parameters to serializeAndAnnounceTransaction in send() method", function() {
            // Arrange:
            let scope = $rootScope.$new();
            createDummyWalletContextTestnet(Wallet)
            let ctrl = $controller('EditMosaicCtrl', {
                $scope: scope
            });
            scope.$digest();
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
            let ctrl = $controller('EditMosaicCtrl', {
                $scope: scope
            });
            scope.$digest();
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