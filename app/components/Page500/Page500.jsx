import React from "react";
import {Link} from "react-router-dom";
import {connect} from "alt-react";
import SettingsStore from "stores/SettingsStore";
import Translate from "react-translate-component";
import LogsActions from "actions/LogsActions";
import {Route, Redirect} from "react-router-dom";

const light = require("assets/logo-404-light.png");
const dark = require("assets/logo-404-dark.png");
const midnight = require("assets/logo-404-midnight.png");

class Page500 extends React.Component {
    static defaultProps = {
        subtitle: "page_not_found_subtitle"
    };

    constructor(props) {
        super(props);
        this.state = this.getInitialState(props);
    }

    componentWillMount() {
        this.getLogs();
    }
    componentDidCatch(error) {
        this.setState({errorModule: true});
    }
    onError() {
        this.setState({errorModule: false});
    }

    render() {
        const {state} = this;

        let logo;

        if (this.props.theme === "lightTheme") {
            logo = light;
        }

        if (this.props.theme === "darkTheme") {
            logo = dark;
        }

        if (this.props.theme === "midnightTheme") {
            logo = midnight;
        }
        const content = () => {
            return (
                <div
                    style={{
                        backgroundColor: !this.props.theme ? "#2a2a2a" : null
                    }}
                    className={this.props.theme}
                >
                    <div id="content-wrapper">
                        <div className="grid-frame vertical">
                            <div className="page-404">
                                <div className="page-404-container-big">
                                    <div className="page-404-logo">
                                        <img src={logo} alt="Logo" />
                                    </div>
                                    <div className="page-404-title">
                                        <Translate content="page500.page_not_found_title" />
                                    </div>
                                    <div className="page-404-subtitle">
                                        <Translate
                                            content={
                                                "page500." + this.props.subtitle
                                            }
                                        />
                                    </div>
                                    <div className="page-404-button-back">
                                        <Link to={"/"} onClick={this.onError}>
                                            <Translate
                                                component="button"
                                                className="button"
                                                content="page500.home"
                                            />
                                        </Link>
                                    </div>
                                    <div
                                        style={{
                                            marginBottom: 10
                                        }}
                                    >
                                        <div className="no-margin no-padding">
                                            <div
                                                className="small-6"
                                                style={{
                                                    display: "inline-block",
                                                    marginTop: 10
                                                }}
                                            >
                                                <div
                                                    className="button primary"
                                                    onClick={this.hundleLogs}
                                                >
                                                    <Translate
                                                        content={
                                                            state.showLogs
                                                                ? "page500.hideLogs"
                                                                : "page500.showLogs"
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {state.showLogs && (
                                        <div
                                            className="content-block transfer-input"
                                            style={{
                                                marginBottom: 10
                                            }}
                                        >
                                            <textarea
                                                id="logsText"
                                                style={{marginBottom: 0}}
                                                rows="10"
                                                value={state.memo}
                                                onChange={this.onMemoChanged}
                                            />
                                            <p>
                                                <Translate content="modal.report.copySuccess" />
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        return this.state.errorModule ? (
            <div>
                <Redirect to="/error" />
                <Route exact path="/error" component={content} />
            </div>
        ) : (
            this.props.children
        );
    }

    getInitialState = () => {
        return {
            showLogs: false,
            memo: "",
            errorModule: false
        };
    };

    onMemoChanged = e => {
        this.setState({memo: e.target.value});
    };

    getLogs = () => {
        LogsActions.getLogs().then(data => {
            LogsActions.convertToText(data).then(text => {
                this.setState({
                    memo: text
                });
            });
        });
    };

    hundleLogs = () => {
        const {state} = this;

        this.setState(
            {
                showLogs: !state.showLogs
            },
            () => {
                if (!state.showLogs) {
                    setTimeout(() => {
                        this.copyLogs();
                    }, 1000);
                }
            }
        );
    };

    copyLogs = () => {
        const copyText = document.getElementById("logsText");
        copyText.select();
        document.execCommand("copy");
    };
}

export default (Page500 = connect(
    Page500,
    {
        listenTo() {
            return [SettingsStore];
        },
        getProps() {
            return {
                theme: SettingsStore.getState().settings.get("themes")
            };
        }
    }
));
