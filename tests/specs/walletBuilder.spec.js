import Network from '../../src/app/utils/Network';
import Address from '../../src/app/utils/Address';
import convert from '../../src/app/utils/convert';

describe('WalletBuilder service tests', function() {
    let WalletBuilder

    beforeEach(angular.mock.module('app'));

    beforeEach(angular.mock.inject(function(_WalletBuilder_) {
        WalletBuilder = _WalletBuilder_;
    }));

    it("Can create new wallet", function(done) {
        // Arrange:
        let walletName = "Quantum_Mechanics";
        let password = "TestTest";
        let network = Network.data.Mainnet.id;

        // Act
        WalletBuilder.createWallet(walletName, password, network).then((wallet) => {

            // Assert
            expect(wallet).not.toBe(0);

            done();
        });
    });

    describe('Create new wallet edge-cases', function() {

        it("Can't create new wallet without password", function(done) {
            // Arrange:
            let walletName = "Quantum_Mechanics";
            let password = "";
            let network = Network.data.Mainnet.id;

            // Act
            WalletBuilder.createWallet(walletName, password, network).then((wallet) => {

                },
                (err) => {

                    // Assert
                    expect(err).toBeDefined();

                    done();
                });
        });

        it("Can't create new wallet without name", function(done) {
            // Arrange:
            let walletName = "";
            let password = "TestTest";
            let network = Network.data.Mainnet.id;

            // Act
            WalletBuilder.createWallet(walletName, password, network).then((wallet) => {

                },
                (err) => {

                    // Assert
                    expect(err).toBeDefined();

                    done();
                });
        });

        it("Can't create new wallet without network", function(done) {
            // Arrange:
            let walletName = "Quantum_Mechanics";
            let password = "TestTest";
            let network = "";

            //// Act
            WalletBuilder.createWallet(walletName, password, network).then((wallet) => {

                },
                (err) => {

                    // Assert
                    expect(err).toBeDefined();

                    done();
                });
        });

    });

    it("Can create brain wallet", function(done) {
        // Arrange:
        let walletName = "Quantum_Mechanics";
        let password = "TestTest";
        let network = Network.data.Mainnet.id;
        let expectedWallet = {
            "privateKey": "",
            "name": "Quantum_Mechanics",
            "accounts": {
                "0": {
                    "brain": true,
                    "algo": "pass:6k",
                    "encrypted": "",
                    "iv": "",
                    "address": "NCTIKLMIWKRZC3TRKD5JYZUQHV76LGS3TTSUIXM6",
                    "label": "Primary",
                    "network": 104,
                    "child": "fda69cfb780e65ee400be32101f80c7611ba95930cd838a4d32dabb4c738f1af"
                }
            }
        };

        // Act
        WalletBuilder.createBrainWallet(walletName, password, network).then((wallet) => {

            // Assert
            expect(wallet).toEqual(expectedWallet);

            done();
        });
    });

    describe('Create brain wallet edge-cases', function() {

        it("Can't create brain wallet without password", function(done) {
            // Arrange:
            let walletName = "Quantum_Mechanics";
            let password = "";
            let network = Network.data.Mainnet.id;

            // Act
            WalletBuilder.createBrainWallet(walletName, password, network).then((wallet) => {

                },
                (err) => {

                    // Assert
                    expect(err).toBeDefined();

                    done();
                });
        });

        it("Can't create brain wallet without name", function(done) {
            // Arrange:
            let walletName = "";
            let password = "TestTest";
            let network = Network.data.Mainnet.id;

            // Act
            WalletBuilder.createBrainWallet(walletName, password, network).then((wallet) => {

                },
                (err) => {

                    // Assert
                    expect(err).toBeDefined();

                    done();
                });
        });

        it("Can't create brain wallet without network", function(done) {
            // Arrange:
            let walletName = "Quantum_Mechanics";
            let password = "TestTest";
            let network = "";

            // Act
            WalletBuilder.createBrainWallet(walletName, password, network).then((wallet) => {

                },
                (err) => {

                    // Assert
                    expect(err).toBeDefined();

                    done();
                });
        });

    });

    it("Can create private key wallet", function(done) {
        // Arrange:
        let walletName = "Quantum_Mechanics";
        let password = "TestTest";
        let privateKey = "73d0d250a2214274c4f433f79573ff1d50cde37b5d181b341f9942d096341225";
        let address = "NBJ2XZMCAFAAVZXTPUPJ4MDAJOYCFB7X3MKBHFCK";
        let network = Network.data.Mainnet.id;

        // Act
        WalletBuilder.createPrivateKeyWallet(walletName, password, address, privateKey, network).then((wallet) => {

            // Assert
            expect(wallet).not.toBe(0);

            done();
        });
    });

    describe('Create private key wallet edge-cases', function() {

        it("Can't create private Key wallet without password", function(done) {
            // Arrange:
            let walletName = "Quantum_Mechanics";
            let password = "";
            let privateKey = "73d0d250a2214274c4f433f79573ff1d50cde37b5d181b341f9942d096341225";
            let address = "NBJ2XZMCAFAAVZXTPUPJ4MDAJOYCFB7X3MKBHFCK";
            let network = Network.data.Mainnet.id;

            // Act
            WalletBuilder.createPrivateKeyWallet(walletName, password, address, privateKey, network).then((wallet) => {

                },
                (err) => {

                    // Assert
                    expect(err).toBeDefined();

                    done();
                });
        });

        it("Can't create private Key wallet without private key", function(done) {
            // Arrange:
            let walletName = "Quantum_Mechanics";
            let password = "TestTest";
            let privateKey = "";
            let address = "NBJ2XZMCAFAAVZXTPUPJ4MDAJOYCFB7X3MKBHFCK";
            let network = Network.data.Mainnet.id;

            // Act
            WalletBuilder.createPrivateKeyWallet(walletName, password, address, privateKey, network).then((wallet) => {

                },
                (err) => {

                    // Assert
                    expect(err).toBeDefined();

                    done();
                });
        });

        it("Can't create private Key wallet without address", function(done) {
            // Arrange:
            let walletName = "Quantum_Mechanics";
            let password = "TestTest";
            let privateKey = "73d0d250a2214274c4f433f79573ff1d50cde37b5d181b341f9942d096341225";
            let address = "";
            let network = Network.data.Mainnet.id;

            // Act
            WalletBuilder.createPrivateKeyWallet(walletName, password, address, privateKey, network).then((wallet) => {

                },
                (err) => {

                    // Assert
                    expect(err).toBeDefined();

                    done();
                });
        });

        it("Can't create private Key wallet without name", function(done) {
            // Arrange:
            let walletName = "";
            let password = "TestTest";
            let privateKey = "73d0d250a2214274c4f433f79573ff1d50cde37b5d181b341f9942d096341225";
            let address = "NBJ2XZMCAFAAVZXTPUPJ4MDAJOYCFB7X3MKBHFCK";
            let network = Network.data.Mainnet.id;

            // Act
            WalletBuilder.createPrivateKeyWallet(walletName, password, address, privateKey, network).then((wallet) => {

                },
                (err) => {

                    // Assert
                    expect(err).toBeDefined();

                    done();
                });
        });

        it("Can't create private Key wallet without network", function(done) {
            // Arrange:
            let walletName = "Quantum_Mechanics";
            let password = "TestTest";
            let privateKey = "73d0d250a2214274c4f433f79573ff1d50cde37b5d181b341f9942d096341225";
            let address = "NBJ2XZMCAFAAVZXTPUPJ4MDAJOYCFB7X3MKBHFCK";
            let network = "";

            // Act
            WalletBuilder.createPrivateKeyWallet(walletName, password, address, privateKey, network).then((wallet) => {

                },
                (err) => {

                    // Assert
                    expect(err).toBeDefined();

                    done();
                });
        });

    });


});