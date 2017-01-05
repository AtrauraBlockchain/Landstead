/** @module utils/TransactionTypes */

/**
 * The transfer transaction type
 *
 * @type {string}
 *
 * @default
 */
let Transfer = 0x101; // 257

/**
 * The importance transfer type
 *
 * @type {string}
 *
 * @default
 */
let ImportanceTransfer = 0x801; // 2049

/**
 * The aggregate modification transaction type
 *
 * @type {string}
 *
 * @default
 */
let MultisigModification = 0x1001; // 4097

/**
 * The multisignature signature transaction type
 *
 * @type {string}
 *
 * @default
 */
let MultisigSignature = 0x1002; // 4098

/**
 * The multisignature transaction type
 *
 * @type {string}
 *
 * @default
 */
let MultisigTransaction = 0x1004; // 4100

/**
 * The provision namespace transaction type
 *
 * @type {string}
 *
 * @default
 */
let ProvisionNamespace = 0x2001; // 8193

/**
 * The mosaic definition transaction type
 *
 * @type {string}
 *
 * @default
 */
let MosaicDefinition = 0x4001; // 16385

/**
 * The mosaic supply change transaction type
 *
 * @type {string}
 *
 * @default
 */
let MosaicSupply = 0x4002; // 16386

module.exports = {
    Transfer,
    ImportanceTransfer,
    MultisigModification,
    MultisigSignature,
    MultisigTransaction,
    ProvisionNamespace,
    MosaicDefinition,
    MosaicSupply
}