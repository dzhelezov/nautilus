import React from "react";
import PropTypes from "prop-types";
import orderBy from "lodash/orderBy";
import map from "lodash/map";
import classNames from "classnames";
import { withI18n } from "react-i18next";
import { connect } from "react-redux";
import moment from "moment";
import { generateAlert } from "actions/alerts";
import { promoteTransaction, retryFailedTransaction } from "actions/transfers";
import { toggleEmptyTransactions } from "actions/settings";
import {
  getSelectedAccountName,
  getSelectedAccountMeta,
  getAccountNamesFromState,
  selectAccountInfo
} from "selectors/accounts";
import { getThemeFromState } from "selectors/global";
import { formatHlx, unitStringToValue } from "libs/hlx/utils";
import {
  formatTime,
  formatModalTime,
  convertUnixTimeToJSDate,
  detectedTimezone
} from "libs/date";
import SeedStore from "libs/seed";
import {
  mapNormalisedTransactions,
  formatRelevantTransactions
} from "libs/hlx/transfers";
import Clipboard from "ui/components/clipboard";
import Icon from "ui/components/icon";
import Scrollbar from "ui/components/scrollbar";
import Button from "ui/components/button";
import css from "./list.scss";
/**
 * Transaction history list component
 */

export class ListComponent extends React.PureComponent {
 
  static propTypes = {
    /** Wallet mode */
    mode: PropTypes.string.isRequired,
    /** Hide empty transactions flag */
    hideEmptyTransactions: PropTypes.bool.isRequired,
    /** Should update history */
    updateAccount: PropTypes.func,
    /** Toggle hide empty transactions */
    toggleEmptyTransactions: PropTypes.func.isRequired,

    accountInfo: PropTypes.object.isRequired,
    /** Promotes bundle
     * @param {string} bundle - bundle hash
     * @param {object} seedStore
     */
    promoteTransaction: PropTypes.func.isRequired,
    /** Retry failed bundle
     * @param {string} bundle - bundle hash
     * @param {object} seedStore
     */
    retryFailedTransaction: PropTypes.func.isRequired,
    /** Set active history item
     * @param {number} index - Current item index
     */
    setItem: PropTypes.func.isRequired,
    /** Current active history item */
    currentItem: PropTypes.string,
    /** Translation helper
     * @param {string} translationString - locale string identifier to be translated
     * @ignore
     */
    t: PropTypes.func.isRequired,
    /** @ignore */
    accountMeta: PropTypes.object.isRequired,
    /** @ignore */
    password: PropTypes.object.isRequired,
        /** @ignore */
    style: PropTypes.object
  };

  state = {
    filter: "All",
    search: "",
    loaded: true,
    isBusy: false,
    isLoading: false,
    currentlyPromotingBundleHash: false,
    isRetryingFailedTransaction: false,
    transactions: []
  };

  changeFilter(e){
    console.log(e.target.value);
    this.switchFilter(e.target.value)
  }

  switchFilter(filter) {
    if (filter === this.state.filter) {
      return;
    }

    this.setState({
      filter: filter,
      loaded: false
    });
    setTimeout(() => {
      this.setState({
        loaded: true
      });
    }, 200);
  }

  listAddresses(tx) {
    const { t } = this.props;

    return (
      <div className={css.addresses}>
        <strong>{t("addresses")}:</strong>
        <Scrollbar>
          {tx.inputs.concat(tx.outputs).map((input, index) => {
            return (
              <p key={`${index}-${input.address}`}>
                <span>
                  <Clipboard
                    text={`${input.address}${input.checksum}`}
                    title={t("history:addressCopied")}
                    success={t("history:addressCopiedExplanation")}
                    address
                  >
                    {input.address}
                    <mark>{input.checksum}</mark>
                  </Clipboard>
                </span>
                <em>{formatHlx(input.value, true, true)}</em>
              </p>
            );
          })}
        </Scrollbar>
      </div>
    );
  }

  async promoteTransaction(e, bundle) {
    e.stopPropagation();

    const { accountMeta, password } = this.props;
    const seedStore = await new SeedStore[accountMeta.type](password);

    // this.props.promoteTransaction(bundle, seedStore);
    this.props.promoteTransaction(bundle, this.props.accountName, seedStore);
  }

  async retryFailedTransaction(e, bundle) {
    e.stopPropagation();

    const { accountMeta, password } = this.props;
    const seedStore = await new SeedStore[accountMeta.type](password);

    // this.props.retryFailedTransaction(bundle, seedStore);
    this.props.retryFailedTransaction(
      this.props.accountName,
      bundle,
      seedStore
    );
  }

  getAccountTransactions = accountData => {
    const addresses = map(
      accountData.addressData,
      addressData => addressData.address
    );
    const transactions = mapNormalisedTransactions(
      accountData.transactions,
      accountData.addressData
    );
    return formatRelevantTransactions(transactions, addresses);
  };

  componentDidMount() {
    const { ui, accountInfo } = this.props;
    const isBusy =
      ui.isSyncing ||
      ui.isSendingTransfer ||
      ui.isAttachingToTangle ||
      ui.isTransitioning;
    const isLoading = ui.isFetchingAccountInfo;
    const currentlyPromotingBundleHash = ui.currentlyPromotingBundleHash;
    const isRetryingFailedTransaction = ui.isRetryingFailedTransaction;
    const tx = this.getAccountTransactions(accountInfo);
    this.setState({
      isBusy: isBusy,
      isLoading: isLoading,
      currentlyPromotingBundleHash: currentlyPromotingBundleHash,
      isRetryingFailedTransaction: isRetryingFailedTransaction,
      transactions: tx
    });
  }

  showMessage(message){
    if(message.indexOf('{')!=-1){
      return 'Empty';
    }
    return message;
  }

  render() {
    const {
      mode,
      hideEmptyTransactions,
      toggleEmptyTransactions,
      updateAccount,
      setItem,
      currentItem,
      t,
      style
    } = this.props;

    const {
      filter,
      isBusy,
      isLoading,
      loaded,
      currentlyPromotingBundleHash,
      isRetryingFailedTransaction,
      transactions,
      search
    } = this.state;

    const filters = ["All", "Sent", "Received", "Pending"];

    const totals = {
      All: 0,
      Sent: 0,
      Received: 0,
      Pending: 0
    };

    const filteredTransactions = orderBy(transactions, "timestamp", [
      "desc"
    ]).filter(transaction => {
      const isReceived = transaction.incoming;
      const isConfirmed = transaction.persistence;

      if (hideEmptyTransactions && transaction.transferValue === 0) {
        return false;
      }

      if (
        search.length &&
        transaction.message.toLowerCase().indexOf(search.toLowerCase()) < 0 &&
        transaction.bundle.toLowerCase().indexOf(search.toLowerCase()) !== 0 &&
        !(
          search[0] === ">" &&
          unitStringToValue(search.substr(1)) < transaction.transferValue
        ) &&
        !(
          search[0] === "<" &&
          unitStringToValue(search.substr(1)) > transaction.transferValue
        ) &&
        transaction.transferValue !== unitStringToValue(search)
      ) {
        return false;
      }

      totals.All++;

      if (!isConfirmed) {
        totals.Pending++;
        if (filter === "Pending") {
          return true;
        }
      } else if (isReceived) {
        totals.Received++;
        if (filter === "Received") {
          return true;
        }
      } else {
        totals.Sent++;
        if (filter === "Sent") {
          return true;
        }
      }

      return filter === "All";
    });

    const activeTx = currentItem
      ? filteredTransactions.filter(tx => tx.bundle === currentItem)[0]
      : null;
    const isActiveFailed = activeTx && activeTx.broadcasted === false;

    const scrollStyle = {
      paddingRight: '0px',
      marginLeft: '-50px',
      width: '109%',
    };
    return (
      <React.Fragment>
        <nav className={css.nav}>
        {/* <div className={css.search}><input type="text" className={css.search_text} placeholder="Type text here..." /></div> */}
        <div className={css.search}>
          <div
              onClick={() => this.setState({ search: "" })}
              style={{ display: "inline-block", marginLeft: "-110%" }}
            >
              <Icon
                icon={search.length > 0 ? "cross" : "search"}
                size={search.length > 0 ? 16 : 20}
              />
            </div>
            <input
              className={css.search_text}
              value={search}
              placeholder="Type text here..."
              onChange={e => this.setState({ search: e.target.value })}
            />
            
          </div>
          <p className={css.sort_by}>Sort By</p>
          <div className={css.search}><select className={css.sort_text} onChange={this.changeFilter.bind(this)}>
                  {filters.map(item => {
                  return (
                  <option value={item} key={item}>
                    {item}
                  </option>)
                })}
                </select></div> 
          
          <a
            onClick={() => updateAccount()}
            className={classNames(
              css.refresh,
              isBusy ? css.busy : null,
              isLoading ? css.loading : null
            )}
          >
            <Icon icon="sync" size={24} />
          </a>

          
        </nav>
        {/* <div className={css.list} style={style}> */}

          <Scrollbar style={scrollStyle}>
            {filteredTransactions.length ? (
              filteredTransactions.map((transaction, key) => {
                const isReceived = transaction.incoming;
                const isConfirmed = transaction.persistence;

                return (
                  <a
                    key={key}
                    onClick={() => setItem(transaction.bundle)}
                  >
                    {isReceived || isConfirmed ?(
                    <div className={!isReceived?css.column_sent:css.column_receive}>
                    <div className={css.column_cnt}>
                        <h4 className={css.sent_heading}>{!isReceived ? 'SENT': 'RECEIVED'}</h4>
                        <h6>{moment.unix(transaction.timestamp).format("DD MMM YYYY")}</h6>
                       
                    </div>
                    <div className={css.column_cnt}>
                        <p className={css.note}>{this.showMessage(transaction.message)}</p>
                    </div>
                    <div className={css.column_cnt}>
                        <h4 className={css.sender_heading}>{!isReceived?'Sender':'Receiver'}</h4>
                        <p className={css.fromhash}>{transaction.bundle}</p>
                    </div>
                    <div className={css.column_cnt}>
                        <span className={!isReceived?css.sent:css.receive}>{transaction.transferValue === 0
                          ? ""
                          : isReceived
                          ? "+"
                          : "-"}
                        {formatHlx(transaction.transferValue, true, true)}</span>
                    </div>
                    </div>
                    ): (
                      <div className={css.column_pending}>
                    <div className={css.column_cnt}>
                        <h4 className={css.sent_heading}>PENDING</h4>
                        <h6>{moment.unix(transaction.timestamp).format("DD MMM YYYY")}</h6>
                        
                    </div>
                    <div className={css.column_cnt}>
                        <p className={css.note}>Add Note:</p>
                    </div>
                    <div className={css.column_cnt}>
                        <h4 className={css.sender_heading}>{!isReceived?'Sending':'Receiving'}</h4>
                        <p className={css.fromhash}>{transaction.bundle}</p>
                    </div>
                    <div className={css.column_cnt}>
                        <span className={!isReceived?css.sent:css.receive}>{transaction.transferValue === 0
                          ? ""
                          : isReceived
                          ? "+"
                          : "-"}
                        {formatHlx(transaction.transferValue, true, true)}</span>
                    </div>
                    </div>
                    )}

                    {/* <div className={css.alt_bg}>
                      {isReceived ? (
                        <Icon icon="plus" size={14} />
                      ) : (
                        <Icon icon="minus" size={14} />
                      )}
                      <span>
                        {formatTime(
                          navigator.language,
                          detectedTimezone,
                          convertUnixTimeToJSDate(transaction.timestamp)
                        )}
                      </span>
                      <span>
                        {!isConfirmed
                          ? isReceived
                            ? t("receiving")
                            : t("sending")
                          : isReceived
                          ? t("received")
                          : t("sent")}
                      </span>
                      <span>
                        {transaction.transferValue === 0
                          ? ""
                          : isReceived
                          ? "+"
                          : "-"}
                        {formatHlx(transaction.transferValue, true, true)}
                      </span>
                    </div> */}
                  </a>
                );
              })
            ) : (
              <p className={css.empty}>
                {!transactions.length
                  ? t("noTransactions")
                  : t("history:noTransactionsFound")}
              </p>
            )}
          </Scrollbar>
        {/* </div> */}
        <div
          className={classNames(css.popup, activeTx ? css.on : null)}
          onClick={() => setItem(null)}
        >
          <div>
            {activeTx ? (
              <div
                className={classNames(
                  activeTx.incoming ? css.received : css.sent,
                  activeTx.persistence ? css.confirmed : css.pending
                )}
              >
                <p>
                  <strong>
                    {activeTx.incoming
                      ? t("history:receive")
                      : t("history:send")}{" "}
                    <span>
                      {formatHlx(activeTx.transferValue, false, true)}
                    </span>
                  </strong>
                  <small>
                    {!activeTx.persistence
                      ? t("pending")
                      : activeTx.incoming
                      ? t("received")
                      : t("sent")}
                    <em>
                      {formatModalTime(
                        navigator.language,
                        detectedTimezone,
                        convertUnixTimeToJSDate(activeTx.timestamp)
                      )}
                    </em>
                  </small>
                </p>
                <h6>{t("bundleHash")}:</h6>
                <p className={css.hash}>
                  <Clipboard
                    text={activeTx.bundle}
                    title={t("history:bundleHashCopied")}
                    success={t("history:bundleHashCopiedExplanation")}
                  />
                </p>
                {mode === "Advanced" && this.listAddresses(activeTx)}
                <div className={css.message}>
                  <strong>{t("send:message")}:</strong>
                  <Scrollbar>
                    <Clipboard
                      text={activeTx.message}
                      title={t("history:messageCopied")}
                      success={t("history:messageCopiedExplanation")}
                    />
                  </Scrollbar>
                </div>
                {!activeTx.persistence && (
                  <nav>
                    {isActiveFailed && (
                      <Button
                        className="small"
                        loading={isRetryingFailedTransaction}
                        onClick={e =>
                          this.retryFailedTransaction(e, activeTx.bundle)
                        }
                      >
                        {t("retry")}
                      </Button>
                    )}
                    {!isActiveFailed && (
                      <Button
                        className="small"
                        loading={
                          currentlyPromotingBundleHash === activeTx.bundle
                        }
                        onClick={e =>
                          this.promoteTransaction(e, activeTx.bundle)
                        }
                      >
                        {t("retry")}
                      </Button>
                    )}
                  </nav>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  seedIndex: state.wallet.seedIndex,
  accounts: state.accounts,
  accountName: getSelectedAccountName(state),
  theme: getThemeFromState(state),
  accountMeta: getSelectedAccountMeta(state),
  accountNames: getAccountNamesFromState(state),
  accountInfo: selectAccountInfo(state),
  mode: state.settings.mode,
  ui: state.ui,
  hideEmptyTransactions: state.settings.hideEmptyTransactions,
  password: state.wallet.password
});

const mapDispatchToProps = {
  toggleEmptyTransactions,
  promoteTransaction,
  retryFailedTransaction,
  generateAlert
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withI18n()(ListComponent));