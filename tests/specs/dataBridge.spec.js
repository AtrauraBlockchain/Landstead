import helpers from '../../src/app/utils/helpers';
import WalletFixture from '../data/wallet';

describe('DataBridge service tests', function() {
    let DataBridge, AppConstants, $localStorage, Wallet, Connector;

    beforeEach(angular.mock.module('app'));

    beforeEach(angular.mock.inject(function( _AppConstants_, _$localStorage_, _DataBridge_, _Wallet_, _Connector_) {
        DataBridge = _DataBridge_;
        Wallet = _Wallet_;
        Connector = _Connector_;
        AppConstants = _AppConstants_;
        $localStorage = _$localStorage_;
    }));

    function createContext(Wallet) {
        Wallet.setWallet(WalletFixture);
        Wallet.setDefaultNode();
    }

    it("Default properties initialized", function() {
        // Assert
        expect(DataBridge.nisHeight).toBe(0);
        expect(DataBridge.connectionStatus).toBe(false);
        expect(DataBridge.accountData).toBeUndefined();
        expect(DataBridge.transactions).toEqual([]);
        expect(DataBridge.unconfirmed).toEqual([]);
        expect(DataBridge.mosaicDefinitionMetaDataPair).toEqual({});
        expect(DataBridge.mosaicDefinitionMetaDataPairSize).toBe(0);
        expect(DataBridge.mosaicOwned).toEqual({});
        expect(DataBridge.mosaicOwnedSize).toEqual({});
        expect(DataBridge.namespaceOwned).toEqual({});
        expect(DataBridge.harvestedBlocks).toEqual([]);
        expect(DataBridge.connector).toBeUndefined();
        expect(DataBridge.delegatedData).toBeUndefined();
        expect(DataBridge.marketInfo).toBeUndefined();
    });
});