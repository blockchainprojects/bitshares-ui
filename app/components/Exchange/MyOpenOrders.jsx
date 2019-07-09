import React from "react";
import PropTypes from "prop-types";
import Ps from "perfect-scrollbar";
import OpenSettleOrders from "./OpenSettleOrders";
import MarketsActions from "actions/MarketsActions";
import Translate from "react-translate-component";
import TransitionWrapper from "../Utility/TransitionWrapper";
import SettingsActions from "actions/SettingsActions";
import {ChainStore} from "bitsharesjs";
import {LimitOrder, CallOrder} from "common/MarketClasses";
import ReactTooltip from "react-tooltip";
import {Button} from "bitshares-ui-style-guide";
import {MyOpenOrdersView, ExchangeOrderRowView} from "./View/MyOpenOrdersView";

class MyOpenOrders extends React.Component {
    constructor(props) {
        super();
        this.state = {
            activeTab: props.activeTab,
            rowCount: 20,
            showAll: false,
            selectedOrders: []
        };
        this._getOrders = this._getOrders.bind(this);
        this.container = React.createRef();
    }

    /***
     * Update PS Container
     * type:int [0:destroy, 1:init, 2:update] (default: 2)
     */
    _updateContainer(type = 2) {
        let containerNode = this.container.current;

        if (!containerNode) return;

        if (type == 0) {
            Ps.destroy(containerNode);
        } else if (type == 1) {
            Ps.initialize(containerNode);
            this._updateContainer(2);
        } else if (type == 2) {
            containerNode.scrollTop = 0;
            Ps.update(containerNode);
        }
        this.refs.contentTransition.resetAnimation();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextProps.baseSymbol !== this.props.baseSymbol ||
            nextProps.quoteSymbol !== this.props.quoteSymbol ||
            nextProps.className !== this.props.className ||
            nextProps.activeTab !== this.props.activeTab ||
            nextState.activeTab !== this.state.activeTab ||
            nextState.showAll !== this.state.showAll ||
            nextProps.currentAccount !== this.props.currentAccount ||
            nextState.selectedOrders !== this.state.selectedOrders
        );
    }

    componentDidMount() {
        if (!this.props.hideScrollbars) {
            this._updateContainer(1);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.hideScrollbars) {
            if (prevState.showAll != this.state.showAll) {
                prevState.showAll
                    ? this._updateContainer(0)
                    : this._updateContainer(1);
            } else if (this.state.showAll && prevState.showAll) {
                this._updateContainer(1);
            }
        } else if (prevState.showAll === this.state.showAll) {
            this._updateContainer(1);
        } else {
            this._updateContainer(2);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.activeTab !== this.props.activeTab) {
            this._changeTab(nextProps.activeTab);
        }

        if (
            nextProps.baseSymbol !== this.props.baseSymbol ||
            nextProps.quoteSymbol !== this.props.quoteSymbol
        ) {
            this._updateContainer(0);
        }

        if (nextProps.hideScrollbars !== this.props.hideScrollbars) {
            this._updateContainer(0);

            if (!nextProps.hideScrollbars) {
                this._updateContainer(1);
                this._updateContainer(2);
            }
        }
    }

    onCheckCancel(orderId, evt) {
        let {selectedOrders} = this.state;
        let checked = evt.target.checked;

        if (checked) {
            this.setState({selectedOrders: selectedOrders.concat([orderId])});
        } else {
            let index = selectedOrders.indexOf(orderId);

            if (index > -1) {
                this.setState({
                    selectedOrders: selectedOrders
                        .slice(0, index)
                        .concat(selectedOrders.slice(index + 1))
                });
            }
        }
    }

    cancelSelected() {
        this._cancelLimitOrders.call(this);
    }

    resetSelected() {
        this.setState({selectedOrders: []});
    }

    onCancelToggle(evt) {
        const orders = this._getOrders();
        let selectedOrders = [];

        orders.forEach(order => {
            selectedOrders.push(order.id);
        });

        if (evt.target.checked) {
            this.setState({selectedOrders: selectedOrders});
        } else {
            this.setState({selectedOrders: []});
        }
    }

    _cancelLimitOrders() {
        MarketsActions.cancelLimitOrders(
            this.props.currentAccount.get("id"),
            this.state.selectedOrders
        )
            .then(() => {
                this.resetSelected();
            })
            .catch(err => {
                console.log("cancel orders error:", err);
            });
    }

    _onSetShowAll() {
        this.setState({
            showAll: !this.state.showAll
        });

        if (this.state.showAll) {
            this.container.current.scrollTop = 0;
        }
    }

    _getOrders() {
        const {currentAccount, base, quote, feedPrice} = this.props;
        const orders = currentAccount.get("orders"),
            call_orders = currentAccount.get("call_orders");
        const baseID = base.get("id"),
            quoteID = quote.get("id");
        const assets = {
            [base.get("id")]: {precision: base.get("precision")},
            [quote.get("id")]: {precision: quote.get("precision")}
        };
        let limitOrders = orders
            .toArray()
            .map(order => {
                let o = ChainStore.getObject(order);
                if (!o) return null;
                let sellBase = o.getIn(["sell_price", "base", "asset_id"]),
                    sellQuote = o.getIn(["sell_price", "quote", "asset_id"]);
                if (
                    (sellBase === baseID && sellQuote === quoteID) ||
                    (sellBase === quoteID && sellQuote === baseID)
                ) {
                    return new LimitOrder(o.toJS(), assets, quote.get("id"));
                }
            })
            .filter(a => !!a);

        let callOrders = call_orders
            .toArray()
            .map(order => {
                try {
                    let o = ChainStore.getObject(order);
                    if (!o) return null;
                    let sellBase = o.getIn(["call_price", "base", "asset_id"]),
                        sellQuote = o.getIn([
                            "call_price",
                            "quote",
                            "asset_id"
                        ]);
                    if (
                        (sellBase === baseID && sellQuote === quoteID) ||
                        (sellBase === quoteID && sellQuote === baseID)
                    ) {
                        return feedPrice
                            ? new CallOrder(
                                  o.toJS(),
                                  assets,
                                  quote.get("id"),
                                  feedPrice
                              )
                            : null;
                    }
                } catch (e) {
                    return null;
                }
            })
            .filter(a => !!a)
            .filter(a => {
                try {
                    return a.isMarginCalled();
                } catch (err) {
                    return false;
                }
            });
        return limitOrders.concat(callOrders);
    }

    _changeTab(tab) {
        SettingsActions.changeViewSetting({
            ordersTab: tab
        });
        this.setState({
            activeTab: tab
        });

        this._updateContainer(2);

        setTimeout(ReactTooltip.rebuild, 1000);
    }

    render() {
        let {base, quote, quoteSymbol, baseSymbol, settleOrders} = this.props;
        let {activeTab, showAll, rowCount, selectedOrders} = this.state;

        if (!base || !quote) return null;

        let contentContainer;
        let footerContainer;

        /* Users Open Orders Tab (default) */
        let totalMyOrders = 0;

        if (!activeTab || activeTab == "my_orders") {
            const orders = this._getOrders();
            let emptyRow = (
                <tr>
                    <td
                        style={{
                            textAlign: "center",
                            lineHeight: 4,
                            fontStyle: "italic"
                        }}
                        colSpan="5"
                    >
                        <Translate content="account.no_orders" />
                    </td>
                </tr>
            );

            let bids = orders
                .filter(a => {
                    return a.isBid();
                })
                .sort((a, b) => {
                    return b.getPrice() - a.getPrice();
                })
                .map(order => {
                    return (
                        <ExchangeOrderRowView
                            key={order.id}
                            order={order}
                            base={base}
                            quote={quote}
                            selected={
                                this.state.selectedOrders.length > 0 &&
                                this.state.selectedOrders.includes(order.id)
                            }
                            onCheckCancel={this.onCheckCancel.bind(
                                this,
                                order.id
                            )}
                        />
                    );
                });

            let asks = orders
                .filter(a => {
                    return !a.isBid();
                })
                .sort((a, b) => {
                    return a.getPrice() - b.getPrice();
                })
                .map(order => {
                    return (
                        <ExchangeOrderRowView
                            key={order.id}
                            order={order}
                            base={base}
                            quote={quote}
                            selected={
                                this.state.selectedOrders.length > 0 &&
                                this.state.selectedOrders.includes(order.id)
                            }
                            onCancel={this.props.onCancel.bind(this, order.id)}
                            onCheckCancel={this.onCheckCancel.bind(
                                this,
                                order.id
                            )}
                        />
                    );
                });

            let rows = [];

            if (asks.length) {
                rows = rows.concat(asks);
            }

            if (bids.length) {
                rows = rows.concat(bids);
            }

            rows.sort((a, b) => {
                return a.props.price - b.props.price;
            });

            totalMyOrders = rows.length;
            let rowsLength = rows.length;

            if (!showAll) {
                rows.splice(rowCount, rows.length);
            }

            contentContainer = (
                <TransitionWrapper
                    ref="contentTransition"
                    component="tbody"
                    transitionName="newrow"
                >
                    {rows.length ? rows : emptyRow}
                </TransitionWrapper>
            );

            var cancelOrderButton = (
                <div style={{display: "grid"}}>
                    <Button onClick={this.cancelSelected.bind(this)}>
                        <Translate content="exchange.cancel_selected_orders" />
                    </Button>
                </div>
            );

            footerContainer =
                rowsLength > 11 ? (
                    <React.Fragment>
                        <div className="orderbook-showall">
                            <a onClick={this._onSetShowAll.bind(this)}>
                                <Translate
                                    content={
                                        showAll
                                            ? "exchange.hide"
                                            : "exchange.show_all_orders"
                                    }
                                    rowcount={rowsLength}
                                />
                            </a>
                        </div>
                        {selectedOrders.length > 0 ? cancelOrderButton : null}
                    </React.Fragment>
                ) : selectedOrders.length > 0 ? (
                    cancelOrderButton
                ) : null;
        }

        {
            /* Open Settle Orders */
        }
        if (activeTab && activeTab == "open_settlement") {
            let settleOrdersLength = settleOrders.length;

            if (settleOrdersLength > 0) {
                if (!showAll) {
                    settleOrders.splice(rowCount, settleOrders.length);
                }
            }

            contentContainer = (
                <OpenSettleOrders
                    key="settle_orders"
                    orders={settleOrders}
                    base={base}
                    quote={quote}
                    baseSymbol={baseSymbol}
                    quoteSymbol={quoteSymbol}
                />
            );

            footerContainer =
                settleOrdersLength > 11 ? (
                    <div className="orderbook-showall">
                        <a onClick={this._onSetShowAll.bind(this)}>
                            <Translate
                                content={
                                    showAll
                                        ? "exchange.hide"
                                        : "exchange.show_all_orders"
                                }
                                rowcount={settleOrdersLength}
                            />
                        </a>
                    </div>
                ) : null;
        }

        return (
            <MyOpenOrdersView
                ref={this.container}
                style={this.props.style}
                headerStyle={this.props.headerStyle}
                className={this.props.className}
                innerClass={this.props.innerClass}
                innerStyle={this.props.innerStyle}
                activeTab={activeTab}
                baseSymbol={baseSymbol}
                quoteSymbol={quoteSymbol}
                selected={
                    this.state.selectedOrders.length > 0 &&
                    this.state.selectedOrders.length == totalMyOrders
                }
                onCancelToggle={this.onCancelToggle.bind(this)}
                tinyScreen={this.props.tinyScreen}
                noHeader={this.props.noHeader}
                footerContainer={footerContainer}
                contentContainer={contentContainer}
            />
        );
    }
}

MyOpenOrders.defaultProps = {
    base: {},
    quote: {},
    orders: {},
    quoteSymbol: "",
    baseSymbol: ""
};

MyOpenOrders.propTypes = {
    base: PropTypes.object.isRequired,
    quote: PropTypes.object.isRequired,
    orders: PropTypes.object.isRequired,
    quoteSymbol: PropTypes.string.isRequired,
    baseSymbol: PropTypes.string.isRequired
};

export {MyOpenOrders};
