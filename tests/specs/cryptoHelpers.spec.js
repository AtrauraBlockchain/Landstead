import Address from '../../src/app/utils/Address';
import convert from '../../src/app/utils/convert';
import Network from '../../src/app/utils/Network';
import KeyPair from '../../src/app/utils/KeyPair';
import CryptoHelpers from '../../src/app/utils/CryptoHelpers';

describe('CryptoHelpers util tests', function() {
    let $filter;

    beforeEach(angular.mock.module('app'));

    beforeEach(angular.mock.inject(function(_$filter_) {
        $filter = _$filter_;
    }));

    it("Can check address", function() {
        // Arrange:
        let privatekey = "2a91e1d5c110a8d0105aad4683f962c2a56663a3cad46666b16d243174673d90";
        let address = "NCRCWIADNM3UQQTRRFKXBAVHDPZMGVBBXA4J4RE5";

        // Act:
        let result = CryptoHelpers.checkAddress(privatekey, Network.data.Mainnet.id, address);

        // Assert:
        expect(result).toBe(true);
    });

    it("Can derive a key from password and count", function() {
        // Arrange:
        let password = "TestTest";
        let count = 20;
        let expectedKey = "8cd87bc513857a7079d182a6e19b370e907107d97bd3f81a85bcebcc4b5bd3b5"

        // Act:
        let result = CryptoHelpers.derivePassSha(password, count);

        // Assert:
        expect(result.priv).toEqual(expectedKey);
    });

    it("Can encrypt a private key", function() {
        // Arrange:
        let password = "TestTest";
        let privateKey = "2a91e1d5c110a8d0105aad4683f962c2a56663a3cad46666b16d243174673d90";
        let expectedKey = "8cd87bc513857a7079d182a6e19b370e907107d97bd3f81a85bcebcc4b5bd3b5";

        // Act:
        let result = CryptoHelpers.encodePrivKey(privateKey, password);
        let pass = CryptoHelpers.derivePassSha(password, 20);
        let obj = {
            ciphertext: CryptoJS.enc.Hex.parse(result.ciphertext),
            iv: convert.hex2ua(result.iv),
            key: convert.hex2ua(pass.priv)
        }

        // Assert:
        expect(pass.priv).toEqual(expectedKey);
        expect(result.iv.length).toBe(16 * 2);
        expect(result.ciphertext.length).toBe(48 * 2);
    });

    it("Can decrypt a private key", function() {
        // Arrange:
        let password = "TestTest";
        let expectedPrivateKey = "2a91e1d5c110a8d0105aad4683f962c2a56663a3cad46666b16d243174673d90";
        let key = "8cd87bc513857a7079d182a6e19b370e907107d97bd3f81a85bcebcc4b5bd3b5";
        let encrypted = "c09ef3ed0cadd6ca6d3638b5dd854ac871a0afaec6b7fed791166b571a64d57f564376dc0180c851b0a1120b5896e6a0";
        let iv = "0329814121c7a4bb11418084dbe40560";
        let obj = {
            ciphertext: CryptoJS.enc.Hex.parse(encrypted),
            iv: convert.hex2ua(iv),
            key: convert.hex2ua(key)
        }

        // Act:
        let decrypted = CryptoHelpers.decrypt(obj);

        // Assert:
        expect(decrypted).toEqual(expectedPrivateKey);
    });

    it("Can encrypt and decrypt private Key", function() {
        // Arrange:
        let password = "TestTest";
        let privateKey = "2a91e1d5c110a8d0105aad4683f962c2a56663a3cad46666b16d243174673d90";

        // Act:
        let result = CryptoHelpers.encodePrivKey(privateKey, password);
        let pass = CryptoHelpers.derivePassSha(password, 20);
        let obj = {
            ciphertext: CryptoJS.enc.Hex.parse(result.ciphertext),
            iv: convert.hex2ua(result.iv),
            key: convert.hex2ua(pass.priv)
        }
        let decrypted = CryptoHelpers.decrypt(obj);

        // Assert:
        expect(privateKey).toEqual(decrypted);
    });

    describe('Encrypt private key edge-cases', function() {

        it("Encryption return error if no password", function() {
            // Arrange:
            let password = "";
            let privateKey = "2a91e1d5c110a8d0105aad4683f962c2a56663a3cad46666b16d243174673d90";

            // Act:
            let result = CryptoHelpers.encodePrivKey.bind(null, privateKey, password);

            // Assert:
            expect(result).toThrow();
        });

        it("Encryption return error if no private key", function() {
            // Arrange:
            let password = "TestTest";
            let privateKey = "";

            // Act
            let result = CryptoHelpers.encodePrivKey.bind(null, privateKey, password);

            // Assert:
            expect(result).toThrow();
        });

    });

    it("Can decrypt private key of pass:enc wallets", function() {
        // Arrange:
        let common = {
            'password': 'TestTest',
            'privateKey': ''
        }
        let walletAccount = {
            "encrypted": "2e1717f245b7e1138b0dfe99dfce65b16b1c9d8ca03a9f90b86b43677b6337ce56ec474c64f73244790eb2490ad14752",
            "iv": "dccffaa4883cda85d6b06714aabe6ec6",
        }
        let mainAlgo = "pass:enc";
        let expectedPrivateKey = "2a91e1d5c110a8d0105aad4683f962c2a56663a3cad46666b16d243174673d90";

        // Act:
        let result = CryptoHelpers.passwordToPrivatekeyClear(common, walletAccount, mainAlgo, true);

        // Assert:
        expect(result).toBe(true);
        expect(common.privateKey).toEqual(expectedPrivateKey);
        expect(!common.password).toEqual(true);
    });

    it("Can decrypt private key of pass:bip32 wallets", function() {
        // Arrange:
        let common = {
            'password': 'TestTest',
            'privateKey': ''
        }
        let walletAccount = {
            "encrypted": "2e1717f245b7e1138b0dfe99dfce65b16b1c9d8ca03a9f90b86b43677b6337ce56ec474c64f73244790eb2490ad14752",
            "iv": "dccffaa4883cda85d6b06714aabe6ec6",
        }
        let mainAlgo = "pass:bip32";
        let expectedPrivateKey = "2a91e1d5c110a8d0105aad4683f962c2a56663a3cad46666b16d243174673d90";

        // Act:
        let result = CryptoHelpers.passwordToPrivatekeyClear(common, walletAccount, mainAlgo, true);

        // Assert:
        expect(result).toBe(true);
        expect(common.privateKey).toEqual(expectedPrivateKey);
        expect(!common.password).toEqual(true);
    });

    it("Can decrypt private key of pass:6k wallets", function() {
        // Arrange:
        let common = {
            'password': 'TestTest',
            'privateKey': ''
        }
        let walletAccount = {
            "encrypted": "",
            "iv": ""
        }
        let mainAlgo = "pass:6k";
        let expectedPrivateKey = "8fac70ea9aca3ae3418e25c0d31d9a0723e0a1790ae8fa97747c00dc0037472e";

        // Act:
        let result = CryptoHelpers.passwordToPrivatekeyClear(common, walletAccount, mainAlgo, true);

        // Assert:
        expect(result).toBe(true);
        expect(common.privateKey).toEqual(expectedPrivateKey);
    });

    it("Can decrypt private key of pass:6k wallets childs", function() {
        // Arrange:
        let common = {
            'password': 'TestTest',
            'privateKey': ''
        }
        let walletAccount = {
            "encrypted": "5c3a7ebbefb391e5175a29ec5a22cb162cd590bb2e0b09416273f86bdc39fa83c04c4bb53b9c64fd1e6eaba5dba149bd",
            "iv": "f131d9a4dfb1b0b696e05ccae9412e8f"
        }
        let mainAlgo = "pass:6k";
        let expectedPrivateKey = "4f27ca43521bbc394a6f6dde65b533e0768f954fa47ce320b0e9f4b5fe450f9d";

        // Act:
        let result = CryptoHelpers.passwordToPrivatekeyClear(common, walletAccount, mainAlgo, true);

        // Assert:
        expect(result).toBe(true);
        expect(common.privateKey).toEqual(expectedPrivateKey);
        expect(!common.password).toEqual(true);
    });

    describe('Decrypt private key edge-cases', function() {

        it("Private key decryption return false and alert if no algo", function() {
            // Arrange:
            let common = {
                'password': 'TestTest',
                'privateKey': ''
            }
            let walletAccount = {
                "encrypted": "2e1717f245b7e1138b0dfe99dfce65b16b1c9d8ca03a9f90b86b43677b6337ce56ec474c64f73244790eb2490ad14752",
                "iv": "dccffaa4883cda85d6b06714aabe6ec6",
            }
            let mainAlgo = "";
            let expectedPrivateKey = "2a91e1d5c110a8d0105aad4683f962c2a56663a3cad46666b16d243174673d90";

            // Act:
            let result = CryptoHelpers.passwordToPrivatekeyClear(common, walletAccount, mainAlgo, true);

            // Assert:
            expect(result).toBe(false);
            expect(common.privateKey).toEqual("");
            expect(!common.password).toEqual(false);
        });

        it("Decryption of pass:enc wallets return false if no password", function() {
            // Arrange:
            let common = {
                'password': '',
                'privateKey': ''
            }
            let walletAccount = {
                "encrypted": "2e1717f245b7e1138b0dfe99dfce65b16b1c9d8ca03a9f90b86b43677b6337ce56ec474c64f73244790eb2490ad14752",
                "iv": "dccffaa4883cda85d6b06714aabe6ec6",
            }
            let mainAlgo = "pass:enc";

            // Act:
            let result = CryptoHelpers.passwordToPrivatekeyClear(common, walletAccount, mainAlgo, true);

            // Assert:
            expect(result).toBe(false);
            expect(common.privateKey).toEqual("");
            expect(!common.password).toEqual(true);
        });

        it("Decryption of pass:bip32 wallets return false if no password", function() {
            // Arrange:
            let common = {
                'password': '',
                'privateKey': ''
            }
            let walletAccount = {
                "encrypted": "2e1717f245b7e1138b0dfe99dfce65b16b1c9d8ca03a9f90b86b43677b6337ce56ec474c64f73244790eb2490ad14752",
                "iv": "dccffaa4883cda85d6b06714aabe6ec6",
            }
            let mainAlgo = "pass:bip32";

            // Act:
            let result = CryptoHelpers.passwordToPrivatekeyClear(common, walletAccount, mainAlgo, true);

            // Assert:
            expect(result).toBe(false);
            expect(common.privateKey).toEqual("");
            expect(!common.password).toEqual(true);
        });

        it("Decryption of pass:6k wallets return false if no password", function() {
            // Arrange:
            let common = {
                'password': '',
                'privateKey': ''
            }
            let walletAccount = {
                "encrypted": "2e1717f245b7e1138b0dfe99dfce65b16b1c9d8ca03a9f90b86b43677b6337ce56ec474c64f73244790eb2490ad14752",
                "iv": "dccffaa4883cda85d6b06714aabe6ec6",
            }
            let mainAlgo = "pass:6k";

            // Act:
            let result = CryptoHelpers.passwordToPrivatekeyClear(common, walletAccount, mainAlgo, true);

            // Assert:
            expect(result).toBe(false);
            expect(common.privateKey).toEqual("");
            expect(!common.password).toEqual(true);
        });

        it("Decryption of pass:6k wallets generate key if no encrypted and iv in wallet account", function() {
            // Arrange:
            let common = {
                'password': 'TestTest',
                'privateKey': ''
            }
            let walletAccount = {
                "encrypted": "",
                "iv": "",
            }
            let mainAlgo = "pass:6k";
            let expectedPrivateKey = "8fac70ea9aca3ae3418e25c0d31d9a0723e0a1790ae8fa97747c00dc0037472e";

            // Act:
            let result = CryptoHelpers.passwordToPrivatekeyClear(common, walletAccount, mainAlgo, true);

            // Assert:
            expect(result).toBe(true);
            expect(common.privateKey).toEqual(expectedPrivateKey);
            expect(!common.password).toEqual(true);
        });

        it("Decryption of pass:6k wallets return false and alert if encrypted but no iv", function() {
            // Arrange:
            let common = {
                'password': 'TestTest',
                'privateKey': ''
            }
            let walletAccount = {
                "encrypted": "2e1717f245b7e1138b0dfe99dfce65b16b1c9d8ca03a9f90b86b43677b6337ce56ec474c64f73244790eb2490ad14752",
                "iv": "",
            }
            let mainAlgo = "pass:6k";

            // Act:
            let result = CryptoHelpers.passwordToPrivatekeyClear(common, walletAccount, mainAlgo, true);

            // Assert:
            expect(result).toBe(false);
            expect(common.privateKey).toEqual("");
            expect(!common.password).toEqual(false);
        });

        it("Decryption of pass:6k wallets return false and alert if no encrypted but iv", function() {
            // Arrange:
            let common = {
                'password': 'TestTest',
                'privateKey': ''
            }
            let walletAccount = {
                "encrypted": "",
                "iv": "dccffaa4883cda85d6b06714aabe6ec6",
            }
            let mainAlgo = "pass:6k";

            // Act:
            let result = CryptoHelpers.passwordToPrivatekeyClear(common, walletAccount, mainAlgo, true);

            // Assert:
            expect(result).toBe(false);
            expect(common.privateKey).toEqual("");
            expect(!common.password).toEqual(false);
        });

    });

    it("Can generate bip32 seed and child on mainnet", function(done) {
        // Arrange:
        let privateKey = "6809a9582cd395aa8803bbce10449c9819e34d3afa1cb4f4e2df52fb37864ccb";
        let password = "TestTest";
        let index = 0;
        let expectedSeed = "P5XzbwJKMQMpm1hYYk1z9k4KNcjnvDMfGsxmimSWH7QwPJu2jK3u8GvwPSaeZajxHS1gPEMovGk2pcu3Y2zpgC7VcYDK5Cpkb3aNtyjfiiPnf2Nq";
        let expectedChildPrivateKey = "2a91e1d5c110a8d0105aad4683f962c2a56663a3cad46666b16d243174673d90";

        // Act:
        CryptoHelpers.generateBIP32Data(privateKey, password, index, Network.data.Mainnet.id).then((data) => {
            let seed = data.seed;
            let childPrivateKey = data.privateKey;

            // Assert:
            expect(seed).toEqual(expectedSeed);
            expect(childPrivateKey).toEqual(expectedChildPrivateKey);

            done();
        });
    });

    it("Can generate bip32 seed and child on testnet", function(done) {
        // Arrange:
        let privateKey = "6809a9582cd395aa8803bbce10449c9819e34d3afa1cb4f4e2df52fb37864ccb";
        let password = "TestTest";
        let index = 0;
        let expectedSeed = "ZGYuxVoQi4Wi11wqqQpDHg16w3Je6wP6KCfqWT9o8SatSvpr5VUfmAENCyh3svgaXGFXZN11RYvrNA2equ6yprZmNrr2JjrCcYMuQwrZ4XAoJdBs";
        let expectedChildPrivateKey = "2a91e1d5c110a8d0105aad4683f962c2a56663a3cad46666b16d243174673d90";

        // Act:
        CryptoHelpers.generateBIP32Data(privateKey, password, index, Network.data.Testnet.id).then((data) => {
            let seed = data.seed;
            let childPrivateKey = data.privateKey;

            // Assert:
            expect(seed).toEqual(expectedSeed);
            expect(childPrivateKey).toEqual(expectedChildPrivateKey);

            done();
        });
    });

    it("Can derive account from bip32 seed", function(done) {
        // Arrange:
        let seed = "ZGYuxVoQi4Wi11wqqQpDHg16w3Je6wP6KCfqWT9o8SatSvpr5VUfmAENCyh3svgaXGFXZN11RYvrNA2equ6yprZmNrr2JjrCcYMuQwrZ4XAoJdBs";
        let index = 1;
        let expectedAccount = "NA7RDSYKYNPPU6F5FDT2ACXN4WHIMD33G7IZPR3N";
        let expectedAccountPrivateKey = "e1a5c85cd1a9162022eab2e60429cbea6e65977f048dab25c86a5bab923b675f";

        // Act:
        CryptoHelpers.BIP32derivation(seed, index, Network.data.Mainnet.id).then((data) => {
            let account = data.address;
            let accountPrivateKey = data.privateKey;

            // Assert:
            expect(account).toEqual(expectedAccount);
            expect(accountPrivateKey).toEqual(expectedAccountPrivateKey);

            done();
        });
    });

    describe('Bip32 edge-cases', function() {

        it("Bip32 return error if no private key", function(done) {
            // Arrange:
            let privateKey = "";
            let password = "TestTest";
            let index = 0;

            // Act:
            CryptoHelpers.generateBIP32Data(privateKey, password, index, Network.data.Mainnet.id)
                .then((data) => {

                    },
                    (err) => {
                        // Assert:
                        expect(err).toBeDefined();

                        done();
                    });
        });

        it("Bip32 return error if no password", function(done) {
            // Arrange:
            let privateKey = "6809a9582cd395aa8803bbce10449c9819e34d3afa1cb4f4e2df52fb37864ccb";
            let password = "";
            let index = 0;

            // Act:
            let result = CryptoHelpers.generateBIP32Data(privateKey, password, index, Network.data.Mainnet.id)
                .then((data) => {

                    },
                    (err) => {
                        // Assert:
                        expect(err).toBeDefined();

                        done();
                    });
        });

        it("Bip32 can't derivate account without seed", function(done) {
            // Arrange:
            let seed = "";
            let index = 1;
            let isMultisig = false;

            // Act:
            let result = CryptoHelpers.BIP32derivation(seed, isMultisig, index, Network.data.Mainnet.id)
                .then((data) => {

                    },
                    (err) => {
                        // Assert:
                        expect(result).toBeDefined();

                        done();
                    });
        });

    });

    it("Can encode message with sender private key", function() {
        // Arrange:
        let senderPriv = "2a91e1d5c110a8d0105aad4683f962c2a56663a3cad46666b16d243174673d90";
        let recipientPublic = "5aae0b521c59cfc8c2114dc74d2f652359a68e377657c3f6bd6091f16f72e1ec";
        let message = "NEM is awesome !";
        let iv = "f396cf605ee7cb0e7618df82aa48c684";
        let salt = "5f8d37e8116b6dc9171ffeb7617b0988bfd8abe0e611c2c34cc127b637d8192a";
        let expectedHex = "5f8d37e8116b6dc9171ffeb7617b0988bfd8abe0e611c2c34cc127b637d8192af396cf605ee7cb0e7618df82aa48c684eb60d26923a2672758f7df7b1430a026e88fea1f4bb3171ab213a5679b9fb9d9";

        // Act:
        let encryptedHex = CryptoHelpers._encode(senderPriv, recipientPublic, message, convert.hex2ua(iv), convert.hex2ua(salt));

        // Assert:
        expect(encryptedHex).toEqual(expectedHex);
    });

    it("Can decode message with recipient private key", function() {
        // Arrange:
        let senderPublic = "9291abb3c52134be9d20ef21a796743497df7776d2661237bda9cadade34e44c";
        let recipientPriv = "2618090794e9c9682f2ac6504369a2f4fb9fe7ee7746f9560aca228d355b1cb9";
        let expectedMessage = "NEM is awesome !";
        let encryptedMessage = "dd31d6b4111c1023bae6533399e74f73a29c6e6b48ab550f8a7bea127e27dddb4fd3fe4fad3c835307c0da52d9c268f56237d1810e07912e6a6568cba09d9a9176ee6b1ade9569c2e1e273e9675bd4ff";

        // Act:
        let decrypted = {
            'type': 1,
            'payload': CryptoHelpers.decode(recipientPriv, senderPublic, encryptedMessage)
        };
        let decryptedMessage = $filter('fmtHexMessage')(decrypted);

        // Assert:
        expect(decryptedMessage).toEqual(expectedMessage);
    });

    it("Roundtrip decode encode", function() {
        // Arrange:
        let senderPriv = "2a91e1d5c110a8d0105aad4683f962c2a56663a3cad46666b16d243174673d90";
        let sender = KeyPair.create(senderPriv);
        let recipientPriv = "2618090794e9c9682f2ac6504369a2f4fb9fe7ee7746f9560aca228d355b1cb9";
        let recipient = KeyPair.create(recipientPriv);
        let message = "NEM is awesome !";
        let encryptedMessage = "dd31d6b4111c1023bae6533399e74f73a29c6e6b48ab550f8a7bea127e27dddb4fd3fe4fad3c835307c0da52d9c268f56237d1810e07912e6a6568cba09d9a9176ee6b1ade9569c2e1e273e9675bd4ff";

        // Act:
        let decrypted = {
            'type': 1,
            'payload': CryptoHelpers.decode(recipientPriv, sender.publicKey.toString(), encryptedMessage)
        };
        let decryptedMessage = $filter('fmtHexMessage')(decrypted);

        let encrypted = CryptoHelpers.encode(recipientPriv, sender.publicKey.toString(), decryptedMessage);

        // Assert:
        expect(decryptedMessage).toEqual(message);
        expect(encrypted.length).toBe(80 * 2);
    });

    it("Roundtrip encode decode", function() {
        // Arrange:
        let senderPriv = "2a91e1d5c110a8d0105aad4683f962c2a56663a3cad46666b16d243174673d90";
        let sender = KeyPair.create(senderPriv);
        let recipientPriv = "2618090794e9c9682f2ac6504369a2f4fb9fe7ee7746f9560aca228d355b1cb9";
        let recipient = KeyPair.create(recipientPriv);
        let message = "NEM is awesome !";

        // Act:
        let encrypted = CryptoHelpers.encode(senderPriv, recipient.publicKey.toString(), message);
        let decrypted = {
            'type': 1,
            'payload': CryptoHelpers.decode(recipientPriv, sender.publicKey.toString(), encrypted)
        };
        let decryptedMessage = $filter('fmtHexMessage')(decrypted);

        // Assert:
        expect(decryptedMessage).toEqual(message);
    });

    describe('Encode & decode message edge-cases', function() {

        it("Message encoding return error if no sender private key", function() {
            // Arrange:
            let senderPriv = "";
            let recipientPublic = "2618090794e9c9682f2ac6504369a2f4fb9fe7ee7746f9560aca228d355b1cb9";
            let message = "NEM is awesome !";

            // Act:
            let result = CryptoHelpers.encode.bind(null, senderPriv, recipientPublic, message);

            // Assert:
            expect(result).toThrow();
        });

        it("Message encoding return error if no recipient public key", function() {
            // Arrange:
            let senderPriv = "2a91e1d5c110a8d0105aad4683f962c2a56663a3cad46666b16d243174673d90";
            let recipientPublic = "";
            let message = "NEM is awesome !";

            // Act:
            let result = CryptoHelpers.encode.bind(null, senderPriv, recipientPublic, message);

            // Assert:
            expect(result).toThrow();
        });

        it("Message encoding return error if no message", function() {
            // Arrange:
            let senderPriv = "2a91e1d5c110a8d0105aad4683f962c2a56663a3cad46666b16d243174673d90";
            let recipientPublic = "2618090794e9c9682f2ac6504369a2f4fb9fe7ee7746f9560aca228d355b1cb9";
            let message = "";

            // Act:
            let result = CryptoHelpers.encode.bind(null, senderPriv, recipientPublic, message);

            // Assert:
            expect(result).toThrow();
        });


        it("Message decoding return error if no recipient private key", function() {
            // Arrange:
            let senderPublic = "9291abb3c52134be9d20ef21a796743497df7776d2661237bda9cadade34e44c";
            let recipientPriv = "";
            let message = "NEM is awesome !";
            let encryptedMessage = "dd31d6b4111c1023bae6533399e74f73a29c6e6b48ab550f8a7bea127e27dddb4fd3fe4fad3c835307c0da52d9c268f56237d1810e07912e6a6568cba09d9a9176ee6b1ade9569c2e1e273e9675bd4ff";

            // Act:
            let result = CryptoHelpers.decode.bind(null, recipientPriv, senderPublic, encryptedMessage);

            // Assert:
            expect(result).toThrow();
        });

        it("Message decoding return error if no sender public key", function() {
            // Arrange:
            let senderPublic = "";
            let recipientPriv = "2618090794e9c9682f2ac6504369a2f4fb9fe7ee7746f9560aca228d355b1cb9";
            let message = "NEM is awesome !";
            let encryptedMessage = "dd31d6b4111c1023bae6533399e74f73a29c6e6b48ab550f8a7bea127e27dddb4fd3fe4fad3c835307c0da52d9c268f56237d1810e07912e6a6568cba09d9a9176ee6b1ade9569c2e1e273e9675bd4ff";

            // Act:
            let result = CryptoHelpers.decode.bind(null, recipientPriv, senderPublic, encryptedMessage);

            // Assert:
            expect(result).toThrow();
        });


        it("Message decoding return error if no payload", function() {
            // Arrange:
            let senderPublic = "9291abb3c52134be9d20ef21a796743497df7776d2661237bda9cadade34e44c";
            let recipientPriv = "2618090794e9c9682f2ac6504369a2f4fb9fe7ee7746f9560aca228d355b1cb9";
            let message = "NEM is awesome !";
            let encryptedMessage = "";

            // Act:
            let result = CryptoHelpers.decode.bind(null, recipientPriv, senderPublic, encryptedMessage)

            // Assert:
            expect(result).toThrow();
        });

    });

    //Key is different each time and it return an error... Not sure how to do that properly
    xit("Can encrypt and decrypt private key for mobile", function() {
        // Arrange:
        let privateKey = "2a91e1d5c110a8d0105aad4683f962c2a56663a3cad46666b16d243174673d90";
        let password = "TestTest";

        // Act:
        let result = CryptoHelpers.AES_PBKF2_encryption(password, privateKey);
        let encrypted = result.encrypted.ciphertext.toString();
        let salt = result.salt.toString();

        let key = CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: 2000,
            hasher: CryptoJS.algo.SHA1
        });

        let decrypted = CryptoJS.AES.decrypt(result.encrypted.enc, key.toString());

        // Assert:
        expect(encrypted.length).toBe(48 * 2);
        expect(salt.length).toBe(32 * 2);
        expect(decrypted).toEqual(privateKey);
    });

});