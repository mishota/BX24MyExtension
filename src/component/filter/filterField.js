import React from "react";
import { MDBInput } from "mdb-react-ui-kit";
import { Trans } from 'react-i18next';
import i18next from "i18next";
import Select from 'react-select';
import FilterType from './filterType';
import { FilterFieldContext } from './filterFieldContext';
import FilterRangeType from './filterRangeType';
import UserSelect from '../select/user';
import DealSelect from "../select/deal";
import ContactSelect from "../select/contact";

class FilterField extends React.Component {
    static contextType = FilterFieldContext;

    render() {
        return (
            <div className="">
                {this.context.filterItem.Type === FilterType.Text &&
                    <FilterFieldText />
                }
                {this.context.filterItem.Type === FilterType.NumberRange &&
                    <FilterFieldNumberRange />
                }
                {this.context.filterItem.Type === FilterType.DateRange &&
                    <FilterFieldDateRange />
                }
                {this.context.filterItem.Type === FilterType.Select &&
                    <FilterFieldSelect />
                }
                {this.context.filterItem.Type === FilterType.UserSelect &&
                    <FilterFieldUserSelect />
                }
                {this.context.filterItem.Type === FilterType.DealSelect &&
                    <FilterFieldDealSelect />
                }
                {this.context.filterItem.Type === FilterType.ContactSelect &&
                    <FilterFieldContactSelect />
                }
            </div>
        );
    }
}

class FilterFieldText extends React.Component {
    static contextType = FilterFieldContext;

    constructor(props) {
        super();
        this.state = {
            value: [],
            description: []
        };
    }

    componentDidMount() {
        const objValue = this.context.value;
        this.setState({
            value: objValue && objValue.value ? objValue.value : []
        });
    }

    onChange() {
        const result = { ...this.state };
        this.context.onChange(result, this.context.filterItem);
    }

    onChangeValue = (e) => {
        const value = [];
        const description = [];

        if (e.target.value && e.target.value.length > 0) {
            value.push(e.target.value);
            description.push(e.target.value);
        }
        this.setState({
            value: value,
            description: description
        }, this.onChange);
    }

    render() {
        const _ = this;
        const filterItem = this.context.filterItem;
        const hasValue = this.state.value.length > 0;
        return (
            <div className="md-form md-outline m-0">
                <input type="text" className="form-control mb-0" value={this.state.value.length > 0 ? this.state.value[0] : ''} onChange={this.onChangeValue} />
                <label className={hasValue ? 'active' : ''} data-l10n-id={filterItem.Title}></label>
            </div>
        );
    }
}

class FilterFieldNumberRange extends React.Component {
    static contextType = FilterFieldContext;

    constructor(props) {
        super();
        this.state = {
            type: '',
            from: false,
            to: false,
            value: false,
            description: []
        };
    }

    componentDidMount() {
        const objValue = this.context.value;
        this.dataParam = this.context.filterItem.DataParams ? this.context.filterItem.DataParams.join(' ') : '';
        this.setState({
            type: objValue && objValue.type ? objValue.type : FilterRangeType.Range,
            from: objValue && objValue.from !== false ? objValue.from : false,
            to: objValue && objValue.to !== false ? objValue.to : false,
            value: objValue && objValue.value !== false ? objValue.value : false,
            period: objValue && objValue.period ? objValue.period : false
        });
    }

    onChange() {
        const result = { ...this.state };

        if (result.type === FilterRangeType.Range) {
            result.value = false;
            result.period = false;
            if (result.from && result.to) {
                result.description = [`${result.from} - ${result.to}`];
            }
            else {
                if (result.from) {
                    result.description = [`> ${result.from}`];
                }
                if (result.to) {
                    result.description = [`< ${result.to}`];
                }
            }
        }

        if (result.type !== FilterRangeType.Range) {
            result.from = false;
            result.to = false;
            result.period = false;
            if (result.value) {
                switch (result.type) {
                    case FilterRangeType.GreaterThan:
                        result.description = [`> ${result.value}`];
                        break;
                    case FilterRangeType.LessThan:
                        result.description = [`< ${result.value}`];
                        break;
                    default:
                        result.description = [`${result.value}`];
                        break;
                }
            }
        }
        this.context.onChange(result, this.context.filterItem);
    }

    onChangeType = (e) => {
        this.setState({
            type: e.target.value
        }, this.onChange);
    }

    onChangeFrom = (e) => {
        this.setState({
            from: e.target.value ? e.target.value : false
        }, this.onChange);
    }

    onChangeTo = (e) => {
        this.setState({
            to: e.target.value ? e.target.value : false
        }, this.onChange);
    }

    onChangeValue = (e) => {
        this.setState({
            value: e.target.value ? e.target.value : false
        }, this.onChange);
    }

    onChangePeriod = (e) => {
        let value = '';
        const description = [];
        Array.from(e.target.selectedOptions, option => {
            if (option.value && option.value.length > 0) {
                value = option.value;
                description.push(option.text);
            }
        });
        this.setState({
            period: value && value.length > 0 ? value : false,
            description: description
        }, this.onChange);
    }

    render() {
        const filterItem = this.context.filterItem;
        return (
            <div className="md-form md-outline m-0 filter-range">
                <label className="active" data-l10n-id={filterItem.Title}></label>
                <div className="form-row">
                    <div className="col-7 col-xl-4 mb-2 mb-xl-0">
                        <select className="browser-default custom-select" value={this.state.type} onChange={this.onChangeType}>
                            {FilterRangeType.Items().map((item) => (
                                <option key={item.id} value={item.id} data-l10n-id={item.name}></option>
                            ))}
                        </select>
                    </div>
                    {this.state.type === FilterRangeType.Range &&
                        <React.Fragment>
                            <div className="col-6 col-xl-4 mt-2 mt-xl-0">
                                <div className="from">
                                    <input type="number" className="form-control mb-0" name={`${filterItem.Name}_from`} id={`f-${filterItem.Name}-from`} onChange={this.onChangeFrom} value={`${this.state.from !== false ? this.state.from : ''}`} {...this.dataParam} />
                                    <label className={this.state.from ? 'active' : ''} htmlFor={`f-${filterItem.Name}-from`} data-l10n-id="main-from"></label>
                                </div>
                            </div>
                            <div className="col-6 col-xl-4 mt-2 mt-xl-0">
                                <div className="to">
                                    <input type="number" className="form-control mb-0" name={`${filterItem.Name}_to`} id={`f-${filterItem.Name}-to`} onChange={this.onChangeTo} value={`${this.state.to !== false ? this.state.to : ''}`} {...this.dataParam} />
                                    <label className={this.state.to ? 'active' : ''} htmlFor={`f-${filterItem.Name}-to`} data-l10n-id="main-to"></label>
                                </div>
                            </div>
                        </React.Fragment>
                    }
                    {this.state.type !== FilterRangeType.Range &&
                        <div className="col-12 col-xl-8 mt-2 mt-xl-0">
                            <input type="number" className="form-control mb-0" name={filterItem.Name} id={`f-${filterItem.Name}`} onChange={this.onChangeValue} value={`${this.state.value !== false ? this.state.value : ''}`} {...this.dataParam} />
                        </div>
                    }
                </div>
            </div>
        );
    }
}

class FilterFieldDateRange extends React.Component {
    static contextType = FilterFieldContext;

    constructor(props) {
        super();
        this.state = {
            type: '',
            from: false,
            to: false,
            value: false,
            description: []
        };

        this.typeOptions = [];
        FilterRangeType.DateItems().forEach((item) => {
            this.typeOptions.push({
                value: item.id,
                label: i18next.t(item.name)
            });
        });

        this.periodOptions = [];
        FilterRangeType.PeriodItems().forEach((item) => {
            this.periodOptions.push({
                value: item.id,
                label: i18next.t(item.name)
            });
        });
    }

    componentDidMount() {
        const objValue = this.context.value;
        this.dataParam = this.context.filterItem.DataParams ? this.context.filterItem.DataParams.join(' ') : '';
        const type = objValue && objValue.type ? objValue.type : FilterRangeType.Range;
        const period = objValue && objValue.period ? objValue.period : FilterRangeType.Today;
        this.setState({
            type: this.typeOptions.find(x => x.value === type),
            from: objValue && objValue.from ? objValue.from : false,
            to: objValue && objValue.to ? objValue.to : false,
            value: objValue && objValue.value ? objValue.value : false,
            period: this.periodOptions.find(x => x.value === period),
        });
    }

    onChange() {
        const result = { ...this.state };

        result.type = result.type.value;

        if (result.type === FilterRangeType.Range) {
            result.value = false;
            result.period = false;
            if (result.from && result.to) {
                result.description = [`${new Date(result.from).toLocaleDateString(this.context.language)} - ${new Date(result.to).toLocaleDateString(this.context.language)}`];
            }
            else {
                if (result.from) {
                    result.description = [`> ${new Date(result.from).toLocaleDateString(this.context.language)}`];
                }
                if (result.to) {
                    result.description = [`< ${new Date(result.to).toLocaleDateString(this.context.language)}`];
                }
            }
        }
        if (result.type === FilterRangeType.Period) {
            result.value = false;
            result.from = false;
            result.to = false;
            if (result.period) {
                result.description = [result.period.label];
                result.period = result.period.value;
            }
        }
        if (result.type !== FilterRangeType.Range && result.type !== FilterRangeType.Period) {
            result.from = false;
            result.to = false;
            result.period = false;
            if (result.value) {
                switch (result.type) {
                    case FilterRangeType.GreaterThan:
                        result.description = [`> ${new Date(result.value).toLocaleDateString(this.context.language)}`];
                        break;
                    case FilterRangeType.LessThan:
                        result.description = [`< ${new Date(result.value).toLocaleDateString(this.context.language)}`];
                        break;
                    default:
                        result.description = [`${new Date(result.value).toLocaleDateString(this.context.language)}`];
                        break;
                }
            }
        }
        this.context.onChange(result, this.context.filterItem);
    }

    onChangeType = (selected) => {
        this.setState({
            type: selected
        }, this.onChange);
    }

    onChangeFrom = (e) => {
        this.setState({
            from: e.target.value ? e.target.value : false
        }, this.onChange);
    }

    onChangeTo = (e) => {
        this.setState({
            to: e.target.value ? e.target.value : false
        }, this.onChange);
    }

    onChangeValue = (e) => {
        this.setState({
            value: e.target.value ? e.target.value : false
        }, this.onChange);
    }

    onChangePeriod = (selected) => {
        this.setState({
            period: selected
        }, this.onChange);
    }

    render() {
        const filterItem = this.context.filterItem;//label={i18next.t('main-from')} label={i18next.t('main-to')}
        return (
            <div className="filter-range">
                <label className="active"><Trans>{filterItem.Title}</Trans></label>
                <div className="row">
                    <div className="col-7 col-xl-4">
                        <Select value={this.state.type} onChange={this.onChangeType} options={this.typeOptions} />
                    </div>
                    {this.state.type.value === FilterRangeType.Range &&
                        <>
                            <div className="col-6 col-xl-4 mt-2 mt-xl-0">
                                <MDBInput type="date" max="2100-01-01" onChange={this.onChangeFrom} value={`${this.state.from !== false ? new Date(this.state.from).toISOString().slice(0, 10) : ''}`} {...this.dataParam} placeholder={i18next.t('filter-field-input-date-placeholder')} />
                            </div>
                            <div className="col-6 col-xl-4 mt-2 mt-xl-0">
                                <MDBInput type="date" max="2100-01-01" onChange={this.onChangeTo} value={`${this.state.to !== false ? new Date(this.state.to).toISOString().slice(0, 10) : ''}`} {...this.dataParam} placeholder={i18next.t('filter-field-input-date-placeholder')} />
                            </div>
                        </>
                    }
                    {this.state.type.value === FilterRangeType.Period &&
                        <div className="col-12 col-xl-8 mt-2 mt-xl-0">
                            <div className="form-outline">
                                <Select value={this.state.period} onChange={this.onChangePeriod} options={this.periodOptions} />
                                <label className={`select-label ${this.state.period ? 'active' : ''}`}><Trans>filter-range-type-period</Trans></label>
                            </div>
                        </div>
                    }
                    {this.state.type.value !== FilterRangeType.Range && this.state.type.value !== FilterRangeType.Period &&
                        <div className="col-12 col-xl-8 mt-2 mt-xl-0">
                            <MDBInput type="date" name={filterItem.Name} id={`f-${filterItem.Name}`} max="2100-01-01" onChange={this.onChangeValue} value={`${this.state.value !== false ? new Date(this.state.value).toISOString().slice(0, 10) : ''}`} {...this.dataParam} placeholder={i18next.t('filter-field-input-date-placeholder')} />
                        </div>
                    }
                </div>
            </div>
        );
    }
}

class FilterFieldSelect extends React.Component {
    static contextType = FilterFieldContext;

    constructor(props) {
        super();
        this.state = {
            value: [],
            description: []
        };
    }

    componentDidMount() {
        const objValue = this.context.value;
        this.setState({
            value: objValue && objValue.value ? objValue.value : []
        });
    }

    onChange() {
        const result = { ...this.state };
        this.context.onChange(result, this.context.filterItem);
    }

    onChangeValue = (e) => {
        const value = [];
        const description = [];

        Array.from(e.target.selectedOptions, option => {
            if (option.value && option.value.length > 0) {
                value.push(option.value);
                description.push(option.text);
            }
        });
        this.setState({
            value: value,
            description: description
        }, this.onChange);
    }

    render() {
        const _ = this;
        const filterItem = this.context.filterItem;
        const hasValue = (filterItem.Multiple === 'Y' && this.state.value.length > 0) || (filterItem.Multiple !== 'Y' && this.state.value.length > 0);
        return (
            <div className="md-form md-outline m-0">
                <label className={hasValue ? 'active' : ''} data-l10n-id={filterItem.Title}></label>
                <select className="browser-default custom-select" value={filterItem.Multiple === 'Y' ? this.state.value : (this.state.value.length < 1 ? '' : this.state.value[0])} onChange={this.onChangeValue} multiple={filterItem.Multiple === 'Y'}>
                    {filterItem.Items.map((item) => (
                        <option key={item.id} value={item.id} data-l10n-id={item.name}></option>
                    ))}
                </select>
            </div>
        );
    }
}

class FilterFieldUserSelect extends React.Component {
    static contextType = FilterFieldContext;

    constructor(props) {
        super();
        this.state = {
            value: [],
            description: [],
            loaded: false
        };
    }

    componentDidMount() {
        const objValue = this.context.value;
        this.setState({
            value: objValue && objValue.value ? objValue.value : [],
            description: objValue && objValue.description ? objValue.description : [],
            loaded: true
        });
    }

    onChange() {
        const result = { ...this.state };
        this.context.onChange(result, this.context.filterItem);
    }

    onChangeValue = (e) => {
        const value = [];
        const description = [];

        if (e) {
            value.push(e.value);
            description.push(e.label);
        }
        this.setState({
            value: value,
            description: description
        }, this.onChange);
    }

    render() {
        const filterItem = this.context.filterItem;
        const val = this.state.value.length > 0 ? {
            value: this.state.value[0],
            label: this.state.description.length > 0 ? this.state.description[0] : '',
        } : false;
        return (
            <div className="form-outline m-0">
                {this.state.loaded &&
                    <UserSelect title={filterItem.Title} value={val} onChange={this.onChangeValue} />
                }
            </div>
        );
    }
}

class FilterFieldDealSelect extends React.Component {
    static contextType = FilterFieldContext;

    constructor(props) {
        super();
        this.state = {
            value: [],
            description: [],
            loaded: false
        };
    }

    componentDidMount() {
        const objValue = this.context.value;
        this.setState({
            value: objValue && objValue.value ? objValue.value : [],
            description: objValue && objValue.description ? objValue.description : [],
            loaded: true
        });
    }

    onChange() {
        const result = { ...this.state };
        this.context.onChange(result, this.context.filterItem);
    }

    onChangeValue = (e) => {
        const value = [];
        const description = [];

        if (e) {
            value.push(e.value);
            description.push(e.label);
        }
        this.setState({
            value: value,
            description: description
        }, this.onChange);
    }

    render() {
        const filterItem = this.context.filterItem;
        const val = this.state.value.length > 0 ? {
            value: this.state.value[0],
            label: this.state.description.length > 0 ? this.state.description[0] : '',
        } : false;
        return (
            <div className="form-outline m-0">
                {this.state.loaded &&
                    <DealSelect title={filterItem.Title} value={val} onChange={this.onChangeValue} />
                }
            </div>
        );
    }
}

class FilterFieldContactSelect extends React.Component {
    static contextType = FilterFieldContext;

    constructor(props) {
        super();
        this.state = {
            value: [],
            description: [],
            loaded: false
        };
    }

    componentDidMount() {
        const objValue = this.context.value;
        this.setState({
            value: objValue && objValue.value ? objValue.value : [],
            description: objValue && objValue.description ? objValue.description : [],
            loaded: true
        });
    }

    onChange() {
        const result = { ...this.state };
        this.context.onChange(result, this.context.filterItem);
    }

    onChangeValue = (e) => {
        const value = [];
        const description = [];

        if (e) {
            value.push(e.value);
            description.push(e.label);
        }
        this.setState({
            value: value,
            description: description
        }, this.onChange);
    }

    render() {
        const filterItem = this.context.filterItem;
        const val = this.state.value.length > 0 ? {
            value: this.state.value[0],
            label: this.state.description.length > 0 ? this.state.description[0] : '',
        } : false;
        return (
            <div className="form-outline m-0">
                {this.state.loaded &&
                    <ContactSelect title={filterItem.Title} value={val} onChange={this.onChangeValue} />
                }
            </div>
        );
    }
}
/*
class FilterFieldBooleanSelect extends React.Component {
    static contextType = FilterFieldContext;

    constructor(props) {
        super();
        this.state = {
            value: [],
            description: []
        };
    }

    componentDidMount() {
        const objValue = this.context.value;
        this.setState({
            value: objValue && objValue.value ? objValue.value : []
        });
    }

    onChange() {
        const result = {...this.state };
        this.context.onChange(result, this.context.filterItem);
    }

    onChangeValue = (e) => {
        const value = [];
        const description = [];

        Array.from(e.target.selectedOptions, option => {
            if(option.value && option.value === 'true') {
                value.push(true);
                description.push(option.text);
            }
            if(option.value && option.value === 'false') {
                value.push(false);
                description.push(option.text);
            }
        });
        this.setState({
            value: value,
            description: description
        }, this.onChange);
    }

    render() {
        const _ = this;
        const filterItem = this.context.filterItem;
        const hasValue = this.state.value.length > 0;
        return (
            <div className="md-form md-outline m-0">
                <label className={hasValue ? 'active' : ''} data-l10n-id={filterItem.Title}></label>
                <select className="browser-default custom-select" value={this.state.value.length > 0 ? this.state.value[0] : ''} onChange={this.onChangeValue} multiple={filterItem.Multiple === 'Y'}>
                    <option></option>
                    <option value={true} data-l10n-id="main-yes"></option>
                    <option value={false} data-l10n-id="main-no"></option>
                </select>
            </div>
        );
    }
}
*/
export default FilterField;