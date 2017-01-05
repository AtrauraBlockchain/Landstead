import convert from '../utils/convert';
import Address from '../utils/Address';
import Network from '../utils/Network';
import helpers from '../utils/helpers';

/**
* fmtPubToAddress() Convert a public key to NEM address
*
* @param input: The account public key
* @param networkId: The current network id
*
* @return a clean NEM address
*/
let fmtPubToAddress = function() {
    return function fmtPubToAddress(input, networkId) {
        return input && Address.toAddress(input, networkId);
    };
}

/**
* fmtAddress() Add hyphens to a clean address
*
* @param input: A NEM address
*
* @return a formatted NEM address
*/
let fmtAddress = function() {
    return function fmtAddress(input) {
        return input && input.toUpperCase().replace(/-/g, '').match(/.{1,6}/g).join('-');
    };
}

/**
* fmtNemDate() Format a timestamp to NEM date
*
* @param data: A timestamp
*
* @return a date string
*/
let fmtNemDate = function() {
    let nemesis = Date.UTC(2015, 2, 29, 0, 6, 25);
    return function fmtNemDate(data) {
        if (data === undefined) return data;
        let o = data;
        let t = (new Date(nemesis + o * 1000));
        return t.toUTCString();
    };
}

let fmtSupply = function() {
    return function fmtSupply(data, mosaicId, mosaics) {
        if (data === undefined) return data;
        let mosaicName = helpers.mosaicIdToName(mosaicId);
        if (!(mosaicName in mosaics)) {
            return ['unknown mosaic divisibility', data];
        }
        let mosaicDefinitionMetaDataPair = mosaics[mosaicName];
        let divisibilityProperties = $.grep(mosaicDefinitionMetaDataPair.mosaicDefinition.properties, function(w) {
            return w.name === "divisibility";
        });
        let divisibility = divisibilityProperties.length === 1 ? ~~(divisibilityProperties[0].value) : 0;
        let o = parseInt(data, 10);
        if (!o) {
            if (divisibility === 0) {
                return ["0", ''];
            } else {
                return ["0", o.toFixed(divisibility).split('.')[1]];
            }
        }
        o = o / Math.pow(10, divisibility);
        let b = o.toFixed(divisibility).split('.');
        let r = b[0].split(/(?=(?:...)*$)/).join(" ");
        return [r, b[1] || ""];
    };
}

let fmtSupplyRaw = function() {
    return function fmtSupplyRaw(data, _divisibility) {
        let divisibility = ~~_divisibility;
        let o = parseInt(data, 10);
        if (!o) {
            if (divisibility === 0) {
                return ["0", ''];
            } else {
                return ["0", o.toFixed(divisibility).split('.')[1]];
            }
        }
        o = o / Math.pow(10, divisibility);
        let b = o.toFixed(divisibility).split('.');
        let r = b[0].split(/(?=(?:...)*$)/).join(" ");
        return [r, b[1] || ""];
    };
}

let fmtLevyFee = ['fmtSupplyFilter', function(fmtSupplyFilter) {
    return function fmtLevyFee(mosaic, multiplier, levy, mosaics) {
        if (mosaic === undefined || mosaics === undefined) return mosaic;
        if (levy === undefined || levy.type === undefined) return undefined;
        let levyValue;
        if (levy.type === 1) {
            levyValue = levy.fee;
        } else {
            // Note, multiplier is in micro NEM
            levyValue = (multiplier / 1000000) * mosaic.quantity * levy.fee / 10000;
        }
        let r = fmtSupplyFilter(levyValue, levy.mosaicId, mosaics);
        return r[0] + "." + r[1];
    }
}];

/**
* fmtNemImportanceScore() Format a NEM importance score
*
* @param data: The importance score
*
* @return a formatted importance score at 10^-5
*/
let fmtNemImportanceScore = function() {
    return function fmtNemImportanceScore(data) {
        if (data === undefined) return data;
        let o = data;
        if (o) {
            o *= 10000;
            o = o.toFixed(4).split('.');
            return [o[0], o[1]];
        }
        return [o, 0];
    };
}

/**
* fmtNemValue() Format a value to NEM value
*
* @return array with values before and after decimal point
*/
let fmtNemValue = function() {
    return function fmtNemValue(data) {
        if (data === undefined) return data;
        let o = data;
        if (!o) {
            return ["0", '000000'];
        } else {
            o = o / 1000000;
            let b = o.toFixed(6).split('.');
            let r = b[0].split(/(?=(?:...)*$)/).join(" ");
            return [r, b[1]];
        }
    };
}

/**
* fmtImportanceTransferMode() Give name of an importance transfer mode
*
* @return an importance transfer mode name
*/
let fmtImportanceTransferMode = function() {
    return function fmtImportanceTransferMode(data) {
        if (data === undefined) return data;
        let o = data;
        if (o === 1) return "Activation";
        else if (o === 2) return "Deactivation";
        else return "Unknown";
    };
}

/**
* fmtHexToUtf8() Convert hex to utf8
*
* @param data: Hex data
*
* @return result: utf8 string
*/
let fmtHexToUtf8 = function() {
    return function fmtHexToUtf8(data) {
        if (data === undefined) return data;
        let o = data;
        if (o && o.length > 2 && o[0] === 'f' && o[1] === 'e') {
            return "HEX: " + o.slice(2);
        }
        let result;
        try {
            result = decodeURIComponent(escape(convert.hex2a(o)))
        } catch (e) {
            //result = "Error, message not properly encoded !";
            result = convert.hex2a(o);
            console.log('invalid text input: ' + data);
        }
        //console.log(decodeURIComponent(escape( convert.hex2a(o) )));*/
        //result = convert.hex2a(o);
        return result;
    };
}

let fmtHexMessage = ['fmtHexToUtf8Filter', function(fmtHexToUtf8Filter) {
    return function fmtHexMessage(data) {
        if (data === undefined) return data;
        if (data.type === 1) {
            return fmtHexToUtf8Filter(data.payload);
        } else {
            return '';
        }
    };
}];

/**
* fmtSplitHex() Split hex string into 64 characters segments
*
* @param data: An hex string
*
* @return a segmented hex string
*/
let fmtSplitHex = function() {
    return function fmtSplitHex(data) {
        if (data === undefined) return data;
        let parts = data.match(/[\s\S]{1,64}/g) || [];
        let r = parts.join("\n");
        return r;
    };
}

/**
* startFrom() Build array of objects from object of objects
*
* @param data: An object of objects
*
* @return an array of objects
*/
let objValues = function() {
    return function objValues(data) {
        if (data === undefined) return data;
        return Object.keys(data).map(function(key) {
            return data[key];
        });
    };
}

/**
* startFrom() Helper for confirmed transactions pagination
*
* @param input: An array
* @param start: Index where to start showing the array
*
* @return the part of the array
*/
let startFrom = function() {
    return function(input, start) {
        if (!input || !input.length) {
            return;
        }
        start = +start; //parse to int
        return input.slice(start);
    }
}

/**
* startFromUnc() Helper for unconfirmed transactions pagination
*
* @param input: An array
* @param start: Index where to start showing the array
*
* @return the part of the array
*/
let startFromUnc = function() {
    return function(input, start) {
        let input2tab = [];
        for (let hash in input) {
            input2tab.push(input[hash]);
        }
        start = +start; //parse to int
        if (!input || !Object.keys(input).length) {
            return;
        }
        return input2tab.slice(start);
    }
}

/**
* reverse() Reverse order of an array
*
* @param items: An array
*
* @return the reversed array
*/
let reverse = function() {
    return function(items) {
        if (items === undefined) {
            return ;
        } else {
            return items.slice().reverse();
        }
    };
}

let htmlSafe = function($sce) {
    console.log($sce);
    return function(htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    };
}

/**
* toNetworkName() Get network name from id
*
* @param id: The network id
*
* @return the network name
*/
let toNetworkName = function() {
    return function(id) {
        if (id === Network.data.Testnet.id) {
            return 'Testnet';
        } else if (id === Network.data.Mainnet.id) {
            return 'Mainnet';
        } else {
            return 'Mijin';
        }
    }
}

/**
* toHostname() Parse url to get only ip or domain
*
* @param uri: The uri to parse
*
* @return uri hostname
*/
let toHostname = function() {
    return function(uri) {
        let _uriParser = document.createElement('a');
        _uriParser.href = uri;
        return _uriParser.hostname;
    }
}

/**
* currencyFormat() Set a value to common currency format
*
* @param number: The number to format
*
* @return number with following format: 0.00
*/
let currencyFormat = function() {
    return function(number) {
        if(undefined === number) {
            number = 0;
            return number.toFixed(2);
        }
        return parseFloat(number).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    }
}

/**
* btcFormat() Set a value to btc format
*
* @param number: The number to format
*
* @return number with following format: 0.00000000 
*/
let btcFormat = function() {
    return function(number) {
        if(undefined === number) {
            number = 0;
            return number.toFixed(8);
        }
        return number.toFixed(8);
    }
}

module.exports = {
    toNetworkName,
    htmlSafe,
    reverse,
    startFromUnc,
    startFrom,
    objValues,
    fmtSplitHex,
    fmtHexMessage,
    fmtHexToUtf8,
    fmtImportanceTransferMode,
    fmtNemValue,
    fmtNemImportanceScore,
    fmtLevyFee,
    fmtSupplyRaw,
    fmtSupply,
    fmtNemDate,
    fmtPubToAddress,
    fmtAddress,
    toHostname,
    currencyFormat,
    btcFormat
}