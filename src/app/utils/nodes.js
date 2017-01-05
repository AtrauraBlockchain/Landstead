/** @module utils/nodes */

/**
 * The default testnet node
 *
 * @type {string}
 */
let defaultTestnetNode = 'http://bob.nem.ninja:7778';

/**
 * The default mainnet node
 *
 * @type {string}
 */
let defaultMainnetNode = 'http://alice6.nem.ninja:7778';

/**
 * The default mijin node
 *
 * @type {string}
 */
let defaultMijinNode = '';

/**
 * The default mainnet block explorer
 *
 * @type {string}
 */
let defaultMainnetExplorer = 'http://chain.nem.ninja/#/transfer/';

/**
 * The default testnet block explorer
 *
 * @type {string}
 */
let defaultTestnetExplorer = 'http://bob.nem.ninja:8765/#/transfer/';

/**
 * The default mijin block explorer
 *
 * @type {string}
 */
let defaultMijinExplorer = '';

/**
 * The nodes allowing search by transaction hash on testnet
 *
 * @type {array}
 */
let testnetSearchNodes = [
	{
	    'uri': 'http://bigalice2.nem.ninja:7890',
	    'location': 'America / New_York'
	},
	{
	    'uri': 'http://192.3.61.243:7890',
	    'location': 'America / Los_Angeles'
	},
	{
	    'uri': 'http://23.228.67.85:7890',
	    'location': 'America / Los_Angeles'
	}
];

/**
 * The nodes allowing search by transaction hash on mainnet
 *
 * @type {array}
 */
let mainnetSearchNodes = [
	{
	    'uri': 'http://62.75.171.41:7890',
	    'location': 'Germany'
	}, {
	    'uri': 'http://104.251.212.131:7890',
	    'location': 'USA'
	}, {
	    'uri': 'http://45.124.65.125:7890',
	    'location': 'Hong Kong'
	}, {
	    'uri': 'http://185.53.131.101:7890',
	    'location': 'Netherlands'
	}, {
	    'uri': 'http://sz.nemchina.com:7890',
	    'location': 'China'
	}
];

/**
 * The nodes allowing search by transaction hash on mijin
 *
 * @type {array}
 */
let mijinSearchNodes = [
	{
	    'uri': '',
	    'location': ''
	}
];

/**
 * The testnet nodes
 *
 * @type {array}
 */
let testnetNodes = [
	{
	    uri: 'http://bob.nem.ninja:7778'
	}, {
	        uri: 'http://104.128.226.60:7778'
	}, {
	        uri: 'http://23.228.67.85:7778'
	}, {
	        uri: 'http://192.3.61.243:7778'
	}, {
	        uri: 'http://50.3.87.123:7778'
	}, {
	    uri: 'http://localhost:7778'
	}
];

/**
 * The mainnet nodes
 *
 * @type {array}
 */
let mainnetNodes = [
    {
        uri: 'http://62.75.171.41:7778'
    }, {
        uri: 'http://san.nem.ninja:7778'
    }, {
        uri: 'http://go.nem.ninja:7778'
    }, {
        uri: 'http://hachi.nem.ninja:7778'
    }, {
        uri: 'http://jusan.nem.ninja:7778'
    }, {
        uri: 'http://nijuichi.nem.ninja:7778'
    }, {
        uri: 'http://alice2.nem.ninja:7778'
    }, {
        uri: 'http://alice3.nem.ninja:7778'
    }, {
        uri: 'http://alice4.nem.ninja:7778'
    }, {
        uri: 'http://alice5.nem.ninja:7778'
    }, {
        uri: 'http://alice6.nem.ninja:7778'
    }, {
        uri: 'http://alice7.nem.ninja:7778'
    }, {
        uri: 'http://localhost:7778'
    }
];

/**
 * The mijin nodes
 *
 * @type {array}
 */
let mijinNodes = [
	{
	    uri: ''
	}
];

/**
 * The server verifying signed apostilles
 *
 * @type {string}
 */
let apostilleAuditServer = 'http://185.117.22.58:4567/verify';

module.exports = {
    defaultTestnetNode,
    defaultMainnetNode,
    defaultMijinNode,
    defaultMainnetExplorer,
    defaultTestnetExplorer,
    defaultMijinExplorer,
    testnetSearchNodes,
    mainnetSearchNodes,
    mijinSearchNodes,
    testnetNodes,
    mainnetNodes,
    mijinNodes,
    apostilleAuditServer
}