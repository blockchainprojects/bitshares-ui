import React from "react";
import counterpart from "counterpart";
import utils from "common/utils";
import Translate from "react-translate-component";
import PriceText from "components/Utility/PriceText";
import AssetName from "components/Utility/AssetName";
const rightAlign = {textAlign: "right"};
import {Tooltip, Checkbox} from "bitshares-ui-style-guide";

const ExchangeTableHeaderView = ({
    baseSymbol,
    quoteSymbol,
    selected,
    onCancelToggle
}) => {
    return (
        <thead>
            <tr>
                <th style={{width: "6%", textAlign: "center"}}>
                    <Tooltip
                        title={counterpart.translate(
                            "exchange.cancel_order_select_all"
                        )}
                        placement="left"
                    >
                        <Checkbox
                            className="order-cancel-toggle"
                            checked={selected}
                            onChange={onCancelToggle}
                        />
                    </Tooltip>
                </th>
                <th style={rightAlign}>
                    <Translate
                        className="header-sub-title"
                        content="exchange.price"
                    />
                </th>
                <th style={rightAlign}>
                    {baseSymbol ? (
                        <span className="header-sub-title">
                            <AssetName dataPlace="top" name={quoteSymbol} />
                        </span>
                    ) : null}
                </th>
                <th style={rightAlign}>
                    {baseSymbol ? (
                        <span className="header-sub-title">
                            <AssetName dataPlace="top" name={baseSymbol} />
                        </span>
                    ) : null}
                </th>
                <th style={rightAlign}>
                    <Translate
                        className="header-sub-title"
                        content="transaction.expiration"
                    />
                </th>
            </tr>
        </thead>
    );
};

const ExchangeOrderRowView = ({
    base,
    quote,
    order,
    selected,
    onCheckCancel
}) => {
    const isBid = order.isBid();
    const isCall = order.isCall();
    let tdClass = isCall
        ? "orderHistoryCall"
        : isBid
        ? "orderHistoryBid"
        : "orderHistoryAsk";
    return (
        <tr key={order.id}>
            <td className="text-center" style={{width: "6%"}}>
                {isCall ? null : (
                    <Checkbox
                        className="orderCancel"
                        checked={selected}
                        onChange={onCheckCancel}
                    />
                )}
            </td>
            <td className={tdClass} style={{paddingLeft: 10}}>
                <PriceText price={order.getPrice()} base={base} quote={quote} />
            </td>
            <td>
                {utils.format_number(
                    order[
                        !isBid ? "amountForSale" : "amountToReceive"
                    ]().getAmount({real: true}),
                    quote.get("precision")
                )}{" "}
            </td>
            <td>
                {utils.format_number(
                    order[
                        !isBid ? "amountToReceive" : "amountForSale"
                    ]().getAmount({real: true}),
                    base.get("precision")
                )}{" "}
            </td>
            <td>
                <Tooltip title={order.expiration.toLocaleString()}>
                    <div
                        style={{
                            textAlign: "right",
                            whiteSpace: "nowrap"
                        }}
                    >
                        {isCall
                            ? null
                            : counterpart.localize(new Date(order.expiration), {
                                  type: "date",
                                  format: "short_custom"
                              })}
                    </div>
                </Tooltip>
            </td>
        </tr>
    );
};

const MyOpenOrdersView = React.forwardRef((props, ref) => {
    const {
        style,
        headerStyle,
        className,
        innerClass,
        innerStyle,
        baseSymbol,
        quoteSymbol,
        selected,
        onCancelToggle,
        tinyScreen,
        noHeader,
        activeTab,
        contentContainer,
        footerContainer
    } = props;
    return (
        <div style={style} key="open_orders" className={className}>
            <div className={innerClass} style={innerStyle}>
                {noHeader ? null : (
                    <div
                        style={headerStyle}
                        className="exchange-content-header"
                    >
                        {activeTab == "my_orders" ? (
                            <Translate content="exchange.my_orders" />
                        ) : null}
                        {activeTab == "open_settlement" ? (
                            <Translate content="exchange.settle_orders" />
                        ) : null}
                    </div>
                )}
                <div className="grid-block shrink left-orderbook-header market-right-padding-only">
                    <table className="table order-table text-right fixed-table market-right-padding">
                        {activeTab == "my_orders" ? (
                            <ExchangeTableHeaderView
                                baseSymbol={baseSymbol}
                                quoteSymbol={quoteSymbol}
                                selected={selected}
                                onCancelToggle={onCancelToggle}
                            />
                        ) : (
                            <thead>
                                <tr>
                                    <th>
                                        <Translate
                                            className="header-sub-title"
                                            content="exchange.price"
                                        />
                                    </th>
                                    <th>
                                        <span className="header-sub-title">
                                            <AssetName
                                                dataPlace="top"
                                                name={quoteSymbol}
                                            />
                                        </span>
                                    </th>
                                    <th>
                                        <span className="header-sub-title">
                                            <AssetName
                                                dataPlace="top"
                                                name={baseSymbol}
                                            />
                                        </span>
                                    </th>
                                    <th>
                                        <Translate
                                            className="header-sub-title"
                                            content="explorer.block.date"
                                        />
                                    </th>
                                </tr>
                            </thead>
                        )}
                    </table>
                </div>

                <div
                    className="table-container grid-block market-right-padding-only no-overflow"
                    ref={ref}
                    style={{
                        overflow: "hidden",
                        minHeight: !tinyScreen ? 260 : 0,
                        maxHeight: 260,
                        lineHeight: "13px"
                    }}
                >
                    <table className="table order-table table-highlight-hover table-hover no-stripes text-right fixed-table market-right-padding">
                        {contentContainer}
                    </table>
                </div>
                {footerContainer}
            </div>
        </div>
    );
});

export {MyOpenOrdersView, ExchangeTableHeaderView, ExchangeOrderRowView};
