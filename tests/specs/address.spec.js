import Address from '../../src/app/utils/Address';
import convert from '../../src/app/utils/convert';
import Network from '../../src/app/utils/Network';

describe('Address util tests', function() {

    function generateRandomKey() {
        let rawPublicKey = new Uint8Array(32);
        window.crypto.getRandomValues(rawPublicKey);
        return convert.ua2hex(rawPublicKey);
    }

    it("Can create mainnet address", function() {
        // Arrange:
        let publicKey = generateRandomKey();

        // Act:
        let address = Address.toAddress(publicKey, Network.data.Mainnet.id);

        // Assert:
        expect(address[0]).toEqual(Network.data.Mainnet.char);
        expect(address.length).toBe(40);
    });

    it("Can create testnet address", function() {
        // Arrange:
        let publicKey = generateRandomKey();

        // Act:
        let address = Address.toAddress(publicKey, Network.data.Testnet.id);

        // Assert:
        expect(address[0]).toEqual(Network.data.Testnet.char);
        expect(address.length).toBe(40);
    });

    it("Same public key yields same address", function() {
        // Arrange:
        let publicKey = generateRandomKey();

        // Act:
        let address1 = Address.toAddress(publicKey, Network.data.Testnet.id);
        let address2 = Address.toAddress(publicKey, Network.data.Testnet.id);

        // Assert:
        expect(address1).toEqual(address2);
        expect(address1.length).toBe(40);
    });

    it("Different network yields different address", function() {
        // Arrange:
        let publicKey = generateRandomKey();

        // Act:
        let address1 = Address.toAddress(publicKey, Network.data.Testnet.id);
        let address2 = Address.toAddress(publicKey, Network.data.Mainnet.id);

        // Assert:
        expect(address1.slice(1)).not.toEqual(address2.slice(1));
        expect(address1.length).toBe(40);
    });

    it("Generated address is valid", function() {
        // Arrange:
        let publicKey = generateRandomKey();

        // Act:
        let address = Address.toAddress(publicKey, Network.data.Mainnet.id);

        // Assert:
        expect(Address.isValid(address)).toBe(true);
        expect(address.length).toBe(40);
    });

    it("Altered address is not valid", function() {
        // Arrange:
        let publicKey = generateRandomKey();

        // Act:
        let address = Address.toAddress(publicKey, Network.data.Mainnet.id);
        let modifiedAddress = Network.data.Testnet.char + address.slice(1);

        // Assert:
        expect(Address.isValid(address)).toBe(true);
        expect(Address.isValid(modifiedAddress)).toBe(false);
    });

    it("Can convert public key to address", function() {
        // Arrange:
        let publicKeyMainnet = "ed9bf729c0d93f238bc4af468b952c35071d9fe1219b27c30dfe108c2e3db030";
        let publicKeyTestnet = "4fec0eb477c3294c0ae1de1c6f6e47253b6e392ecb136bdf60721cde90890db0";
        let expectedAddressMainnet = "NC3KIMHFGODLLWLQLRIUVF5BLXBCEZLC7AI7L36K";
        let expectedAddressTestnet = "TA4B72ATAJ6NAWTYWNRKJBPH5PQ5VQA2GQFDCEPL";

        // Act:
        let addressMainnet = Address.toAddress(publicKeyMainnet, Network.data.Mainnet.id);
        let addressTestnet = Address.toAddress(publicKeyTestnet, Network.data.Testnet.id);

        // Assert:
        expect(addressMainnet).toEqual(expectedAddressMainnet);
        expect(addressTestnet).toEqual(expectedAddressTestnet);
    });

    it("Can convert same public key to different network address", function() {
        // Arrange:
        let publicKey = "ed9bf729c0d93f238bc4af468b952c35071d9fe1219b27c30dfe108c2e3db030";
        let expectedAddressMainnet = "NC3KIMHFGODLLWLQLRIUVF5BLXBCEZLC7AI7L36K";
        let expectedAddressTestnet = "TC3KIMHFGODLLWLQLRIUVF5BLXBCEZLC7CL2246V";

        // Act:
        let addressMainnet = Address.toAddress(publicKey, Network.data.Mainnet.id);
        let addressTestnet = Address.toAddress(publicKey, Network.data.Testnet.id);

        // Assert:
        expect(addressMainnet).toEqual(expectedAddressMainnet);
        expect(addressTestnet).toEqual(expectedAddressTestnet);
    });

});