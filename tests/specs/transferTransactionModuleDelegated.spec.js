import helpers from '../../src/app/utils/helpers';
import WalletFixture from '../data/wallet';
import AccountDataFixture from '../data/accountData';

describe('Transfer transaction module delegated tests', function() {
    let WalletBuilder, $controller, $rootScope, Wallet, DataBridge, $httpBackend, NetworkRequests, $q, Transactions;

    beforeEach(angular.mock.module('app'));

    beforeEach(angular.mock.inject(function(_$controller_, _$rootScope_, _Wallet_, _DataBridge_, _$httpBackend_, _NetworkRequests_, _$q_, _Transactions_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        Wallet = _Wallet_;
        DataBridge = _DataBridge_;
        $httpBackend = _$httpBackend_;
        NetworkRequests = _NetworkRequests_;
        $q = _$q_;
        Transactions = _Transactions_;
    }));

    function createDummyWalletContextMainnet(Wallet) {
        Wallet.setWallet(WalletFixture.mainnetWallet);
        Wallet.setDefaultNode();

        DataBridge.accountData = AccountDataFixture.mainnetAccountData;
        DataBridge.namespaceOwned = AccountDataFixture.mainnetNamespaceOwned;
        DataBridge.mosaicOwned =  AccountDataFixture.mainnetMosaicOwned;
        DataBridge.mosaicDefinitionMetaDataPair = AccountDataFixture.mainnetMosaicDefinitionMetaDataPair;
        DataBridge.nisHeight = 999999999;

    }

it("Call getRecipientData function with right parameter", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();
        spyOn(ctrl, 'getRecipientData').and.returnValue($q.when({}));
        let cleanAddress = 'NAMOAVHFVPJ6FP32YP2GCM64WSRMKXA5KKYWWHPY';

        // Act
        ctrl.formData.rawRecipient = 'NAMOAV-HFVPJ6-FP32YP-2GCM64-WSRMKX-A5KKYW-WHPY';
        scope.$digest();
        ctrl.processRecipientInput();

        // Assert
        expect(ctrl.getRecipientData).toHaveBeenCalledWith(cleanAddress);
    });

    it("Call getRecipientDataFromAlias function with right parameter", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();
        spyOn(ctrl, 'getRecipientDataFromAlias').and.returnValue($q.when({}));
        let alias = 'imre';

        // Act
        ctrl.formData.rawRecipient = '@imre';
        ctrl.processRecipientInput();
        scope.$digest();

        // Assert
        expect(ctrl.getRecipientDataFromAlias).toHaveBeenCalledWith(alias);
    });

    it("Right parameters in getAccountData request when using plain address", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();
        let cleanAddress = 'NAMOAVHFVPJ6FP32YP2GCM64WSRMKXA5KKYWWHPY';
        let accountData = {
            "meta": {
                "cosignatories": [],
                "cosignatoryOf": [],
                "status": "LOCKED",
                "remoteStatus": "ACTIVE"
            },
            "account": {
                "address": "NAMOAVHFVPJ6FP32YP2GCM64WSRMKXA5KKYWWHPY",
                "harvestedBlocks": 116,
                "balance": 3030159148572,
                "importance": 3.543180679979003E-4,
                "vestedBalance": 3005640174876,
                "publicKey": "89ba9620b787ee1b4cdc1d1a9c6739ed90657cc3e04af9319a9cc3e029804b07",
                "label": null,
                "multisigInfo": {}
            }
        }

        spyOn(ctrl, 'getRecipientData').and.callThrough();
        spyOn(ctrl._NetworkRequests, 'getAccountData').and.callFake(function() {
          return {
            then: (callback) => { return callback(accountData); }
          };
        });

        // Act
        ctrl.formData.rawRecipient = 'NAMOAV-HFVPJ6-FP32YP-2GCM64-WSRMKX-A5KKYW-WHPY';
        ctrl.processRecipientInput();
        scope.$digest();

        // Assert
        expect(ctrl.getRecipientData).toHaveBeenCalledWith(cleanAddress);
        expect(ctrl._NetworkRequests.getAccountData).toHaveBeenCalledWith(helpers.getHostname(Wallet.node), cleanAddress);
    });

    it("Right parameters in getNamespacesById and getAccountData request when using @alias", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();
        let cleanAddress = 'NDS3R3ZVAUCQGIU4GUG7L56II4IIXBGIMREL45YG';
        let alias = 'imre';
        let accountData = {
            "meta": {
                "cosignatories": [],
                "cosignatoryOf": [],
                "status": "LOCKED",
                "remoteStatus": "INACTIVE"
            },
            "account": {
                "address": "NDS3R3ZVAUCQGIU4GUG7L56II4IIXBGIMREL45YG",
                "harvestedBlocks": 0,
                "balance": 13949807000001,
                "importance": 0.001423425672461785,
                "vestedBalance": 13949807000001,
                "publicKey": "f85ab43dad059b9d2331ddacc384ad925d3467f03207182e01296bacfb242d01",
                "label": null,
                "multisigInfo": {}
            }
        }
        let namespaceData = {
            "owner": "NDS3R3ZVAUCQGIU4GUG7L56II4IIXBGIMREL45YG",
            "fqn": "imre",
            "height": 440493
        }

        spyOn(ctrl, 'getRecipientDataFromAlias').and.callThrough();
        spyOn(ctrl._NetworkRequests, 'getNamespacesById').and.callFake(function() {
          return {
            then: (callback) => { return callback(namespaceData); }
          };
        });
        spyOn(ctrl._NetworkRequests, 'getAccountData').and.callFake(function() {
          return {
            then: (callback) => { return callback(accountData); }
          };
        });

        // Act
        ctrl.formData.rawRecipient = '@imre';
        ctrl.processRecipientInput();
        scope.$digest();

        // Assert
        expect(ctrl.getRecipientDataFromAlias).toHaveBeenCalledWith(alias);
        expect(ctrl._NetworkRequests.getNamespacesById).toHaveBeenCalledWith(helpers.getHostname(Wallet.node), alias);
        expect(ctrl._NetworkRequests.getAccountData).toHaveBeenCalledWith(helpers.getHostname(Wallet.node), cleanAddress);
    });

    it("Pass right parameters to prepareTranfer when updating fees", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();
        spyOn(ctrl._Transactions, 'prepareTransfer').and.callThrough();
        ctrl.common = {
            "privateKey": "8fac70ea9aca3ae3418e25c0d31d9a0723e0a1790ae8fa97747c00dc0037472e",
            "password": ""
        }

        // Act
        ctrl.formData.recipient = 'NAMOAVHFVPJ6FP32YP2GCM64WSRMKXA5KKYWWHPY';
        ctrl.formData.amount = 8;
        ctrl.formData.message = 'NEM rocks !';
        ctrl.updateFees();
        scope.$digest();

        // Assert
        expect(ctrl._Transactions.prepareTransfer).toHaveBeenCalledWith(ctrl.common, ctrl.formData, ctrl.mosaicsMetaData);
    });

    it("Pass right parameters to prepareTranfer in send() method", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();
        // Override
        ctrl.updateFees = function() {
            // Otherwise it calls prepareTransfer from here first and then spy is on the wrong function
        }
        spyOn(ctrl._Transactions, 'prepareTransfer').and.callThrough();
        spyOn(ctrl._Transactions, 'serializeAndAnnounceTransaction').and.returnValue($q.when({}));
        ctrl.common = {
            "privateKey": "",
            "password": "TestTest"
        }
        ctrl.formData.recipient = 'NAMOAVHFVPJ6FP32YP2GCM64WSRMKXA5KKYWWHPY';
        ctrl.formData.amount = 8;
        ctrl.formData.message = 'NEM rocks !';
        scope.$digest();

        // Act
        ctrl.send();

        // Assert
        expect(ctrl._Transactions.prepareTransfer).toHaveBeenCalledWith(ctrl.common, ctrl.formData, ctrl.mosaicsMetaData);
    });

    it("Can't call prepareTransfer in send() method if wrong password", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();
        // Override
        ctrl.updateFees = function() {
            // Otherwise it calls prepareTransfer from here first and then spy is on the wrong function
        }
        spyOn(ctrl._Transactions, 'prepareTransfer').and.callThrough();
        spyOn(ctrl._Transactions, 'serializeAndAnnounceTransaction').and.returnValue($q.when({}));
        ctrl.common = {
            "privateKey": "",
            "password": "TestTest11"
        }

        // Act
        ctrl.send();

        // Assert
        expect(ctrl._Transactions.prepareTransfer).not.toHaveBeenCalled();
    });

    it("Pass right parameters to serializeAndAnnounceTransaction in send() method", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();
        spyOn(ctrl._Transactions, 'serializeAndAnnounceTransaction').and.returnValue($q.when({}));
        ctrl.common = {
            "privateKey": "",
            "password": "TestTest"
        }
        ctrl.formData.recipient = 'NAMOAVHFVPJ6FP32YP2GCM64WSRMKXA5KKYWWHPY';
        ctrl.formData.amount = 8;
        scope.$digest();

        // Act
        ctrl.send();

        // Assert
        expect(ctrl._Transactions.serializeAndAnnounceTransaction).toHaveBeenCalledWith(jasmine.any(Object), ctrl.common);
    });

    it("Can't call serializeAndAnnounceTransaction in send() method if wrong password", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet)
        let ctrl = $controller('TransferTransactionCtrl', { $scope: scope });
        scope.$digest();
        spyOn(ctrl._Transactions, 'serializeAndAnnounceTransaction').and.returnValue($q.when({}));
        ctrl.common = {
            "privateKey": "",
            "password": "TestTest11"
        }

        // Act
        ctrl.send();

        // Assert
        expect(ctrl._Transactions.serializeAndAnnounceTransaction).not.toHaveBeenCalled();
    });

});