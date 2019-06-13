import MarketsActions from "actions/MarketsActions";
import {checkFeeStatusAsync} from "common/trxHelper";

class AbstractOrderBook {
    constructor(prefix) {
        this._orderBook_prefix = prefix;
    }
}

class RegularOrderBook extends AbstractOrderBook {
    constructor(props) {
        super(props);
    }
    createLimitOrder2(orders) {
        return MarketsActions.createLimitOrder2(orders);
    }

    createPredictionShort(order, collateral) {
        return MarketsActions.createPredictionShort(order, collateral);
    }

    getTrackedGroupsConfig() {
        return MarketsActions.getTrackedGroupsConfig();
    }

    cancelLimitOrder(currentAccountId, orderID) {
        return MarketsActions.cancelLimitOrder(currentAccountId, orderID);
    }

    changeCurrentGroupLimit(groupLimit) {
        return MarketsActions.changeCurrentGroupLimit(groupLimit);
    }

    checkFeeStatusAsync(accountID, feeID) {
        return checkFeeStatusAsync({
            accountID: accountID,
            feeID: feeID,
            type: "limit_order_create"
        });
    }
}

class HtlcOrderBook extends AbstractOrderBook {
    constructor(props) {
        super(props);
    }

    checkFeeStatusAsync(accountID, feeID) {
        return checkFeeStatusAsync({
            accountID: accountID,
            feeID: feeID,
            type: "htlc_create"
        });
    }
}

const _orderbookCache = {};
const orderBook = prefix => {
    _orderbookCache[prefix] =
        prefix === "htlc" ? new HtlcOrderBook() : new RegularOrderBook();
};

export default orderBook;
