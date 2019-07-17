import React from "react";
import SettingsStore from "stores/SettingsStore";
import IntlStore from "stores/IntlStore";
import AltContainer from "alt-container";
import Settings from "./Settings";
import AccountStore from "stores/AccountStore";

class SettingsContainer extends React.Component {
    render() {
        return (
            <AltContainer
                stores={[SettingsStore, AccountStore]}
                inject={{
                    settings: () => {
                        return SettingsStore.getState().settings;
                    },
                    viewSettings: () => {
                        return SettingsStore.getState().viewSettings;
                    },
                    defaults: () => {
                        return SettingsStore.getState().defaults;
                    },
                    localesObject: () => {
                        return IntlStore.getState().localesObject;
                    },
                    apiLatencies: () => {
                        return SettingsStore.getState().apiLatencies;
                    },
                    currentAccount: () => {
                        return AccountStore.getState().currentAccount;
                    }
                }}
            >
                <Settings {...this.props} />
            </AltContainer>
        );
    }
}

export default SettingsContainer;
