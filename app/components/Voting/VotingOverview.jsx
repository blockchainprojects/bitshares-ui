import React from "react";
import counterpart from "counterpart";
import VoteWitnesses from "./VoteWitnesses";
import {Tabs} from "bitshares-ui-style-guide";

class VotingOverview extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tabs: [
                {
                    name: "witnesses",
                    link: "/voting2/witnesses",
                    translate: "explorer.witnesses.title",
                    content: VoteWitnesses
                }
            ]
        };
    }

    render() {
        const onChange = value => {
            console.log(value);
            this.props.history.push(value);
        };

        return (
            <Tabs
                activeKey={this.props.location.pathname}
                animated={false}
                style={{display: "table", height: "100%", width: "100%"}}
                onChange={onChange}
            >
                {this.state.tabs.map(tab => {
                    const TabContent = tab.content;

                    return (
                        <Tabs.TabPane
                            key={tab.link}
                            tab={counterpart.translate(tab.translate)}
                        >
                            <div className="padding">
                                <TabContent />
                            </div>
                        </Tabs.TabPane>
                    );
                })}
            </Tabs>
        );
    }
}

export default VotingOverview;
