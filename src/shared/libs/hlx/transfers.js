import assign from 'lodash/assign';
import cloneDeep from 'lodash/cloneDeep';
import clone from 'lodash/clone';
import get from 'lodash/get';
import each from 'lodash/each';
import every from 'lodash/every';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import flatMap from 'lodash/flatMap';
import head from 'lodash/head';
import has from 'lodash/has';
import isObject from 'lodash/isObject';
import isNumber from 'lodash/isNumber';
import map from 'lodash/map';
import pick from 'lodash/pick';
import includes from 'lodash/includes';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';
import filter from 'lodash/filter';
import some from 'lodash/some';
import size from 'lodash/size';
import reduce from 'lodash/reduce';
import transform from 'lodash/transform';
import orderBy from 'lodash/orderBy';
import xor from 'lodash/xor';
import { isBundle as bundleValidator} from '@helixnetwork/bundle-validator';
import { asciiToHBytes } from '@helixnetwork/converter';
import {addChecksum, removeChecksum } from '@helixnetwork/checksum';
import { asTransactionObject ,asTransactionHBytes} from '@helixnetwork/transaction-converter';
import { isHash } from '@helixnetwork/validators';
import { DEFAULT_TAG, DEFAULT_MIN_WEIGHT_MAGNITUDE, BUNDLE_OUTPUTS_THRESHOLD } from '../../config';
// import { iota } from './index';
import { accumulateBalance } from './addresses';
import {
    getBalances,
    getTransactionsObjects,
    getLatestInclusion,
    findTransactionObjects,
    getTransactionsToApprove,
    attachToTangle,
    storeAndBroadcast,
    isPromotable,
    promoteTransaction,
    replayBundle,
} from './extendedApi';
import i18next from '../../libs/i18next.js';
import {
    convertFromBytes,
    EMPTY_HASH_BYTES,
    EMPTY_TRANSACTION_MESSAGE,
    TRANSACTION_BYTES_SIZE,
    VALID_ADDRESS_WITHOUT_CHECKSUM_REGEX,
} from './utils';
import Errors from './../errors';

/**
 * Gets total transfer value from a bundle
 *
 * @method getTransferValue
 * @param {array} inputs
 * @param {array} outputs
 * @param {array} addresses
 *
 * @returns {number}
 */
export const getTransferValue = (inputs, outputs, addresses) => {
    const remainderValue = get(
        find(outputs, (output) => output.currentIndex === output.lastIndex && output.lastIndex !== 0),
        'value',
    );

    const ownInputs = filter(inputs, (input) => includes(addresses, input.address));
    const inputsValue = reduce(inputs, (acc, input) => acc + Math.abs(input.value), 0);

    return size(ownInputs)
        ? inputsValue - remainderValue
        : reduce(
              filter(outputs, (output) => includes(addresses, output.address)),
              (acc, output) => acc + output.value,
              0,
          );
};

/**
 * Finds transaction message from a bundle.
 *
 * @method computeTransactionMessage
 * @param {array} bundle
 *
 * @returns {string}
 */
export const computeTransactionMessage = (bundle) => {
    let message = EMPTY_TRANSACTION_MESSAGE;

    each(bundle, (tx) => {
        message = convertFromBytes(tx.signatureMessageFragment);

        if (message !== EMPTY_TRANSACTION_MESSAGE) {
            return false;
        }
    });

    return message;
};

/**
 * Finds a promotable (consistent & above max depth) tail transaction
 *
 * @method findPromotableTail
 * @param {object} [settings]
 *
 * @returns {function(array, number): Promise<object|boolean>}
 */
export const findPromotableTail = (settings) => (tails, idx) => {
    let tailsAboveMaxDepth = [];

    if (idx === 0) {
        tailsAboveMaxDepth = filter(tails, (tx) => isAboveMaxDepth(tx.attachmentTimestamp)).sort(
            (a, b) => b.attachmentTimestamp - a.attachmentTimestamp,
        );
    }

    if (!tailsAboveMaxDepth[idx]) {
        return Promise.resolve(false);
    }

    const thisTail = tailsAboveMaxDepth[idx];

    return isPromotable(settings)(get(thisTail, 'hash'))
        .then((state) => {
            if (state === true && isAboveMaxDepth(get(thisTail, 'attachmentTimestamp'))) {
                return thisTail;
            }

            idx += 1;
            return findPromotableTail(settings)(tailsAboveMaxDepth, idx);
        })
        .catch(() => false);
};

/**
 * Check if attachment timestamp on transaction is above max depth (~11 minutes)
 *
 * @method isAboveMaxDepth
 * @param {number} attachmentTimestamp
 *
 * @returns {boolean}
 */
export const isAboveMaxDepth = (attachmentTimestamp) => {
    return attachmentTimestamp < Date.now() && Date.now() - attachmentTimestamp < 11 * 60 * 1000;
};

/**
 *   Returns a transfer array
 *   Converts message to hbytes. Basically preparing an array of transfer objects before making a transfer.
 *   Since zero value transfers have no inputs, after a sync with ledger, these transfers would not be detected.
 *   To make sure zero value transfers are detected after a sync, add a second transfer to the array that has
 *   seed's own address at index 0.
 *
 *   @method prepareTransferArray
 *   @param {string} address
 *   @param {number} [value]
 *   @param {string} [message]
 *   @param {object} addressData
 *   @param {string} [tag='HELIX']
 *
 *   @returns {array} Transfer object
 **/
export const prepareTransferArray = (address, value, message, addressData, tag = DEFAULT_TAG) => {
    const firstAddress = get(find(addressData, { index: 0 }), 'address');

    if (!firstAddress) {
        throw new Error(Errors.EMPTY_ADDRESS_DATA);
    }

    const hbytesConvertedMessage = asciiToHBytes(message);
    const transfer = {
        address,
        value,
        message: hbytesConvertedMessage,
        tag,
    };

    const isZeroValueTransaction = value === 0;

    if (isZeroValueTransaction) {
        return includes(map(addressData, (addressObject) => addressObject.address), removeChecksum(address))
            ? [transfer]
            : [transfer, assign({}, transfer, { address: firstAddress })];
    }

    return [transfer];
};

/**
 *   Categorise bundle by inputs and outputs.
 *
 *   @method categoriseBundleByInputsOutputs
 *   @param {array} bundle
 *   @param {array} addresses
 *   @param {number} outputsThreshold
 *
 *   @returns {object}
 **/
export const categoriseBundleByInputsOutputs = (bundle, addresses, outputsThreshold = BUNDLE_OUTPUTS_THRESHOLD) => {
    const isRemainder = (tx) => tx.currentIndex === tx.lastIndex && tx.lastIndex !== 0;

    const categorisedBundle = transform(
        bundle,
        (acc, tx) => {
            const meta = {
                ...pick(tx, ['address', 'value', 'hash', 'currentIndex', 'lastIndex']),
                checksum: addChecksum(tx.address).slice(tx.address.length),
            };

            if (tx.value < 0) {
                acc.inputs.push(meta);
            } else {
                acc.outputs.push(meta);
            }
        },
        {
            inputs: [],
            outputs: [],
        },
    );

    // Note: Ideally we should categorise all outputs
    // But some bundles esp carriota field donation bundles are huge
    // and on devices with restricted storage storing them can cause the problem.

    // Now this does not mean that large bundles should not be validated.
    // Categorisation should always happen after the bundle is construction and validated.

    // This step can lead to an inconsistent behavior if addresses aren't properly synced
    // That is why as a safety check remainder transaction objects would always be considered as outputs

    // TODO: But to make this process more secure, always sync addresses during poll
    return size(categorisedBundle.outputs) <= outputsThreshold
        ? {
              inputs: categorisedBundle.inputs,
              outputs: categorisedBundle.outputs,
          }
        : {
              inputs: categorisedBundle.inputs,
              outputs: filter(
                  categorisedBundle.outputs,
                  (output) => includes(addresses, output.address) || isRemainder(output),
              ),
          };
};

/**
 *   Checks if the bundle is outgoing
 *
 *   @method isSentTransfer
 *   @param {array} bundle
 *   @param {array} addresses
 *   @returns {boolean}
 **/
export const isSentTransfer = (bundle, addresses) => {
    const categorisedBundle = categoriseBundleByInputsOutputs(bundle, addresses);
    const value = getTransferValue(categorisedBundle.inputs, categorisedBundle.outputs, addresses);

    if (value === 0) {
        return (
            !includes(addresses, get(categorisedBundle.outputs, '[0].address')) &&
            includes(addresses, get(categorisedBundle.outputs, '[1].address'))
        );
    }
    return some(bundle, (tx) => {
        const isRemainder = tx.currentIndex === tx.lastIndex && tx.lastIndex !== 0;
        return includes(addresses, tx.address) && tx.value < 0 && !isRemainder;
    });
};

/**
 *   Checks if the bundle is incoming
 *
 *   @method isReceivedTransfer
 *   @param {array} bundle
 *   @param {array} addresses
 *   @returns {boolean}
 **/
export const isReceivedTransfer = (bundle, addresses) => !isSentTransfer(bundle, addresses);

/**
 *   Accepts tail transaction object and all transaction objects from bundle hashes
 *   Then construct a bundle by following trunk transaction from tail transaction object.
 *
 *   @method constructBundle
 *   @param {object} tailTransaction
 *   @param {array} allTransactionObjects
 *
 *   @returns {array}
 **/
export const constructBundle = (tailTransaction, allTransactionObjects) => {
    // Start from the tail transaction object
    // This will also preserve the order since the next objects will be pushed
    const bundle = [tailTransaction];

    // In case tail transaction is only transfer in the bundle
    // Just return the tail transaction as a bundle
    if (tailTransaction.currentIndex === tailTransaction.lastIndex) {
        return bundle;
    }

    let hasFoundLastTransfer = false;

    // Start off from by searching for trunk transaction of tail transaction object,
    // Which is hash of the next transfer i.e. transfer with current index 1
    let nextTrunkTransaction = tailTransaction.trunkTransaction;

    // Finds the next transfer which would basically be that transfer that has hash === nextTrunkTransaction
    const nextTransfer = () => find(allTransactionObjects, { hash: nextTrunkTransaction });

    while (
        // Safety check to see if the next transfer exists
        nextTransfer() &&
        // Next check if bundle hash for tail transaction matches the next found transfer
        nextTransfer().bundle === tailTransaction.bundle &&
        // Make sure it hasn't already found the last transfer in the bundle
        !hasFoundLastTransfer
    ) {
        const transfer = nextTransfer();
        const isLastTransferInBundle = transfer.currentIndex === transfer.lastIndex;

        // Assign trunk transaction of this transaction as the next trunk transaction to be searched for,
        // Next trunk transaction should always be the hash of currentIndex + 1 except for the case in remainder objects (currentIndex === lastIndex)
        nextTrunkTransaction = transfer.trunkTransaction;

        bundle.push(transfer);

        if (isLastTransferInBundle) {
            hasFoundLastTransfer = true;
        }
    }

    return bundle;
};

/**
 *   Construct bundles, validates, assign confirmation states and Normalises them.
 *
 *   @method constructBundlesFromTransactions
 *   @param {array} transactions
 *
 *   @returns {array}
 **/
export const constructBundlesFromTransactions = (transactions) => {
    if (isEmpty(transactions)) {
        return [];
    }
    if (!isArray(transactions)) {
        throw new Error(Errors.INVALID_TRANSACTIONS_PROVIDED);
    }

    const { broadcastedTailTransactions, failedTailTransactions } = transform(
        transactions,
        (acc, transaction) => {
            if (transaction.currentIndex === 0) {
                if (transaction.broadcasted === true) {
                    acc.broadcastedTailTransactions.push(transaction);
                } else {
                    acc.failedTailTransactions.push(transaction);
                }
            }
        },
        { broadcastedTailTransactions: [], failedTailTransactions: [] },
    );

    return [
        ...map(broadcastedTailTransactions, (tailTransaction) => constructBundle(tailTransaction, transactions)),
        // Bundles for failed transactions cannot be properly constructed because trunk/branch hashes aren't properly set.
        // Manually construct bundles for failed transactions based on bundleHash.
        // Note: Failed bundles only have a single (local) instance.
        ...map(failedTailTransactions, (failedTailTransaction) =>
            filter(transactions, (transaction) => transaction.bundle === failedTailTransaction.bundle),
        ),
    ];
};

/**
 * Filter invalid bundles
 *
 * @method filterInvalidBundles
 * @param {array} bundles
 *
 * @returns {array}
 */
export const filterInvalidBundles = (bundles) => filter(bundles, isBundle);

/**
 *   Normalises bundle.
 *
 *   @method normaliseBundle
 *   @param {array} bundle
 *   @param {array} addressData
 *   @param {array} tailTransactions
 *   @param {boolean} persistence
 *
 *   @returns {object} - Normalised bundle
 **/
export const normaliseBundle = (bundle, addressData, tailTransactions, persistence) => {
    const addresses = map(addressData, (addressObject) => addressObject.address);
    const transaction = get(bundle, '[0]');
    const bundleHash = transaction.bundle;
    const { inputs, outputs } = categoriseBundleByInputsOutputs(bundle, addresses);

    return {
        ...pick(transaction, ['bundle', 'timestamp', 'attachmentTimestamp', 'broadcasted']),
        inputs,
        outputs,
        persistence,
        incoming: isReceivedTransfer(bundle, addresses),
        transferValue: getTransferValue(inputs, outputs, addresses),
        message: computeTransactionMessage(bundle),
        tailTransactions: map(filter(tailTransactions, (tx) => tx.bundle === bundleHash), (tx) => ({
            hash: tx.hash,
            attachmentTimestamp: tx.attachmentTimestamp,
        })),
    };
};

/**
 *   Get transaction objects associated with hashes, assign persistence by calling inclusion states
 *   Resolves transfers.
 *
 *   @method syncTransactions
 *   @param {object} [settings]
 *
 *   @returns {function(array, array): Promise<object>}
 **/
export const syncTransactions = (settings) => (diff, existingTransactions) => {
    const pullNewTransactions = (diff) => {
        const bundleHashes = new Set();

        return getTransactionsObjects(settings)(diff)
            .then((transactionObjects) => {
                each(transactionObjects, (transactionObject) => {
                    if (transactionObject.bundle !== EMPTY_HASH_BYTES) {
                        bundleHashes.add(transactionObject.bundle);
                    }
                });

                // Find all transaction objects for bundle hashes
                return findTransactionObjects(settings)({ bundles: Array.from(bundleHashes) });
            })
            .then((transactionObjects) => {
                const existingTransactionHashes = map(existingTransactions, (transaction) => transaction.hash);

                // In the previous step, we pulled all transactions against the bundle hash
                // Querying by bundle hash retrieves all transactions including reattachments
                // It is possible that we have already retrieved and validated some of these reattachments
                // Therefore, there is no need to reconstruct bundles for the transactions that are already stored locally
                // Bundle validation is expensive and could lead to performance issues
                const newTransactions = filter(
                    transactionObjects,
                    (transaction) => !includes(existingTransactionHashes, transaction.hash),
                );

                // Construct bundles only for newer (not yet seen/stored) transactions
                const bundles = constructBundlesFromTransactions(
                    map(newTransactions, (transaction) => ({
                        ...transaction,
                        // Assign broadcasted as true as all these transactions were pulled in from the ledger
                        broadcasted: true,
                        // Temporarily assign persistence false
                        // In the next step, communicate with the ledger to get correct inclusion state (persistence) and assign those
                        persistence: false,
                        fatalErrorOnRetry: false,
                    })),
                );

                const transactions = flatMap(
                    // Get rid of invalid bundles
                    filterInvalidBundles(bundles),
                );

                return transactions;
            });
    };

    return (size(diff) ? pullNewTransactions(diff) : Promise.resolve([])).then((newTransactions) => {
        const transactions = [...existingTransactions, ...newTransactions];

        const { confirmed, unconfirmed } = transform(
            constructBundlesFromTransactions(transactions),
            (acc, bundle) => {
                if (some(bundle, (transaction) => transaction.persistence === true)) {
                    acc.confirmed.push(bundle);
                } else {
                    acc.unconfirmed.push(bundle);
                }
            },
            { confirmed: [], unconfirmed: [] },
        );

        if (isEmpty(unconfirmed)) {
            return [...flatMap(confirmed), ...flatMap(unconfirmed)];
        }

        return assignInclusionStatesToBundles(settings)(unconfirmed).then((bundles) => [
            ...flatMap(confirmed),
            ...flatMap(bundles),
        ]);
    });
};

/**
 *  Finds difference between seed transaction hashes with new transaction hashes.
 *
 *  @method getTransactionsDiff
 *  @param {array} existingHashes
 *  @param {array} newHashes
 *
 *  @returns {array}
 **/
export const getTransactionsDiff = (existingHashes, newHashes) => {
    return xor(existingHashes, newHashes);
};

/**
 *   Performs proof of work and updates hbytes and transaction objects with nonce.
 *
 *   @method performPow
 *
 *   @param {function} powFn
 *   @param {function} digestFn
 *   @param {array} hbytes
 *   @param {string} trunkTransaction
 *   @param {string} branchTransaction
 *   @param {number} [minWeightMagnitude = 14]
 *   @param {boolean} [batchedPow]
 *
 *   @returns {Promise}
 **/
export const performPow = (
    powFn,
    digestFn,
    hbytes,
    trunkTransaction,
    branchTransaction,
    minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
    batchedPow = true,
) => {
    if (!isFunction(powFn)) {
        return Promise.reject(new Error(Errors.POW_FUNCTION_UNDEFINED));
    }

    if (!isFunction(digestFn)) {
        return Promise.reject(new Error(Errors.DIGEST_FUNCTION_UNDEFINED));
    }

    return batchedPow
        ? powFn(hbytes, trunkTransaction, branchTransaction, minWeightMagnitude)
        : performSequentialPow(powFn, digestFn, hbytes, branchTransaction, trunkTransaction, minWeightMagnitude);
};

/**
 *
 * Performs sequential proof of work (Can be run in parallel with getTransactionsToApprove).
 * See: https://github.com/iotaledger/trinity-wallet/issues/205
 *
 * @method performSequentialPow
 *
 * @param {function} powFn
 * @param {function} digestFn
 * @param {array} hbytes
 * @param {string} trunkTransaction
 * @param {string} branchTransaction
 * @param {number} minWeightMagnitude
 *
 * @returns {Promise}
 */
export const performSequentialPow = (
    powFn,
    digestFn,
    hbytes,
    trunkTransaction,
    branchTransaction,
    minWeightMagnitude,
) => {
    const transactionObjects = map(hbytes, (transactionHBytes) =>
        assign({}, asTransactionObject(transactionHBytes), {
            attachmentTimestamp: Date.now(),
            attachmentTimestampLowerBound: 0,
            attachmentTimestampUpperBound: (Math.pow(3, 27) - 1) / 2,
        }),
    );

    // Order transaction objects in descending to make sure it starts from remainder object.
    const sortedTransactionObjects = orderBy(transactionObjects, 'currentIndex', ['desc']);

    return reduce(
        sortedTransactionObjects,
        (promise, transaction, index) => {
            return promise.then((result) => {
                // Assign parent transactions (trunk and branch)
                // Starting from the remainder transaction object (index = 0 in sortedTransactionObjects)
                // - When index === 0 i.e. remainder transaction object
                //    * Assign trunkTransaction with provided trunk transaction from (getTransactionsToApprove)
                //    * Assign branchTransaction with provided branch transaction from (getTransactionsToApprove)
                // - When index > 0 i.e. not remainder transaction objects
                //    * Assign trunkTransaction with hash of previous transaction object
                //    * Assign branchTransaction with provided trunk transaction from (getTransactionsToApprove)
                const withParentTransactions = assign({}, transaction, {
                    trunkTransaction: index ? head(result.transactionObjects).hash : trunkTransaction,
                    branchTransaction: index ? trunkTransaction : branchTransaction,
                });

                const transactionHByteString = asTransactionHBytes(withParentTransactions);

                return powFn(transactionHByteString, minWeightMagnitude)
                    .then((nonce) => {
                        // TODO recheck
                        const hbytesWithNonce = transactionHByteString.substr(0, TRANSACTION_BYTES_SIZE - nonce.length).concat(nonce);

                        result.hbytes.unshift(hbytesWithNonce);

                        return digestFn(hbytesWithNonce).then((digest) =>
                            asTransactionObject(hbytesWithNonce, digest),
                        );
                    })
                    .then((transactionObject) => {
                        result.transactionObjects.unshift(transactionObject);

                        return result;
                    });
            });
        },
        Promise.resolve({ hbytes: [], transactionObjects: [] }),
    );
};

/**
 * Retry failed transaction with signed inputs
 *
 * @method retryFailedTransaction
 *
 * @param {object} [settings]
 *
 * @returns {function(array, object): Promise<object>}
 **/
export const retryFailedTransaction = (settings) => (transactionObjects, seedStore) => {
    const convertToHBytes = (tx) => asTransactionHBytes(tx);

    const cached = {
        transactionObjects: cloneDeep(transactionObjects),
        hbytes: map(transactionObjects, convertToHBytes),
    };

    const isInvalidTransactionHash = ({ hash }) =>
        hash === EMPTY_HASH_BYTES || !isHash(hash);
        // TODO recheck
        // iota.utils.isTransactionHash(hash, DEFAULT_MIN_WEIGHT_MAGNITUDE);

    // Verify if all transaction objects have valid hash
    // Proof of work was not performed correctly if any transaction has invalid hash
    if (some(transactionObjects, isInvalidTransactionHash)) {
        // If proof of work failed, select new tips and retry
        return getTransactionsToApprove(settings)()
            .then(({ trunkTransaction, branchTransaction }) => {
                return attachToTangle(settings, seedStore)(trunkTransaction, branchTransaction, cached.hbytes);
            })
            .then(({ hbytes, transactionObjects }) => {
                cached.hbytes = hbytes;
                cached.transactionObjects = transactionObjects;

                return storeAndBroadcast(settings)(cached.hbytes).then(() => cached);
            });
    }

    return storeAndBroadcast(settings)(cached.hbytes).then(() => cached);
};

/**
 *  Returns string for current transaction's status
 *
 *   @method computeStatusText
 *
 *   @param {array} outputs
 *   @param {boolean} persistence
 *   @param {boolean} incoming
 *   @return {string} Status text
 */

export const computeStatusText = (outputs, persistence, incoming) => {
    const receiveStatus = persistence ? i18next.t('global:received') : i18next.t('global:receiving');
    const sendStatus = persistence ? i18next.t('global:sent') : i18next.t('global:sending');
    return incoming ? receiveStatus : sendStatus;
};

/**
 * Formats transaction list to accommodate for sending to self
 * @param {Array} transactions
 * @return {Array} Formatted transaction list
 */
export const formatRelevantTransactions = (transactions, addresses) => {
    const relevantTransactions = [];
    map(transactions, (transaction) => {
        if (!transaction.incoming && transaction.outputs.every((tx) => addresses.includes(tx.address))) {
            const sendToSelfTransaction = clone(transaction);
            sendToSelfTransaction.incoming = true;
            relevantTransactions.push(sendToSelfTransaction);
            relevantTransactions.push(transaction);
        } else {
            relevantTransactions.push(transaction);
        }
    });
    return relevantTransactions;
};

/**
 * Formats recent transactions to accommodate for sending to self
 *
 * @method formatRelevantRecentTransactions
 * @param {array} transactions
 * @param {array} addresses
 *
 * @return {array} Formatted recent transactions
 */
export const formatRelevantRecentTransactions = (transactions, addresses) => {
    const relevantTransactions = [];
    map(transactions, (transaction) => {
        if (relevantTransactions.length < 4) {
            if (!transaction.incoming && transaction.outputs.every((tx) => addresses.includes(tx.address))) {
                const sendToSelfTransaction = clone(transaction);
                sendToSelfTransaction.incoming = true;
                relevantTransactions.push(sendToSelfTransaction);
                if (relevantTransactions.length < 4) {
                    relevantTransactions.push(transaction);
                }
            } else {
                relevantTransactions.push(transaction);
            }
        }
    });
    return relevantTransactions;
};

/**
 * Sort transaction hbytes array
 *
 * @method sortTransactionHBytesArray
 * @param {array} hbytes
 * @param {string} [sortBy]
 * @param {string} [order]
 *
 */
export const sortTransactionHBytesArray = (hbytes, sortBy = 'currentIndex', order = 'desc') => {
    const sortableTransactionKeys = ['currentIndex', 'lastIndex', 'timestamp', 'attachmentTimestamp'];

    if (!includes(sortableTransactionKeys, sortBy) || !includes(['desc', 'asc'], order)) {
        return hbytes;
    }

    const transactionObjects = map(hbytes, (hbyteString) =>
        asTransactionObject(
            hbyteString,
            // Pass in null hash hbytes to avoid computing transaction hash.
            EMPTY_HASH_BYTES,
        ),
    );

    return map(orderBy(transactionObjects, [sortBy], [order]), asTransactionHBytes);
};

/**
 *   Checks if a transfer object is valid
 *
 *   @method isValidTransfer
 *   @param {object} transfer
 *
 *   @returns {boolean}
 **/
export const isValidTransfer = (transfer) => {
    return (
        isObject(transfer) && VALID_ADDRESS_WITHOUT_CHECKSUM_REGEX.test(transfer.address) && isNumber(transfer.value)
    );
};

/**
 * Checks if a bundle is funded
 * Note: Does not validate signatures or other bundle attributes
 *
 * @method isFundedBundle
 *
 * @param {object} {settings}
 * @param {boolean} withQuorum
 *
 *
 * @returns {function(array): Promise<boolean>}
 **/

export const isFundedBundle = (settings, withQuorum) => (bundle) => {
    if (isEmpty(bundle)) {
        return Promise.reject(new Error(Errors.EMPTY_BUNDLE_PROVIDED));
    }

    return getBalances(settings, withQuorum)(
        reduce(bundle, (acc, tx) => (tx.value < 0 ? [...acc, tx.address] : acc), []),
    ).then((balances) => {
        return (
            reduce(bundle, (acc, tx) => (tx.value < 0 ? acc + Math.abs(tx.value) : acc), 0) <=
            accumulateBalance(map(balances.balances, Number))
        );
    });
};

/**
 * Filters zero value bundles
 *
 * @method filterZeroValueBundles
 * @param {array} bundles
 */
export const filterZeroValueBundles = (bundles) => {
    return filter(bundles, (bundle) => some(bundle, (transaction) => transaction.value < 0));
};

/**
 * Filters non-funded bundles
 * Note: Does not validate signatures or other bundle attributes
 *
 * @method filterNonFundedBundles
 *
 * @param {object} [settings]
 * @param {boolean} withQuorum
 *
 * @returns {function(array): Promise<boolean>}
 **/
export const filterNonFundedBundles = (settings, withQuorum) => (bundles) => {
    if (isEmpty(bundles)) {
        return Promise.reject(new Error(Errors.EMPTY_BUNDLES_PROVIDED));
    }

    return reduce(
        // Only check funds for value transactions
        filterZeroValueBundles(bundles),
        (promise, bundle) => {
            return promise.then((result) => {
                return isFundedBundle(settings, withQuorum)(bundle).then((isFunded) => {
                    if (isFunded) {
                        return [...result, bundle];
                    }

                    return result;
                });
            });
        },
        Promise.resolve([]),
    );
};

/**
 * Categorises inclusion states by bundle hash of tail transactions
 * Note: Make sure the order of tail transactions -> inclusion states is preserved before using this function
 *
 * @method categoriseInclusionStatesByBundleHash
 * @param {array} tailTransactions
 * @param {array} inclusionStates
 *
 * @returns {object}
 */
export const categoriseInclusionStatesByBundleHash = (tailTransactions, inclusionStates) => {
    if (size(tailTransactions) !== size(inclusionStates)) {
        throw new Error(Errors.INCLUSION_STATES_SIZE_MISMATCH);
    }

    return transform(
        tailTransactions,
        (acc, tailTransaction, idx) => {
            if (tailTransaction.bundle in acc) {
                acc[tailTransaction.bundle] = acc[tailTransaction.bundle] || inclusionStates[idx];
            } else {
                acc[tailTransaction.bundle] = inclusionStates[idx];
            }
        },
        {},
    );
};

/**
 * Promotes a transaction till it gets confirmed.
 *
 * @method promoteTransactionTilConfirmed
 *
 * @param {object} [settings]
 * @param {function} [powFn]
 *
 * @returns {function(array, [number]): Promise<object>}
 */
export const promoteTransactionTilConfirmed = (settings, seedStore) => (
    tailTransactions,
    promotionsAttemptsLimit = 50,
) => {
    let promotionAttempt = 0;
    const tailTransactionsClone = cloneDeep(tailTransactions);

    const _promote = (tailTransaction) => {
        promotionAttempt += 1;

        if (promotionAttempt === promotionsAttemptsLimit) {
            return Promise.reject(new Error(Errors.PROMOTIONS_LIMIT_REACHED));
        }

        // Before every promotion, check confirmation state
        return getLatestInclusion(settings)(map(tailTransactionsClone, (tx) => tx.hash)).then((states) => {
            if (some(states, (state) => state === true)) {
                // If any of the tail is confirmed, return the "confirmed" tail transaction object.
                return find(tailTransactionsClone, (_, idx) => idx === findIndex(states, (state) => state === true));
            }

            const { hash, attachmentTimestamp } = tailTransaction;

            // Promote transaction
            return promoteTransaction(settings, seedStore)(hash)
                .then(() => {
                    return _promote(tailTransaction);
                })
                .catch((error) => {
                    const isTransactionInconsistent = includes(error.message, Errors.TRANSACTION_IS_INCONSISTENT);

                    if (isTransactionInconsistent) {
                        // Temporarily disable reattachments if transaction is still above max depth
                        return !isAboveMaxDepth(attachmentTimestamp)
                            ? _reattachAndPromote()
                            : _promote(tailTransaction);
                    }

                    throw error;
                });
        });
    };

    const _reattachAndPromote = () => {
        // Grab first tail transaction hash
        const tailTransaction = head(tailTransactionsClone);
        const hash = tailTransaction.hash;

        return replayBundle(settings, seedStore)(hash).then((reattachment) => {
            const tailTransaction = find(reattachment, { currentIndex: 0 });
            // Add newly reattached transaction
            tailTransactionsClone.push(tailTransaction);

            return _promote(tailTransaction);
        });
    };

    return findPromotableTail(settings)(tailTransactionsClone, 0).then((consistentTail) => {
        if (has(consistentTail, 'hash')) {
            return _promote(consistentTail);
        }

        return _reattachAndPromote();
    });
};

/**
 * Assigns latest inclusion states to bundles.
 *
 * @method assignInclusionStatesToBundles
 *
 * @param {object} [settings]
 * @returns {array}
 */
export const assignInclusionStatesToBundles = (settings) => (bundles) => {
    if (!isArray(bundles)) {
        return Promise.reject(new Error(Errors.INVALID_BUNDLES_PROVIDED));
    }

    if (isEmpty(bundles)) {
        return Promise.resolve([]);
    }

    const tailTransactions = map(bundles, (bundle) => find(bundle, { currentIndex: 0 }));
    const tailTransactionsHashes = map(tailTransactions, (transaction) => transaction.hash);

    return getLatestInclusion(settings)(tailTransactionsHashes).then((states) => {
        return map(tailTransactions, (tailTransaction, idx) => {
            const bundleForThisTailTransaction = find(bundles, (bundle) =>
                some(bundle, (transaction) => transaction.hash === tailTransaction.hash),
            );

            return map(bundleForThisTailTransaction, (transaction) =>
                assign({}, transaction, { persistence: states[idx] }),
            );
        });
    });
};

/**
 * Normalises transactions (array of transaction objects).
 * @method mapNormalisedTransactions
 *
 * @param {array} transactions
 * @param {array} addressData
 * @returns {object}
 */
export const mapNormalisedTransactions = (transactions, addressData) => {
    const tailTransactions = filter(transactions, (tx) => tx.currentIndex === 0);

    const bundles = constructBundlesFromTransactions(transactions);

    return transform(
        bundles,
        (acc, bundle) => {
            const bundleHead = head(bundle);
            const bundleHash = bundleHead.bundle;

            // If we have already normalised bundle, then this is a reattached bundle
            // The only thing we are interested in is persistence of the bundle
            // Either the original transaction or a reattachment can be confirmed.
            if (bundleHash in acc) {
                acc[bundleHash].persistence = acc[bundleHash].persistence || bundleHead.persistence;
            } else {
                acc[bundleHash] = normaliseBundle(bundle, addressData, tailTransactions, bundleHead.persistence);
            }
        },
        {},
    );
};

/**
 * Computes and assign transaction hash to transactions from attached hbytes (Forms a bundle).
 *
 * @method constructBundleFromAttachedBytes
 *
 * @param {array} attachedHBytes
 * @param {object} seedStore
 *
 * @returns {Promise<array>}
 */
export const constructBundleFromAttachedBytes = (attachedHBytes, seedStore) => {
    return reduce(
        attachedHBytes,
        (promise, hbyteString) => {
            return promise.then((result) => {
                return seedStore.getDigest(hbyteString).then((digest) => {
                    const transactionObject = asTransactionObject(hbyteString, digest);

                    result.unshift(transactionObject);

                    return result;
                });
            });
        },
        Promise.resolve([]),
    );
};

/**
 * Checks if bundle can be traversed
 *
 * @method isBundleTraversable
 *
 * @param {array} bundle
 * @param {string} trunkTransaction
 * @param {string} branchTransaction
 *
 * @returns {boolean}
 */
export const isBundleTraversable = (bundle, trunkTransaction, branchTransaction) =>
    !isEmpty(bundle) &&
    every(orderBy(bundle, ['currentIndex'], ['desc']), (transaction, index, transactions) =>
        index
            ? transaction.trunkTransaction === transactions[index - 1].hash &&
              transaction.branchTransaction === trunkTransaction
            : transaction.trunkTransaction === trunkTransaction && transaction.branchTransaction === branchTransaction,
    );

/**
 * Wraps iota.utils.isBundle (https://github.com/iotaledger/iota.js/blob/develop/lib/utils/utils.js#L421)
 * Ensures transaction objects in bundle are in correct (ascending) order
 *
 * @method isBundle
 *
 * @param {array} bundle
 *
 * @returns {boolean}
 */
export const isBundle = (bundle) => bundleValidator(orderBy(bundle, ['currentIndex'], ['asc']));

/**
 * Determines if a transaction error should be considere fatal
 *
 * @method isFatalTransactionError
 *
 * @param {object} err
 *
 * @returns {boolean}
 */
export const isFatalTransactionError = (err) => {
    const fatalTransferErrors = [
        Errors.BUNDLE_NO_LONGER_FUNDED,
        Errors.DETECTED_INPUT_WITH_ZERO_BALANCE,
        Errors.INVALID_TRANSFER,
        Errors.TRANSACTION_IS_INCONSISTENT,
        Errors.ALREADY_SPENT_FROM_ADDRESSES,
        Errors.INVALID_BUNDLE,
        Errors.BUNDLE_NO_LONGER_VALID,
        Errors.FUNDS_AT_SPENT_ADDRESSES,
        Errors.KEY_REUSE,
    ];
    return some(fatalTransferErrors, (error) => err.message && err.message.includes(error));
};
