import MarketsActions from "actions/MarketsActions";
import MarketsStore from "stores/MarketsStore";
import {checkFeeStatusAsync} from "common/trxHelper";

class RegularOrderBook {
    constructor(props) {
        this.activeMarketHistory = MarketsStore.getState().activeMarketHistory; //latest change class
        this.marketLimitOrders = MarketsStore.getState().marketLimitOrders; //orders
        this.marketCallOrders = MarketsStore.getState().marketCallOrders; //calls
        this.invertedCalls = MarketsStore.getState().invertedCalls; //invertedCalls
        this.marketData = MarketsStore.getState().marketData; //combinedBids combinedAsks highestBid lowestAsk groupedBids groupedAsks
        this.totals = MarketsStore.getState().totals; //totalBids totalAsks
        this.trackedGroupsConfig = MarketsStore.getState().trackedGroupsConfig;
        this.currentGroupOrderLimit = MarketsStore.getState().currentGroupLimit;
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
    unSubscribeMarket(quoteAssetId, baseAssetId) {
        return MarketsActions.unSubscribeMarket(quoteAssetId, baseAssetId);
    }
    SubscribeMarket(quoteAssetId, baseAssetId, newBucketSize) {
        MarketsActions.subscribeMarket(
            quoteAssetId,
            baseAssetId,
            newBucketSize
        );
    }
}

class HtlcOrderBook {
    constructor(props) {}

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
    return (_orderbookCache[prefix] =
        prefix === "htlc" ? new HtlcOrderBook() : new RegularOrderBook());
};

export default orderBook;
