import React from "react";
import AccountImage from "./AccountImage";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import Translate from "react-translate-component";
import QRCode from "qrcode.react";
import PropTypes from "prop-types";

class AccountInfo extends React.Component {
    static propTypes = {
        account: ChainTypes.ChainAccount.isRequired,
        title: PropTypes.string,
        image_size: PropTypes.object.isRequired,
        my_account: PropTypes.bool
    };

    static defaultProps = {
        title: null,
        image_size: {height: 120, width: 120},
        showQR: false,
        titleClass: "account-title"
    };

    constructor() {
        super();

        this.state = {
            hover: false
        };
    }

    render() {
        let {account, image_size} = this.props;
        const accountName = account ? account.get("name") : null;

        let isLTM = account
            ? account.get("lifetime_referrer_name") === accountName
            : false;

        let QR = (
            <div className="account-image">
                <QRCode size={image_size.width} value={accountName || ""} />
            </div>
        );

        let qrState = !this.state.hover
            ? this.props.showQR
            : !this.props.showQR;

        return (
            <div
                style={{maxWidth: image_size.width}}
                className={
                    "account-info" +
                    (this.props.my_account ? " my-account" : "")
                }
            >
                {this.props.title ? <h4>{this.props.title}</h4> : null}
                <div
                    onMouseEnter={() => {
                        this.setState({hover: true});
                    }}
                    onMouseLeave={() => {
                        this.setState({hover: false});
                    }}
                    className="clickable"
                    onClick={() => {
                        this.setState({hover: false});
                        this.props.toggleQR(!this.props.showQR);
                    }}
                >
                    {qrState ? (
                        QR
                    ) : (
                        <AccountImage
                            size={image_size}
                            account={accountName}
                            custom_image={null}
                        />
                    )}
                </div>
                <p>
                    <Translate content="account.deposit_address" />!
                </p>
                <p className={this.props.titleClass}>
                    <span className={isLTM ? "lifetime" : ""}>
                        {accountName}
                    </span>
                </p>
                {/* <div className="secondary">
                    <span className="subheader">#{display_id}</span>
                    {this.props.my_account ? <span className="my-account-label"><Translate content="account.mine" /></span> : null}
                </div> */}
            </div>
        );
    }
}

export default BindToChainState(AccountInfo);
