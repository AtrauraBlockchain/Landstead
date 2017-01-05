import * as CryptoHelpers from '../../src/app/utils/CryptoHelpers';
import WalletFixture from '../data/wallet';

describe('Login module tests', function() {
    let Wallet, $localStorage, $controller, $q, $rootScope;

    beforeEach(angular.mock.module('app'));

    beforeEach(angular.mock.inject(function(_$controller_, _$localStorage_, _Wallet_, _$q_, _$rootScope_) {
        Wallet = _Wallet_;
        $localStorage = _$localStorage_;
        $controller = _$controller_;
        $localStorage.$reset();
        $q = _$q_;
        $rootScope = _$rootScope_;
    }));

    function override(ctrl) {
        ctrl._downloadWalletCalled = false;
        ctrl.download = function(wallet) {
            ctrl._downloadWalletCalled = true;
        }
    }

    it("Default properties initialized", function() {
        // Arrange:
        let ctrl = $controller('LoginCtrl');

        // Assert
        expect(ctrl.selectedWallet).toEqual('');
        expect(ctrl._storage.wallets).toEqual($localStorage.wallets || []);
        expect(ctrl.common).toEqual({
            'password': '',
            'privateKey': ''
        });
    });

    it("Can load a wallet into app", function() {
        // Arrange:
        let ctrl = $controller('LoginCtrl');
        let base64WalletString = "eyJwcml2YXRlS2V5IjoiIiwibmFtZSI6IlRlc3RuZXRTcGVjIiwiYWNjb3VudHMiOnsiMCI6eyJicmFpbiI6dHJ1ZSwiYWxnbyI6InBhc3M6YmlwMzIiLCJlbmNyeXB0ZWQiOiJjNmRjYmM4YTUzOGM5ZTJlYzllOWJlMTE1YWE2YTEzNDlkMWE4YTI3ZTU3NDEzNmI0ZTYwM2YwNTQ5NDc0MDUzZTAyNmUwNzcxYmY4ZDg2YTM5MmZjY2NlNWI1NDNkMGIiLCJpdiI6IjRjNjM3Nzc1MjM2ZDVhMzY5OGM5NzNiOWJhNjc0NTllIiwiYWRkcmVzcyI6IlRBRjdCUERWMjJIQ0ZOUkpFV09HTFJLQllRRjY1R0JPTFFQSTVHR08iLCJuZXR3b3JrIjotMTA0LCJIRHNlZWQiOiJaR1l1eFZvUWk0V2kxMXdxcVFYaHRmZFdZU01iZWpEUVp1NW5uY25vNmFHSnhaVmR3UEtyb01oY0hhelBOTnAxYWE4UmQyenBCOHRtbm93WE40b3ViM3NyUEtGYnBDQWNvVHBoeml0eXNMcWk1ckJVIiwiY2hpbGQiOiJURDQySTRENVU3VU00VjJXUDJNNlNBNE5XQTdQNTVJVFRZVVZMQkFVIn19fQ=="

        // Act
        ctrl.loadWallet(base64WalletString);

        // Assert
        expect(ctrl._storage.wallets).toEqual([{
            "privateKey": "",
            "name": "TestnetSpec",
            "accounts": {
                "0": {
                    "brain": true,
                    "algo": "pass:bip32",
                    "encrypted": "c6dcbc8a538c9e2ec9e9be115aa6a1349d1a8a27e574136b4e603f0549474053e026e0771bf8d86a392fccce5b543d0b",
                    "iv": "4c637775236d5a3698c973b9ba67459e",
                    "address": "TAF7BPDV22HCFNRJEWOGLRKBYQF65GBOLQPI5GGO",
                    "network": -104,
                    "HDseed": "ZGYuxVoQi4Wi11wqqQXhtfdWYSMbejDQZu5nncno6aGJxZVdwPKroMhcHazPNNp1aa8Rd2zpB8tmnowXN4oub3srPKFbpCAcoTphzitysLqi5rBU",
                    "child": "TD42I4D5U7UM4V2WP2M6SA4NWA7P55ITTYUVLBAU"
                }
            }
        }]);
    });

    xit("Can login with selected wallet - Don't know how to test", function() {
        // Arrange:
        let ctrl = $controller('LoginCtrl');
        ctrl._storage.wallets = [WalletFixture.testnetWallet];
        let selectedWallet = ctrl._storage.wallets[0];
        spyOn(ctrl._location, 'path');

        // Act
        ctrl.login(selectedWallet);

        // Assert
        expect(Wallet.current).toEqual(selectedWallet);
        expect(ctrl._location.path).toHaveBeenCalledWith('/dashboard');
    });

    it("Can clear sensitive data", function() {
        // Arrange:
        let ctrl = $controller('LoginCtrl');
        ctrl.common = {
            'password': '1234567890123456789012345678901234567890123456789012345678901234',
            'privateKey': 'Hello'
        };

        // Act
        ctrl.clearSensitiveData();

        // Assert
        expect(ctrl.common).toEqual({
            'password': '',
            'privateKey': ''
        });
    });

    describe('Login module edge-cases', function() {

        it("Can't load a wallet into app if empty data", function() {
            // Arrange:
            let ctrl = $controller('LoginCtrl');
            let base64WalletString = "";

            // Act
            ctrl.loadWallet(base64WalletString);

            // Assert
            expect(ctrl._storage.wallets).toEqual([]);
        });

        it("Can't login without selected wallet", function() {
            // Arrange:
            let ctrl = $controller('LoginCtrl');
            let selectedWallet = "";
            spyOn(ctrl._location, 'path');

            // Act
            ctrl.login(selectedWallet);

            // Assert
            expect(Wallet.current).toEqual(undefined);
            expect(ctrl._location.path).not.toHaveBeenCalled();
        });

    });

    xit("Pass right parameters to generateBIP32Data on wallet upgrade ", function(done) {
        // Arrange:
        let scope = $rootScope.$new();
        let ctrl = $controller('LoginCtrl');
        override(ctrl);
        ctrl.common = {
            'password': 'TestTest11',
            'privateKey': ''
        };
        ctrl._storage.wallets = [WalletFixture.testnetWallet];
        ctrl.selectedWallet = ctrl._storage.wallets[0];
        spyOn(CryptoHelpers, 'generateBIP32Data').and.returnValues($q.when({}));
        spyOn(ctrl, 'upgradeWallet').and.callThrough();
    
        // Act
        ctrl.upgradeWallet();

        // Assert
        expect(CryptoHelpers.generateBIP32Data).toHaveBeenCalledWith(ctrl.common.privateKey, ctrl.common.password, 0, ctrl.selectedWallet.accounts[0].network);
        done();
    });

    xit("Can upgrade a wallet", function(done) {
        // Arrange:
        let ctrl = $controller('LoginCtrl');
        override(ctrl);
        let expectedWallet = WalletFixture.testnetWallet
        let bip32Data = {
        	"seed": "ZGYuxVoQi4Wi11wqqQXhtfdWYSMbejDQZu5nncno6aGJxZVdwPKroMhcHazPNNp1aa8Rd2zpB8tmnowXN4oub3srPKFbpCAcoTphzitysLqi5rBU",
        	"address": "TD42I4D5U7UM4V2WP2M6SA4NWA7P55ITTYUVLBAU"
        }
        ctrl.common = {
            'password': 'TestTest11',
            'privateKey': ''
        };
        ctrl._storage.wallets = [WalletFixture.testnetWallet];
        ctrl.selectedWallet = ctrl._storage.wallets[0];
        spyOn(CryptoHelpers, 'generateBIP32Data').and.callThrough();

        // Act
        ctrl.upgradeWallet();

        // Assert
        expect(ctrl._storage.wallets[0]).toEqual(expectedWallet);
        expect(ctrl.common).toEqual({
            'password': '',
            'privateKey': ''
        });
        expect(ctrl._downloadWalletCalled).toBe(true)
        done()
    });

});