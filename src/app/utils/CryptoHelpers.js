/** @module utils/CryptoHelpers */

import KeyPair from './KeyPair';
import convert from './convert';
import Address from './Address';
import BIP32Provider from './bip32';
import nacl from './nacl-fast';
import Network from './Network';

/**
 * Encrypt a private key for mobile apps
 *
 * @param {string} password - A wallet password
 * @param {string} privateKey - An account private key
 *
 * @return {object} - The encrypted data
 */
let AES_PBKF2_encryption = function(password, privateKey) {
    let salt = CryptoJS.lib.WordArray.random(256 / 8);
    let key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 2000
    });
    let iv = new Uint8Array(16);
    window.crypto.getRandomValues(iv);
    let encIv = {
        iv: convert.ua2words(iv, 16)
    };
    let encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Hex.parse(privateKey), key, encIv);
    return {
        encrypted: convert.ua2hex(iv) + encrypted.ciphertext,
        salt:  salt.toString()
    }
};

/**
 * Derive a private key from a password using count iterations of SHA3-256
 *
 * @param {string} password - A wallet password
 * @param {number} count - A number of iterations
 *
 * @return {object} - The derived private key
 */
let derivePassSha = function(password, count) {
    let data = password;
    console.time('sha3^n generation time');
    for (let i = 0; i < count; ++i) {
        data = CryptoJS.SHA3(data, {
            outputLength: 256
        });
    }
    console.timeEnd('sha3^n generation time');
    return {
        'priv': CryptoJS.enc.Hex.stringify(data)
    };
};

/**
 * Reveal the private key of an account or derive it from the wallet password
 *
 * @param {object} commonData- An object containing password and privateKey field
 * @param {object} walletAccount - A wallet account object
 * @param {string} algo - A wallet algorithm
 * @param {boolean} doClear - True to clean password after operation, false otherwise
 *
 * @return {object|boolean} - The account private key or false
 */
let passwordToPrivatekeyClear = function(commonData, walletAccount, algo, doClear) {
    if (commonData.password) {
        let r = undefined;
        if (algo === "pass:6k") { // Brain wallets
            if (!walletAccount.encrypted && !walletAccount.iv) {
                // Base account private key is generated simply using a passphrase so it has no encrypted and iv
                r = derivePassSha(commonData.password, 6000);
            } else if (!walletAccount.encrypted || !walletAccount.iv) {
                // Else if one is missing there is a problem
                alert("Account might be compromised, missing encrypted or iv");
                return false;
            } else {
                // Else child accounts have encrypted and iv so we decrypt
                let pass = derivePassSha(commonData.password, 20);
                let obj = {
                    ciphertext: CryptoJS.enc.Hex.parse(walletAccount.encrypted),
                    iv: convert.hex2ua(walletAccount.iv),
                    key: convert.hex2ua(pass.priv)
                }
                let d = decrypt(obj);
                r = {
                    'priv': d
                };
            }
        } else if (algo === "pass:bip32") { // Wallets from PRNG
            let pass = derivePassSha(commonData.password, 20);
            let obj = {
                ciphertext: CryptoJS.enc.Hex.parse(walletAccount.encrypted),
                iv: convert.hex2ua(walletAccount.iv),
                key: convert.hex2ua(pass.priv)
            }
            let d = decrypt(obj);
            r = {
                'priv': d
            };
        } else if (algo === "pass:enc") { // Private Key wallets
            let pass = derivePassSha(commonData.password, 20);
            let obj = {
                ciphertext: CryptoJS.enc.Hex.parse(walletAccount.encrypted),
                iv: convert.hex2ua(walletAccount.iv),
                key: convert.hex2ua(pass.priv)
            }
            let d = decrypt(obj);
            r = {
                'priv': d
            };
        } else {
            alert("Unknown wallet encryption method");
            return false;
        }
        if (doClear) {
            delete commonData.password;
        }
        commonData.privateKey = r.priv;
        return true;
    } else {
        return false;
    }
}

/**
 * Check if a private key correspond to an account address
 *
 * @param {string} priv - An account private key
 * @param {number} network - A network id
 * @param {string} _expectedAddress - The expected NEM address
 *
 * @return {boolean} - True if valid, false otherwise
 */
let checkAddress = function(priv, network, _expectedAddress) {
    if (priv.length === 64 || priv.length === 66) {
        let expectedAddress = _expectedAddress.toUpperCase().replace(/-/g, '');
        let kp = KeyPair.create(priv);
        let address = Address.toAddress(kp.publicKey.toString(), network);
        return address === expectedAddress;
    } else {
        return false;
    }
};

function hashfunc(dest, data, dataLength) {
    let convertedData = convert.ua2words(data, dataLength);
    let hash = CryptoJS.SHA3(convertedData, {
        outputLength: 512
    });
    convert.words2ua(dest, hash);
}

function key_derive(shared, salt, sk, pk) {
    nacl.lowlevel.crypto_shared_key_hash(shared, pk, sk, hashfunc);
    for (let i = 0; i < salt.length; i++) {
        shared[i] ^= salt[i];
    }
    let hash = CryptoJS.SHA3(convert.ua2words(shared, 32), {
        outputLength: 256
    });
    return hash;
}

/**
 * Generate a random key
 *
 * @return {Uint8Array} - A random key
 */
let randomKey = function() {
    let rkey = new Uint8Array(32);
    window.crypto.getRandomValues(rkey);
    return rkey;
};

/**
 * encrypt() Encrypt hex data using a key
 *
 * @param {string} data - An hex string
 * @param {Uint8Array} key - An Uint8Array key
 *
 * @return {object} - The encrypted data
 */
let encrypt = function(data, key) {
    let iv = new Uint8Array(16);
    window.crypto.getRandomValues(iv);

    let encKey = convert.ua2words(key, 32);
    let encIv = {
        iv: convert.ua2words(iv, 16)
    };
    let encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Hex.parse(data), encKey, encIv);
    return {
        ciphertext: encrypted.ciphertext,
        iv: iv,
        key: key
    };
};

/**
 * Decrypt data
 *
 * @param {object} data - An encrypted data object
 *
 * @return {string} - The decrypted hex string
 */
let decrypt = function(data) {
    let encKey = convert.ua2words(data.key, 32);
    let encIv = {
        iv: convert.ua2words(data.iv, 16)
    };
    return CryptoJS.enc.Hex.stringify(CryptoJS.AES.decrypt(data, encKey, encIv));
};

/**
 * Encode a private key using a password
 *
 * @param {string} privateKey - An hex private key
 * @param {string} password - A password
 *
 * @return {object} - The encoded data
 */
let encodePrivKey = function(privateKey, password) {
    if (!password) {
        throw new Error("No password provided");
    } else if (!privateKey) {
        throw new Error("No private key provided");
    } else {
        let pass = derivePassSha(password, 20);
        let r = encrypt(privateKey, convert.hex2ua(pass.priv));
        let ret = {
            ciphertext: CryptoJS.enc.Hex.stringify(r.ciphertext),
            iv: convert.ua2hex(r.iv)
        };
        return ret;
    }
};

/***
 * Encode a message, separated from encode() to help testing
 *
 * @param {string} senderPriv - A sender private key
 * @param {string} recipientPub - A recipient public key
 * @param {string} msg - A text message
 * @param {Uint8Array} iv - An initialization vector
 * @param {Uint8Array} salt - A salt
 *
 * @return {string} - The encoded message
 */
let _encode = function(senderPriv, recipientPub, msg, iv, salt) {
    let sk = convert.hex2ua_reversed(senderPriv);
    let pk = convert.hex2ua(recipientPub);

    let shared = new Uint8Array(32);
    let r = key_derive(shared, salt, sk, pk);

    let encKey = r;
    let encIv = {
        iv: convert.ua2words(iv, 16)
    };
    let encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Hex.parse(convert.utf8ToHex(msg)), encKey, encIv);
    let result = convert.ua2hex(salt) + convert.ua2hex(iv) + CryptoJS.enc.Hex.stringify(encrypted.ciphertext);
    return result;
};

/**
 * Encode a message
 *
 * @param {string} senderPriv - A sender private key
 * @param {string} recipientPub - A recipient public key
 * @param {string} msg - A text message
 *
 * @return {string} - The encoded message
 */
let encode = function(senderPriv, recipientPub, msg) {
    if (!recipientPub) {
        throw new Error("No recipient public key");
    } else if (!msg) {
        throw new Error("No message to encode");
    } else if (!senderPriv) {
        throw new Error("No sender private key");
    } else {
        let iv = new Uint8Array(16);
        window.crypto.getRandomValues(iv);
        //console.log("IV:", convert.ua2hex(iv));

        let salt = new Uint8Array(32);
        window.crypto.getRandomValues(salt);

        let encoded = _encode(senderPriv, recipientPub, msg, iv, salt);

        return encoded;
    }
};

/**
 * Decode an encrypted message payload
 *
 * @param {string} recipientPrivate - A recipient private key
 * @param {string} senderPublic - A sender public key
 * @param {string} _payload - An encrypted message payload
 *
 * @return {string} - The decoded payload as hex
 */
let decode = function(recipientPrivate, senderPublic, _payload) {
    if (!senderPublic) {
        throw new Error("No sender public key");
    } else if (!_payload) {
        throw new Error("No payload to decode");
    } else if (!recipientPrivate) {
        throw new Error("No recipient private key");
    } else {
        let binPayload = convert.hex2ua(_payload);
        let salt = new Uint8Array(binPayload.buffer, 0, 32);
        let iv = new Uint8Array(binPayload.buffer, 32, 16);
        let payload = new Uint8Array(binPayload.buffer, 48);

        let sk = convert.hex2ua_reversed(recipientPrivate);
        let pk = convert.hex2ua(senderPublic);
        let shared = new Uint8Array(32);
        let r = key_derive(shared, salt, sk, pk);

        let encKey = r;
        let encIv = {
            iv: convert.ua2words(iv, 16)
        };

        let encrypted = {
            'ciphertext': convert.ua2words(payload, payload.length)
        };
        let plain = CryptoJS.AES.decrypt(encrypted, encKey, encIv);
        let hexplain = CryptoJS.enc.Hex.stringify(plain);
        return hexplain;
    }
};

/**
 * Generate bip32 data
 *
 * @param {string} r - A private key
 * @param {string} password - A wallet password
 * @param {number} index - A derivation index
 * @param {number} network - A network id
 *
 * @return {object|promise} - The bip32 data or promise error
 */
let generateBIP32Data = function(r, password, index, network) {
    return new Promise((resolve, reject) => {

        if (!r) {
            return reject("No private key");
        }
        if (!password) {
            return reject("No password");
        }
        if (!network) {
            return reject("No network");
        }

        // 25000 rounds of SHA3
        let pk_SHA3_25000;
        for (let i = 0; i < 25000; ++i) {
            pk_SHA3_25000 = CryptoJS.SHA3(r, {
                outputLength: 256
            });
        }
        let hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA3, password);
        hmac.update(pk_SHA3_25000);
        let hash = hmac.finalize();

        // Split into equal parts of 32 bytes
        let il = Crypto.util.hexToBytes(hash.toString().slice(0, 64));
        let ir = Crypto.util.hexToBytes(hash.toString().slice(64, 128));

        /*console.log("Private: " + r.toString());
        console.log("Hash: " + hash.toString());
        console.log("il: " + il.toString());
        console.log("ir: " + ir.toString());*/

        // Create BIP32 object
        let gen_bip32 = new BIP32Provider.BIP32();
        try {
            // Set BIP32 object properties
            gen_bip32.eckey = new Bitcoin.ECKey(il);
            gen_bip32.eckey.pub = gen_bip32.eckey.getPubPoint();
            gen_bip32.eckey.setCompressed(true);
            gen_bip32.eckey.pubKeyHash = Bitcoin.Util.sha256ripe160(gen_bip32.eckey.pub.getEncoded(true));
            gen_bip32.has_private_key = true;

            gen_bip32.chain_code = ir;
            gen_bip32.child_index = 0;
            gen_bip32.parent_fingerprint = Bitcoin.Util.hexToBytes("00000000");
            // BIP32 version by wallet network
            if (network === Network.data.Mainnet.id) {
                gen_bip32.version = 0x68000000;
            } else if (network === Network.data.Mijin.id) {
                gen_bip32.version = 0x60000000;
            } else {
                gen_bip32.version = 0x98000000;
            }
            gen_bip32.depth = 99;

            gen_bip32.build_extended_public_key();
            gen_bip32.build_extended_private_key();
        } catch (err) {
            return reject(err);
        }

        //console.log('BIP32 Extended Key: ' + gen_bip32.extended_private_key_string("base58"));

        updateDerivationPath(gen_bip32, index, network, resolve, reject);
    });
};

function updateDerivationPath(bip32_source_key, index, network, resolve, reject) {
    let bip32_derivation_path = "m/i"; //Simple

    //k set to 0, only using the i'th KeyPair
    updateResult(bip32_source_key, bip32_derivation_path, 0, index, network, resolve, reject);
}

function updateResult(bip32_source_key, bip32_derivation_path, k_index, i_index, network, resolve, reject) {
    let p = '' + bip32_derivation_path;
    let k = parseInt(k_index);
    let i = parseInt(i_index);

    p = p.replace('i', i).replace('k', k);

    let result;
    try {
        if (bip32_source_key == null) {
            // if this is the case then there's an error state set on the source key
            return reject("Error state set on the source key")
        }
        console.log("Deriving: " + p);
        result = bip32_source_key.derive(p);
    } catch (err) {
        return reject(err);
    }

    if (result.has_private_key) {
        console.log('Derived private key: ' + result.extended_private_key_string("base58"));
        console.log('Derived private key HEX: ' + Crypto.util.bytesToHex(result.eckey.priv.toByteArrayUnsigned()));
        let privkeyBytes = result.eckey.priv.toByteArrayUnsigned();
        while (privkeyBytes.length < 32) {
            privkeyBytes.unshift(0);
        };
    } else {
        return reject("No private key available");
    }

    let account = KeyPair.create(Crypto.util.bytesToHex(result.eckey.priv.toByteArrayUnsigned()));
    let address = Address.toAddress(account.publicKey.toString(), network);
    console.log('BIP32 account generated: ' + address);

    return resolve({
        seed: bip32_source_key.extended_private_key_string("base58"),
        address: address,
        privateKey: Crypto.util.bytesToHex(result.eckey.priv.toByteArrayUnsigned()),
        publicKey: account.publicKey.toString()
    });
}

/**
 * Derive a bip32 account from seed
 *
 * @param {string} bip32Key - A bip32 seed
 * @param {number} index - A derivation index
 * @param {number} network - A network id
 *
 * @return {object|promise} - The bip32 data or promise error
 */
let BIP32derivation = function(bip32Key, index, network) {
    return new Promise((resolve, reject) => {

        if (!bip32Key) {
            return reject("No seed to derivate account from");
        }

        let bip32_source_key;
        try {
            // Create bip32 object from seed
            let source_key_str = bip32Key;
            if (source_key_str.length == 0) return;
            bip32_source_key = new BIP32Provider.BIP32(source_key_str);
        } catch (err) {
            bip32_source_key = null;
            return reject(err)
        }

        updateDerivationPath(bip32_source_key, index, network, resolve, reject);
    });
};

module.exports = {
    AES_PBKF2_encryption,
    derivePassSha,
    passwordToPrivatekeyClear,
    checkAddress,
    randomKey,
    decrypt,
    encrypt,
    encodePrivKey,
    _encode,
    encode,
    decode,
    generateBIP32Data,
    BIP32derivation
}