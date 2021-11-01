import React from "react";
import { Trans } from 'react-i18next';
import i18next from 'i18next';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import Moment from 'moment';
import FilterField from './filterField';
import FilterDefaults from './filterDefaults';
import FilterType from './filterType';
import { AppContext } from '../../context/app.context';
import { FilterFieldContext } from './filterFieldContext';
import FilterRangeType from './filterRangeType';
import Utils from '../../utils';
import { DataStorage } from '../../enum/dataStorage';
import { Rest } from "../../rest";

class Filter extends React.Component {
    static contextType = AppContext;

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            loadedFilters: {},
            requestParams: [],
            editMode: false,
            showFieldsVisibility: false,
            currentFilterId: '',
            editFilter: false,
            editFilterName: '',
            filterSorting: false
        };
        this.findTimestamp = 0;
        this.findDelay = 700;
        this.filterContainer = React.createRef();
        this.inputText = React.createRef();
        const typingIndex = props.items.findIndex(x => x.Typing === 'Y');
        if (typingIndex > -1) {
            this.TypingFilterItem = props.items[typingIndex];
        }
    }

    componentDidMount() {
        const _ = this;
        _.loadFilters(function () {
            _.loadStateParams();
        });
    }

    getFilterItemByName = (name) => {
        const index = this.props.items.findIndex(x => x.Name === name);
        if (index < 0)
            return false;
        return this.props.items[index];
    }

    loadFilters(callback, loadDefault) {
        const _ = this;
        _.loadFiltersRequest(function (entities, sorting) {
            if (entities.length < 1 && !loadDefault) {
                new FilterDefaults().get(_.props.id, function () {
                    _.loadFilters(callback, true);
                });
                return;
            }
            _.loadFiltersEndAction(entities, sorting, callback);
        }, function () {
            _.loadFiltersEndAction([], [], callback);
        });
    }

    loadFiltersRequest(resolve, reject) {
        const _ = this;
        var items = [];
        const rd = {
            ENTITY: DataStorage.filter,
            FILTER: {
                PROPERTY_TABLE: _.props.id,
                PROPERTY_USER: _.context.getCurrentUser().Id
            }
        };
        Rest.callMethod('entity.item.get', rd, true).then(data => {
            items = data.items.map(x => new FilterModel(x));
            _.loadFiltersSorting(function (sorting) {
                resolve(items, sorting);
            });
        }).catch(err => {
            const error = err.ex ? err.ex : err;
            console.error('error-get-filters', error);
            reject();
        });

        /*$.get(`/filter/list/${this.props.id}`, (result) => {
            const items = [];
            if (result.items && Array.isArray(result.items)) {
                result.items.forEach((item) => {
                    items.push({ ...item, data: JSON.parse(item.data) });
                });
            }
            const sorting = result.sorting && Array.isArray(result.sorting) ? result.sorting : [];
            resolve(items, sorting);
        }).fail((err) => {
            console.error('load filter error', err);
            reject();
        });*/
    }

    loadFiltersSorting(callback) {
        const _ = this;
        const sorting = [];
        const rd = {
            ENTITY: DataStorage.filterSort,
            FILTER: {
                PROPERTY_TABLE: _.props.id,
                PROPERTY_USER: _.context.getCurrentUser().Id
            }
        };

        Rest.callMethod('entity.item.get', rd, true).then(data => {
            if (data.items.length < 1) {
                callback(sorting);
                return;
            }
            callback(Utils.tryParseJson(data.items[0].PROPERTY_VALUES.DATA) || []);
        }).catch(err => {
            const error = err.ex ? err.ex : err;
            console.error('error-get-filters-sort', error);
            callback(sorting);
        });
    }

    loadFiltersEndAction(entities, sorting, callback) {
        const _ = this;
        const ids = [];
        const result = [];
        sorting.forEach(function (id) {
            const item = entities.find(x => x.id === id);
            if (item) {
                ids.push(item.id);
                result.push(item);
            }
        });
        entities.filter(x => !ids.includes(x.id)).forEach(function (item) {
            result.push(item);
            ids.push(item.id);
        });
        const loadedFilters = {};
        result.forEach(function (item) {
            loadedFilters[item.id] = item;
        });
        this.setState({
            loadedFilters: loadedFilters,
            filterSorting: ids
        }, callback);
    }

    saveSortingRequest = () => {
        const _ = this;
        const rd = {
            ENTITY: DataStorage.filterSort,
            FILTER: {
                PROPERTY_TABLE: _.props.id,
                PROPERTY_USER: _.context.getCurrentUser().Id
            }
        };

        Rest.callMethod('entity.item.get', rd, true).then(result => {
            if (result.items.length < 1) {
                Rest.callMethod('entity.item.add', {
                    ENTITY: DataStorage.filterSort,
                    NAME: DataStorage.filterSort,
                    PROPERTY_VALUES: {
                        TABLE: _.props.id,
                        DATA: JSON.stringify(this.state.filterSorting),
                        USER: _.context.getCurrentUser().Id
                    }
                }).catch(err => {
                    console.error('saveSortingRequest add', err);
                });
            }
            else {
                Rest.callMethod('entity.item.update', {
                    ENTITY: DataStorage.filterSort,
                    ID: result.items[0].ID,
                    PROPERTY_VALUES: {
                        DATA: JSON.stringify(this.state.filterSorting)
                    }
                }).catch(err => {
                    console.error('saveSortingRequest update', err);
                });
            }
        }).catch(err => {
            console.error('saveSortingRequest', err);
        });

        /*
        $.post('/filter/sorting', {
            table: this.props.id,
            data: this.state.filterSorting
        }, (result) => {
            console.log('save sort', result);
        });*/
    }

    loadStateParams() {
        const _ = this;
        if (_.props.query) {
            const queryArray = [];
            Object.keys(_.props.query).forEach((key) => {
                const item = _.getFilterItemByName(key);
                if (item) {
                    queryArray.push({
                        name: key,
                        title: item.Title,
                        value: {
                            value: [_.props.query[key]],
                            description: [_.props.query[key]]
                        }
                    });
                }
            });
            if (queryArray.length > 0) {
                _.setState({
                    currentFilterId: '',
                    requestParams: queryArray
                }, _.find);
                return;
            }
        }

        const stateString = _.getFromLocalStorage(`${_.props.id}`);
        if (!stateString) {
            _.find();
            return;
        }
        const result = Utils.tryParseJson(stateString);
        _.setState({
            currentFilterId: result.currentFilterId ? result.currentFilterId : '',
            requestParams: Array.isArray(result.requestParams) ? result.requestParams.slice() : []
        }, _.find);
    }

    clickFind = (e) => {
        if (e) e.preventDefault();
        this.closeModal();
        this.find();
    }

    clickReset = () => {
        this.setState({
            currentFilterId: ''
        });
        this.removeRequestParams();
        //filter.clearModal();
        this.closeModal();
        this.find();
    }

    clickClear = (e) => {
        if (e) e.preventDefault();
        this.setState({
            currentFilterId: ''
        });
        this.removeRequestParams(true);
        this.find();
    }

    removeRequestParams = (all = false) => {
        this.setState({
            requestParams: this.state.requestParams.map((item) => {
                if (item.title || all) {
                    item.value = false;
                }
                return item;
            })
        });
    }

    clickCreateFilterMode = () => {
        this.setState({
            editMode: true,
            currentFilterId: 'new'
        });
    }

    clickEditMode = () => {
        const currentFilter = this.state.loadedFilters[this.state.currentFilterId];
        if (currentFilter) {
            this.setState({
                editFilterName: currentFilter.name,
                editMode: true
            });
        }
        else {
            this.setState({
                currentFilterId: '',
                editMode: true
            });
        }
    }

    clickRemoveUserFilters = () => {
        const _ = this;
        _.removeLoadedFilters(function () {
            new FilterDefaults().get(_.props.id, function () {
                _.loadFilters(() => {
                    _.clickCancel();
                }, true);
            });
        });
    }

    removeLoadedFilters(callback) {
        const _ = this;
        const keys = Object.keys(_.state.loadedFilters);
        if (keys.length < 1) {
            callback();
            return;
        }
        const ids = keys.filter(x => _.state.loadedFilters[x].default);

        if (ids.length < 1) {
            callback();
            return;
        }

        _.removeFilterRequest(ids).then(() => {
            callback();
        });
    }

    find(e) {
        const _ = this;
        const timestamp = new Date().getTime();
        _.findTimestamp = timestamp;
        setTimeout(function () {
            if (_.findTimestamp !== timestamp)
                return;
            _.findAction();
        }, _.findDelay);
    }

    findAction() {
        this.trySaveStateParams();
        this.props.refreshTable();
    }

    trySaveStateParams() {
        try {
            this.saveInLocalStorage(`${this.props.id}`, JSON.stringify({
                currentFilterId: this.state.currentFilterId,
                requestParams: this.state.requestParams
            }));
        }
        catch (err) {
            console.error('save filter params', err);
        }
    }

    openModal = () => {
        const _ = this;
        this.setState({ showModal: true }, () => { _.inputText.current.focus() });
    }

    toggleModal = () => {
        this.setState({ showModal: !this.state.showModal });
    }

    closeModal = () => {
        this.setState({ showModal: false });
    }

    getModalStyle() {
        return {
            overlay: {
                backgroundColor: 'transparent'
            },
            content: {
                top: this.filterContainer.current.offsetTop + 40,
                left: this.filterContainer.current.offsetLeft,
                right: 'auto',
                bottom: 'auto',
                width: this.filterContainer.current.offsetWidth,
                padding: 0
            }
        };
    }

    openModalFields = (e) => {
        console.log('openModalFields', e);
        this.setState({
            showFieldsVisibility: true
        });
    }

    loadFilterDefaultFields = (e) => {
        if (e) e.preventDefault();
        const _ = this;
        const requestParams = this.state.requestParams;
        _.props.items.forEach((item) => {
            const index = requestParams.findIndex(x => x.name === item.Name);
            if (index < 0 && (item.Typing || item.Default)) {
                requestParams.push({
                    name: item.Name,
                    value: false
                });
            }
            if (index > -1 && !item.Typing && !item.Default) {
                requestParams.splice(index, 1);
            }
        });
        _.setState({
            requestParams: requestParams
        });
    }

    saveFilterRequest = (id, name) => {
        const _ = this;
        const rd = {
            ENTITY: DataStorage.filter,
            NAME: name,
            PROPERTY_VALUES: {
                TABLE: _.props.id,
                DATA: JSON.stringify(_.state.requestParams),
                DEFAULT: 'N',
                USER: _.context.getCurrentUser().Id
            }
        };

        if (id) {
            rd.ID = id;
            Rest.callMethod('entity.item.update', rd).then(result => {
                _.loadFilters(() => {
                    _.setState({
                        editMode: false
                    });
                    _.clickSelectFilter(false, id);
                });
            }).catch(err => {
                console.error('saveFilterRequest', err);
            });
        }
        else {
            Rest.callMethod('entity.item.add', rd).then(result => {
                _.loadFilters(() => {
                    _.setState({
                        editMode: false
                    });
                    _.clickSelectFilter(false, result.items[0]);
                });
            }).catch(err => {
                console.error('saveFilterRequest', err);
            });
        }
    }

    clickSave = () => {
        const editFilterName = this.state.editFilterName.trim();
        if (editFilterName.length < 1) {
            return;
        }
        if (this.state.currentFilterId === 'new') {
            this.saveFilterRequest(false, editFilterName);
        }
        else {
            const id = parseInt(this.state.currentFilterId) || 0;
            if (id > 0) {
                this.saveFilterRequest(id, editFilterName);
            }
            else {
                this.setState({
                    editMode: false
                });
            }
        }
    }

    clickCancel = () => {
        this.setState({
            editMode: false
        });
    }

    clickSaveFieldsVisibility = (values) => {
        if (values) {
            const requestParams = this.state.requestParams.filter(x => values.includes(x.name) || (this.TypingFilterItem && this.TypingFilterItem.Name === x.name));
            values.forEach((item) => {
                const index = requestParams.findIndex(x => x.name === item);
                if (index < 0) {
                    requestParams.push({
                        value: false,
                        name: item
                    });
                }
            });
            this.setState({
                requestParams: requestParams,
                showFieldsVisibility: false
            });
            return;
        }
        this.setState({
            showFieldsVisibility: false
        });
    }
    saveInLocalStorage(key, value) {
        try {
            localStorage.setItem(key, value);
        }
        catch (e) {
            console.warn(e);
        }
    }

    getFromLocalStorage(key) {
        try {
            return localStorage.getItem(key);
        }
        catch (e) {
            console.warn(e);
        }
        return false;
    }

    clickRemovePresetFilter = (e) => {
        const requestParams = this.state.requestParams;
        requestParams.forEach((item) => {
            item.value = false;
        });
        this.setState({
            currentFilterId: '',
            requestParams: requestParams
        }, this.find());
    }

    clickRemovePresetParam = (e, params) => {
        const requestParams = this.state.requestParams;
        const index = requestParams.findIndex(x => x.name === params.name);
        if (index > -1) {
            requestParams[index].value = false;
            this.setState({
                requestParams: requestParams
            }, this.find());
        }
    }

    clickRemovePresetMore = (e, arrMore) => {
        this.setState({
            requestParams: this.state.requestParams.filter(x => !arrMore.find(more => more.name === x.name))
        });
    }

    clickRemoveField = (name) => {
        this.setState({
            requestParams: this.state.requestParams.filter(x => x.name !== name)
        });
    }

    changeValue = (value, filterItem) => {
        const requestParams = this.state.requestParams;
        const index = requestParams.findIndex(x => x.name === filterItem.Name);
        if (index > -1) {
            requestParams[index].title = filterItem.Title;
            requestParams[index].value = value;
            this.setState({
                requestParams: requestParams
            });
        }
    }

    changeTextInput = (e) => {
        const _ = this;
        if (_.TypingFilterItem) {
            const requestParams = _.state.requestParams.slice();
            const index = requestParams.findIndex(x => x.name === _.TypingFilterItem.Name);
            if (index < 0 && e.target.value.length > 0) {
                requestParams.push({
                    value: e.target.value,
                    name: _.TypingFilterItem.Name
                });
            }
            else {
                if (e.target.value.length > 0) {
                    requestParams[index] = {
                        value: e.target.value,
                        name: _.TypingFilterItem.Name
                    };
                }
                else {
                    requestParams.splice(index, 1);
                }
            }
            _.setState({
                requestParams: requestParams,
                showModal: false
            }, _.find);
        }
    }

    changeEditFilterName = (e) => {
        if (e) e.preventDefault();

        this.setState({
            editFilterName: e.target.value
        });
    }

    clickSelectFilter = (e, id) => {
        if (e) e.preventDefault();
        console.log('clickSelectFilter', id);
        this.setState({
            currentFilterId: id,
            editFilter: false,
            editFilterName: this.state.loadedFilters[id].name,
            requestParams: this.state.loadedFilters[id].data.map(x => ({ ...x }))
        });
    }

    clickEditFilterName = (e, id) => {
        if (e) e.preventDefault();
        const _ = this;
        _.setState({
            editFilter: true,
            editFilterName: _.state.loadedFilters[id].name
        });
    }

    clickRemoveFilter = (e, id) => {
        if (e) e.preventDefault();
        const _ = this;
        _.removeFilterRequest([id]).then(() => {
            _.loadFilters(() => {
            });
        });
    }

    async removeFilterRequest(ids) {
        const _ = this;
        for (const id of ids) {
            try {
                await Rest.callMethod('entity.item.delete', { ENTITY: DataStorage.filter, ID: id });
            }
            catch (err) {
                console.error('removeFilterRequest', err);
            }
        }
        if (ids.includes(_.state.currentFilterId)) {
            _.setState({
                currentFilterId: ''
            });
        }
        _.setState({
            filterSorting: _.state.filterSorting.filter(x => !ids.includes(x))
        });
    }

    fillRequestFilter(requestFilter) {
        const filter = this;
        filter.props.items.forEach((item) => {
            let upperName = item.Name;
            switch (item.Type) {
                case FilterType.Hidden:
                    let arValues = Utils.getStringArray(filter.getValueByName(item.Name));
                    if (arValues && arValues.length > 0) {
                        if (item.PREFIX == 'Y') {
                            filter.addValueToRequestFilter(requestFilter, `%${upperName}`, arValues[0]);
                        }
                        else {
                            filter.addValueToRequestFilter(requestFilter, upperName, arValues);
                        }
                    }
                    break;
                case FilterType.Text:
                    const textValue = filter.getValueByName(item.Name);
                    if (textValue && textValue.value.length > 0) {
                        filter.addValueToRequestFilter(requestFilter, upperName, textValue.value[0]);
                    }
                    break
                case FilterType.NumberRange:
                    const numberRangeValue = filter.getValueByName(item.Name);
                    if (numberRangeValue) {
                        if (numberRangeValue.from) {
                            filter.addValueToRequestFilter(requestFilter, `>=${upperName}`, numberRangeValue.from);
                        }
                        if (numberRangeValue.to) {
                            filter.addValueToRequestFilter(requestFilter, `<=${upperName}`, numberRangeValue.to);
                        }
                        if (numberRangeValue.value) {
                            switch (numberRangeValue.type) {
                                case FilterRangeType.GreaterThan:
                                    filter.addValueToRequestFilter(requestFilter, `>${upperName}`, numberRangeValue.value);
                                    break;
                                case FilterRangeType.LessThan:
                                    filter.addValueToRequestFilter(requestFilter, `<${upperName}`, numberRangeValue.value);
                                    break;
                                default:
                                    filter.addValueToRequestFilter(requestFilter, `${upperName}`, numberRangeValue.value);
                                    break;
                            }
                        }
                    }
                    break;
                case FilterType.DateRange:
                    const dateRangeValue = filter.getValueByName(item.Name);
                    if (dateRangeValue) {
                        if (dateRangeValue.from) {
                            filter.addValueToRequestFilter(requestFilter, `>=${upperName}`, item.NUMBER ? new Date(dateRangeValue.from).getTime() : new Date(dateRangeValue.from).toISOString());
                        }
                        if (dateRangeValue.to) {
                            filter.addValueToRequestFilter(requestFilter, `<=${upperName}`, item.NUMBER ? new Date(dateRangeValue.to).getTime() : new Date(dateRangeValue.to).toISOString());
                        }
                        if (dateRangeValue.value) {
                            switch (dateRangeValue.type) {
                                case FilterRangeType.GreaterThan:
                                    filter.addValueToRequestFilter(requestFilter, `>=${upperName}`, item.NUMBER ? new Date(dateRangeValue.value).getTime() : new Date(dateRangeValue.value).toISOString());
                                    break;
                                case FilterRangeType.LessThan:
                                    filter.addValueToRequestFilter(requestFilter, `<=${upperName}`, item.NUMBER ? new Date(dateRangeValue.value).getTime() : new Date(dateRangeValue.value).toISOString());
                                    break;
                                default:
                                    filter.addValueToRequestFilter(requestFilter, `${upperName}`, item.NUMBER ? new Date(dateRangeValue.value).getTime() : new Date(dateRangeValue.value).toISOString());
                                    break;
                            }
                        }
                        if (dateRangeValue.period) {
                            switch (dateRangeValue.period) {
                                case FilterRangeType.Today:
                                    filter.addValueToRequestFilter(requestFilter, `>=${upperName}`, item.NUMBER ? Moment().startOf('day').valueOf() : Moment().format(Moment.HTML5_FMT.DATE));
                                    filter.addValueToRequestFilter(requestFilter, `<=${upperName}`, item.NUMBER ? Moment().startOf('day').add(1, 'day').valueOf() : Moment().add(1, 'day').format(Moment.HTML5_FMT.DATE));
                                    break;
                                case FilterRangeType.Yesterday:
                                    filter.addValueToRequestFilter(requestFilter, `>=${upperName}`, item.NUMBER ? Moment().startOf('day').subtract(1, 'day').valueOf() : Moment().subtract(1, 'day').format(Moment.HTML5_FMT.DATE));
                                    filter.addValueToRequestFilter(requestFilter, `<=${upperName}`, item.NUMBER ? Moment().startOf('day').valueOf() : Moment().format(Moment.HTML5_FMT.DATE));
                                    break;
                                case FilterRangeType.Week:
                                    filter.addValueToRequestFilter(requestFilter, `>=${upperName}`, item.NUMBER ? Moment().subtract(7, 'day').valueOf() : Moment().subtract(7, 'day').format(Moment.HTML5_FMT.DATE));
                                    filter.addValueToRequestFilter(requestFilter, `<=${upperName}`, item.NUMBER ? Moment().add(1, 'day').valueOf() : Moment().add(1, 'day').format(Moment.HTML5_FMT.DATE));
                                    break;
                                case FilterRangeType.Month:
                                    filter.addValueToRequestFilter(requestFilter, `>=${upperName}`, item.NUMBER ? Moment().subtract(30, 'day').valueOf() : Moment().subtract(30, 'day').format(Moment.HTML5_FMT.DATE));
                                    filter.addValueToRequestFilter(requestFilter, `<=${upperName}`, item.NUMBER ? Moment().add(1, 'day').valueOf() : Moment().add(1, 'day').format(Moment.HTML5_FMT.DATE));
                                    break;
                            }
                        }
                    }
                    break;
                case FilterType.Select:
                case FilterType.DealSelect:
                case FilterType.ContactSelect:
                case FilterType.UserSelect:
                    const selectValue = filter.getValueByName(item.Name);
                    if (selectValue && selectValue.value && selectValue.value.length > 0) {
                        filter.addValueToRequestFilter(requestFilter, `${upperName}`, selectValue.value);
                    }
                    break;
            }
        });
        return requestFilter;
    }

    getValueByName(name) {
        var index = this.state.requestParams.findIndex(x => x.name === name);
        if (index < 0)
            return false;

        return this.state.requestParams[index].value;
    }

    addValueToRequestFilter(requestFilter, name, value) {
        if (value || value === 0) {
            requestFilter[name] = value;
        }
    }

    onSortFields = (data, e) => {
        if (data.oldIndex === data.newIndex)
            return;
        this.setState({
            requestParams: arrayMove(this.state.requestParams, data.oldIndex, data.newIndex)
        });
    }

    onSortFilters = (data, e) => {
        if (data.oldIndex === data.newIndex)
            return;
        this.setState({
            filterSorting: arrayMove(this.state.filterSorting, data.oldIndex, data.newIndex)
        }, this.saveSortingRequest);
    }

    compareFilterFields() {
        if (!this.state.currentFilterId || !this.state.loadedFilters[this.state.currentFilterId])
            return false;
        const fields = this.state.requestParams;
        const filterFields = this.state.loadedFilters[this.state.currentFilterId].data;
        var result = true;
        fields.forEach(field => {
            var index = filterFields.findIndex(x => x.name === field.name);
            if (index < 0 && field.value) {
                result = false;
                return false;
            }
            if (filterFields[index] && JSON.stringify(field.value) !== JSON.stringify(filterFields[index].value)) {
                result = false;
                return false;
            }
        });
        return result;
    }

    render() {
        const _ = this;
        var currentFilter = _.state.currentFilterId && _.state.loadedFilters[_.state.currentFilterId] && _.compareFilterFields() ? _.state.loadedFilters[_.state.currentFilterId] : false;
        var hasValue = false;
        var hasPreset = false;
        var buffer = [];
        var inputTextValue = '';
        _.state.requestParams.slice().reverse().forEach(function (params) {
            if ((!params.value && params.value !== false))
                return;
            if (!params.title && params.value !== false) {
                hasValue = true;
                inputTextValue = params.value;
                return;
            }
            if (params.value.description && Array.isArray(params.value.description) && params.value.description.length < 1) {
                return;
            }
            buffer.push(params);
        });
        const arrPresetItems = [];
        if (currentFilter) {
            arrPresetItems.push((
                <div className="filter-preset-item" key={currentFilter.id} title={currentFilter.name}>
                    <span className="filter-preset-item-text">{currentFilter.name}</span>
                    <span className="preset-remove" onClick={this.clickRemovePresetFilter}>
                        <i className="fas fa-times"></i>
                    </span>
                </div>
            ));
            hasPreset = true;
        }
        else {
            var arrMore = [];
            var arrPreset = buffer.filter(x => {
                if (x.value === false || x.value.length < 1) {
                    return false;
                }
                return true;
            });
            arrPreset.forEach(function (params) {
                if (arrPresetItems.length > 2) {
                    arrMore.push(params);
                    return;
                }
                arrPresetItems.push((
                    <div className="filter-preset-item" key={params.name}>
                        {params.value.description && Array.isArray(params.value.description) &&
                            <span className="filter-preset-item-text" title={params.value.description.join(', ')}>
                                <span><Trans>{params.title}</Trans></span>: <span>{params.value.description.join(', ')}</span>
                            </span>
                        }
                        <span className="preset-remove" onClick={(e) => _.clickRemovePresetParam(e, params)}>
                            <i className="fas fa-times"></i>
                        </span>
                    </div>
                ));
                hasPreset = true;
            });
            if (arrMore.length > 0) {
                arrPresetItems.push((
                    <div className="filter-preset-item" key="more">
                        <span className="filter-preset-item-text"><Trans>filter-preset-more</Trans> {arrMore.length}</span>
                        <span className="preset-remove" onClick={(e) => _.clickRemovePresetMore(e, arrMore)}>
                            <i className="fas fa-times"></i>
                        </span>
                    </div>
                ));
            }
        }
        return (
            <div className="filter-search" ref={this.filterContainer}>
                {arrPresetItems.map((item) => (
                    item
                ))}
                <input type="text" ref={this.inputText} name="find" value={inputTextValue} className="filter-search-text" autoComplete="off"
                    onChange={this.changeTextInput} onClick={this.toggleModal}
                    placeholder={i18next.t(hasPreset ? 'filter-find-not-empty' : 'filter-find-empty')} />
                <div className="main-ui-item-icon-block">
                    <span className="main-ui-item-icon" onClick={this.clickFind}>
                        <i className="fas fa-search"></i>
                    </span>
                    {(hasValue || hasPreset) &&
                        <span className="main-ui-item-icon" onClick={this.clickClear}>
                            <i className="fas fa-times"></i>
                        </span>
                    }
                </div>
                {this.state.showModal &&
                    <div className="filter-modal">
                        <div className="row">
                            <div className="col-12 col-xl-3 d-fl ex flex-col umn">
                                <div className="main-ui-filter-sidebar-title">
                                    <h5 className="main-ui-filter-sidebar-title-item"><Trans>filter-title-filters</Trans></h5>
                                </div>
                                <div className={`${this.state.filterSorting && this.state.filterSorting.length > 0 ? 'flex-grow-1' : ''} main-ui-filter-sidebar-item-container`}>
                                    <SortableFilterList helperClass='sortable-helper' lockAxis='y' useDragHandle={true} pressDelay={200}
                                        editMode={this.state.editMode} editFilter={this.state.editFilter} editFilterName={this.state.editFilterName}
                                        items={this.state.filterSorting}
                                        loadedFilters={this.state.loadedFilters}
                                        currentFilterId={this.state.currentFilterId} currentFilter={currentFilter}
                                        onSortEnd={this.onSortFilters} changeEditFilterName={this.changeEditFilterName} clickSelectFilter={this.clickSelectFilter} clickEditFilterName={this.clickEditFilterName} clickRemoveFilter={this.clickRemoveFilter} />
                                    {this.state.editMode && _.state.currentFilterId === 'new' &&
                                        <div className="main-ui-filter-sidebar-item main-ui-filter-ne w-filter">
                                            <div className="main-ui-filter-edit-mask">
                                                <input type="text" className="main-ui-filter-sidebar-edit-control" placeholder={i18next.t('filter-name')} value={this.state.editFilterName} onChange={this.changeEditFilterName} />
                                            </div>
                                        </div>
                                    }
                                </div>
                                <div className="d-flex px-2 mt-2">
                                    {!this.state.editMode &&
                                        <span className="main-ui-filter-add-item flex-grow-1" onClick={this.clickCreateFilterMode}>
                                            <i className="fas fa-plus me-1"></i>
                                            <span><Trans>filter-btn-save-filter</Trans></span>
                                        </span>
                                    }
                                    {!this.state.editMode &&
                                        <span className="main-ui-filter-add-edit" title={i18next.t('filter-btn-edit-filter')} onClick={this.clickEditMode}>
                                            <i className="fas fa-cog mt-1"></i>
                                        </span>
                                    }
                                    {this.state.editMode &&
                                        <span className="main-ui-filter-reset-link mb-2" onClick={this.clickRemoveUserFilters}>
                                            <i className="fas fa-reply me-1"></i>
                                            <span><Trans>filter-btn-reset-filter</Trans></span>
                                        </span>
                                    }
                                </div>
                                <div className="d-block d-xl-none">
                                    <hr className="my-2" />
                                </div>
                            </div>
                            <div className="col-12 col-xl-9">
                                {!this.state.showFieldsVisibility &&
                                    <React.Fragment>
                                        <div className="d-flex flex-column flex-gro w-1">
                                            <SortableFieldList helperClass='sortable-helper' lockAxis='y' useDragHandle={true} pressDelay={200} currentFilterId={this.state.currentFilterId} items={this.state.requestParams} getFilterItemByName={this.getFilterItemByName} onSortEnd={this.onSortFields} onChangeValue={this.changeValue} onClickRemove={this.clickRemoveField} />
                                            <div className="d-flex justify-content-center mt-2 mb-3">
                                                <span className="main-ui-filter-field-add-item" onClick={this.openModalFields}><Trans>filter-btn-add-field</Trans></span>
                                                <span className="main-ui-filter-field-restore-items" onClick={this.loadFilterDefaultFields}><Trans>filter-btn-restore-fields</Trans></span>
                                            </div>
                                        </div>
                                        <div className="">
                                            <div className="d-flex justify-content-center">
                                                {!this.state.editMode &&
                                                    <div className="mb-2">
                                                        <button className="btn btn-primary btn-md me-2" onClick={this.clickFind}>
                                                            <i className="fas fa-search me-2"></i>
                                                            <span><Trans>filter-btn-search</Trans></span>
                                                        </button>
                                                        <button className="btn btn-outline-primary btn-md" onClick={this.clickReset}><Trans>filter-btn-reset</Trans></button>
                                                    </div>
                                                }
                                                {this.state.editMode &&
                                                    <div className="mb-2">
                                                        <button className="btn btn-success btn-md me-2" onClick={this.clickSave}><Trans>filter-btn-save</Trans></button>
                                                        <button className="btn btn-outline-success btn-md" onClick={this.clickCancel}><Trans>filter-btn-cancel</Trans></button>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </React.Fragment>
                                }
                                {this.state.showFieldsVisibility &&
                                    <FilterVisibility items={this.props.items} requestParams={this.state.requestParams} save={this.clickSaveFieldsVisibility} />
                                }
                            </div>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

const DragHanle = SortableHandle(() => <div className="main-ui-item-icon main-ui-filter-icon-grab" title={i18next.t('filter-sort-filter')}><i className="fas fa-bars"></i></div>);

class SortableField extends React.Component {
    render() {
        return (
            <div className="d-flex mb-3">
                <DragHanle />
                <div className="flex-grow-1">
                    <FilterFieldContext.Provider value={{ value: this.props.item.value, filterItem: this.props.filterItem, onChange: this.props.onChangeValue, language: Rest.getLang() }}>
                        <FilterField />
                    </FilterFieldContext.Provider>
                </div>
                <div className="main-ui-item-icon pe-2 me-1" onClick={() => this.props.onClickRemove(this.props.item.name)}>
                    <i className="fas fa-times"></i>
                </div>
            </div>
        );
    }
}

const SortableFieldItem = SortableElement(SortableField);

class SortableFields extends React.Component {
    render() {
        return (
            <div className='mt-3'>
                {this.props.items.map((item, index) => {
                    const filterItem = this.props.getFilterItemByName(item.name);
                    if (filterItem && filterItem.Type !== FilterType.Hidden) {
                        return (
                            <SortableFieldItem key={`${item.name}_${this.props.currentFilterId}`} index={index} item={item} filterItem={filterItem} onChangeValue={this.props.onChangeValue} onClickRemove={this.props.onClickRemove} />
                        )
                    }
                })}
            </div>
        )
    }
}

const SortableFieldList = SortableContainer(SortableFields);

class SortableFilter extends React.Component {
    render() {
        return (
            <div className={`d-flex main-ui-filter-sidebar-item ${this.props.currentFilter && this.props.currentFilterId == this.props.id ? 'main-ui-filter-current-item' : ''}`}>
                <DragHanle />
                {(this.props.editFilter && this.props.currentFilterId == this.props.id)
                    ?
                    <div className="flex-grow-1 p-2 main-ui-filter-sidebar-item-text-container">
                        <input type="text" className="main-ui-filter-sidebar-item-input" placeholder={i18next.t('filter-name')} autoFocus={true} value={this.props.editFilterName} onChange={this.props.changeEditFilterName} />
                    </div>
                    :
                    <div className="flex-grow-1 p-2 main-ui-filter-sidebar-item-text-container" onClick={(e) => this.props.clickSelectFilter(e, this.props.id)}>
                        <span className="main-ui-filter-sidebar-item-text">
                            {this.props.filter.name}
                        </span>
                    </div>
                }
                {this.props.editMode &&
                    <React.Fragment>
                        <div className="main-ui-item-icon main-ui-filter-icon-edit" title={i18next.t('filter-edit-filter-name')} onClick={(e) => this.props.clickEditFilterName(e, this.props.id)}>
                            <i className="fas fa-pen"></i>
                        </div>
                        <div className="main-ui-item-icon main-ui-delete main-ui-filter-filter-delete" title={i18next.t('filter-delete-filter')} onClick={(e) => this.props.clickRemoveFilter(e, this.props.id)}>
                            <i className="fas fa-times"></i>
                        </div>
                    </React.Fragment>
                }
            </div>
        );
    }
}

const SortableFilterItem = SortableElement(SortableFilter);

class SortableFilters extends React.Component {
    render() {
        return (
            <div>
                {this.props.items && this.props.items.map((id, index) => (
                    <SortableFilterItem key={id} index={index} id={id} currentFilter={this.props.currentFilter} currentFilterId={this.props.currentFilterId} editMode={this.props.editMode} editFilter={this.props.editFilter}
                        editFilterName={this.props.editFilterName} changeEditFilterName={this.props.changeEditFilterName} clickSelectFilter={this.props.clickSelectFilter}
                        filter={this.props.loadedFilters[id]}
                        clickEditFilterName={this.props.clickEditFilterName} clickRemoveFilter={this.props.clickRemoveFilter} />
                ))}
            </div>
        );
    }
}

const SortableFilterList = SortableContainer(SortableFilters);

class FilterVisibility extends React.Component {
    constructor(props) {
        super();
        const selected = [];
        if (props.requestParams && Array.isArray(props.requestParams)) {
            props.requestParams.forEach((item) => {
                if (item.name) {
                    selected.push(item.name);
                }
            });
        }
        this.state = {
            selected: selected
        };
    }

    clickSaveFields = () => {
        this.props.save(this.state.selected);
    }

    clickCancelFields = () => {
        this.props.save(false);
    }

    select = (name) => {
        const selected = this.state.selected;
        const index = selected.indexOf(name);
        if (index < 0) {
            selected.push(name);
        }
        else {
            selected.splice(index, 1);
        }
        this.setState({
            selected: selected
        });
    }

    render() {
        return (
            <React.Fragment>
                <div className="d-flex flex-column flex-grow-1">
                    <div className="row px-3">
                        {this.props.items.map((item) => {
                            if (item.Type !== FilterType.Hidden) {
                                return (
                                    <div key={item.Name} className={`col-6 main-ui-select-inner-item main-ui-filter-field-list-item ${this.state.selected.includes(item.Name) ? 'main-ui-checked' : ''}`} onClick={() => this.select(item.Name)}>
                                        <div className="main-ui-select-inner-label">
                                            <Trans>{item.Title}</Trans>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>
                <div>
                    <div className="d-flex justify-content-center mb-2">
                        <button className="btn btn-success btn-md me-2" onClick={this.clickSaveFields}><Trans>filter-btn-save</Trans></button>
                        <button className="btn btn-outline-success btn-md" onClick={this.clickCancelFields}><Trans>filter-btn-cancel</Trans></button>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

class FilterModel {
    constructor(fields) {
        Object.assign(this, fields);

        this.id = parseInt(fields.ID) || 0;
        this.table = fields.PROPERTY_VALUES.TABLE;
        this.name = fields.NAME;
        this.user = parseInt(fields.PROPERTY_VALUES.USER) || 0;
        this.data = JSON.parse(fields.PROPERTY_VALUES.DATA);
        this.default = fields.PROPERTY_VALUES.DEFAULT === 'Y';
    }
}

export default Filter;