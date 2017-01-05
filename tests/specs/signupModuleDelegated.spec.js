import Network from '../../src/app/utils/Network';
import Address from '../../src/app/utils/Address';
import KeyPair from '../../src/app/utils/KeyPair';
import CryptoHelpers from '../../src/app/utils/CryptoHelpers';

describe('Signup module delegated tests', function() {
    let WalletBuilder, $filter, $controller, $localStorage, AppConstants, $q;

    beforeEach(angular.mock.module('app'));

    beforeEach(angular.mock.inject(function(_$filter_, _$controller_, _$localStorage_, _AppConstants_, _WalletBuilder_, _$q_) {
        WalletBuilder = _WalletBuilder_;
        $q = _$q_;
        $filter = _$filter_;
        $controller = _$controller_;
        $localStorage = _$localStorage_;
        AppConstants = _AppConstants_;
    }));

    // Override
    function override(ctrl) {
        ctrl._storage.wallets = [];
        ctrl._downloadWalletCalled = false;
        ctrl.download = function(wallet) {
            ctrl._downloadWalletCalled = true;
        }
    }

    it("Can create new wallet", function() {
        // Arrange
        let ctrl = $controller('SignupCtrl');
        override(ctrl);
        ctrl.formData = {};
        ctrl.formData.walletName = "QM";
        ctrl.formData.password = "TestTest";
        ctrl.formData.confirmPassword = "TestTest";
        ctrl.network = Network.data.Mainnet.id;

        spyOn(ctrl._WalletBuilder, 'createWallet').and.returnValue($q.when({}));

        // Act
        ctrl.createWallet();

        // Assert: 
        expect(ctrl._WalletBuilder.createWallet).toHaveBeenCalledWith(
            ctrl.formData.walletName,
            ctrl.formData.password,
            ctrl.network);
    });

    it("Can create brain wallet", function() {
        // Arrange
        let ctrl = $controller('SignupCtrl');
        override(ctrl);
        ctrl.formData = {};
        ctrl.formData.walletName = "QM";
        ctrl.formData.password = "TestTest";
        ctrl.formData.confirmPassword = "TestTest";
        ctrl.network = Network.data.Mainnet.id;

        spyOn(ctrl._WalletBuilder, 'createBrainWallet').and.returnValue($q.when({}));

        // Act
        ctrl.createBrainWallet();

        // Assert: 
        expect(ctrl._WalletBuilder.createBrainWallet).toHaveBeenCalledWith(
            ctrl.formData.walletName,
            ctrl.formData.password,
            ctrl.network);
    });

    it("Can create private key wallet", function() {
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

        spyOn(ctrl._WalletBuilder, 'createPrivateKeyWallet').and.returnValue($q.when({}));

        // Act
        ctrl.createPrivateKeyWallet();

        // Assert: 
        expect(ctrl._WalletBuilder.createPrivateKeyWallet).toHaveBeenCalledWith(
            ctrl.formData.walletName,
            ctrl.formData.password,
            ctrl.formData.address,
            ctrl.formData.privateKey,
            ctrl.network);
    });

});