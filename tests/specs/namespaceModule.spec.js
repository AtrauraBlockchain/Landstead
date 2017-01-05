import Sinks from '../../src/app/utils/sinks';
import WalletFixture from '../data/wallet';
import AccountDataFixture from '../data/accountData';

describe('Provision namespace transaction module tests', function() {
    let $controller, $rootScope, Wallet, DataBridge, $q, $filter;

    beforeEach(angular.mock.module('app'));

    beforeEach(angular.mock.inject(function(_$controller_, _$rootScope_, _Wallet_, _DataBridge_, _$q_, _$filter_) {
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
        DataBridge.nisHeight = 999999999;

    }

    function createDummyWalletContextMainnet(Wallet) {
        Wallet.setWallet(WalletFixture.mainnetWallet);
        Wallet.setDefaultNode();

        DataBridge.accountData = AccountDataFixture.mainnetAccountData;
        DataBridge.namespaceOwned = AccountDataFixture.mainnetNamespaceOwned;

        DataBridge.nisHeight = 999999999;

    }

    it("Default properties initialized", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('NamespacesCtrl', {
            $scope: scope
        });
        scope.$digest();
        // Assert
        expect(ctrl.formData).toEqual({
            rentalFeeSink: Sinks.sinks.namespace[Wallet.network],
            rentalFee: 200*1000000,
            namespaceName: '',
            namespaceParent: { owner: 'TAF7BPDV22HCFNRJEWOGLRKBYQF65GBOLQPI5GGO', fqn: 'nano', height: 547741 },
            fee: 20*1000000,
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
        expect(ctrl.okPressed).toBe(false);
        expect(ctrl.common).toEqual({
            'password': '',
            'privateKey': '',
        });
    });

    it("Has right transaction fee on testnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('NamespacesCtrl', {
            $scope: scope
        });

        // Act
        ctrl.updateFees();
        scope.$digest();

        // Assert
        expect(ctrl.formData.fee).toBe(20000000);
        expect(ctrl.formData.innerFee).toBe(0);
    });

    it("Has right transaction fee on mainnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet)
        let ctrl = $controller('NamespacesCtrl', {
            $scope: scope
        });

        // Act
        ctrl.updateFees();
        scope.$digest();

        // Assert
        expect(ctrl.formData.fee).toBe(108000000);
        expect(ctrl.formData.innerFee).toBe(0);
    });

    it("Has right transaction fee if multisig", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('NamespacesCtrl', {
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

    it("Has right rental fee for root namespaces on testnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('NamespacesCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.namespaceParent = null;
        ctrl.updateFees();
        scope.$digest();

        // Assert
        expect(ctrl.formData.rentalFee).toBe(5000 * 1000000);
    });

    it("Has right rental fee for root namespaces on mainnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet)
        let ctrl = $controller('NamespacesCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.namespaceParent = null;
        ctrl.updateFees();
        scope.$digest();

        // Assert
        expect(ctrl.formData.rentalFee).toBe(50000 * 1000000);
    });

    it("Has right rental fee for sub namespaces on testnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('NamespacesCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.namespaceParent = 'nano';
        ctrl.updateFees();
        scope.$digest();

        // Assert
        expect(ctrl.formData.rentalFee).toBe(200 * 1000000);
    });

    it("Has right rental fee for sub namespaces on mainnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet)
        let ctrl = $controller('NamespacesCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.namespaceParent = 'nano';
        ctrl.updateFees();
        scope.$digest();

        // Assert
        expect(ctrl.formData.rentalFee).toBe(5000 * 1000000);
    });

    it("Has right sink on testnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('NamespacesCtrl', {
            $scope: scope
        });

        // Act
        scope.$digest();

        // Assert
        expect(ctrl.formData.rentalFeeSink).toEqual("TAMESP-ACEWH4-MKFMBC-VFERDP-OOP4FK-7MTDJE-YP35");
    });

    it("Has right sink on mainnet", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextMainnet(Wallet)
        let ctrl = $controller('NamespacesCtrl', {
            $scope: scope
        });

        // Act
        scope.$digest();

        // Assert
        expect(ctrl.formData.rentalFeeSink).toEqual("NAMESP-ACEWH4-MKFMBC-VFERDP-OOP4FK-7MTBXD-PZZA");
    });

    it("Can detect < level 3 namespaces", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet);
        DataBridge.namespaceOwned[1] = {
            "nano.test.third": {
                "owner": "TAF7BPDV22HCFNRJEWOGLRKBYQF65GBOLQPI5GGO",
                "fqn": "nano.test.third",
                "height": 547741
            }
        }
        let ctrl = $controller('NamespacesCtrl', {
            $scope: scope
        });
        let NSarray = $filter('objValues')(DataBridge.namespaceOwned);

        // Act & Assert
        expect(ctrl.isNotNamespaceLevel3(NSarray[1]['nano'])).toBe(true);
        expect(ctrl.isNotNamespaceLevel3(NSarray[0]['nano.test.third'])).toBe(false);
    });

    it("Set right current address if multisig enabled", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('NamespacesCtrl', {
            $scope: scope
        });

        // Act
        ctrl.formData.isMultisig = true;
        ctrl.updateCurrentAccountNS();
        scope.$digest();

        // Assert
        expect(ctrl.currentAccount).toEqual("TBUSUKWVVPS7LZO4AF6VABQHY2FI4IIMCJGIVX3X");
    });

    it("Set right current address if multisig enabled then disabled", function() {
        // Arrange:
        let scope = $rootScope.$new();
        createDummyWalletContextTestnet(Wallet)
        let ctrl = $controller('NamespacesCtrl', {
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

    describe('Provision namespace transaction module delegation tests', function() {

        it("Pass right parameters to prepareNamespace in send() method", function() {
            // Arrange:
            let scope = $rootScope.$new();
            createDummyWalletContextTestnet(Wallet)
            let ctrl = $controller('NamespacesCtrl', {
                $scope: scope
            });
            // Override
            ctrl.updateFees = function() {
                // Otherwise it calls prepareNamespace from here first and then spy is on the wrong function
            }
            spyOn(ctrl._Transactions, 'prepareNamespace').and.callThrough();
            spyOn(ctrl._Transactions, 'serializeAndAnnounceTransaction').and.returnValue($q.when({}));
            ctrl.common = {
                "privateKey": "",
                "password": "TestTest11"
            }

            // Act
            ctrl.send();

            // Assert
            expect(ctrl._Transactions.prepareNamespace).toHaveBeenCalledWith(ctrl.common, ctrl.formData);
        });

        it("Can't call prepareNamespace in send() method if wrong password", function() {
            // Arrange:
            let scope = $rootScope.$new();
            createDummyWalletContextTestnet(Wallet)
            let ctrl = $controller('NamespacesCtrl', {
                $scope: scope
            });
            // Override
            ctrl.updateFees = function() {
                // Otherwise it calls prepareNamespace from here first and then spy is on the wrong function
            }
            spyOn(ctrl._Transactions, 'prepareNamespace').and.callThrough();
            spyOn(ctrl._Transactions, 'serializeAndAnnounceTransaction').and.returnValue($q.when({}));
            ctrl.common = {
                "privateKey": "",
                "password": "TestTest"
            }

            // Act
            ctrl.send();

            // Assert
            expect(ctrl._Transactions.prepareNamespace).not.toHaveBeenCalled();
        });

        it("Pass right parameters to serializeAndAnnounceTransaction in send() method", function() {
            // Arrange:
            let scope = $rootScope.$new();
            createDummyWalletContextTestnet(Wallet)
            let ctrl = $controller('NamespacesCtrl', {
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
            let ctrl = $controller('NamespacesCtrl', {
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