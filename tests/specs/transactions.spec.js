import WalletFixture from '../data/wallet';
import TransactionTypes from '../../src/app/utils/TransactionTypes';

describe('Transactions service tests', function() {
    let Wallet, DataBridge, $localStorage, Transactions;

    beforeEach(angular.mock.module('app'));

    beforeEach(angular.mock.inject(function(_Wallet_, _DataBridge_, _$localStorage_, _Transactions_) {
        Wallet = _Wallet_;
        DataBridge = _DataBridge_;
        $localStorage = _$localStorage_;
        $localStorage.$reset();
        Transactions = _Transactions_;
    }));

    function createDummyWalletContextMainnet(Wallet) {
        Wallet.setWallet(WalletFixture.mainnetWallet);
        Wallet.setDefaultNode();

        DataBridge.nisHeight = 999999999;
    }

    function createDummyWalletContextTestnet(Wallet) {
        Wallet.setWallet(WalletFixture.testnetWallet);
        Wallet.setDefaultNode();

        DataBridge.nisHeight = 999999999;
    }

    it("Can set right mainnet network version", function() {
        // Arrange
        createDummyWalletContextMainnet(Wallet);

        // Act
        let version1 = Transactions.CURRENT_NETWORK_VERSION(1);
        let version2 = Transactions.CURRENT_NETWORK_VERSION(2);

        // Assert
        expect(version1).toEqual(0x68000000 | 1)
        expect(version2).toEqual(0x68000000 | 2)
    });

    it("Can set right testnet network version", function() {
        // Arrange
        createDummyWalletContextTestnet(Wallet);

        // Act
        let version1 = Transactions.CURRENT_NETWORK_VERSION(1);
        let version2 = Transactions.CURRENT_NETWORK_VERSION(2);

        // Assert
        expect(version1).toEqual(0x98000000 | 1)
        expect(version2).toEqual(0x98000000 | 2)
    });

    it("Can create transfer transaction common data part on mainnet", function() {
        // Arrange
        createDummyWalletContextMainnet(Wallet);
        let expectedCommonDataPart = {
            "type": 257,
            "version": 1744830465,
            "signer": "3f7303650ab969d42247cb7adb0284070c8a64e6fb950fab878dc7ec704be0b6",
            "timeStamp": 42682584,
            "deadline": 42686184
        }
        let senderPublicKey = "3f7303650ab969d42247cb7adb0284070c8a64e6fb950fab878dc7ec704be0b6";
        let timeStamp = 42682584;
        let version = Transactions.CURRENT_NETWORK_VERSION(1);
        let due = 60;

        // Act
        let commonDataPart = Transactions.CREATE_DATA(TransactionTypes.Transfer, senderPublicKey, timeStamp, due, version);

        // Assert
        expect(commonDataPart).toEqual(expectedCommonDataPart);
    });

    it("Can create transfer transaction common data part on testnet", function() {
        // Arrange
        createDummyWalletContextTestnet(Wallet);
        let expectedCommonDataPart = {
            "type": 257,
            "version": -1744830463,
            "signer": "5f8fcdf7cae84b079f08f40c0a6f2da2af3698abeb10de62ed88ccfa1f14e495",
            "timeStamp": 42658411,
            "deadline": 42662011
        }
        let senderPublicKey = "5f8fcdf7cae84b079f08f40c0a6f2da2af3698abeb10de62ed88ccfa1f14e495"
        let timeStamp = 42658411;
        let version = Transactions.CURRENT_NETWORK_VERSION(1);
        let due = 60;

        // Act
        let commonDataPart = Transactions.CREATE_DATA(TransactionTypes.Transfer, senderPublicKey, timeStamp, due, version);

        // Assert
        expect(commonDataPart).toEqual(expectedCommonDataPart);
    });

    it("Can create correct transfer transaction object on mainnet", function() {
        // Arrange
        createDummyWalletContextMainnet(Wallet);
        let common = {
            "privateKey": "e47a818db63310158a38d5e9f6503f40b17011635110cbaa64e0ad3491fe3126",
            "password": ""
        }
        let dummyTransaction = {
            "recipient": "NAMOAVHFVPJ6FP32YP2GCM64WSRMKXA5KKYWWHPY",
            "recipientPubKey": "89ba9620b787ee1b4cdc1d1a9c6739ed90657cc3e04af9319a9cc3e029804b07",
            "amount": 0,
            "message": "",
            "mosaics": null,
            "fee": 10000000,
            "innerFee": 0,
            "due": 60,
            "isMultisig": false,
            "multisigAccount": ''
        }
        let transferTransactionObject = {
            "type": 257,
            "version": 1744830465,
            "signer": "3f7303650ab969d42247cb7adb0284070c8a64e6fb950fab878dc7ec704be0b6",
            "timeStamp": 42682584,
            "deadline": 42686184,
            "recipient": "NAMOAVHFVPJ6FP32YP2GCM64WSRMKXA5KKYWWHPY",
            "amount": 0,
            "fee": 10000000,
            "message": {
                "type": 1,
                "payload": ""
            },
            "mosaics": null
        }

        // Act
        let entity = Transactions.prepareTransfer(common, dummyTransaction, null);
        entity.timeStamp = 42682584;
        entity.deadline = 42686184;

        // Assert
        expect(entity).toEqual(transferTransactionObject);
    });

    it("Can create correct transfer transaction object on testnet", function() {
        // Arrange
        createDummyWalletContextTestnet(Wallet);
        let common = {
            "privateKey": "eb4c6577e1eb7f80466e4073eb12c7d5a546913952b1c9ad608a939dd5bb4221",
            "password": ""
        }
        let dummyTransaction = {
            "recipient": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
            "recipientPubKey": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6",
            "amount": 0,
            "message": "",
            "mosaics": null,
            "fee": 1000000,
            "innerFee": 0,
            "due": 60,
            "isMultisig": false,
            "multisigAccount": ''
        }
        let transferTransactionObject = {
            "type": 257,
            "version": -1744830463,
            "signer": "5f8fcdf7cae84b079f08f40c0a6f2da2af3698abeb10de62ed88ccfa1f14e495",
            "timeStamp": 42658411,
            "deadline": 42662011,
            "recipient": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
            "amount": 0,
            "fee": 1000000,
            "message": {
                "type": 1,
                "payload": ""
            },
            "mosaics": null
        }

        // Act
        let entity = Transactions.prepareTransfer(common, dummyTransaction, null);
        entity.timeStamp = 42658411;
        entity.deadline = 42662011;

        // Assert
        expect(entity).toEqual(transferTransactionObject);
    });

    it("Can create correct transfer transaction object with message on mainnet", function() {
        // Arrange
        createDummyWalletContextMainnet(Wallet);
        let common = {
            "privateKey": "e47a818db63310158a38d5e9f6503f40b17011635110cbaa64e0ad3491fe3126",
            "password": ""
        }
        let dummyTransaction = {
            "recipient": "NAMOAVHFVPJ6FP32YP2GCM64WSRMKXA5KKYWWHPY",
            "recipientPubKey": "89ba9620b787ee1b4cdc1d1a9c6739ed90657cc3e04af9319a9cc3e029804b07",
            "amount": 0,
            "message": "Hey !",
            "mosaics": null,
            "fee": 12000000,
            "innerFee": 0,
            "due": 60,
            "isMultisig": false,
            "multisigAccount": ''
        }
        let transferTransactionObject = {
            "type": 257,
            "version": 1744830465,
            "signer": "3f7303650ab969d42247cb7adb0284070c8a64e6fb950fab878dc7ec704be0b6",
            "timeStamp": 42682584,
            "deadline": 42686184,
            "recipient": "NAMOAVHFVPJ6FP32YP2GCM64WSRMKXA5KKYWWHPY",
            "amount": 0,
            "fee": 12000000,
            "message": {
                "type": 1,
                "payload": "4865792021"
            },
            "mosaics": null
        }

        // Act
        let entity = Transactions.prepareTransfer(common, dummyTransaction, null);
        entity.timeStamp = 42682584;
        entity.deadline = 42686184;

        // Assert
        expect(entity).toEqual(transferTransactionObject);
    });

    it("Can create correct transfer transaction object with message on testnet", function() {
        // Arrange
        createDummyWalletContextTestnet(Wallet);
        let common = {
            "privateKey": "eb4c6577e1eb7f80466e4073eb12c7d5a546913952b1c9ad608a939dd5bb4221",
            "password": ""
        }
        let dummyTransaction = {
            "recipient": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
            "recipientPubKey": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6",
            "amount": 0,
            "message": "Hey !",
            "mosaics": null,
            "fee": 2000000,
            "innerFee": 0,
            "due": 60,
            "isMultisig": false,
            "multisigAccount": ''
        }
        let transferTransactionObject = {
            "type": 257,
            "version": -1744830463,
            "signer": "5f8fcdf7cae84b079f08f40c0a6f2da2af3698abeb10de62ed88ccfa1f14e495",
            "timeStamp": 42658411,
            "deadline": 42662011,
            "recipient": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
            "amount": 0,
            "fee": 2000000,
            "message": {
                "type": 1,
                "payload": "4865792021"
            },
            "mosaics": null
        }

        // Act
        let entity = Transactions.prepareTransfer(common, dummyTransaction, null);
        entity.timeStamp = 42658411;
        entity.deadline = 42662011;

        // Assert
        expect(entity).toEqual(transferTransactionObject);
    });

    it("Can create correct transfer transaction object with mosaics on mainnet", function() {
        // Arrange
        createDummyWalletContextMainnet(Wallet);
        let mosaicDefinitionMetaDataPair = {
            "nem:xem": {
                "mosaicDefinition": {
                    "creator": "3e82e1c1e4a75adaa3cba8c101c3cd31d9817a2eb966eb3b511fb2ed45b8e262",
                    "description": "reserved xem mosaic",
                    "id": {
                        "namespaceId": "nem",
                        "name": "xem"
                    },
                    "properties": [{
                        "name": "divisibility",
                        "value": "6"
                    }, {
                        "name": "initialSupply",
                        "value": "8999999999"
                    }, {
                        "name": "supplyMutable",
                        "value": "false"
                    }, {
                        "name": "transferable",
                        "value": "true"
                    }],
                    "levy": {}
                },
                "supply": 8999999999
            }
        }
        let common = {
            "privateKey": "e47a818db63310158a38d5e9f6503f40b17011635110cbaa64e0ad3491fe3126",
            "password": ""
        }
        let dummyTransaction = {
            "recipient": "NAMOAVHFVPJ6FP32YP2GCM64WSRMKXA5KKYWWHPY",
            "recipientPubKey": "89ba9620b787ee1b4cdc1d1a9c6739ed90657cc3e04af9319a9cc3e029804b07",
            "amount": 1,
            "message": "",
            "mosaics": [{
                "mosaicId": {
                    "namespaceId": "nem",
                    "name": "xem"
                },
                "quantity": 0,
                "gid": "mos_id_0"
            }],
            "fee": 12500000,
            "innerFee": 0,
            "due": 60,
            "isMultisig": false,
            "multisigAccount": ''
        }
        let transferTransactionObject = {
            "type": 257,
            "version": 1744830466,
            "signer": "3f7303650ab969d42247cb7adb0284070c8a64e6fb950fab878dc7ec704be0b6",
            "timeStamp": 42697337,
            "deadline": 42700937,
            "recipient": "NAMOAVHFVPJ6FP32YP2GCM64WSRMKXA5KKYWWHPY",
            "amount": 1000000,
            "fee": 12500000,
            "message": {
                "type": 1,
                "payload": ""
            },
            "mosaics": [{
                "mosaicId": {
                    "namespaceId": "nem",
                    "name": "xem"
                },
                "quantity": 0,
                "gid": "mos_id_0"
            }]
        }

        // Act
        let entity = Transactions.prepareTransfer(common, dummyTransaction, mosaicDefinitionMetaDataPair);
        entity.timeStamp = 42697337;
        entity.deadline = 42700937;

        // Assert
        expect(entity).toEqual(transferTransactionObject);
    });

    it("Can create correct transfer transaction object with mosaics on testnet", function() {
        // Arrange
        createDummyWalletContextTestnet(Wallet);
        let mosaicDefinitionMetaDataPair = {
            "nem:xem": {
                "mosaicDefinition": {
                    "creator": "3e82e1c1e4a75adaa3cba8c101c3cd31d9817a2eb966eb3b511fb2ed45b8e262",
                    "description": "reserved xem mosaic",
                    "id": {
                        "namespaceId": "nem",
                        "name": "xem"
                    },
                    "properties": [{
                        "name": "divisibility",
                        "value": "6"
                    }, {
                        "name": "initialSupply",
                        "value": "8999999999"
                    }, {
                        "name": "supplyMutable",
                        "value": "false"
                    }, {
                        "name": "transferable",
                        "value": "true"
                    }],
                    "levy": {}
                },
                "supply": 8999999999
            }
        }
        let common = {
            "privateKey": "eb4c6577e1eb7f80466e4073eb12c7d5a546913952b1c9ad608a939dd5bb4221",
            "password": ""
        }
        let dummyTransaction = {
            "recipient": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
            "recipientPubKey": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6",
            "amount": 1,
            "message": "",
            "mosaics": [{
                "mosaicId": {
                    "namespaceId": "nem",
                    "name": "xem"
                },
                "quantity": 0,
                "gid": "mos_id_0"
            }],
            "fee": 1000000,
            "innerFee": 0,
            "due": 60,
            "isMultisig": false,
            "multisigAccount": ''
        }
        let transferTransactionObject = {
            "type": 257,
            "version": -1744830462,
            "signer": "5f8fcdf7cae84b079f08f40c0a6f2da2af3698abeb10de62ed88ccfa1f14e495",
            "timeStamp": 42698693,
            "deadline": 42702293,
            "recipient": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
            "amount": 1000000,
            "fee": 1000000,
            "message": {
                "type": 1,
                "payload": ""
            },
            "mosaics": [{
                "mosaicId": {
                    "namespaceId": "nem",
                    "name": "xem"
                },
                "quantity": 0,
                "gid": "mos_id_0"
            }]
        }

        // Act
        let entity = Transactions.prepareTransfer(common, dummyTransaction, mosaicDefinitionMetaDataPair);
        entity.timeStamp = 42698693;
        entity.deadline = 42702293;

        // Assert
        expect(entity).toEqual(transferTransactionObject);
    });

    /**
    * Provision namespace transaction tests
    */
    it("Can create provision namespace transaction common data part on testnet", function() {
        // Arrange
        createDummyWalletContextTestnet(Wallet);
        let expectedCommonDataPart = {
            "type": 8193,
            "version": -1744830463,
            "signer": "462ee976890916e54fa825d26bdd0235f5eb5b6a143c199ab0ae5ee9328e08ce",
            "timeStamp": 43290303,
            "deadline": 43293903
        }
        let senderPublicKey = "462ee976890916e54fa825d26bdd0235f5eb5b6a143c199ab0ae5ee9328e08ce";
        let timeStamp = 43290303;
        let version = Transactions.CURRENT_NETWORK_VERSION(1);
        let due = 60;

        // Act
        let commonDataPart = Transactions.CREATE_DATA(TransactionTypes.ProvisionNamespace, senderPublicKey, timeStamp, due, version);

        // Assert
        expect(commonDataPart).toEqual(expectedCommonDataPart);
    });

    it("Can create correct provision namespace transaction object on testnet", function() {
        // Arrange
        createDummyWalletContextTestnet(Wallet);
        let common = {
            "privateKey": "eb4c6577e1eb7f80466e4073eb12c7d5a546913952b1c9ad608a939dd5bb4221",
            "password": ""
        }
        let dummyTransaction = {
            "rentalFeeSink": "TAMESPACEWH4MKFMBCVFERDPOOP4FK7MTDJEYP35",
            "rentalFee": 5000000000,
            "namespaceName": "",
            "namespaceParent": null,
            "fee": 20000000,
            "innerFee": 0,
            "due": 60,
            "isMultisig": false,
            "multisigAccount": ''
        }
        let transactionObject = {
            "type": 8193,
            "version": -1744830463,
            "signer": "5f8fcdf7cae84b079f08f40c0a6f2da2af3698abeb10de62ed88ccfa1f14e495",
            "newPart": "",
            "parent": null,
            "timeStamp": 42658411,
            "deadline": 42662011,
            "rentalFeeSink": "TAMESPACEWH4MKFMBCVFERDPOOP4FK7MTDJEYP35",
            "fee": 20000000,
            "rentalFee": 5000000000
        }

        // Act
        let entity = Transactions.prepareNamespace(common, dummyTransaction);
        entity.timeStamp = 42658411;
        entity.deadline = 42662011;

        // Assert
        expect(entity).toEqual(transactionObject);
    });

    it("Can create correct provision namespace transaction object for sub-namespace on testnet", function() {
        // Arrange
        createDummyWalletContextTestnet(Wallet);
        let common = {
            "privateKey": "eb4c6577e1eb7f80466e4073eb12c7d5a546913952b1c9ad608a939dd5bb4221",
            "password": ""
        }
        let dummyTransaction = {
            "rentalFeeSink": "TAMESPACEWH4MKFMBCVFERDPOOP4FK7MTDJEYP35",
            "rentalFee": 200000000,
            "namespaceName": "nemrocks",
            "namespaceParent": {
                "fqn": "nano2"
            },
            "fee": 20000000,
            "innerFee": 0,
            "due": 60,
            "isMultisig": false,
            "multisigAccount": ''
        }
        let transactionObject = {
            "type": 8193,
            "version": -1744830463,
            "signer": "5f8fcdf7cae84b079f08f40c0a6f2da2af3698abeb10de62ed88ccfa1f14e495",
            "newPart": "nemrocks",
            "parent": "nano2",
            "timeStamp": 42658411,
            "deadline": 42662011,
            "rentalFeeSink": "TAMESPACEWH4MKFMBCVFERDPOOP4FK7MTDJEYP35",
            "fee": 20000000,
            "rentalFee": 200000000
        }

        // Act
        let entity = Transactions.prepareNamespace(common, dummyTransaction);
        entity.timeStamp = 42658411;
        entity.deadline = 42662011;

        // Assert
        expect(entity).toEqual(transactionObject);
    });

    /**
    * Mosaic definition transaction tests
    */
    it("Can create mosaic definition transaction common data part on testnet", function() {
        // Arrange
        createDummyWalletContextTestnet(Wallet);
        let expectedCommonDataPart = {
            "type": 16385,
            "version": -1744830463,
            "signer": "5f8fcdf7cae84b079f08f40c0a6f2da2af3698abeb10de62ed88ccfa1f14e495",
            "timeStamp": 43290303,
            "deadline": 43293903
        }
        let senderPublicKey = "5f8fcdf7cae84b079f08f40c0a6f2da2af3698abeb10de62ed88ccfa1f14e495";
        let timeStamp = 43290303;
        let version = Transactions.CURRENT_NETWORK_VERSION(1);
        let due = 60;

        // Act
        let commonDataPart = Transactions.CREATE_DATA(TransactionTypes.MosaicDefinition, senderPublicKey, timeStamp, due, version);

        // Assert
        expect(commonDataPart).toEqual(expectedCommonDataPart);
    });

    it("Can create correct mosaic definition transaction object on testnet", function() {
        // Arrange
        createDummyWalletContextTestnet(Wallet);
        let common = {
            "privateKey": "eb4c6577e1eb7f80466e4073eb12c7d5a546913952b1c9ad608a939dd5bb4221",
            "password": ""
        }
        let dummyTransaction = {
            "mosaicFeeSink": "TBMOSA-ICOD4F-54EE5C-DMR23C-CBGOAM-2XSJBR-5OLC",
            "mosaicFee": 500000000,
            "mosaicName": "",
            "namespaceParent": {
                "owner": "TAF7BPDV22HCFNRJEWOGLRKBYQF65GBOLQPI5GGO",
                "fqn": "nw.fiat",
                "height": 307541
            },
            "mosaicDescription": "",
            "properties": {
                "initialSupply": 0,
                "divisibility": 0,
                "transferable": true,
                "supplyMutable": true
            },
            "levy": {
                "mosaic": null,
                "address": "TAF7BPDV22HCFNRJEWOGLRKBYQF65GBOLQPI5GGO",
                "feeType": 1,
                "fee": 5
            },
            "fee": 0,
            "due": 60,
            "innerFee": 0,
            "isMultisig": false,
            "multisigAccount": ""
        }

        let transactionObject = {
            "type": 16385,
            "version": -1744830463,
            "signer": "5f8fcdf7cae84b079f08f40c0a6f2da2af3698abeb10de62ed88ccfa1f14e495",
            "timeStamp": 43773466,
            "deadline": 43777066,
            "creationFeeSink": "TBMOSAICOD4F54EE5CDMR23CCBGOAM2XSJBR5OLC",
            "creationFee": 500000000,
            "mosaicDefinition": {
                "creator": "5f8fcdf7cae84b079f08f40c0a6f2da2af3698abeb10de62ed88ccfa1f14e495",
                "id": {
                    "namespaceId": "nw.fiat",
                    "name": ""
                },
                "description": "",
                "properties": [{
                    "name": "initialSupply",
                    "value": "0"
                }, {
                    "name": "divisibility",
                    "value": "0"
                }, {
                    "name": "transferable",
                    "value": "true"
                }, {
                    "name": "supplyMutable",
                    "value": "true"
                }],
                "levy": null
            },
            "fee": 20000000
        }

        // Act
        let entity = Transactions.prepareMosaicDefinition(common, dummyTransaction);
        entity.timeStamp = 43773466;
        entity.deadline = 43777066;

        // Assert
        expect(entity).toEqual(transactionObject);
    });

    /**
    * Mosaic supply change transaction tests
    */
    it("Can create mosaic supply change transaction common data part on testnet", function() {
        // Arrange
        createDummyWalletContextTestnet(Wallet);
        let expectedCommonDataPart = {
            "type": 16386,
            "version": -1744830463,
            "signer": "5f8fcdf7cae84b079f08f40c0a6f2da2af3698abeb10de62ed88ccfa1f14e495",
            "timeStamp": 43290303,
            "deadline": 43293903
        }
        let senderPublicKey = "5f8fcdf7cae84b079f08f40c0a6f2da2af3698abeb10de62ed88ccfa1f14e495";
        let timeStamp = 43290303;
        let version = Transactions.CURRENT_NETWORK_VERSION(1);
        let due = 60;

        // Act
        let commonDataPart = Transactions.CREATE_DATA(TransactionTypes.MosaicSupply, senderPublicKey, timeStamp, due, version);

        // Assert
        expect(commonDataPart).toEqual(expectedCommonDataPart);
    });

    it("Can create correct mosaic supply change transaction object on testnet", function() {
        // Arrange
        createDummyWalletContextTestnet(Wallet);
        let common = {
            "privateKey": "eb4c6577e1eb7f80466e4073eb12c7d5a546913952b1c9ad608a939dd5bb4221",
            "password": ""
        }
        let dummyTransaction = {
            "mosaic": {
                "namespaceId": "nano2",
                "name": "points"
            },
            "supplyType": 1,
            "delta": 0,
            "fee": 0,
            "due": 60,
            "innerFee": 0,
            "isMultisig": false,
            "multisigAccount": ""
        }

        let transactionObject = {
            "type": 16386,
            "version": -1744830463,
            "signer": "5f8fcdf7cae84b079f08f40c0a6f2da2af3698abeb10de62ed88ccfa1f14e495",
            "timeStamp": 43775455,
            "deadline": 43779055,
            "mosaicId": {
                "namespaceId": "nano2",
                "name": "points"
            },
            "supplyType": 1,
            "delta": 0,
            "fee": 20000000
        }

        // Act
        let entity = Transactions.prepareMosaicSupply(common, dummyTransaction);
        entity.timeStamp = 43775455;
        entity.deadline = 43779055;

        // Assert
        expect(entity).toEqual(transactionObject);
    });

});