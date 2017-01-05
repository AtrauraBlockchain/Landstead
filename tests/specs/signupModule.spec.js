import Network from '../../src/app/utils/Network';
import Address from '../../src/app/utils/Address';
import KeyPair from '../../src/app/utils/KeyPair';
import CryptoHelpers from '../../src/app/utils/CryptoHelpers';

describe('Signup module tests', function() {
    let WalletBuilder, $filter, $controller, $localStorage, AppConstants, $q, $rootScope, $timeout;

    beforeEach(angular.mock.module('app'));

    beforeEach(angular.mock.inject(function(_$filter_, _$controller_, _WalletBuilder_, _$localStorage_, _AppConstants_, _$q_, _$rootScope_, _$timeout_) {
        WalletBuilder = _WalletBuilder_;
        $filter = _$filter_;
        $controller = _$controller_;
        $localStorage = _$localStorage_;
        AppConstants = _AppConstants_;
        $q = _$q_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
    }));

    // Override
    function override(ctrl) {
        ctrl._storage.wallets = [];
        ctrl._downloadWalletCalled = false;
        ctrl.download = function(wallet) {
            ctrl._downloadWalletCalled = true;
        }
    }

    it("Default properties initialized", function() {
        // Arrange:
        let ctrl = $controller('SignupCtrl');

        // Assert
        expect(ctrl.network).toBe(AppConstants.defaultNetwork);
        expect(ctrl.networks).toEqual(Network.data);
        expect(ctrl._selectedType).toEqual(ctrl.walletTypes[0]);
        expect(ctrl._storage.wallets).toEqual($localStorage.wallets || []);
    });

    it("Can change network", function() {
        // Arrange:
        let ctrl = $controller('SignupCtrl');

        // Act
        ctrl.changeNetwork(Network.data.Mainnet.id);

        // Assert
        expect(ctrl.network).toBe(Network.data.Mainnet.id);
    });

    it("Can change wallet type", function() {
        // Arrange:
        let ctrl = $controller('SignupCtrl');
        let type = 2;

        // Act
        ctrl.changeWalletType(type);

        // Assert
        expect(ctrl._selectedType).toEqual(ctrl.walletTypes[type - 1]);
    });

    xit("Can create new wallet", function() {
        // Arrange
        let scope = $rootScope.$new();
        let ctrl = $controller('SignupCtrl', {
            $scope: scope
        });
        override(ctrl);
        ctrl.formData = {};
        ctrl.formData.walletName = "QM";
        ctrl.formData.password = "TestTest";
        ctrl.formData.confirmPassword = "TestTest";
        ctrl.network = Network.data.Mainnet.id;
        scope.$digest();

        // Act
        spyOn(ctrl._WalletBuilder, 'createWallet').and.callThrough();

        ctrl.createWallet();

        expect(ctrl._storage.wallets.length).toEqual(1);
        expect(ctrl._downloadWalletCalled).toBe(true);
    });

    describe('createWallet edge-cases', function() {

        it("Can't create new wallet if name already exist", function() {
            // Arrange:
            let ctrl = $controller('SignupCtrl');
            override(ctrl);
            ctrl.formData = {};
            ctrl.formData.walletName = "QM";
            ctrl.formData.password = "TestTest";
            ctrl.formData.confirmPassword = "TestTest";
            ctrl.network = Network.data.Mainnet.id;
            ctrl._storage.wallets.push({ "name": "QM" })

            spyOn(ctrl._WalletBuilder, 'createWallet').and.returnValue($q.when({}));

            // Act: 
            ctrl.createWallet();

            expect(ctrl._WalletBuilder.createWallet).not.toHaveBeenCalled();

        });

        it("Can't create new wallet if parameter missing", function() {
            // Arrange:
            let ctrl = $controller('SignupCtrl');
            override(ctrl);
            ctrl.formData = {};
            ctrl.formData.walletName = "QM";
            ctrl.formData.password = "TestTest";
            ctrl.formData.confirmPassword = "";
            ctrl.network = Network.data.Mainnet.id;

            spyOn(ctrl._WalletBuilder, 'createWallet').and.returnValue($q.when({}));

            // Act: 
            ctrl.createWallet();

            expect(ctrl._WalletBuilder.createWallet).not.toHaveBeenCalled();
        });

        it("Can't create new wallet if passwords not matching", function() {
            // Arrange:
            let ctrl = $controller('SignupCtrl');
            override(ctrl);
            ctrl.formData = {};
            ctrl.formData.walletName = "QM";
            ctrl.formData.password = "TestTest";
            ctrl.formData.confirmPassword = "TestTest11";
            ctrl.network = Network.data.Mainnet.id;

            spyOn(ctrl._WalletBuilder, 'createWallet').and.returnValue($q.when({}));

            // Act: 
            ctrl.createWallet();

            expect(ctrl._WalletBuilder.createWallet).not.toHaveBeenCalled();
        });
    });

    xit("Can create brain wallet", function(done) {
        // Arrange:
        let ctrl = $controller('SignupCtrl');
        override(ctrl);
        ctrl.formData = {};
        ctrl.formData.walletName = "QM";
        ctrl.formData.password = "TestTest";
        ctrl.formData.confirmPassword = "TestTest";
        ctrl.network = Network.data.Mainnet.id;
        let expectedWallet = {
            "privateKey": "",
            "name": "QM",
            "accounts": {
                "0": {
                    "brain": true,
                    "algo": "pass:6k",
                    "encrypted": "",
                    "iv": "",
                    "address": "NCTIKLMIWKRZC3TRKD5JYZUQHV76LGS3TTSUIXM6",
                    "network": 104,
                    "child": "fda69cfb780e65ee400be32101f80c7611ba95930cd838a4d32dabb4c738f1af"
                }
            }
        };

        // Act
        ctrl._createBrainWallet().then(() => {

            // Assert
            expect(ctrl._storage.wallets.length).toEqual(1);
            expect(ctrl._downloadWalletCalled).toBe(true);
            expect(ctrl._storage.wallets[0]).toEqual(expectedWallet);

            done();
        });

    });

    describe('createBrainWallet edge-cases', function() {

        it("Can't create brain wallet if name already exist", function() {
            // Arrange:
            let ctrl = $controller('SignupCtrl');
            override(ctrl);
            ctrl.formData = {};
            ctrl.formData.walletName = "QM";
            ctrl.formData.password = "TestTest";
            ctrl.formData.confirmPassword = "TestTest";
            ctrl.network = Network.data.Mainnet.id;
            ctrl._storage.wallets[0] = {
                "privateKey": "",
                "name": "QM",
                "accounts": {
                    "0": {
                        "brain": true,
                        "algo": "pass:6k",
                        "encrypted": "",
                        "iv": "",
                        "address": "NCTIKLMIWKRZC3TRKD5JYZUQHV76LGS3TTSUIXM6",
                        "network": 104,
                        "child": "fda69cfb780e65ee400be32101f80c7611ba95930cd838a4d32dabb4c738f1af"
                    }
                }
            }

            spyOn(ctrl._WalletBuilder, 'createBrainWallet').and.returnValue($q.when({}));

            // Act: 
            ctrl.createBrainWallet();

            expect(ctrl._WalletBuilder.createBrainWallet).not.toHaveBeenCalled();
        });

        it("Can't create brain wallet if parameter missing", function() {
            // Arrange:
            let ctrl = $controller('SignupCtrl');
            override(ctrl);
            ctrl.formData = {};
            ctrl.formData.walletName = "QM";
            ctrl.formData.password = "TestTest";
            ctrl.formData.confirmPassword = "";
            ctrl.network = Network.data.Mainnet.id;

            spyOn(ctrl._WalletBuilder, 'createBrainWallet').and.returnValue($q.when({}));

            // Act: 
            ctrl.createBrainWallet();

            expect(ctrl._WalletBuilder.createBrainWallet).not.toHaveBeenCalled();
        });

        it("Can't create brain wallet if passwords not matching", function() {
            // Arrange:
            let ctrl = $controller('SignupCtrl');
            override(ctrl);
            ctrl.formData = {};
            ctrl.formData.walletName = "QM";
            ctrl.formData.password = "TestTest";
            ctrl.formData.confirmPassword = "TestTest11";
            ctrl.network = Network.data.Mainnet.id;

            spyOn(ctrl._WalletBuilder, 'createBrainWallet').and.returnValue($q.when({}));

            // Act: 
            ctrl.createBrainWallet();

            expect(ctrl._WalletBuilder.createBrainWallet).not.toHaveBeenCalled();
        });

    });

    xit("Can create private key wallet", function(done) {
        // Arrange
        let ctrl = $controller('SignupCtrl');
        override(ctrl);
        ctrl.formData = {};
        ctrl.formData.walletName = "QM";
        ctrl.formData.password = "TestTest";
        ctrl.formData.confirmPassword = "TestTest";
        ctrl.formData.privateKey = "73d0d250a2214274c4f433f79573ff1d50cde37b5d181b341f9942d096341225";
        ctrl.formData.address = "NBJ2XZMCAFAAVZXTPUPJ4MDAJOYCFB7X3MKBHFCK";
        ctrl.network = Network.data.Mainnet.id;

        // Act
        ctrl._createPrivateKeyWallet().then(() => {

            // Assert
            expect(ctrl._storage.wallets.length).toEqual(1);
            expect(ctrl._downloadWalletCalled).toBe(true);

            done();
        });

    });

    describe('createPrivateKeyWallet edge-cases', function() {

        it("Can't create private key wallet if name already exist", function() {
            // Arrange:
            let ctrl = $controller('SignupCtrl');
            override(ctrl);
            ctrl.formData = {};
            ctrl.formData.walletName = "QM";
            ctrl.formData.password = "TestTest";
            ctrl.formData.confirmPassword = "TestTest";
            ctrl.formData.privateKey = "73d0d250a2214274c4f433f79573ff1d50cde37b5d181b341f9942d096341225";
            ctrl.formData.address = "NBJ2XZMCAFAAVZXTPUPJ4MDAJOYCFB7X3MKBHFCK";
            ctrl.network = Network.data.Mainnet.id;
            ctrl._storage.wallets[0] = {
                "privateKey": "",
                "name": "QM",
                "accounts": {
                    "0": {
                        "brain": false,
                        "algo": "pass:enc",
                        "encrypted": "4b51d000bce632b5e47d3d1583d421042a81e6dc19edd15339de39e0297c1920aa1646671f111bd712846f1643aaae57",
                        "iv": "a1ba21b3193e6f07e0873b07a3044fd2",
                        "address": "NBJ2XZMCAFAAVZXTPUPJ4MDAJOYCFB7X3MKBHFCK",
                        "network": 104,
                        "child": "NCETMVL7JDELNHFQUNQ3554TUM2A5Z4SGFGIL3WC"
                    }
                }
            };

            spyOn(ctrl._WalletBuilder, 'createPrivateKeyWallet').and.returnValue($q.when({}));

            // Act: 
            ctrl.createPrivateKeyWallet();

            expect(ctrl._WalletBuilder.createPrivateKeyWallet).not.toHaveBeenCalled();
        });

        it("Can't create private key wallet if parameter missing", function() {
            // Arrange:
            let ctrl = $controller('SignupCtrl');
            override(ctrl);
            ctrl.formData = {};
            ctrl.formData.walletName = "QM";
            ctrl.formData.password = "TestTest";
            ctrl.formData.confirmPassword = "TestTest";
            ctrl.formData.privateKey = "73d0d250a2214274c4f433f79573ff1d50cde37b5d181b341f9942d096341225";
            ctrl.formData.address = "";
            ctrl.network = Network.data.Mainnet.id;

            spyOn(ctrl._WalletBuilder, 'createPrivateKeyWallet').and.returnValue($q.when({}));

            // Act: 
            ctrl.createPrivateKeyWallet();

            expect(ctrl._WalletBuilder.createPrivateKeyWallet).not.toHaveBeenCalled();
        });

        it("Can't create private key wallet if passwords not matching", function() {
            // Arrange:
            let ctrl = $controller('SignupCtrl');
            override(ctrl);
            ctrl.formData = {};
            ctrl.formData.walletName = "QM";
            ctrl.formData.password = "TestTest";
            ctrl.formData.confirmPassword = "TestTest11";
            ctrl.formData.privateKey = "73d0d250a2214274c4f433f79573ff1d50cde37b5d181b341f9942d096341225";
            ctrl.formData.address = "NBJ2XZMCAFAAVZXTPUPJ4MDAJOYCFB7X3MKBHFCK";
            ctrl.network = Network.data.Mainnet.id;

            spyOn(ctrl._WalletBuilder, 'createPrivateKeyWallet').and.returnValue($q.when({}));

            // Act: 
            ctrl.createPrivateKeyWallet();

            expect(ctrl._WalletBuilder.createPrivateKeyWallet).not.toHaveBeenCalled();
        });

    });

});