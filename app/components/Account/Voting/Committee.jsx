import React, {Component} from "react";
import Translate from "react-translate-component";
import JoinCommitteeModal from "../../Modal/JoinCommitteeModal";
import VotingAccountsList from "../VotingAccountsList";
import cnames from "classnames";
import {Input, Icon as AntIcon, Button} from "bitshares-ui-style-guide";

export default class Committee extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showCreateCommitteeModal: false
        };
    }

    render() {
        const showCommitteeModal = () => {
            console.log("show committee modal");
            this.setState({
                showCreateCommitteeModal: !this.state.showCreateCommitteeModal
            });
        };

        const onFilterChange = this.props.onFilterChange;
        const validateAccountHandler = this.props.validateAccountHandler;
        const addCommitteeHandler = this.props.addCommitteeHandler;
        const removeCommitteeHandler = this.props.removeCommitteeHandler;

        const {showCreateCommitteeModal} = this.state;
        const {
            all_committee,
            proxy_committee,
            committee,
            proxy_account_id,
            hasProxy,
            globalObject,
            filterSearch,
            account
        } = this.props;
        return (
            <div>
                <div className="header-selector">
                    <div style={{float: "right"}}>
                        <Button
                            style={{marginRight: "5px"}}
                            onClick={showCommitteeModal}
                        >
                            <Translate content="account.votes.join_committee" />
                        </Button>
                    </div>

                    <div className="selector inline-block">
                        <Input
                            placeholder={"Filter..."}
                            value={filterSearch}
                            style={{width: "220px"}}
                            onChange={onFilterChange}
                            addonAfter={<AntIcon type="search" />}
                        />
                    </div>
                </div>
                <div className={cnames("content-block")}>
                    <VotingAccountsList
                        type="committee"
                        label="account.votes.add_committee_label"
                        items={all_committee}
                        validateAccount={validateAccountHandler}
                        onAddItem={addCommitteeHandler}
                        onRemoveItem={removeCommitteeHandler}
                        tabIndex={hasProxy ? -1 : 3}
                        supported={hasProxy ? proxy_committee : committee}
                        withSelector={false}
                        active={globalObject.get("active_committee_members")}
                        proxy={proxy_account_id}
                        filterSearch={filterSearch}
                    />
                </div>
                <JoinCommitteeModal
                    visible={showCreateCommitteeModal}
                    account={account}
                    hideModal={showCommitteeModal}
                />
            </div>
        );
    }
}