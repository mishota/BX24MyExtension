import React from "react";
import AppAsyncSelect from './appAsyncSelect';
import { Rest } from '../../rest';
import User from '../../models/user';

export default class UserSelect extends React.Component {
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
                name: ['user.search', { ACTIVE: 'Y', FIND: inputValue }],
                email: ['user.search', { ACTIVE: 'Y', EMAIL: `%${inputValue}%` }]
            };

            Rest.callBatch(batchData, (result) => {
                Object.keys(result).forEach((key) => {
                    if (result[key].error()) {
                        return;
                    }
                    result[key].data().forEach((item) => {
                        const entity = new User(item);
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