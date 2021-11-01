import FilterRangeType from './filterRangeType';

class FilterDefaults {
    constructor() {
        this.Filters = [];
        this.Table = '';
    }

    get(name, callback) {
        const _ = this;
        switch (name) {
            case 'filter-devices':
                _.Table = name;
                _.devices(callback);
                return;
            case 'filter-programs':
                _.Table = name;
                _.programs(callback);
                return;
        }
        callback();
    }

    programs(callback) {
        const _ = this;
        document.l10n.formatValue('filter-default-programs-active').then((resolve) => {
            _.Filters.push({
                name: resolve,
                fields: [{
                    value: { value: '0', type: FilterRangeType.GreaterThan, description: ['> 0'] },
                    title: 'field-used-on-devices',
                    name: 'usage'
                }]
            });
            _.tryAddFilter(callback);
        });
    }

    devices(callback) {
        const _ = this;
        document.l10n.formatValue('filter-default-devices-in-progress').then((resolve) => {
            _.Filters.push({
                name: resolve,
                fields: [{
                    value: false,
                    title: 'field-growth-program',
                    name: 'programId'
                }]
            });            
            document.l10n.formatValue('field-harvesting').then((resolve) => {                
                document.l10n.formatValue('date-today').then((resolveToday) => {
                    _.Filters.push({
                        name: resolve,
                        fields: [{
                            value: { period: FilterRangeType.Today, type: FilterRangeType.Period, description: [resolveToday] },
                            title: 'field-harvesting',
                            name: 'harvestDate'
                        }]
                    });
                    _.tryAddFilter(callback);
                })
            });
        });
    }

    tryAddFilter(callback) {
        const _ = this;
        if(_.Filters.length < 1) {
            callback();
            return;
        }
        _.addFilter(_.Filters[0].name, _.Filters[0].fields, function () {
            _.Filters.splice(0, 1);
            _.tryAddFilter(callback);
        });
    }

    addFilter(filterName, filterFields, callback) {
        const _ = this;
        const rd = {
            table: _.Table,
            name: filterName,
            data: JSON.stringify(filterFields),
            default: 'Y'
        };

        //todo

        callback();
        return;
        /*
        $.post('/filter/edit', rd, (result) => {
            if (result.error) {
                console.log(result.error_description);
            }
            callback();
        }).fail((err) => {
            console.error('err', err);
            callback();
        });*/
    }
}

export default FilterDefaults;