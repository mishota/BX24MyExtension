export default {    
    Equal: 'equal',
    GreaterThan: 'greater',
    LessThan: 'less',
    Range: 'range',
    Period: 'period',
    Today: 'today',
    Yesterday: 'yesterday',
    Week: 'week',
    Month: 'month',
    Items: () => {
        return [
            //{ id: 'equal', name: `filter-range-type-equal` },
            { id: 'greater', name: `filter-range-type-greater` },
            { id: 'less', name: `filter-range-type-less` },
            { id: 'range', name: `filter-range-type-range` }
        ]
    },
    DateItems: () => {
        return [
            { id: 'period', name: `filter-range-type-period` },
            { id: 'greater', name: `filter-range-type-greater` },
            { id: 'less', name: `filter-range-type-less` },
            { id: 'range', name: `filter-range-type-range` }
        ];
    },
    PeriodItems: () => {
        return [
            { id: 'today', name: 'date-today'},
            { id: 'yesterday', name: 'date-yesterday'},
            { id: 'week', name: 'date-week'},
            { id: 'month', name: 'date-month'}
        ];
    }
};