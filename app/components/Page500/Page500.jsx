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
    state = {
        showLogs: false,
        logs: "",
        errorModule: false
    };

    static defaultProps = {
        subtitle: "page_not_found_subtitle"
    };

    componentDidUpdate(prevProps, prevState) {
        if (
            this.props.isErrorCaught !== prevState.errorModule &&
            !this.state.logs
        ) {
            this.getLogs();
        }
    }

    clearErrors = () => {
        this.setState(
            {errorModule: false, logs: ""},
            this.props.clearCaughtError
        );
    };

    getLogs = () => {
        LogsActions.getLogs().then(data => {
            this.setState({
                logs: data.join("\n"),
                errorModule: true
            });
        });
    };

    toggleLogs = () => {
        const {showLogs} = this.state;

        this.setState(
            {
                showLogs: !showLogs
            },
            () => {
                if (!showLogs) {
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

    render() {
        const {showLogs, logs, errorModule} = this.state;
        const {theme, children} = this.props;

        let logo;

        switch (theme) {
            case "darkTheme":
                logo = dark;
                break;
            case "lightTheme":
                logo = light;
                break;
            case "midnightTheme":
                logo = midnight;
                break;
            default:
                logo = dark;
        }

        const content = () => {
            return (
                <div
                    style={{
                        backgroundColor: !theme ? "#2a2a2a" : null
                    }}
                    className={theme}
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
                                        <Link
                                            to={"/"}
                                            onClick={this.clearErrors}
                                        >
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
                                                    onClick={this.toggleLogs}
                                                >
                                                    <Translate
                                                        content={
                                                            showLogs
                                                                ? "page500.hideLogs"
                                                                : "page500.showLogs"
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {showLogs && (
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
                                                value={logs}
                                                readOnly
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
        return errorModule ? (
            <div>
                {window.location.pathname !== "/error" && (
                    <Redirect to="/error" />
                )}
                <Route exact path="/error" component={content} />
            </div>
        ) : (
            children
        );
    }
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
