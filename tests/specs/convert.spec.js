import convert from '../../src/app/utils/convert';

describe('Convert util tests', function() {

    it("utf8ToHex encodes ascii", function() {
        // Arrange:
        let ascii = "Hello";
        let expectedResult = "48656c6c6f";

        // Act:
        let result = convert.utf8ToHex(ascii);

        // Assert:
        expect(result).toEqual(expectedResult);
    });

    it("utf8ToHex encodes utf8", function() {
        // Arrange:
        let utf8 = "Любя, съешь щипцы, - вздохнёт мэр, - кайф жгуч";
        let expectedResult = "d09bd18ed0b1d18f2c20d181d18ad0b5d188d18c20d189d0b8d0bfd186d18b2c202d20d0b2d0b7d0b4d0bed185d0bdd191d18220d0bcd18dd1802c202d20d0bad0b0d0b9d18420d0b6d0b3d183d187";

        // Act:
        let result = convert.utf8ToHex(utf8);

        // Assert:
        expect(result).toEqual(expectedResult);
    });

    it("hex2ua does not throw on invalid input", function() {
        // Arrange:
        let input = null;

        // Act:
        // toThrow requires a function, not an actual result, so wrap in bind
        let result = convert.hex2ua.bind(null, {});

        // Assert:
        expect(result).not.toThrow();
    });

    it("hex2ua converts proper data", function() {
        // Arrange:
        let hex = "55aa90bb";
        let expectedResult = new Uint8Array([85, 170, 144, 187]);

        // Act: 
        let result = convert.hex2ua(hex);

        // Assert:
        expect(result).toEqual(expectedResult);
    });

    it("hex2ua discards odd bytes", function() {
        // Arrange:
        let hex = "55aa90b"
        let expectedResult = new Uint8Array([85, 170, 144]);

        // Act:
        let result = convert.hex2ua(hex);

        // Assert:
        expect().toEqual(expectedResult);
    });

    it("ua2hex works on typed arrays", function() {
        // Arrange:
        let source = new Uint8Array([85, 170, 144, 187]);
        let expectedResult = "55aa90bb";

        // Act:
        let result = convert.ua2hex(source);

        // Assert:
        expect(result).toEqual(expectedResult);
    });

    // this one is actually not a requirement...
    it("ua2hex works on untyped arrays", function() {
        // Arrange:
        let source = [85, 170, 144, 187];
        let expectedResult = "55aa90bb";

        // Act:
        let result = convert.ua2hex(source);

        // Assert:
        expect(result).toEqual(expectedResult);
    });

    // actually maybe it'd be good if it would throw ...
    it("ua2hex does throws on invalid data", function() {
        // Arrange:
        let source = [256];
        let data = null;

        // Act: 
        let result = convert.ua2hex.bind(data, source);

        // Assert:
        expect(result).not.toThrow();
    });

    it("roundtrip ua2hex(hex2ua())", function() {
        // Arrange:
        let hex = "55aa90bb";

        // Act:
        let result = convert.ua2hex(convert.hex2ua(hex));

        // Assert:
        expect(result).toEqual(hex);
    });

    it("roundtrip hex2ua(ua2hex())", function() {
        // Arrange:
        let source = new Uint8Array([85, 170, 144, 187]);

        // Act:
        let result = convert.hex2ua(convert.ua2hex(source));

        // Assert:
        expect(result).toEqual(source);
    });


    it("hex2ua_reversed returns reversed array", function() {
        // Arrange:
        let hex = "55aa90bb";
        let expectedResult = new Uint8Array([187, 144, 170, 85]);

        // Act:
        let result = convert.hex2ua_reversed(hex);

        // Assert:
        expect(result).toEqual(expectedResult);
    });

    it("hex2ua_reversed discards odd bytes", function() {
        // Arrange:
        let hex = "55aa90bb";
        let expectedResult = new Uint8Array([144, 170, 85]);

        // Act:
        let result = convert.hex2ua_reversed(hex);

        // Assert:
        expect(result).toEqual(expectedResult);
    });

    it("hex2a encodes byte-to-byte", function() {
        // Arrange:
        let source = "90909055aa90bbc3bc";
        let expectedResult = 9;

        // Act:
        let result = convert.hex2a(source).length;

        // Assert:
        expect(result).toEqual(expectedResult);
    });

    it("Can convert ua to words", function() {
        // Arrange:
        let ua = new Uint8Array([125, 109, 176, 209, 206, 169, 43, 155, 2, 2, 206, 98, 33, 74, 26, 25, 30, 25, 123, 238, 201, 175, 91, 63, 25, 79, 136, 232, 177, 18, 201, 127]);
        let uaLength = 32;
        let expectedResult = CryptoJS.enc.Hex.parse("7d6db0d1cea92b9b0202ce62214a1a191e197beec9af5b3f194f88e8b112c97f");

        // Act:
        let result = convert.ua2words(ua, uaLength).toString(CryptoJS.enc.Hex);

        // Assert:
        expect(CryptoJS.enc.Hex.parse(result)).toEqual(expectedResult);
    });

    it("Can convert words to ua", function() {
        // Arrange:
        let ua = new Uint8Array([125, 109, 176, 209, 206, 169, 43, 155, 2, 2, 206, 98, 33, 74, 26, 25, 30, 25, 123, 238, 201, 175, 91, 63, 25, 79, 136, 232, 177, 18, 201, 127]);
        let words = CryptoJS.enc.Hex.parse("7d6db0d1cea92b9b0202ce62214a1a191e197beec9af5b3f194f88e8b112c97f");
        let destUa = new Uint8Array(64);
        let hash = CryptoJS.SHA3(words, {
            outputLength: 512
        });

        // Act:
        let result = convert.words2ua(words, hash);

        // Assert:
        expect(convert.hex2ua(result)).toEqual(ua);
    });

});