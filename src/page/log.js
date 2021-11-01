import React from 'react';
import Filter from '../component/filter/filter';
import FilterItem from '../component/filter/filterItem';
import FilterType from '../component/filter/filterType';
import LogTable from '../component/table/logTable';

export default class LogPage extends React.Component {
    constructor() {
        super();
        this.filterItems = [
            new FilterItem(FilterType.Hidden, 'id', 'field-id', { Typing: 'Y', PREFIX: 'Y' }),
            new FilterItem(FilterType.UserSelect, 'property_user', 'field-responsible', { Default: 'Y' }),
            new FilterItem(FilterType.DateRange, 'property_date', 'field-date', { NUMBER: 'Y' })
        ];

        this.table = React.createRef();
        this.filter = React.createRef();
    }

    refreshTable = () => {
        if (this.table && this.table.current) {
            this.table.current.tryLoadData();
        }
    }

    render() {
        return (
            <div>
                <div className="d-xl-flex mb-3 mt-3">
                    <Filter ref={this.filter} id={'filter-log'} items={this.filterItems} refreshTable={this.refreshTable} />
                </div>
                <LogTable ref={this.table} filter={this.filter} />
            </div>
        );
    }
}