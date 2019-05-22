import React from "react";
import Translate from "react-translate-component";
import AccountSelector from "../Account/AccountSelector";
import AccountActions from "actions/AccountActions";
import counterpart from "counterpart";
import {Modal, Button, Input, Select, Form} from "bitshares-ui-style-guide";
import Icon from "../Icon/Icon";
import {PublicKey} from "bitsharesjs";

class JoinWitnessesModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState(props);
    }

    getInitialState(props) {
        return {
            witnessAccount: props.account,
            urlSchema: "Https://",
            memo_key: props.account.get("options").get("memo_key")
        };
    }

    shouldComponentUpdate(np, ns) {
        return (
            this.props.show !== np.show ||
            this.state.memo_key !== ns.memo_key ||
            this.state.witnessAccount !== ns.witnessAccount
        );
    }

    onAddWitness() {
        const {witness_modal_input = ""} = this.refs;
        const {witnessAccount, urlSchema, memo_key} = this.state;

        if (witnessAccount && witness_modal_input) {
            let url = urlSchema + witness_modal_input.state.value;
            url = url.toLowerCase();
            AccountActions.createWitness({
                account: witnessAccount,
                url,
                memo_key
            });
        }
        this.props.showModal();
        this.setState(
            this.getInitialState(this.props),
            (this.refs.witness_modal_input.state.value = "")
        );
    }

    onChangeCommittee(account) {
        this.setState({
            witnessAccount: account
        });
    }

    onMemoKeyChanged(e) {
        this.setState({
            memo_key: e.target.value
        });
    }

    isValidPubKey = value => {
        return !PublicKey.fromPublicKeyString(value);
    };

    onClose() {
        this.setState(
            this.getInitialState(this.props),
            this.props.showModal(),
            (this.refs.witness_modal_input.state.value = "")
        );
    }

    render() {
        const {urlSchema, witnessAccount, memo_key} = this.state;

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
                title={counterpart.translate("modal.witness.create_witness")}
                closable={false}
                visible={this.props.show}
                footer={[
                    <Button
                        key="submit"
                        type="primary"
                        onClick={this.onAddWitness.bind(this)}
                    >
                        {counterpart.translate("modal.witness.confirm")}
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
                        label="modal.witness.from"
                        accountName={
                            (witnessAccount && witnessAccount.get("name")) ||
                            account.get("name")
                        }
                        account={witnessAccount}
                        onAccountChanged={this.onChangeCommittee.bind(this)}
                        size={35}
                        typeahead={true}
                    />
                    <Translate
                        content="modal.witness.text"
                        unsafe
                        component="p"
                    />
                    <div className="ant-divider ant-divider-horizontal" />
                    <Form.Item
                        label={counterpart.translate("modal.witness.url")}
                    >
                        <Input
                            addonBefore={selectBefore}
                            ref="witness_modal_input"
                            placeholder={counterpart.translate(
                                "modal.witness.web_example"
                            )}
                        />
                    </Form.Item>
                    <Form.Item
                        label={counterpart.translate(
                            "modal.witness.public_key_memo"
                        )}
                    >
                        {this.isValidPubKey(memo_key) ? (
                            <label
                                className="right-label"
                                style={{
                                    marginTop: "-30px",
                                    position: "static"
                                }}
                            >
                                <Translate content="modal.witness.invalid_key" />
                            </label>
                        ) : null}

                        <Input
                            addonBefore={
                                <Icon name="key" title="icons.key" size="1x" />
                            }
                            value={memo_key}
                            onChange={this.onMemoKeyChanged.bind(this)}
                            placeholder={counterpart.translate(
                                "modal.witness.public_key"
                            )}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

export default JoinWitnessesModal;
