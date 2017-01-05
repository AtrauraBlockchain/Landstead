import Network from '../../src/app/utils/Network';
import Address from '../../src/app/utils/Address';

describe('Filters tests', function() {
    let $filter;

    beforeEach(angular.mock.module('app'));

    beforeEach(angular.mock.inject(function(_$filter_) {
        $filter = _$filter_;
    }));

    it("Can format public key to address", function() {
        // Arrange:
        let publicKey = "9291abb3c52134be9d20ef21a796743497df7776d2661237bda9cadade34e44c";
        let expectedAddress = Address.toAddress(publicKey, Network.data.Mainnet.id);

        // Act:
        let result = $filter('fmtPubToAddress')(publicKey, Network.data.Mainnet.id);

        // Assert:
        expect(result).toEqual(expectedAddress);
    });

    it("Can format address", function() {
        // Arrange:
        let address = "NCRCWIADNM3UQQTRRFKXBAVHDPZMGVBBXA4J4RE5";
        let expectedResult = "NCRCWI-ADNM3U-QQTRRF-KXBAVH-DPZMGV-BBXA4J-4RE5";

        // Act:
        let result = $filter('fmtAddress')(address);

        // Assert:
        expect(result).toEqual(expectedResult);
    });

    it("Can format NEM date", function() {
        // Arrange:
        let timestamp = 37629823;
        let expectedResult = "Mon, 06 Jun 2016 12:50:08 GMT";

        // Act:
        let result = $filter('fmtNemDate')(timestamp);

        // Assert:
        expect(result).toEqual(expectedResult);
    });

    it("Can format NEM value", function() {
        // Arrange:
        let value = 10000200;

        // Act:
        let result = $filter('fmtNemValue')(value);

        // Assert
        expect(result[0]).toEqual("10");
        expect(result[1]).toEqual("000200");
    });

    it("Can format Importance score", function() {
        // Arrange:
        let data = 0.0005305934429032625;

        // Act:
        let result = $filter('fmtNemImportanceScore')(data);

        // Assert:
        expect(result[0]).toEqual("5");
        expect(result[1]).toEqual("3059");
    });

    it("Can format Importance transfer modes", function() {
        // Arrange:
        let mode1 = "Activation";
        let mode2 = "Deactivation";

        //Act:
        let result1 = $filter('fmtImportanceTransferMode')(1);
        let result2 = $filter('fmtImportanceTransferMode')(2);

        // Assert:
        expect(result1).toEqual(mode1);
        expect(result2).toEqual(mode2);
    });

    it("Can reverse array", function() {
        // Arrange:
        let array = [0, 1, 2, 3, 4, 5];
        let expectedResult = [5, 4, 3, 2, 1, 0];

        // Act:
        let result = $filter('reverse')(array);

        // Assert:
        expect(result).toEqual(expectedResult);
    });

    it("Can format name from network id", function() {
        // Arrange:
        let mijin = "Mijin";
        let mainnet = "Mainnet";
        let testnet = "Testnet";

        // Act:
        let result1 = $filter('toNetworkName')(Network.data.Mijin.id);
        let result2 = $filter('toNetworkName')(Network.data.Mainnet.id);
        let result3 = $filter('toNetworkName')(Network.data.Testnet.id);

        // Assert:
        expect(result1).toEqual(mijin);
        expect(result2).toEqual(mainnet);
        expect(result3).toEqual(testnet);
    });

    it("Can paginate an array", function() {
        // Arrange:
        let currentPage = 1;
        let pageSize = 5;
        let input = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        let expectedResult = [5, 6, 7, 8];

        // Act:
        let result = $filter('startFrom')(input, currentPage * pageSize);

        // Assert:
        expect(result).toEqual(expectedResult);
    });

    it("Can paginate unconfirmed txes", function() {
        // Arrange:
        let currentPage = 1;
        let pageSize = 5;
        let input = {
            "7b0f03c193207e1be74d573f36c4456d55bc9eaf2400c559313aafe0c47273bc": {
                "meta": {
                    "innerHash": {},
                    "id": 0,
                    "hash": {
                        "data": "7b0f03c193207e1be74d573f36c4456d55bc9eaf2400c559313aafe0c47273bc"
                    },
                    "height": 9007199254740991
                },
                "transaction": {
                    "timeStamp": 38180238,
                    "amount": 0,
                    "signature": "3eeec6afffcbafa9dc81958f8ae599ede115159dfe1132c5b85e23f05f5b31297aa692c36045b0b55dc9516715839c55dd33cc97940f575326e6f0ab17e98205",
                    "fee": 10000000,
                    "recipient": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
                    "type": 257,
                    "deadline": 38183838,
                    "message": {},
                    "version": -1744830463,
                    "signer": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6"
                }
            },
            "58e0481ffbdd3b94817dcfb36b5f7fb6631aad624ea6d025489ac03afb0b6c7f": {
                "meta": {
                    "innerHash": {},
                    "id": 0,
                    "hash": {
                        "data": "58e0481ffbdd3b94817dcfb36b5f7fb6631aad624ea6d025489ac03afb0b6c7f"
                    },
                    "height": 9007199254740991
                },
                "transaction": {
                    "timeStamp": 38180242,
                    "amount": 0,
                    "signature": "a8d9428674eb67593df3d14abf44a2c4a6406de879ba276abda578f2a7c74346e8a39333ef1a75d7c4fe90cff1545ae00f5806713f07511dcdce01a79adf6d0d",
                    "fee": 10000000,
                    "recipient": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
                    "type": 257,
                    "deadline": 38183842,
                    "message": {},
                    "version": -1744830463,
                    "signer": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6"
                }
            },
            "d75b34c37919643fd4e4e6977442b8395ca084e6eaa0207cf9a290366a89f75a": {
                "meta": {
                    "innerHash": {},
                    "id": 0,
                    "hash": {
                        "data": "d75b34c37919643fd4e4e6977442b8395ca084e6eaa0207cf9a290366a89f75a"
                    },
                    "height": 9007199254740991
                },
                "transaction": {
                    "timeStamp": 38180246,
                    "amount": 0,
                    "signature": "2b201dc47d3e3c1770beb719068ecfcce79a054181c906e5774d733936d3149fa7369a41eb981447fa5874dd532699bbbbacbd5f3bc30ba3f3ef8ff96ce49805",
                    "fee": 10000000,
                    "recipient": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
                    "type": 257,
                    "deadline": 38183846,
                    "message": {},
                    "version": -1744830463,
                    "signer": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6"
                }
            },
            "dc0710faefd670bc61160b557bcf6842fe3a825e522444ee6aa1317fc34bab10": {
                "meta": {
                    "innerHash": {},
                    "id": 0,
                    "hash": {
                        "data": "dc0710faefd670bc61160b557bcf6842fe3a825e522444ee6aa1317fc34bab10"
                    },
                    "height": 9007199254740991
                },
                "transaction": {
                    "timeStamp": 38180249,
                    "amount": 0,
                    "signature": "5f0b553873b8d97bcc3b6a64a464e0359b8d3f4afe853fd3d79522b404173bdf03e648bc0c256cb530a9f70c18f28438449eee20e786140ca180f6d523ca8700",
                    "fee": 10000000,
                    "recipient": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
                    "type": 257,
                    "deadline": 38183849,
                    "message": {},
                    "version": -1744830463,
                    "signer": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6"
                }
            },
            "2ded88a0bb62efa9f6bfbc014d2c1bf3df3facd7f5d3bcee3b74923b0f9b971b": {
                "meta": {
                    "innerHash": {},
                    "id": 0,
                    "hash": {
                        "data": "2ded88a0bb62efa9f6bfbc014d2c1bf3df3facd7f5d3bcee3b74923b0f9b971b"
                    },
                    "height": 9007199254740991
                },
                "transaction": {
                    "timeStamp": 38180253,
                    "amount": 0,
                    "signature": "73ff0bbcb5a4163631edab82f50fbb84c6090b47ff953c0bdffa636521892d89b3cfe661ca5e6ff77871470db8556af565bf751bc6f701c0da06c007f573d80b",
                    "fee": 10000000,
                    "recipient": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
                    "type": 257,
                    "deadline": 38183853,
                    "message": {},
                    "version": -1744830463,
                    "signer": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6"
                }
            },
            "2c7afcd6590ea4859835c435fd1df2c43d9b32479744e0dbf225236212a66c2f": {
                "meta": {
                    "innerHash": {},
                    "id": 0,
                    "hash": {
                        "data": "2c7afcd6590ea4859835c435fd1df2c43d9b32479744e0dbf225236212a66c2f"
                    },
                    "height": 9007199254740991
                },
                "transaction": {
                    "timeStamp": 38180256,
                    "amount": 0,
                    "signature": "ba75097a85535c1b962f6b64f06597f0d153f976e7e0826c2426732321bd1d44f4c08c83b70f0560cca8e4e52b06154de6d8277fd4926748bc7c5a43d997fa0d",
                    "fee": 10000000,
                    "recipient": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
                    "type": 257,
                    "deadline": 38183856,
                    "message": {},
                    "version": -1744830463,
                    "signer": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6"
                }
            }
        };
        let expectedResult = [{
            "meta": {
                "innerHash": {},
                "id": 0,
                "hash": {
                    "data": "2c7afcd6590ea4859835c435fd1df2c43d9b32479744e0dbf225236212a66c2f"
                },
                "height": 9007199254740991
            },
            "transaction": {
                "timeStamp": 38180256,
                "amount": 0,
                "signature": "ba75097a85535c1b962f6b64f06597f0d153f976e7e0826c2426732321bd1d44f4c08c83b70f0560cca8e4e52b06154de6d8277fd4926748bc7c5a43d997fa0d",
                "fee": 10000000,
                "recipient": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
                "type": 257,
                "deadline": 38183856,
                "message": {},
                "version": -1744830463,
                "signer": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6"
            }
        }];

        // Act:
        let result = $filter('startFromUnc')(input, currentPage * pageSize)

        // Assert:
        expect(result).toEqual(expectedResult);
    });

    it("Can format supply", function() {
        // Arrange:
        let supply = 50000000000;
        let mosaicId = {
            namespaceId: "nw.fiat",
            name: "eur"
        };
        let mosaics = {
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
            },
            "nano.fiat:eur": {
                "mosaicDefinition": {
                    "creator": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6",
                    "description": "Test currency",
                    "id": {
                        "namespaceId": "nano.fiat",
                        "name": "eur"
                    },
                    "properties": [{
                        "name": "divisibility",
                        "value": "2"
                    }, {
                        "name": "initialSupply",
                        "value": "9999999"
                    }, {
                        "name": "supplyMutable",
                        "value": "true"
                    }, {
                        "name": "transferable",
                        "value": "true"
                    }],
                    "levy": {}
                },
                "supply": 9999999
            },
            "nw.fiat:eur": {
                "mosaicDefinition": {
                    "creator": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6",
                    "description": "Test asset",
                    "id": {
                        "namespaceId": "nw.fiat",
                        "name": "eur"
                    },
                    "properties": [{
                        "name": "divisibility",
                        "value": "2"
                    }, {
                        "name": "initialSupply",
                        "value": "300000000"
                    }, {
                        "name": "supplyMutable",
                        "value": "true"
                    }, {
                        "name": "transferable",
                        "value": "true"
                    }],
                    "levy": {}
                },
                "supply": 500000000
            },
            "nano.fiat:usd": {
                "mosaicDefinition": {
                    "creator": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6",
                    "description": "Test currency",
                    "id": {
                        "namespaceId": "nano.fiat",
                        "name": "usd"
                    },
                    "properties": [{
                        "name": "divisibility",
                        "value": "2"
                    }, {
                        "name": "initialSupply",
                        "value": "1000000000"
                    }, {
                        "name": "supplyMutable",
                        "value": "true"
                    }, {
                        "name": "transferable",
                        "value": "true"
                    }],
                    "levy": {}
                },
                "supply": 1000010000
            }
        };
        let expectedResult = ['500 000 000', '00'];

        // Act:
        let result = $filter('fmtSupply')(supply, mosaicId, mosaics);

        // Assert:
        expect(result).toEqual(expectedResult);
    });

    describe('Fmt supply edge-cases', function() {

        it("Fmt supply return error if unknown mosaic name", function() {
            // Arrange:
            let supply = 50000000000;
            let mosaicId = {
                namespaceId: "nw.fiat",
                name: "vouchers"
            };
            let mosaics = {
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
                },
                "nano.fiat:eur": {
                    "mosaicDefinition": {
                        "creator": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6",
                        "description": "Test currency",
                        "id": {
                            "namespaceId": "nano.fiat",
                            "name": "eur"
                        },
                        "properties": [{
                            "name": "divisibility",
                            "value": "2"
                        }, {
                            "name": "initialSupply",
                            "value": "9999999"
                        }, {
                            "name": "supplyMutable",
                            "value": "true"
                        }, {
                            "name": "transferable",
                            "value": "true"
                        }],
                        "levy": {}
                    },
                    "supply": 9999999
                },
                "nw.fiat:eur": {
                    "mosaicDefinition": {
                        "creator": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6",
                        "description": "Test asset",
                        "id": {
                            "namespaceId": "nw.fiat",
                            "name": "eur"
                        },
                        "properties": [{
                            "name": "divisibility",
                            "value": "2"
                        }, {
                            "name": "initialSupply",
                            "value": "300000000"
                        }, {
                            "name": "supplyMutable",
                            "value": "true"
                        }, {
                            "name": "transferable",
                            "value": "true"
                        }],
                        "levy": {}
                    },
                    "supply": 500000000
                },
                "nano.fiat:usd": {
                    "mosaicDefinition": {
                        "creator": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6",
                        "description": "Test currency",
                        "id": {
                            "namespaceId": "nano.fiat",
                            "name": "usd"
                        },
                        "properties": [{
                            "name": "divisibility",
                            "value": "2"
                        }, {
                            "name": "initialSupply",
                            "value": "1000000000"
                        }, {
                            "name": "supplyMutable",
                            "value": "true"
                        }, {
                            "name": "transferable",
                            "value": "true"
                        }],
                        "levy": {}
                    },
                    "supply": 1000010000
                }
            };
            let expectedResult = ["unknown mosaic divisibility", 50000000000];

            // Act:
            let result = $filter('fmtSupply')(supply, mosaicId, mosaics);

            // Assert:
            expect(result).toEqual(expectedResult);
        });

        it("Fmt supply return no divisibility if == 0", function() {
            // Arrange:
            let supply = 50000000000;
            let mosaicId = {
                namespaceId: "nw.fiat",
                name: "eur"
            };
            let mosaics = {
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
                },
                "nano.fiat:eur": {
                    "mosaicDefinition": {
                        "creator": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6",
                        "description": "Test currency",
                        "id": {
                            "namespaceId": "nano.fiat",
                            "name": "eur"
                        },
                        "properties": [{
                            "name": "divisibility",
                            "value": "2"
                        }, {
                            "name": "initialSupply",
                            "value": "9999999"
                        }, {
                            "name": "supplyMutable",
                            "value": "true"
                        }, {
                            "name": "transferable",
                            "value": "true"
                        }],
                        "levy": {}
                    },
                    "supply": 9999999
                },
                "nw.fiat:eur": {
                    "mosaicDefinition": {
                        "creator": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6",
                        "description": "Test asset",
                        "id": {
                            "namespaceId": "nw.fiat",
                            "name": "eur"
                        },
                        "properties": [{
                            "name": "divisibility",
                            "value": "0"
                        }, {
                            "name": "initialSupply",
                            "value": "300000000"
                        }, {
                            "name": "supplyMutable",
                            "value": "true"
                        }, {
                            "name": "transferable",
                            "value": "true"
                        }],
                        "levy": {}
                    },
                    "supply": 500000000
                },
                "nano.fiat:usd": {
                    "mosaicDefinition": {
                        "creator": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6",
                        "description": "Test currency",
                        "id": {
                            "namespaceId": "nano.fiat",
                            "name": "usd"
                        },
                        "properties": [{
                            "name": "divisibility",
                            "value": "2"
                        }, {
                            "name": "initialSupply",
                            "value": "1000000000"
                        }, {
                            "name": "supplyMutable",
                            "value": "true"
                        }, {
                            "name": "transferable",
                            "value": "true"
                        }],
                        "levy": {}
                    },
                    "supply": 1000010000
                }
            };
            let expectedResult = ["50 000 000 000", ""];

            // Act:
            let result = $filter('fmtSupply')(supply, mosaicId, mosaics);

            // Assert:
            expect(result).toEqual(expectedResult);
        });

        it("Fmt supply return 0 if supply == 0", function() {
            // Arrange:
            let supply = 0;
            let mosaicId = {
                namespaceId: "nw.fiat",
                name: "eur"
            };
            let mosaics = {
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
                },
                "nano.fiat:eur": {
                    "mosaicDefinition": {
                        "creator": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6",
                        "description": "Test currency",
                        "id": {
                            "namespaceId": "nano.fiat",
                            "name": "eur"
                        },
                        "properties": [{
                            "name": "divisibility",
                            "value": "2"
                        }, {
                            "name": "initialSupply",
                            "value": "9999999"
                        }, {
                            "name": "supplyMutable",
                            "value": "true"
                        }, {
                            "name": "transferable",
                            "value": "true"
                        }],
                        "levy": {}
                    },
                    "supply": 9999999
                },
                "nw.fiat:eur": {
                    "mosaicDefinition": {
                        "creator": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6",
                        "description": "Test asset",
                        "id": {
                            "namespaceId": "nw.fiat",
                            "name": "eur"
                        },
                        "properties": [{
                            "name": "divisibility",
                            "value": "2"
                        }, {
                            "name": "initialSupply",
                            "value": "300000000"
                        }, {
                            "name": "supplyMutable",
                            "value": "true"
                        }, {
                            "name": "transferable",
                            "value": "true"
                        }],
                        "levy": {}
                    },
                    "supply": 500000000
                },
                "nano.fiat:usd": {
                    "mosaicDefinition": {
                        "creator": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6",
                        "description": "Test currency",
                        "id": {
                            "namespaceId": "nano.fiat",
                            "name": "usd"
                        },
                        "properties": [{
                            "name": "divisibility",
                            "value": "2"
                        }, {
                            "name": "initialSupply",
                            "value": "1000000000"
                        }, {
                            "name": "supplyMutable",
                            "value": "true"
                        }, {
                            "name": "transferable",
                            "value": "true"
                        }],
                        "levy": {}
                    },
                    "supply": 1000010000
                }
            };
            let expectedResult = ["0", "00"];

            // Act:
            let result = $filter('fmtSupply')(supply, mosaicId, mosaics);

            // Assert:
            expect(result).toEqual(expectedResult);
        });

    });

    it("Can format raw supply", function() {
        // Arrange:
        let supply = 420000;
        let divisibility = 3;
        let expectedResult = ['420', '000'];

        // Act:
        let result = $filter('fmtSupplyRaw')(supply, divisibility);

        // Assert:
        expect(result).toEqual(expectedResult);
    });

    describe('Fmt raw supply edge-cases', function() {

        it("Fmt raw supply return 0 if raw supply == 0", function() {
            // Arrange:
            let supply = 0;
            let divisibility = 3;
            let expectedResult = ['0', '000'];

            // Act:
            let result = $filter('fmtSupplyRaw')(supply, divisibility);

            // Assert:
            expect(result).toEqual(expectedResult);
        });

        it("Fmt raw supply return no divisibility if == 0", function() {
            // Arrange:
            let supply = 420000;
            let divisibility = 0;
            let expectedResult = ['420 000', ''];

            // Act:
            let result = $filter('fmtSupplyRaw')(supply, divisibility);

            // Assert:
            expect(result).toEqual(expectedResult);
        });

    });

    it("Can format HEX to UTF8", function() {
        // Arrange:
        let hex = "d09bd18ed0b1d18f2c20d181d18ad0b5d188d18c20d189d0b8d0bfd186d18b2c202d20d0b2d0b7d0b4d0bed185d0bdd191d18220d0bcd18dd1802c202d20d0bad0b0d0b9d18420d0b6d0b3d183d187";
        let expectedResult = "Любя, съешь щипцы, - вздохнёт мэр, - кайф жгуч";

        // Act:
        let result = $filter('fmtHexToUtf8')(hex);

        // Assert:
        expect(result).toEqual(expectedResult);
    });

    it("Can format Levy", function() {
        // Arrange:
        let mosaic = {
            "quantity": 1000000,
            "mosaicId": {
                "namespaceId": "nano",
                "name": "usd"
            },
            "levy": {
                "fee": 1000,
                "recipient": "TALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J",
                "type": 1,
                "mosaicId": {
                    "namespaceId": "nem",
                    "name": "xem"
                }
            }
        };
        let multiplier = 1;
        let levy = mosaic.levy;
        let mosaics = {
            "nano:usd": {
                "mosaicDefinition": {
                    "creator": "0257b05f601ff829fdff84956fb5e3c65470a62375a1cc285779edd5ca3b42f6",
                    "description": "Test currency",
                    "id": {
                        "namespaceId": "nano",
                        "name": "usd"
                    },
                    "properties": [{
                        "name": "divisibility",
                        "value": "2"
                    }, {
                        "name": "initialSupply",
                        "value": "1000000000"
                    }, {
                        "name": "supplyMutable",
                        "value": "true"
                    }, {
                        "name": "transferable",
                        "value": "true"
                    }],
                    "levy": {
                        "fee": 1000,
                        "recipient": "TALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J",
                        "type": 1,
                        "mosaicId": {
                            "namespaceId": "nem",
                            "name": "xem"
                        },
                        "supply": 1000000
                    }
                }
            },
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
        };

        // Act:
        let result = $filter('fmtLevyFee')(mosaic, multiplier, levy, mosaics);

        // Assert:
        expect(result).toEqual("0.001000");
    });

    it("Can format HEX message", function() {
        // Arrange:
        let data = {
            type: 1,
            payload: "4e454d20697320617765736f6d652021"
        };
        let expectedMessage = "NEM is awesome !";

        // Act:
        let message = $filter('fmtHexMessage')(data);

        // Assert:
        expect(message).toEqual(expectedMessage);
    });

    it("Can split HEX", function() {
        // Arrange:
        let hex = "aef202e4e1ea9ec9b409e9bea3ab97115e5341dec70966cddda0fdcaf36ea28493f93c48c5221ab87327dd30ee712b94f721d899866b3d2566f46178e63a243d2036006a14aef4776ea81445def250c8";
        let expectedResult = "aef202e4e1ea9ec9b409e9bea3ab97115e5341dec70966cddda0fdcaf36ea284\n93f93c48c5221ab87327dd30ee712b94f721d899866b3d2566f46178e63a243d\n2036006a14aef4776ea81445def250c8";

        // Act:
        let result = $filter('fmtSplitHex')(hex);

        // Assert:
        expect(result).toEqual(expectedResult);
    });

    it("Can split HEX return initial HEX if length < 64 chars", function() {
        // Arrange:
        let hex = "aef202e4e1ea9ec9b409e9bea3ab97115e5341dec709";

        // Act:
        let result = $filter('fmtSplitHex')(hex);

        // Assert:
        expect(result).toEqual(hex);
    });

    it("Can format objects to array", function() {
        // Arrange:
        let data = {
            "nw.fiat": {
                "owner": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
                "fqn": "nw.fiat",
                "height": 307541
            },
            "nano.assets": {
                "owner": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
                "fqn": "nano.assets",
                "height": 437986
            },
            "nano": {
                "owner": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
                "fqn": "nano",
                "height": 437986
            },
            "nanowallet": {
                "owner": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
                "fqn": "nanowallet",
                "height": 447390
            },
            "nw": {
                "owner": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
                "fqn": "nw",
                "height": 307541
            },
            "nano.fiat": {
                "owner": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
                "fqn": "nano.fiat",
                "height": 437986
            }
        };
        let expectedResult = [{
            "owner": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
            "fqn": "nw.fiat",
            "height": 307541
        }, {
            "owner": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
            "fqn": "nano.assets",
            "height": 437986
        }, {
            "owner": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
            "fqn": "nano",
            "height": 437986
        }, {
            "owner": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
            "fqn": "nanowallet",
            "height": 447390
        }, {
            "owner": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
            "fqn": "nw",
            "height": 307541
        }, {
            "owner": "TBCI2A67UQZAKCR6NS4JWAEICEIGEIM72G3MVW5S",
            "fqn": "nano.fiat",
            "height": 437986
        }];

        // Act:
        let result = $filter('objValues')(data);

        // Assert:
        expect(result).toEqual(expectedResult);
    });
});