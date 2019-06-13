/** Accounts action types */
export const AccountsActionTypes = {
    UPDATE_ACCOUNT_INFO_AFTER_SPENDING: 'HELIX/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING',
    UPDATE_ACCOUNT_AFTER_REATTACHMENT: 'HELIX/ACCOUNTS/UPDATE_ACCOUNT_AFTER_REATTACHMENT',
    UPDATE_ADDRESS_DATA: 'HELIX/ACCOUNTS/UPDATE_ADDRESS_DATA',
    CHANGE_ACCOUNT_NAME: 'HELIX/ACCOUNTS/CHANGE_ACCOUNT_NAME',
    REMOVE_ACCOUNT: 'HELIX/ACCOUNTS/REMOVE_ACCOUNT',
    SET_ONBOARDING_COMPLETE: 'HELIX/ACCOUNTS/SET_ONBOARDING_COMPLETE',
    UPDATE_ACCOUNT_AFTER_TRANSITION: 'HELIX/ACCOUNTS/UPDATE_ACCOUNT_AFTER_TRANSITION',
    FULL_ACCOUNT_INFO_FETCH_REQUEST: 'HELIX/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_REQUEST',
    FULL_ACCOUNT_INFO_FETCH_SUCCESS: 'HELIX/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_SUCCESS',
    FULL_ACCOUNT_INFO_FETCH_ERROR: 'HELIX/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_ERROR',
    MANUAL_SYNC_REQUEST: 'HELIX/ACCOUNTS/MANUAL_SYNC_REQUEST',
    MANUAL_SYNC_SUCCESS: 'HELIX/ACCOUNTS/MANUAL_SYNC_SUCCESS',
    MANUAL_SYNC_ERROR: 'HELIX/ACCOUNTS/MANUAL_SYNC_ERROR',
    ACCOUNT_INFO_FETCH_REQUEST: 'HELIX/ACCOUNTS/ACCOUNT_INFO_FETCH_REQUEST',
    ACCOUNT_INFO_FETCH_SUCCESS: 'HELIX/ACCOUNTS/ACCOUNT_INFO_FETCH_SUCCESS',
    ACCOUNT_INFO_FETCH_ERROR: 'HELIX/ACCOUNTS/ACCOUNT_INFO_FETCH_ERROR',
    SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION: 'HELIX/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION',
    SET_BASIC_ACCOUNT_INFO: 'HELIX/ACCOUNTS/SET_BASIC_ACCOUNT_INFO',
    SET_ACCOUNT_INFO_DURING_SETUP: 'HELIX/ACCOUNTS/SET_ACCOUNT_INFO_DURING_SETUP',
    MARK_TASK_AS_DONE: 'HELIX/ACCOUNTS/MARK_TASK_AS_DONE',
    SYNC_ACCOUNT_BEFORE_SWEEPING: 'HELIX/ACCOUNTS/SYNC_ACCOUNT_BEFORE_SWEEPING',
    OVERRIDE_ACCOUNT_INFO: 'HELIX/ACCOUNTS/OVERRIDE_ACCOUNT_INFO',
    ASSIGN_ACCOUNT_INDEX: 'HELIX/ACCOUNTS/ASSIGN_ACCOUNT_INDEX',
};

/** Alerts action types */
export const AlertsActionTypes = {
    SHOW: 'HELIX/ALERTS/SHOW',
    HIDE: 'HELIX/ALERTS/HIDE',
    UPDATE_LOG: 'HELIX/ALERTS/UPDATE_LOG',
    CLEAR_LOG: 'HELIX/ALERTS/CLEAR_LOG',
};

/** Home screen (mobile) action types */
export const HomeActionTypes = {
    CHANGE_HOME_SCREEN_CHILD_ROUTE: 'HELIX/HOME/ROUTE/CHANGE',
    TOGGLE_TOP_BAR_DISPLAY: 'HELIX/HOME/TOP_BAR/TOGGLE',
};

/** Keychain (mobile) action types */
export const KeychainActionTypes = {
    IS_GETTING_SENSITIVE_INFO_REQUEST: 'HELIX/KEYCHAIN/IS_GETTING_SENSITIVE_INFO_REQUEST',
    IS_GETTING_SENSITIVE_INFO_SUCCESS: 'HELIX/KEYCHAIN/IS_GETTING_SENSITIVE_INFO_SUCCESS',
    IS_GETTING_SENSITIVE_INFO_ERROR: 'HELIX/KEYCHAIN/IS_GETTING_SENSITIVE_INFO_ERROR',
};

/** Market data action types */
export const MarketDataActionTypes = {
    SET_TIMEFRAME: 'HELIX/MARKET_DATA/SET_TIMEFRAME',
    SET_CHART_DATA: 'HELIX/MARKET_DATA/SET_CHART_DATA',
    SET_STATISTICS: 'HELIX/MARKET_DATA/SET_STATISTICS',
    SET_CURRENCY: 'HELIX/MARKET_DATA/SET_CURRENCY',
    SET_PRICE: 'HELIX/MARKET_DATA/SET_PRICE',
};

/**
 * Migrations action types
 */
export const MigrationsActionTypes = {
    SET_REALM_MIGRATION_STATUS: 'HELIX/SETTINGS/SET_REALM_MIGRATION_STATUS',
};

/** Polling action types */
export const PollingActionTypes = {
    SET_POLL_FOR: 'HELIX/POLLING/SET_POLL_FOR',
    FETCH_PRICE_REQUEST: 'HELIX/POLLING/FETCH_PRICE_REQUEST',
    FETCH_PRICE_SUCCESS: 'HELIX/POLLING/FETCH_PRICE_SUCCESS',
    FETCH_PRICE_ERROR: 'HELIX/POLLING/FETCH_PRICE_ERROR',
    FETCH_NODELIST_REQUEST: 'HELIX/POLLING/FETCH_NODELIST_REQUEST',
    FETCH_NODELIST_SUCCESS: 'HELIX/POLLING/FETCH_NODELIST_SUCCESS',
    FETCH_NODELIST_ERROR: 'HELIX/POLLING/FETCH_NODELIST_ERROR',
    FETCH_CHART_DATA_REQUEST: 'HELIX/POLLING/FETCH_CHART_DATA_REQUEST',
    FETCH_CHART_DATA_SUCCESS: 'HELIX/POLLING/FETCH_CHART_DATA_SUCCESS',
    FETCH_CHART_DATA_ERROR: 'HELIX/POLLING/FETCH_CHART_DATA_ERROR',
    FETCH_MARKET_DATA_REQUEST: 'HELIX/POLLING/FETCH_MARKET_DATA_REQUEST',
    FETCH_MARKET_DATA_SUCCESS: 'HELIX/POLLING/FETCH_MARKET_DATA_SUCCESS',
    FETCH_MARKET_DATA_ERROR: 'HELIX/POLLING/FETCH_MARKET_DATA_ERROR',
    ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_REQUEST: 'HELIX/POLLING/ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_REQUEST',
    ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_SUCCESS: 'HELIX/POLLING/ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_SUCCESS',
    ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_ERROR: 'HELIX/POLLING/ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_ERROR',
    PROMOTE_TRANSACTION_REQUEST: 'HELIX/POLLING/PROMOTE_TRANSACTION_REQUEST',
    PROMOTE_TRANSACTION_SUCCESS: 'HELIX/POLLING/PROMOTE_TRANSACTION_SUCCESS',
    PROMOTE_TRANSACTION_ERROR: 'HELIX/POLLING/PROMOTE_TRANSACTION_ERROR',
    SYNC_ACCOUNT_BEFORE_AUTO_PROMOTION: 'HELIX/POLLING/SYNC_ACCOUNT_BEFORE_AUTO_PROMOTION',
    SYNC_ACCOUNT_WHILE_POLLING: 'HELIX/POLLING/SYNC_ACCOUNT_WHILE_POLLING',
};

/** Progress bar action types */
export const ProgressActionTypes = {
    SET_NEXT_STEP_AS_ACTIVE: 'HELIX/PROGRESS/SET_NEXT_STEP_AS_ACTIVE',
    SET_ACTIVE_STEP_INDEX: 'HELIX/PROGRESS/SET_ACTIVE_STEP_INDEX',
    RESET: 'HELIX/PROGRESS/RESET',
    START_TRACKING_PROGRESS: 'HELIX/PROGRESS/START_TRACKING_PROGRESS',
};

/** Settings action types */
export const SettingsActionTypes = {
    SET_LOCALE: 'HELIX/SETTINGS/LOCALE',
    SET_NODE: 'HELIX/SETTINGS/FULLNODE',
    SET_NODE_REQUEST: 'HELIX/SETTINGS/SET_NODE_REQUEST',
    SET_NODE_ERROR: 'HELIX/SETTINGS/SET_NODE_ERROR',
    ADD_CUSTOM_NODE_REQUEST: 'HELIX/SETTINGS/ADD_CUSTOM_NODE_REQUEST',
    ADD_CUSTOM_NODE_SUCCESS: 'HELIX/SETTINGS/ADD_CUSTOM_NODE_SUCCESS',
    ADD_CUSTOM_NODE_ERROR: 'HELIX/SETTINGS/ADD_CUSTOM_NODE_ERROR',
    REMOVE_CUSTOM_NODE: 'HELIX/SETTINGS/REMOVE_CUSTOM_NODE',
    SET_MODE: 'HELIX/SETTINGS/SET_MODE',
    SET_THEME: 'HELIX/SETTINGS/SET_THEME',
    SET_LANGUAGE: 'HELIX/SETTINGS/SET_LANGUAGE',
    SET_CURRENCY_DATA: 'HELIX/SETTINGS/SET_CURRENCY',
    UPDATE_THEME: 'HELIX/SETTINGS/UPDATE_THEME',
    CURRENCY_DATA_FETCH_REQUEST: 'HELIX/SETTINGS/CURRENCY_DATA_FETCH_REQUEST',
    CURRENCY_DATA_FETCH_SUCCESS: 'HELIX/SETTINGS/CURRENCY_DATA_FETCH_SUCCESS',
    CURRENCY_DATA_FETCH_ERROR: 'HELIX/SETTINGS/CURRENCY_DATA_FETCH_ERROR',
    SET_RANDOMLY_SELECTED_NODE: 'HELIX/SETTINGS/SET_RANDOMLY_SELECTED_NODE',
    SET_NODELIST: 'HELIX/SETTINGS/SET_NODELIST',
    SET_REMOTE_POW: 'HELIX/SETTINGS/SET_REMOTE_POW',
    SET_AUTO_PROMOTION: 'HELIX/SETTINGS/SET_AUTO_PROMOTION',
    UPDATE_AUTO_NODE_SWITCHING: 'HELIX/SETTINGS/UPDATE_AUTO_NODE_SWITCHING',
    SET_LOCK_SCREEN_TIMEOUT: 'HELIX/SETTINGS/SET_LOCK_SCREEN_TIMEOUT',
    SET_VERSIONS: 'HELIX/SETTINGS/WALLET/SET_VERSIONS',
    WALLET_RESET: 'HELIX/SETTINGS/WALLET/RESET',
    SET_FINGERPRINT_STATUS: 'HELIX/SETTINGS/SET_FINGERPRINT_STATUS',
    ACCEPT_TERMS: 'HELIX/SETTINGS/ACCEPT_TERMS',
    ACCEPT_PRIVACY: 'HELIX/SETTINGS/ACCEPT_PRIVACY',
    TOGGLE_EMPTY_TRANSACTIONS: 'HELIX/SETTINGS/TOGGLE_EMPTY_TRANSACTIONS',
    SET_COMPLETED_FORCED_PASSWORD_UPDATE: 'HELIX/SETTINGS/SET_COMPLETED_FORCED_PASSWORD_UPDATE',
    SET_BYTETRIT_STATUS: 'HELIX/SETTINGS/SET_BYTETRIT_STATUS',
    SET_BYTETRIT_INFO: 'HELIX/SETTINGS/SET_BYTETRIT_INFO',
    SET_TRAY: 'HELIX/SETTINGS/SET_TRAY',
    SET_NOTIFICATIONS: 'HELIX/SETTINGS/SET_NOTIFICATIONS',
    SET_PROXY: 'SET_PROXY',
    RESET_NODES_LIST: 'HELIX/SETTINGS/RESET_NODES_LIST',
    SET_DEEP_LINKING: 'HELIX/SETTINGS/SET_DEEP_LINKING',
    UPDATE_QUORUM_CONFIG: 'HELIX/SETTINGS/UPDATE_QUORUM_CONFIG',
    UPDATE_NODE_AUTO_SWITCH_SETTING: 'HELIX/SETTINGS/UPDATE_NODE_AUTO_SWITCH_SETTING',
    UPDATE_AUTO_NODE_LIST_SETTING: 'HELIX/SETTINGS/UPDATE_AUTO_NODE_LIST_SETTING',
};

/** Transfers action types */
export const TransfersActionTypes = {
    PROMOTE_TRANSACTION_REQUEST: 'HELIX/TRANSFERS/PROMOTE_TRANSACTION_REQUEST',
    PROMOTE_TRANSACTION_SUCCESS: 'HELIX/TRANSFERS/PROMOTE_TRANSACTION_SUCCESS',
    PROMOTE_TRANSACTION_ERROR: 'HELIX/TRANSFERS/PROMOTE_TRANSACTION_ERROR',
    SEND_TRANSFER_REQUEST: 'HELIX/TRANSFERS/SEND_TRANSFER_REQUEST',
    SEND_TRANSFER_SUCCESS: 'HELIX/TRANSFERS/SEND_TRANSFER_SUCCESS',
    SEND_TRANSFER_ERROR: 'HELIX/TRANSFERS/SEND_TRANSFER_ERROR',
    RETRY_FAILED_TRANSACTION_REQUEST: 'HELIX/TRANSFERS/RETRY_FAILED_TRANSACTION_REQUEST',
    RETRY_FAILED_TRANSACTION_SUCCESS: 'HELIX/TRANSFERS/RETRY_FAILED_TRANSACTION_SUCCESS',
    RETRY_FAILED_TRANSACTION_ERROR: 'HELIX/TRANSFERS/RETRY_FAILED_TRANSACTION_ERROR',
};

/** UI action types */
export const UiActionTypes = {
    SET_SEND_ADDRESS_FIELD: 'HELIX/UI/SET_SEND_ADDRESS_FIELD',
    SET_SEND_AMOUNT_FIELD: 'HELIX/UI/SET_SEND_AMOUNT_FIELD',
    SET_SEND_MESSAGE_FIELD: 'HELIX/UI/SET_SEND_MESSAGE_FIELD',
    CLEAR_SEND_FIELDS: 'HELIX/UI/CLEAR_SEND_FIELDS',
    SET_SEND_DENOMINATION: 'HELIX/UI/SET_SEND_DENOMINATION',
    SET_USER_ACTIVITY: 'HELIX/UI/SET_USER_ACTIVITY',
    SET_DO_NOT_MINIMISE: 'HELIX/UI/SET_DO_NOT_MINIMISE',
    TOGGLE_MODAL_ACTIVITY: 'HELIX/UI/TOGGLE_MODAL_ACTIVITY',
    UPDATE_MODAL_PROPS: 'HELIX/UI/UPDATE_MODAL_PROPS',
    SET_LOGIN_ROUTE: 'HELIX/UI/SET_LOGIN_ROUTE',
    SET_QR_MESSAGE: 'HELIX/UI/SET_QR_MESSAGE',
    SET_QR_AMOUNT: 'HELIX/UI/SET_QR_AMOUNT',
    SET_QR_TAG: 'HELIX/UI/SET_QR_TAG',
    SET_QR_DENOMINATION: 'HELIX/UI/SET_QR_DENOMINATION',
    SET_SELECTED_QR_TAB: 'HELIX/UI/SET_SELECTED_QR_TAB',
    SET_ROUTE: 'HELIX/UI/SET_ROUTE',
    SET_KEYBOARD_ACTIVITY: 'HELIX/UI/SET_KEYBOARD_ACTIVITY',
    SET_ANIMATE_CHART_ON_MOUNT: 'HELIX/UI/SET_ANIMATE_CHART_ON_MOUNT',
};

/** Wallet action types */
export const WalletActionTypes = {
    GENERATE_NEW_ADDRESS_REQUEST: 'HELIX/WALLET/GENERATE_NEW_ADDRESS_REQUEST',
    GENERATE_NEW_ADDRESS_SUCCESS: 'HELIX/WALLET/GENERATE_NEW_ADDRESS_SUCCESS',
    GENERATE_NEW_ADDRESS_ERROR: 'HELIX/WALLET/GENERATE_NEW_ADDRESS_ERROR',
    SET_ACCOUNT_NAME: 'HELIX/WALLET/SET_ACCOUNT_NAME',
    SET_RECEIVE_ADDRESS: 'HELIX/WALLET/SET_RECEIVE_ADDRESS',
    SET_PASSWORD: 'HELIX/WALLET/SET_PASSWORD',
    CLEAR_WALLET_DATA: 'HELIX/WALLET/CLEAR_WALLET_DATA',
    SET_SEED_INDEX: 'HELIX/WALLET/SET_SEED_INDEX',
    SET_READY: 'HELIX/WALLET/SET_READY',
    SET_SETTING: 'HELIX/WALLET/SET_SETTING',
    SNAPSHOT_TRANSITION_REQUEST: 'HELIX/WALLET/SNAPSHOT_TRANSITION_REQUEST',
    SNAPSHOT_TRANSITION_SUCCESS: 'HELIX/WALLET/SNAPSHOT_TRANSITION_SUCCESS',
    SNAPSHOT_TRANSITION_ERROR: 'HELIX/WALLET/SNAPSHOT_TRANSITION_ERROR',
    SNAPSHOT_ATTACH_TO_TANGLE_REQUEST: 'HELIX/WALLET/SNAPSHOT_ATTACH_TO_TANGLE_REQUEST',
    SNAPSHOT_ATTACH_TO_TANGLE_COMPLETE: 'HELIX/WALLET/SNAPSHOT_ATTACH_TO_TANGLE_COMPLETE',
    UPDATE_TRANSITION_BALANCE: 'HELIX/WALLET/UPDATE_TRANSITION_BALANCE',
    UPDATE_TRANSITION_ADDRESSES: 'HELIX/WALLET/UPDATE_TRANSITION_ADDRESSES',
    SET_BALANCE_CHECK_FLAG: 'HELIX/WALLET/SET_BALANCE_CHECK_FLAG',
    CANCEL_SNAPSHOT_TRANSITION: 'HELIX/WALLET/CANCEL_SNAPSHOT_TRANSITION',
    CONNECTION_CHANGED: 'HELIX/WALLET/CONNECTION_CHANGED',
    SHOULD_UPDATE: 'HELIX/APP/WALLET/SHOULD_UPDATE',
    FORCE_UPDATE: 'HELIX/APP/WALLET/FORCE_UPDATE',
    DISPLAY_TEST_WARNING: 'HELIX/APP/WALLET/DISPLAY_TEST_WARNING',
    INITIATE_DEEP_LINK_REQUEST: 'HELIX/APP/WALLET/INITIATE_DEEP_LINK_REQUEST',
    COMPLETE_DEEP_LINK_REQUEST: 'HELIX/APP/WALLET/COMPLETE_DEEP_LINK_REQUEST',
    MAP_STORAGE_TO_STATE: 'HELIX/SETTINGS/MAP_STORAGE_TO_STATE',
    ADDRESS_VALIDATION_REQUEST: 'HELIX/APP/WALLET/ADDRESS_VALIDATION_REQUEST',
    ADDRESS_VALIDATION_SUCCESS: 'HELIX/APP/WALLET/ADDRESS_VALIDATION_SUCCESS',
    PUSH_ROUTE: 'HELIX/APP/WALLET/PUSH_ROUTE',
    POP_ROUTE: 'HELIX/APP/WALLET/POP_ROUTE',
    POP_TO_ROUTE: 'HELIX/APP/WALLET/POP_TO_ROUTE',
    RESET_ROUTE: 'HELIX/APP/WALLET/RESET_ROUTE',
};
