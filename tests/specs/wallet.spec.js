import Network from '../../src/app/utils/Network';
import helpers from '../../src/app/utils/helpers';
import Nodes from '../../src/app/utils/nodes';
import WalletFixture from '../data/wallet';


describe('Wallet service tests', function() {
    let Wallet, AppConstants, $localStorage;

    beforeEach(angular.mock.module('app'));

    beforeEach(angular.mock.inject(function(_Wallet_, _AppConstants_, _$localStorage_) {
        Wallet = _Wallet_;
        AppConstants = _AppConstants_;
        $localStorage = _$localStorage_;
        $localStorage.$reset();
    }));

    it("Default properties initialized", function() {
        // Assert
        expect(Wallet.current).toBeUndefined();
        expect(Wallet.currentAccount).toBeUndefined();
        expect(Wallet.algo).toBeUndefined();
        expect(Wallet.node).toBeUndefined();
        expect(Wallet.searchNode).toBeUndefined();
        expect(Wallet.chainLink).toBeUndefined();
        expect(Wallet.harvestingNode).toBeUndefined();
        expect(Wallet.ntyData).toBeUndefined();
    });

    it("Can set a wallet", function() {
        // Arrange
        let wallet = WalletFixture.mainnetWallet;

        // Act
        Wallet.setWallet(wallet);

        // Assert
        expect(Wallet.current).toEqual(wallet);
        expect(Wallet.currentAccount).toEqual(wallet.accounts[0]);
        expect(Wallet.algo).toEqual(wallet.accounts[0].algo);
        expect(Wallet.network).toEqual(wallet.accounts[0].network);
    });

    describe('Set a wallet edge-cases', function() {

        it("Can't set a wallet if no wallet", function() {
            // Arrange
            let wallet = "";

            // Act
            Wallet.setWallet(wallet);

            // Assert
            expect(Wallet.current).toBe(undefined);
            expect(Wallet.currentAccount).toBe(undefined);
            expect(Wallet.algo).toBe(undefined);
            expect(Wallet.network).toBe(AppConstants.defaultNetwork);
        });

    });

    it("Can set a wallet at index", function() {
        // Arrange
        let wallet = WalletFixture.mainnetWalletDoubleAccounts;
        Wallet.setWallet(wallet);
        let index = 1;

        // Act
        Wallet.setWalletAccount(wallet, index);

        // Assert
        expect(Wallet.currentAccount).toEqual(wallet.accounts[index]);
        expect(Wallet.algo).toEqual(wallet.accounts[0].algo);
        expect(Wallet.network).toEqual(wallet.accounts[0].network);
    });

    describe('Set a wallet account edge-cases', function() {

        it("Can't set a wallet account if no current wallet", function() {
            // Arrange
            let wallet = WalletFixture.mainnetWalletDoubleAccounts;
            let index = 1;

            // Act
            Wallet.setWalletAccount(wallet, index);

            // Assert
            expect(Wallet.current).toBe(undefined);
            expect(Wallet.currentAccount).toBe(undefined);
            expect(Wallet.algo).toBe(undefined);
            expect(Wallet.network).toBe(AppConstants.defaultNetwork);
        });

        it("Can't set a wallet account if no selected wallet", function() {
            // Arrange
            let wallet = WalletFixture.mainnetWalletDoubleAccounts;
            Wallet.setWallet(wallet);
            let index = 1;
            let selectedWallet = "";

            // Act
            Wallet.setWalletAccount(selectedWallet, index);

            // Assert
            expect(Wallet.current).toEqual(wallet);
            expect(Wallet.currentAccount).toEqual(wallet.accounts[0]);
            expect(Wallet.algo).toEqual(wallet.accounts[0].algo);
            expect(Wallet.network).toBe(wallet.accounts[0].network);
        });

        it("Can't set a wallet account if index is out of bounds", function() {
            // Arrange
            let wallet = WalletFixture.mainnetWalletDoubleAccounts;
            Wallet.setWallet(wallet);
            let index = 2;

            // Act
            Wallet.setWalletAccount(wallet, index);

            // Assert
            expect(Wallet.current).toEqual(wallet);
            expect(Wallet.currentAccount).toEqual(wallet.accounts[0]);
            expect(Wallet.algo).toEqual(wallet.accounts[0].algo);
            expect(Wallet.network).toBe(wallet.accounts[0].network);
        });

    });

    it("Can set default mainnet node if none in local storage", function() {
        // Arrange
        Wallet.network = 104;

        // Act
        Wallet.setDefaultNode();

        // Assert
        expect(Wallet.node).toEqual(Nodes.defaultMainnetNode);
    });

    it("Can set mainnet node if one in local storage", function() {
        // Arrange
        Wallet.network = 104;
        $localStorage.selectedMainnetNode = "http://san.nem.ninja:7778";

        // Act
        Wallet.setDefaultNode();

        // Assert
        expect(Wallet.node).toEqual($localStorage.selectedMainnetNode);
    });

    it("Can set default testnet node if none in local storage", function() {
        // Arrange
        Wallet.network = -104;

        // Act
        Wallet.setDefaultNode();

        // Assert
        expect(Wallet.node).toEqual(Nodes.defaultTestnetNode);
    });

    it("Can set testnet node if one in local storage", function() {
        // Arrange
        Wallet.network = -104;
        $localStorage.selectedTestnetNode = "http://bob.nem.ninja:7778"

        // Act
        Wallet.setDefaultNode();

        // Assert
        expect(Wallet.node).toEqual($localStorage.selectedTestnetNode);
    });

    it("Can set mainnet util nodes", function() {
        // Arrange
        Wallet.network = 104;

        // Act
        Wallet.setUtilNodes();

        // Assert
        expect(Wallet.chainLink).toEqual(Nodes.defaultMainnetExplorer);
        expect(Wallet.searchNode).toEqual(Nodes.mainnetSearchNodes[0]);
    });

    it("Can set testnet util nodes", function() {
        // Arrange
        Wallet.network = -104;

        // Act
        Wallet.setUtilNodes();

        // Assert
        expect(Wallet.chainLink).toEqual(Nodes.defaultTestnetExplorer);
        expect(Wallet.searchNode).toEqual(Nodes.testnetSearchNodes[0]);
    });

    it("Can set mainnet nty data if present in local storage", function() {
        // Arrange
        Wallet.network = Network.data.Mainnet.id;
        $localStorage.ntyMainnet = [{
            "filename": "Accords-jazz.pdf",
            "tags": "Mainnet",
            "fileHash": "fe4e545903b88c03ec6bd0a91283dc9c12b13510407fc06164fd9bec04258e2bfb79974c43",
            "txHash": "5f0d3258a9a22522ff5d68634484909b9c37bacd6e68ab6d7cbb54d502d45ee9",
            "timeStamp": "Fri, 24 Jun 2016 14:51:31 GMT"
        }]

        // Act
        Wallet.setNtyData()

        // Assert
        expect(Wallet.ntyData).toEqual($localStorage.ntyMainnet);
    });

    it("Can set testnet nty data if present in local storage", function() {
        // Arrange
        Wallet.network = Network.data.Testnet.id;
        $localStorage.ntyTestnet = [{
            "filename": "Accords-jazz.pdf",
            "tags": "Testnet",
            "fileHash": "fe4e545903b88c03ec6bd0a91283dc9c12b13510407fc06164fd9bec04258e2bfb79974c43",
            "txHash": "5f0d3258a9a22522ff5d68634484909b9c37bacd6e68ab6d7cbb54d502d45ee9",
            "timeStamp": "Fri, 24 Jun 2016 14:51:31 GMT"
        }]

        // Act
        Wallet.setNtyData()

        // Assert
        expect(Wallet.ntyData).toEqual($localStorage.ntyTestnet);
    });

    it("Can set mainnet nty data in local storage", function() {
        // Arrange
        Wallet.network = Network.data.Mainnet.id;
        let ntyData = [{
            "filename": "Accords-jazz.pdf",
            "tags": "Mainnet",
            "fileHash": "fe4e545903b88c03ec6bd0a91283dc9c12b13510407fc06164fd9bec04258e2bfb79974c43",
            "txHash": "5f0d3258a9a22522ff5d68634484909b9c37bacd6e68ab6d7cbb54d502d45ee9",
            "timeStamp": "Fri, 24 Jun 2016 14:51:31 GMT"
        }]

        // Act
        Wallet.setNtyDataInLocalStorage(ntyData)

        // Assert
        expect($localStorage.ntyMainnet).toEqual(ntyData);
    });

    it("Can set testnet nty data in local storage", function() {
        // Arrange
        Wallet.network = Network.data.Testnet.id;
        let ntyData = [{
            "filename": "Accords-jazz.pdf",
            "tags": "Mainnet",
            "fileHash": "fe4e545903b88c03ec6bd0a91283dc9c12b13510407fc06164fd9bec04258e2bfb79974c43",
            "txHash": "5f0d3258a9a22522ff5d68634484909b9c37bacd6e68ab6d7cbb54d502d45ee9",
            "timeStamp": "Fri, 24 Jun 2016 14:51:31 GMT"
        }]

        // Act
        Wallet.setNtyDataInLocalStorage(ntyData)

        // Assert
        expect($localStorage.ntyTestnet).toEqual(ntyData);
    });

});