import Address from '../../src/app/utils/Address';
import convert from '../../src/app/utils/convert';
import Network from '../../src/app/utils/Network';
import KeyPair from '../../src/app/utils/KeyPair';

describe('Keypair tests', function() {

    it("Can create keypair from hex private key", function() {
        // Arrange:
        let privateKey = "c9fb7f16b738b783be5192697a684cba4a36adb3d9c22c0808f30ae1d85d384f";
        let expectedPublicKey = "ed9bf729c0d93f238bc4af468b952c35071d9fe1219b27c30dfe108c2e3db030";

        // Act:
        let kp = KeyPair.create(privateKey);

        // Assert:
        expect(kp.publicKey.toString()).toEqual(expectedPublicKey);
    });

    it("Can sign data with private key", function() {
        // Arrange:
        let privateKey = "abf4cf55a2b3f742d7543d9cc17f50447b969e6e06f5ea9195d428ab12b7318d";
        let publicKey = "8a558c728c21c126181e5e654b404a45b4f0137ce88177435a69978cc6bec1f4";
        let signature = "d9cec0cc0e3465fab229f8e1d6db68ab9cc99a18cb0435f70deb6100948576cd5c0aa1feb550bdd8693ef81eb10a556a622db1f9301986827b96716a7134230c";

        // Act:
        let kp = KeyPair.create(privateKey);
        let sign = kp.sign("8ce03cd60514233b86789729102ea09e867fc6d964dea8c2018ef7d0a2e0e24bf7e348e917116690b9").toString();

        // Assert:
        expect(kp.publicKey.toString()).toEqual(publicKey);
        expect(sign).toEqual(signature);
    });

});