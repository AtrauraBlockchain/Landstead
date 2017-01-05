import nacl from '../utils/nacl-fast';
import KeyPair from '../utils/KeyPair';
import convert from '../utils/convert';
import Address from '../utils/Address';
import CryptoHelpers from '../utils/CryptoHelpers';

/** Service to build wallets */
class WalletBuilder {

    /**
     * Initialize services and properties
     *
     * @param {service} Alert - The Alert service
     * @param {service} $timeout - The angular $timeout service
     */
    constructor(Alert, $timeout) {
        'ngInject';

        /***
         * Declare services
         */
        this._Alert = Alert;
        this._$timeout = $timeout;
    }

    /**
     * Create a PRNG wallet object
     *
     * @param {string} walletName - A wallet name
     * @param {string} walletPassword - A wallet password
     * @param {number} network - A network id
     *
     * @return {object|promise} - A PRNG wallet object or promise error
     */
    createWallet(walletName, walletPassword, network) {
        return new Promise((resolve, reject) => {
            if (!walletName || !walletPassword || !network) {
                return reject("Missing parameter");
            }
            // Create private key from random bytes
            let r = convert.ua2hex(nacl.randomBytes(32));
            // Create KeyPair from above key
            let k = KeyPair.create(r);
            // Create address from public key
            let addr = Address.toAddress(k.publicKey.toString(), network);
            // Encrypt private key using password
            let encrypted = CryptoHelpers.encodePrivKey(r, walletPassword);
            // Create bip32 remote amount using generated private key
            return resolve(CryptoHelpers.generateBIP32Data(r, walletPassword, 0, network).then((data) => {
                    // Construct the wallet object
                    let wallet = this.buildWallet(walletName, addr, true, "pass:bip32", encrypted, network, data.publicKey);
                    return wallet;
                },
                (err) => {
                    this._$timeout(() => {
                        this._Alert.createWalletFailed(err);
                        return 0;
                    }, 0)
                }));
        });
    }

    /**
     * Create a brain wallet object
     *
     * @param {string} walletName - A wallet name
     * @param {string} walletPassword - A wallet password
     * @param {number} network - A network id
     *
     * @return {object|promise} - A Brain wallet object or promise error
     */
    createBrainWallet(walletName, walletPassword, network) {
        return new Promise((resolve, reject) => {
            if (!walletName || !walletPassword || !network) {
                return reject("Missing parameter");
            }
            // Derive private key from password
            let r = CryptoHelpers.derivePassSha(walletPassword, 6000);
            // Create KeyPair from above key
            let k = KeyPair.create(r.priv);
            // Create address from public key
            let addr = Address.toAddress(k.publicKey.toString(), network);
            // Create bip32 remote account using derived private key
            return resolve(CryptoHelpers.generateBIP32Data(r.priv, walletPassword, 0, network).then((data) => {
                    // Construct the wallet object
                    let wallet = this.buildWallet(walletName, addr, true, "pass:6k", "", network, data.publicKey);
                    return wallet;
                },
                (err) => {
                    this._$timeout(() => {
                        this._Alert.createWalletFailed(err);
                        return 0;
                    }, 0)
                }));
        });
    }

    /**
     * Create a private key wallet object
     *
     * @param {string} walletName - A wallet name
     * @param {string} walletPassword - A wallet password
     * @param {string} address - An account address
     * @param {string} privateKey - The account private key
     * @param {number} network - A network id
     *
     * @return {object|promise} - A private key wallet object or promise error
     */
    createPrivateKeyWallet(walletName, walletPassword, address, privateKey, network) {
        return new Promise((resolve, reject) => {
            if (!walletName || !walletPassword || !address || !privateKey || !network) {
                return reject("Missing parameter");
            }
            // Encrypt private key using password
            let encrypted = CryptoHelpers.encodePrivKey(privateKey, walletPassword);
            // Clean address
            let cleanAddr = address.toUpperCase().replace(/-/g, '');
            // Create bip32 remote account using provided private key
            return resolve(CryptoHelpers.generateBIP32Data(privateKey, walletPassword, 0, network).then((data) => {
                    // Construct the wallet object
                    let wallet = this.buildWallet(walletName, cleanAddr, false, "pass:enc", encrypted, network, data.publicKey);
                    return wallet;
                },
                (err) => {
                    this._$timeout(() => {
                        this._Alert.createWalletFailed(err);
                        return 0;
                    }, 0)
                }));
        });
    }

    /**
     * Create a wallet object
     *
     * @param {string} walletName - The wallet name
     * @param {string} addr - The main account address
     * @param {boolean} brain - Is brain or not
     * @param {string} algo - The wallet algorithm
     * @param {object} encrypted - The encrypted private key object
     * @param {number} network - The network id
     * @param {string} child - The public key of the account derived from seed
     *
     * @return {object} - A wallet object
     */
    buildWallet(walletName, addr, brain, algo, encrypted, network, child) {
        let wallet = {
            "privateKey": "",
            "name": walletName,
            "accounts": {
                "0": {
                    "brain": brain,
                    "algo": algo,
                    "encrypted": encrypted.ciphertext || "",
                    "iv": encrypted.iv || "",
                    "address": addr.toUpperCase().replace(/-/g, ''),
                    "label": 'Primary',
                    "network": network,
                    "child": child
                }
            }
        };
        return wallet;
    }
}

export default WalletBuilder;