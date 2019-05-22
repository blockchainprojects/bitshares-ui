import React from "react";
import Translate from "react-translate-component";
import AccountSelector from "../Account/AccountSelector";
import AccountActions from "actions/AccountActions";
import counterpart from "counterpart";
import {Modal, Button, Input, Select, Form} from "bitshares-ui-style-guide";

class JoinCommitteeModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState(props);
    }

    getInitialState() {
        return {
            committeeAccount: this.props.account,
            urlSchema: "Https://"
        };
    }

    shouldComponentUpdate(np, ns) {
        return (
            this.props.show !== np.show ||
            this.state.committeeAccount !== ns.committeeAccount
        );
    }

    onAddComittee() {
        const {committee_modal_input} = this.refs;
        const {committeeAccount, urlSchema} = this.state;

        if (committeeAccount && committee_modal_input) {
            let url = urlSchema + committee_modal_input.state.value;
            url = url.toLowerCase();
            AccountActions.createCommittee({account: committeeAccount, url});
        }
        this.showModal();
        this.setState(
            this.getInitialState(this.props),
            (this.refs.committee_modal_input.state.value = "")
        );
    }

    onChangeCommittee(account) {
        this.setState({
            committeeAccount: account
        });
    }

    onClose() {
        this.setState(
            this.getInitialState(this.props),
            this.props.showModal(),
            (this.refs.committee_modal_input.state.value = "")
        );
    }

    render() {
        const {urlSchema, committeeAccount} = this.state;
        const selectBefore = (
            <Select
                defaultValue={urlSchema}
                style={{width: 100}}
                onChange={value => this.setState({urlSchema: value})}
            >
                <Select.Option value="Http://">Http://</Select.Option>
                <Select.Option value="Https://">Https://</Select.Option>
            </Select>
        );

        return (
            <Modal
                title={counterpart.translate(
                    "modal.committee.create_committee"
                )}
                closable={false}
                visible={this.props.show}
                footer={[
                    <Button
                        key="submit"
                        type="primary"
                        onClick={this.onAddComittee.bind(this)}
                    >
                        {counterpart.translate("modal.committee.confirm")}
                    </Button>,
                    <Button
                        key="cancel"
                        style={{marginLeft: "8px"}}
                        onClick={this.onClose.bind(this)}
                    >
                        {counterpart.translate("modal.cancel")}
                    </Button>
                ]}
            >
                <Form className="full-width" layout="vertical">
                    <AccountSelector
                        label="modal.committee.from"
                        accountName={
                            (committeeAccount &&
                                committeeAccount.get("name")) ||
                            account.get("name")
                        }
                        account={committeeAccount || account}
                        onAccountChanged={this.onChangeCommittee.bind(this)}
                        size={35}
                        typeahead={true}
                    />
                    <Translate
                        content="modal.committee.text"
                        unsafe
                        component="p"
                    />
                    <div className="ant-divider ant-divider-horizontal" />
                    <Form.Item
                        label={counterpart.translate("modal.committee.url")}
                    >
                        <Input
                            addonBefore={selectBefore}
                            ref="committee_modal_input"
                            placeholder={counterpart.translate(
                                "modal.committee.web_example"
                            )}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

export default JoinCommitteeModal;
