import helpers from '../../src/app/utils/helpers';
import Network from '../../src/app/utils/Network';
import WalletFixture from '../data/wallet';
import AccountDataFixture from '../data/accountData';

describe('Transfer transaction module tests', function() {
    let $controller, $localStorage, AppConstants, $rootScope, Wallet, DataBridge, $httpBackend, NetworkRequests, $q;

    beforeEach(angular.mock.module('app'));

    beforeEach(angular.mock.inject(function( _$controller_,  _$localStorage_, _AppConstants_, _$rootScope_, _Wallet_, _DataBridge_, _$httpBackend_, _NetworkRequests_, _$q_) {
        $controller = _$controller_;
        $localStorage = _$localStorage_;
        AppConstants = _AppConstants_;
        $rootScope = _$rootScope_;
        Wallet = _Wallet_;
        DataBridge = _DataBridge_;
        $httpBackend = _$httpBackend_;
        NetworkRequests = _NetworkRequests_;
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
        DataBridge.mosaicOwned =  AccountDataFixture.mainnetMosaicOwned;
        DataBridge.mosaicDefinitionMetaDataPair = AccountDataFixture.mainnetMosaicDefinitionMetaDataPair;
        DataBridge.nisHeight = 999999999;
    } 

    it("Default properties initialized", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });

        // Assert
        expect(ctrl.formData).toEqual({
            rawRecipient: '',
            recipientPubKey: '',
            recipient: '',
            message: '',
            amount: 0,
            fee: 1 * 1000000,
            encryptMessage: false,
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
            },
            mosaics: null,
            isMosaicTransfer: false
        });
        expect(ctrl.counter).toBe(1);
        expect(ctrl.mosaicsMetaData).toEqual(DataBridge.mosaicDefinitionMetaDataPair);
        expect(ctrl.currentAccountMosaicNames).toEqual(["nano:points", "nem:xem"]);
        expect(ctrl.selectedMosaic).toEqual("nem:xem");
        expect(ctrl.invoice).toBe(false);
        expect(ctrl.aliasAddress).toEqual('');
        expect(ctrl.showAlias).toBe(false);
        expect(ctrl.okPressed).toBe(false);
        expect(ctrl.common).toEqual({
            'password': '',
            'privateKey': '',
        });
        expect(ctrl.invoiceData).toEqual({
            "v": ctrl._Wallet.network === Network.data.Testnet.id ? 1 : 2,
            "type": 2,
            "data": {
                "addr": "TAF7BPDV22HCFNRJEWOGLRKBYQF65GBOLQPI5GGO",
                "amount": 0,
                "msg": "",
                "name": "NanoWallet XEM invoice"
            }
        });
    });

    it("Can update fee - Testnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });

        // Act
        ctrl.updateFees();

        // Assert
        expect(ctrl.formData.fee).toBe(1000000);
    });

    it("Can update fee - Mainnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });

        // Act
        ctrl.updateFees();

        // Assert
        expect(ctrl.formData.fee).toBe(10000000);
    });

    it("Update fee on amount change - Testnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();

        // Act
        ctrl.formData.amount = 20000;
        ctrl.updateFees();
        scope.$digest();

        // Assert
        expect(ctrl.formData.fee).toBe(2000000);
        expect(ctrl.formData.innerFee).toBe(0);
    });

    it("Update fee on amount change - Mainnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();

        // Act
        ctrl.formData.amount = 20000;
        ctrl.updateFees();
        scope.$digest();

        // Assert
        expect(ctrl.formData.fee).toBe(13000000);
        expect(ctrl.formData.innerFee).toBe(0);
    });

    it("Update fee on message change - Testnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();

        // Act
        ctrl.formData.message = "Hello";
        ctrl.updateFees();
        scope.$digest();

        // Assert
        expect(ctrl.formData.fee).toBe(2000000);
        expect(ctrl.formData.innerFee).toBe(0);
    });

    it("Update fee on message change - Mainnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();

        // Act
        ctrl.formData.message = "Hello";
        ctrl.updateFees();
        scope.$digest();

        // Assert
        expect(ctrl.formData.fee).toBe(12000000);
        expect(ctrl.formData.innerFee).toBe(0);
    });

    it("Update fee if multisig", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();

        // Act
        ctrl.formData.isMultisig = true;
        ctrl.updateFees();
        scope.$digest();

        // Assert
        expect(ctrl.formData.fee).toBe(6000000);
        expect(ctrl.formData.innerFee).toBe(1000000);
    });

    it("Update fee if mosaic transfer - Testnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();

        // Act
        ctrl.formData.isMosaicTransfer = true;
        ctrl.setMosaicTransfer();
        scope.$digest();

        // Assert
        expect(ctrl.formData.fee).toBe(1000000);
    });

    it("Update fee if mosaic transfer - Mainnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();

        // Act
        ctrl.formData.isMosaicTransfer = true;
        ctrl.setMosaicTransfer();
        scope.$digest();

        // Assert
        expect(ctrl.formData.fee).toBe(12500000);
    });

    it("Update fee if multisig and mosaic transfer", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();

        // Act
        ctrl.formData.isMultisig = true;
        ctrl.formData.isMosaicTransfer = true;
        ctrl.setMosaicTransfer();
        scope.$digest();

        // Assert
        expect(ctrl.formData.innerFee).toBe(1000000);
        expect(ctrl.formData.fee).toBe(6000000);
    });

    it("Fee cap is 25 XEM - Testnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();

        // Act
        ctrl.formData.amount = 500000;
        ctrl.updateFees();
        scope.$digest();

        // Assert
        expect(ctrl.formData.fee).toBe(25000000);
        expect(ctrl.formData.innerFee).toBe(0);
    });

    it("Calculate right fees for mosaics - Testnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();

        // Act
        ctrl.formData.isMosaicTransfer = true;
        ctrl.setMosaicTransfer();
        ctrl.formData.mosaics[0].quantity = 150000000000; // 150'000 XEM
        scope.$digest();
        ctrl.updateFees();

        // Assert
        expect(ctrl.formData.fee).toBe(15000000);
    });

    it("Calculate right fees for mosaics - Mainnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();

        // Act
        ctrl.formData.isMosaicTransfer = true;
        ctrl.setMosaicTransfer();
        ctrl.formData.mosaics[0].quantity = 150000000000; // 150'000 XEM
        scope.$digest();
        ctrl.updateFees();

        // Assert
        expect(ctrl.formData.fee).toBe(96250000);
    });

    it("Calculate right fees for multisig mosaic transfers", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();

        // Act
        ctrl.formData.isMultisig = true;
        ctrl.formData.isMosaicTransfer = true;
        ctrl.setMosaicTransfer();
        ctrl.formData.mosaics[0].quantity = 150000000000; // 150'000 XEM
        scope.$digest();
        ctrl.updateFees();

        // Assert
        expect(ctrl.formData.innerFee).toBe(15000000);
        expect(ctrl.formData.fee).toBe(6000000);
    });

    it("Encrypt message disabled if multisig", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();

        // Act
        ctrl.formData.encryptMessage = true;
        ctrl.formData.isMultisig = true;
        // Done directly in view when click on multisig tab, set encrypt message to false
        ctrl.formData.encryptMessage = false;
        scope.$digest();

        // Assert
        expect(ctrl.formData.encryptMessage).toBe(false);
    });

    it("Define right values for mosaics and amount if mosaic transfer enabled", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();

        // Act
        ctrl.formData.isMosaicTransfer = true;
        ctrl.setMosaicTransfer();
        scope.$digest();

        // Assert
        expect(ctrl.formData.mosaics).toEqual([{
            'mosaicId': {
                'namespaceId': 'nem',
                'name': 'xem'
            },
            'quantity': 0,
            'gid': 'mos_id_0'
        }]);
        expect(ctrl.formData.amount).toBe(1)
    });

    it("Define right values for mosaics and amount if mosaic transfer disabled", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();

        // Act
        ctrl.formData.isMosaicTransfer = false;
        ctrl.setMosaicTransfer();
        scope.$digest();

        // Assert
        expect(ctrl.formData.mosaics).toBe(null);
        expect(ctrl.formData.amount).toBe(0)
    });

    it("Define right values for mosaics and amount if mosaic transfer enabled then disabled", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();
        ctrl.formData.isMosaicTransfer = true;
        ctrl.setMosaicTransfer();
        scope.$digest();

        // Act
        ctrl.formData.isMosaicTransfer = false;
        ctrl.setMosaicTransfer();
        scope.$digest();

        // Assert
        expect(ctrl.formData.mosaics).toBe(null);
        expect(ctrl.formData.amount).toBe(0)
    });

    it("Can remove mosaic from mosaics array", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();
        ctrl.formData.isMosaicTransfer = true;
        ctrl.setMosaicTransfer();
        scope.$digest();

        // Act
        ctrl.removeMosaic(0)

        // Assert
        expect(ctrl.formData.mosaics).toEqual([]);
    });

    it("Can update current account mosaics", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        ctrl.currentAccountMosaicNames = [];
        scope.$digest();

        // Act
        ctrl.updateCurrentAccountMosaics();

        // Assert
        expect(ctrl.currentAccountMosaicNames).toEqual(["nano:points", "nem:xem"]);
    });

    it("Can update current multisig account mosaics", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        ctrl.currentAccountMosaicNames = [];
        ctrl.formData.isMultisig = true;
        scope.$digest();

        // Act
        ctrl.updateCurrentAccountMosaics();

        // Assert
        if(!DataBridge.accountData.meta.cosignatoryOf.length) {
            expect(ctrl.currentAccountMosaicNames).toEqual([]);
        } else {
            expect(ctrl.currentAccountMosaicNames).toEqual(["nem:xem"]);
        }
    });

    it("Can attach a mosaic to mosaics array", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        ctrl.formData.isMosaicTransfer = true;
        ctrl.setMosaicTransfer();
        scope.$digest();

        // Act
        ctrl.selectedMosaic = 'nano:points'
        ctrl.attachMosaic();
        scope.$digest()

        // Assert
        expect(ctrl.formData.mosaics).toEqual([{
            'mosaicId': {
                'namespaceId': 'nem',
                'name': 'xem'
            },
            'quantity': 0,
            'gid': 'mos_id_0'
        },{
            'mosaicId': {
                'namespaceId': 'nano',
                'name': 'points'
            },
            'quantity': 0,
            'gid': 'mos_id_'+ctrl.counter
        }]);
    });

    it("Can reset mosaics array if multisig", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        ctrl.formData.isMosaicTransfer = true;
        ctrl.setMosaicTransfer();
        scope.$digest();
        ctrl.formData.mosaics = [{
            'mosaicId': {
                'namespaceId': 'nem',
                'name': 'xem'
            },
            'quantity': 0,
            'gid': 'mos_id_0'
        },{
            'mosaicId': {
                'namespaceId': 'nano',
                'name': 'points'
            },
            'quantity': 0,
            'gid': 'mos_id_'+ctrl.counter
        }]

        // Act
        ctrl.formData.isMultisig = true;
         // Done directly in view when click on multisig tab, reset mosaic array
        ctrl.setMosaicTransfer();
        scope.$digest();

        // Assert
        expect(ctrl.formData.mosaics).toEqual([{
            'mosaicId': {
                'namespaceId': 'nem',
                'name': 'xem'
            },
            'quantity': 0,
            'gid': 'mos_id_0'
        }]);
    });

    it("Can get recipient's public key from network and set right data using plain address", function(done) {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();
        let cleanAddress = 'TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S';
        let accountData = {
            "meta": {
                "cosignatories": [],
                "cosignatoryOf": [],
                "status": "LOCKED",
                "remoteStatus": "ACTIVE"
            },
            "account": {
                "address": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
                "harvestedBlocks": 592,
                "balance": 231445000000,
                "importance": 2.9038651986973836E-4,
                "vestedBalance": 231356599161,
                "publicKey": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6",
                "label": null,
                "multisigInfo": {}
            }
        }

        // Act
        $httpBackend.expectGET('http://' + helpers.getHostname(Wallet.node) + ':' + AppConstants.defaultNisPort + '/account/get?address=TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S').respond(200, accountData);
        ctrl.formData.rawRecipient = 'TBCI2A-67UQZA-KCR6NS-4JWAEI-CEIGEI-M72G3M-VW5S';
        ctrl.processRecipientInput();
        scope.$digest();
        $httpBackend.flush();

        // Assert
        expect(ctrl.formData.recipientPubKey.length).toBe(64);
        expect(ctrl.formData.recipient).toEqual(cleanAddress);
        done();
    });

    it("Can get recipient's public key from network and set right data using @alias", function(done) {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();
        let cleanAddress = 'TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S';
        let accountData = {
            "meta": {
                "cosignatories": [],
                "cosignatoryOf": [],
                "status": "LOCKED",
                "remoteStatus": "INACTIVE"
            },
            "account": {
                "address": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
                "harvestedBlocks": 592,
                "balance": 231445000000,
                "importance": 2.9038651986973836E-4,
                "vestedBalance": 231356599161,
                "publicKey": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6",
                "label": null,
                "multisigInfo": {}
            }
        }
        let namespaceData = {
            "owner": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
            "fqn": "nw",
            "height": 440493
        }

        // Act
        $httpBackend.expectGET('http://' + helpers.getHostname(Wallet.node) + ':' + AppConstants.defaultNisPort + '/namespace?namespace=nw').respond(200, namespaceData);
        $httpBackend.expectGET('http://' + helpers.getHostname(Wallet.node) + ':' + AppConstants.defaultNisPort + '/account/get?address=TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S').respond(200, accountData);
        ctrl.formData.rawRecipient = '@nw';
        ctrl.processRecipientInput();
        scope.$digest();
        $httpBackend.flush();

        // Assert
        expect(ctrl.formData.recipientPubKey.length).toBe(64);
        expect(ctrl.formData.recipient).toEqual(cleanAddress);
        expect(ctrl.showAlias).toBe(true);
        done()
    });

    it("Can reset recipient data", function(done) {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();
        let cleanAddress = 'TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S';
        let accountData = {
            "meta": {
                "cosignatories": [],
                "cosignatoryOf": [],
                "status": "LOCKED",
                "remoteStatus": "INACTIVE"
            },
            "account": {
                "address": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
                "harvestedBlocks": 592,
                "balance": 231445000000,
                "importance": 2.9038651986973836E-4,
                "vestedBalance": 231356599161,
                "publicKey": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6",
                "label": null,
                "multisigInfo": {}
            }
        }
        let namespaceData = {
            "owner": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
            "fqn": "nw",
            "height": 440493
        }

        // Act
        $httpBackend.expectGET('http://' + helpers.getHostname(Wallet.node) + ':' + AppConstants.defaultNisPort + '/namespace?namespace=nw').respond(200, namespaceData);
        $httpBackend.expectGET('http://' + helpers.getHostname(Wallet.node) + ':' + AppConstants.defaultNisPort + '/account/get?address=TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S').respond(200, accountData);
        ctrl.formData.rawRecipient = '@nw';
        ctrl.processRecipientInput();
        scope.$digest();
        $httpBackend.flush();
        ctrl.resetRecipientData();

        // Assert
        expect(ctrl.formData.recipientPubKey.length).toBe(0);
        expect(ctrl.formData.recipient).toEqual('');
        expect(ctrl.showAlias).toBe(false);
        done()
    });

    it("Can reset form data", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();
        ctrl.formData.amount = 8;
        ctrl.formData.message = 'NEM rocks !';
        scope.$digest();

        // Act
        ctrl.resetData();

        // Assert
        expect(ctrl.formData.amount).toBe(0);
        expect(ctrl.formData.message).toEqual('');
    });

});