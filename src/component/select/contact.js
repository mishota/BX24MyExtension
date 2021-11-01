import React from "react";
import AppAsyncSelect from './appAsyncSelect';
import { Rest } from '../../rest';
import Contact from '../../models/contact';

export default class ContactSelect extends React.Component {
    constructor(props) {
        super();
        this.state = {
            loading: false
        };
        this.delay = 500;
        this.loadTimestamp = 0;
    }

    loadAction = (inputValue, callback) => {
        const _ = this;
        const now = new Date().getTime();
        _.loadTimestamp = now;
        _.setState({
            loading: true
        });
        setTimeout(() => {
            if (_.loadTimestamp !== now)
                return;

            if (!inputValue || inputValue.length < 1) {
                _.setState({
                    loading: false
                });
                callback([]);
                return;
            }

            const arItems = [];
            const batchData = {
                email: ['crm.contact.list', { filter: { EMAIL: inputValue } }],
                name: ['crm.contact.list', { filter: { '%NAME': inputValue } }],
                lastName: ['crm.contact.list', { filter: { '%LAST_NAME': inputValue } }]
            };

            Rest.callBatch(batchData, (result) => {
                Object.keys(result).forEach((key) => {
                    if (result[key].error()) {
                        return;
                    }
                    result[key].data().forEach((item) => {
                        const entity = new Contact(item);
                        if (arItems.find(x => x.value === entity.Id)) {
                            return;
                        }
                        arItems.push({
                            value: entity.Id,
                            label: entity.FullName
                        });
                    });
                });
                _.setState({
                    loading: false
                });
                callback(arItems);
            });
        }, _.delay);
    }

    render() {
        return (
            <AppAsyncSelect className="react-select" defaultOptions title={this.props.title} value={this.props.value} loadOptions={this.loadAction} onChange={this.props.onChange}
                required={this.props.required} isMulti={this.props.isMulti} isDisabled={this.props.isDisabled}
            ></AppAsyncSelect>
        );
    }
}