import React from "react";
import AppAsyncSelect from './appAsyncSelect';
import { Rest } from '../../rest';
import User from '../../models/user';
import Deal from "../../models/deal";

class DealSelect extends React.Component {
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

            if (!inputValue || inputValue.lenght < 1) {
                _.setState({
                    loading: false
                });
                callback([]);
                return;
            }

            const arItems = [];
            const rd = {
                filter: {
                    '%TITLE': inputValue
                }
            };

            Rest.callMethod('crm.deal.list', rd).then((entities) => {
                entities.items.forEach((item) => {
                    const entity = new Deal(item);
                    arItems.push({
                        value: entity.Id,
                        label: entity.Name,
                        object: entity
                    });
                    _.setState({
                        loading: false
                    });
                    callback(arItems);
                });
            }).catch((err) => {
                callback([]);
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

export default DealSelect;