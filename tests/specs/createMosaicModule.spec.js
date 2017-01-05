import Sinks from '../../src/app/utils/sinks';
import WalletFixture from '../data/wallet';
import AccountDataFixture from '../data/accountData';


describe('Mosaic definition transaction module tests', function() {
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

    it("Can update current account mosaics and namespaces", function() {
        // Arrange
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('CreateMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.updateCurrentAccountNSM();

        // Assert
        expect(ctrl.currentAccount).toEqual(Wallet.currentAccount.address);
        expect(ctrl.currentAccountMosaicNames).toEqual(['nano:points', 'nem:xem']);
        expect(ctrl.selectedMosaic).toEqual('nem:xem');
        expect(ctrl.formData.namespaceParent).toEqual({
            owner: 'TAF7BPDV22HCFNRJEWOGLRKBYQF65GBOLQPI5GGO',
            fqn: 'nano',
            height: 547741
        });
    });

    it("Default properties initialized (after updateCurrentAccountNSM)", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('CreateMosaicCtrl', {
            $scope: scope
        });

        // Assert
        expect(ctrl.formData).toEqual({
            mosaicFeeSink: Sinks.sinks.mosaic[Wallet.network],
            mosaicName: '',
            namespaceParent: {
                owner: 'TAF7BPDV22HCFNRJEWOGLRKBYQF65GBOLQPI5GGO',
                fqn: 'nano',
                height: 547741
            },
            mosaicDescription: '',
            properties: {
                'initialSupply': 0,
                'divisibility': 0,
                'transferable': true,
                'supplyMutable': true
            },
            levy: {
                'mosaic': null,
                'address': Wallet.currentAccount.address,
                'feeType': 1,
                'fee': 5
            },
            fee: 20 * 1000000,
            mosaicFee: 500 * 1000000,
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
        expect(ctrl.hasLevy).toBe(false);
        expect(ctrl.okPressed).toBe(false);
        expect(ctrl.common).toEqual({
            'password': '',
            'privateKey': '',
        });
    });

    it("Has right sink on testnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('CreateMosaicCtrl', {
            $scope: scope
        });

        // Act
        scope.$digest();

        // Assert
        expect(ctrl.formData.mosaicFeeSink).toEqual("TBMOSA-ICOD4F-54EE5C-DMR23C-CBGOAM-2XSJBR-5OLC");
    });

    it("Has right sink on mainnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet)
        let ctrl = $controller('CreateMosaicCtrl', {
            $scope: scope
        });

        // Act
        scope.$digest();

        // Assert
        expect(ctrl.formData.mosaicFeeSink).toEqual("NBMOSA-ICOD4F-54EE5C-DMR23C-CBGOAM-2XSIUX-6TRS");
    });

    it("Has right rentalFee on testnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet);
        let ctrl = $controller('CreateMosaicCtrl', {
            $scope: scope
        });

        // Act
        scope.$digest();

        // Assert
        expect(ctrl.formData.mosaicFee).toBe(500 * 1000000);
        expect(ctrl.formData.innerFee).toBe(0);
    });

    it("Has right rentalFee on mainnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet);
        let ctrl = $controller('CreateMosaicCtrl', {
            $scope: scope
        });

        // Act
        scope.$digest();

        // Assert
        expect(ctrl.formData.mosaicFee).toBe(50000 * 1000000);
        expect(ctrl.formData.innerFee).toBe(0);
    });

    it("Has right fee on testnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet);
        let ctrl = $controller('CreateMosaicCtrl', {
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
        let ctrl = $controller('CreateMosaicCtrl', {
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
        let ctrl = $controller('CreateMosaicCtrl', {
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

    it("Can update transaction fee if multisig enabled then disabled", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet);
        let ctrl = $controller('CreateMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.isMultisig = true;
        ctrl.updateFees();
        scope.$digest();
        ctrl.formData.isMultisig = false;
        ctrl.updateFees();
        scope.$digest();

        // Assert
        expect(ctrl.formData.fee).toBe(20000000);
        expect(ctrl.formData.innerFee).toBe(0);
    });

    it("Can lowercase mosaic name", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet);
        let ctrl = $controller('CreateMosaicCtrl', {
            $scope: scope
        });
        ctrl.formData.mosaicName = "AwEsOmE";
        ctrl.processMosaicName();

        // Act
        scope.$digest();

        // Assert
        expect(ctrl.formData.mosaicName).toEqual('awesome');
    });

    it("Can set default mosaic levy if levy enabled", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet);
        let ctrl = $controller('CreateMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.updateLevyMosaic(true);
        scope.$digest();

        // Assert
        expect(ctrl.formData.levy.mosaic).toEqual({
            "namespaceId": "nem",
            "name": "xem"
        });
    });

    it("Can set mosaic levy to null if levy enabled then disabled", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet);
        let ctrl = $controller('CreateMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.updateLevyMosaic(true);
        ctrl.updateLevyMosaic(false);
        scope.$digest();

        // Assert
        expect(ctrl.formData.levy.mosaic).toBe(null);
    });

    it("Can set selected mosaic as levy mosaic", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet);
        let ctrl = $controller('CreateMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.selectedMosaic = 'nano:points';
        ctrl.updateLevyMosaic(true);
        scope.$digest();

        // Assert
        expect(ctrl.formData.levy.mosaic).toEqual({
            "namespaceId": "nano",
            "name": "points"
        });
    });

    it("Can change levy fee type to percentile", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet);
        let ctrl = $controller('CreateMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.selectedMosaic = 'nano:points';
        ctrl.updateLevyMosaic(true);
        ctrl.formData.levy.feeType = 2;
        scope.$digest();

        // Assert
        expect(ctrl.formData.levy.feeType).toBe(2);
    });

    it("Can change levy fee type to percentile then absolute", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet);
        let ctrl = $controller('CreateMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.selectedMosaic = 'nano:points';
        ctrl.updateLevyMosaic(true);
        ctrl.formData.levy.feeType = 2;
        scope.$digest();
        ctrl.formData.levy.feeType = 1;

        // Assert
        expect(ctrl.formData.levy.feeType).toBe(1);
    });

    it("Set right current account address if multisig enabled", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('CreateMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.isMultisig = true;
        ctrl.updateCurrentAccountNSM();
        scope.$digest();

        // Assert
        expect(ctrl.currentAccount).toEqual("TBUSUKWVVPS7LZO4AF6VABQHY2FI4IIMCJGIVX3X");
    });

    it("Set right current account address if multisig enabled then disabled", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('CreateMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.isMultisig = true;
        scope.$digest();
        ctrl.formData.isMultisig = false;
        scope.$digest();

        // Assert
        expect(ctrl.currentAccount).toEqual(Wallet.currentAccount.address);
    });

    it("Set right current account mosaic names and selected mosaic if multisig enabled", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('CreateMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.isMultisig = true;
        scope.$digest();
        ctrl.updateCurrentAccountNSM();

        // Assert
        expect(ctrl.currentAccountMosaicNames).toEqual(['nem:xem']);
        expect(ctrl.selectedMosaic).toEqual('nem:xem');
    });

    it("Set right current account mosaic names and selected mosaic if multisig enabled then disabled", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('CreateMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.isMultisig = true;
        scope.$digest();
        ctrl.updateCurrentAccountNSM();
        ctrl.formData.isMultisig = false;
        scope.$digest();
        ctrl.updateCurrentAccountNSM();

        // Assert
        expect(ctrl.currentAccountMosaicNames).toEqual(['nano:points', 'nem:xem']);
        expect(ctrl.selectedMosaic).toEqual('nem:xem');
    });

    it("Can disable transferable mode", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('CreateMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.properties.transferable = false;
        scope.$digest();

        // Assert
        expect(ctrl.formData.properties.transferable).toBe(false);
    });

    it("Can disable mutable supply", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('CreateMosaicCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.properties.supplyMutable = false;
        scope.$digest();

        // Assert
        expect(ctrl.formData.properties.supplyMutable).toBe(false);
    });

    describe('Mosaic definition transaction module delegated tests', function() {

        it("Pass right parameters to prepareMosaicDefinition in send() method", function() {
            // Arrange:
            let scope = $rootScope.$new();
            createDummyWalletContextTestnet(Wallet)
            let ctrl = $controller('CreateMosaicCtrl', {
                $scope: scope
            });
            scope.$digest();
            // Override
            ctrl.updateFees = function() {
                // Otherwise it calls prepareMosaicDefinition from here first and then spy is on the wrong function
            }
            spyOn(ctrl._Transactions, 'prepareMosaicDefinition').and.callThrough();
            spyOn(ctrl._Transactions, 'serializeAndAnnounceTransaction').and.returnValue($q.when({}));
            ctrl.common = {
                "privateKey": "",
                "password": "TestTest11"
            }

            // Act
            ctrl.send();

            // Assert
            expect(ctrl._Transactions.prepareMosaicDefinition).toHaveBeenCalledWith(ctrl.common, ctrl.formData);
        });

        it("Can't call prepareMosaicDefinition in send() method if wrong password", function() {
            // Arrange:
            let scope = $rootScope.$new();
            createDummyWalletContextTestnet(Wallet)
            let ctrl = $controller('CreateMosaicCtrl', {
                $scope: scope
            });
            scope.$digest();
            // Override
            ctrl.updateFees = function() {
                // Otherwise it calls prepareMosaicDefinition from here first and then spy is on the wrong function
            }
            spyOn(ctrl._Transactions, 'prepareMosaicDefinition').and.callThrough();
            spyOn(ctrl._Transactions, 'serializeAndAnnounceTransaction').and.returnValue($q.when({}));
            ctrl.common = {
                "privateKey": "",
                "password": "TestTest"
            }

            // Act
            ctrl.send();

            // Assert
            expect(ctrl._Transactions.prepareMosaicDefinition).not.toHaveBeenCalled();
        });

        it("Pass right parameters to serializeAndAnnounceTransaction in send() method", function() {
            // Arrange:
            let scope = $rootScope.$new();
            createDummyWalletContextTestnet(Wallet)
            let ctrl = $controller('CreateMosaicCtrl', {
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
            let ctrl = $controller('CreateMosaicCtrl', {
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