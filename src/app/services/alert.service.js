export default class Alert {
    constructor(ngToast, $filter) {
        'ngInject';

        // ngToast provider
        this._ngToast = ngToast;
        // Filters
        this._$filter = $filter;
    }

    /***
     * Error alerts
     */
    missingFormData() {
        this._ngToast.create({
            className: 'danger',
            content: this._$filter('translate')('ALERT_MISSING_FORM_DATA')
        });
    }

    errorWalletDownload() {
        this._ngToast.create({
            className: 'danger',
            content: this._$filter('translate')('ALERT_ERROR_WALLET_DOWNLOAD')
        });
    }

    passwordsNotMatching() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_PASSWORDS_NOT_MATCHING'),
            className: 'danger'
        });
    }

    invalidKeyForAddress() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_INVALID_KEY_FOR_ADDR'),
            className: 'danger'
        });
    }

    noWalletLoaded() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_NO_WALLET_LOADED'),
            className: 'danger'
        });
    }

    walletNameExists() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_WALLET_NAME_EXISTS'),
            className: 'danger'
        });
    }

    invalidWalletFile() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_INVALID_WALLET_FILE'),
            className: 'danger'
        });
    }

    noNodeSet() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_NO_NODE_SET'),
            className: 'danger'
        });
    }

    invalidCustomNode() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_INVALID_CUSTOM_NODE'),
            className: 'danger'
        });
    }

    invalidWebsocketPort() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_INVALID_WEBSOCKET_PORT'),
            className: 'danger'
        });
    }

    websocketError(message) {
        this._ngToast.create({
            content: message,
            className: 'danger'
        });
    }

    mijinDisabled() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_MIJIN_DISABLED'),
            className: 'danger'
        });
    }

    getNamespacesByIdError(message) {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_GET_NS_BY_ID_ERROR') + message,
            className: 'danger'
        });
    }

    getAccountDataError(message) {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_GET_ACCOUNT_DATA_ERROR') + message,
            className: 'danger'
        });
    }

    invalidAddressForNetwork(address, network) {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_ERROR_OCCURRED') + address + this._$filter('translate')('ALERT_INVALID_ADDR_FOR_NETWORK') + '(' + network + ') !',
            className: 'danger'
        });
    }

    invalidPassword() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_INVALID_PASSWORD'),
            className: 'danger'
        });
    }

    transactionError(message) {
        this._ngToast.create({
            content: message,
            className: 'danger'
        });
    }

    cosignatoryAlreadyPresentInList(){
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_COSIG_ALREADY_IN_LIST'),
            className: 'danger'
        });
    }

    cosignatoryhasNoPubKey(){
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_COSIGNATORY_HAS_NO_PUBLIC'),
            className: 'danger'
        });
    }

    multisighasNoPubKey(){
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_MULTISIG_HAS_NO_PUBLIC'),
            className: 'danger'
        });
    }

    cosignatoryCannotBeMultisig(){
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_COSIG_CANNOT_BE_MULTISIG'),
            className: 'danger'
        });
    }

    noNamespaceOwned(){
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_NO_NS_OWNED'),
            className: 'danger'
        });
    }

    unlockedInfoError(){
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_UNLOCKED_INFO_ERROR'),
            className: 'danger'
        });
    }

    lockError(message) {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_LOCK_ERROR') + message,
            className: 'danger'
        });
    }

    unlockError(message) {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_UNLOCK_ERROR') + message,
            className: 'danger'
        });
    }

    supernodesError() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_SUPERNODES_ERROR'),
            className: 'danger'
        });
    }

    invalidNtyFile() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_INVALID_NTY_FILE'),
            className: 'danger'
        });
    }

    createWalletFailed(err) {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_CREATE_WALLET_FAILED') + err,
            className: 'danger'
        });
    }

    derivationFromSeedFailed(err) {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_DERIVATION_FROM_SEED_FAILED') + err,
            className: 'danger'
        });
    }

    bip32GenerationFailed(err) {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_BIP32_GENERATION_FAILED') + err,
            className: 'danger'
        });
    }

    noWalletData() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_NO_WALLET_DATA'),
            className: 'danger'
        });
    }

    cantLoginWithoutWallet() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_CANNOT_LOGIN_WITHOU_WALLET'),
            className: 'danger'
        });
    }

    noWalletToSet() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_NO_WALLET_TO_SET'),
            className: 'danger'
        });
    }

    invalidWalletIndex() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_INVALID_WALLET_INDEX'),
            className: 'danger'
        });
    }

    noCurrentWallet() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_NO_CURRENT_WALLET'),
            className: 'danger'
        });
    }

    alreadyMultisig() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_ALREADY_MULTISIG'),
            className: 'danger'
        });
    }

    invalidModificationArray() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_INVALID_MODIFICATION_ARRAY'),
            className: 'danger'
        });
    }

    errorGetMarketInfo() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_GET_MARKET_INFO_ERROR'),
            className: 'danger'
        });
    }

    multisigCannotBeCosignatory() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_MULTISIG_CANNOT_BE_COSIG'),
            className: 'danger'
        });
    }

    purgeCancelled() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_PURGE_CANCELLED'),
            className: 'danger'
        });
    }

    mainnetDisabled() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_MAINNET_DISABLED'),
            className: 'danger'
        });
    }

    emptyDecodedMessage() {
       this._ngToast.create({
            content: this._$filter('translate')('ALERT_EMPTY_DECODED_MSG'),
            className: 'danger'
        }); 
    }

    invalidNamespaceName() {
       this._ngToast.create({
            content: this._$filter('translate')('ALERT_INVALID_NS_NAME'),
            className: 'danger'
        }); 
    }

    invalidMosaicName() {
       this._ngToast.create({
            content: this._$filter('translate')('ALERT_INVALID_MOSAIC_NAME'),
            className: 'danger'
        }); 
    }

    invalidMosaicDescription() {
       this._ngToast.create({
            content: this._$filter('translate')('ALERT_MOSAIC_DESCRIPTION'),
            className: 'danger'
        }); 
    }

    errorFetchingIncomingTxes(message) {
         this._ngToast.create({
            content: this._$filter('translate')('ALERT_GET_INCOMING_TXES_ERROR') + message,
            className: 'danger'
        }); 
    }

    connectionError() {
         this._ngToast.create({
            content: this._$filter("translate")("GENERAL_CONNECTION_ERROR"),
            className: 'danger'
        }); 
    }

    errorGetMosaicsDefintions(message) {
        this._ngToast.create({
            content: this._$filter("translate")("ALERT_GET_MOSAICS_DEFINITIONS_ERROR") + message,
            className: 'danger'
        });
    }

    errorGetSubNamespaces(message) {
        this._ngToast.create({
            content: this._$filter("translate")("ALERT_GET_SUB_NS_ERROR") + message,
            className: 'danger'
        });
    }

    errorGetMosaics(message) {
        this._ngToast.create({
            content: this._$filter("translate")("ALERT_GET_MOSAICS_ERROR") + message,
            className: 'danger'
        });
    }

    errorGetTransactions(message) {
        this._ngToast.create({
            content: this._$filter("translate")("ALERT_GET_TRANSACTIONS_ERROR") + message,
            className: 'danger'
        });
    }

    /***
     * Success alerts
     */
    createWalletSuccess() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_CREATE_WALLET_SUCCESS'),
            className: 'success'
        });
    }

    successPurge() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_SUCCESS_PURGE'),
            className: 'success'
        });
    }

    successLogout() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_SUCCESS_LOGOUT'),
            className: 'success'
        });
    }

    loadWalletSuccess() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_LOAD_WALLET_SUCCESS'),
            className: 'success'
        });
    }

    transactionSuccess() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_TRANSACTION_SUCCESS'),
            className: 'success'
        });
    }

    generateNewAccountSuccess() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_GENERATE_ACCOUNT_SUCCESS'),
            className: 'success'
        });
    }

    upgradeSuccess() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_UPGRADE_SUCCESS'),
            className: 'success'
        });
    }

    transactionSignatureSuccess() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_SIGNATURE_SUCCESS'),
            className: 'success'
        });
    }

    ntyFileSuccess() {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_NTY_FILE_SUCCESS'),
            className: 'success'
        });
    }

    /***
     * Transaction notifications
     */

    incomingTransaction(signer, network) {
        this._ngToast.create({
            content: this._$filter('translate')('ALERT_INCOMING_TX_FROM') + this._$filter('fmtPubToAddress')(signer, network),
            className: 'success'
        });
    }

}