import React from "react";
import { AppContext } from '../context/app.context';
import { DataStorage } from '../enum/dataStorage';
import { Rest } from '../rest';

export default class UpdatePage extends React.Component {
    static contextType = AppContext;

    constructor() {
        super();
        this.keys = [
            'settings',
            'PropSettingsValue',
            'log',
            'PropLogType',
            'PropLogDate',
            'PropLogUser',
            'PropLogObjectId',
            'PropLogObjectType',
            'PropLogDescription',
            'filter',
            'PropFilterTable',
            'PropFilterData',
            'PropFilterDefault',
            'PropFilterUser',
            'filtersort',
            'PropFilterSortTable',
            'PropFilterSortData',
            'PropFilterSortUser',
            //'EventKeyONAPPINSTALL',
            //'EventKeyONAPPUNINSTALL'
        ];
        //this.eventHandler = '';
        this.events = [
            'ONAPPINSTALL',
            'ONAPPUNINSTALL'
        ];
        this.state = {
            currentCount: 0,
            allCount: this.keys.length
        };
    }

    componentDidMount() {
        this.createEntitySettings();
    }

    componentDidUpdate() {
        const _ = this;
        const percent = _.getPercent();
        if (percent === 100) {
            _.context.setAppSettings('Version', _.context.appVersion).then(() => {
                Rest.installComplete();
                _.context.updateComplete();
            });
        }
    }

    getPercent() {
        const _ = this;
        var percent = 0;
        if (_.state.allCount < 1) {
            percent = 100;
        }
        else {
            percent = _.state.currentCount / _.state.allCount * 100;
        }
        return percent;
    }

    addProgressKey(key) {
        const _ = this;
        _.setState({ currentCount: _.state.currentCount + 1 }, () => {
            _.runAfterKey(key);
        });
    }

    async runAfterKey(key) {
        const _ = this;
        switch (key) {
            case 'settings':
                _.createEntityLog();
                break;
            case 'log':
                _.createEntityFilter();
                break;
            case 'filter':
                _.createEntityFilterSort();
                break;
        }
        //_.bindPlacements();
        //_.bindEvents();
    }

    createEntitySettings() {
        const _ = this;
        const storageId = DataStorage.settings;

        const propData = {
            PropSettingsValue: ['entity.item.property.add', { ENTITY: storageId, PROPERTY: 'VALUE', NAME: 'value', TYPE: 'S' }]
        };
        _.createEntity(storageId, propData);
    }

    createEntityLog() {
        const _ = this;
        const storageId = DataStorage.log;

        const propData = {
            PropLogType: ['entity.item.property.add', { ENTITY: storageId, PROPERTY: 'TYPE', NAME: 'type', TYPE: 'S' }],
            PropLogDate: ['entity.item.property.add', { ENTITY: storageId, PROPERTY: 'DATE', NAME: 'date', TYPE: 'N' }],
            PropLogUser: ['entity.item.property.add', { ENTITY: storageId, PROPERTY: 'USER', NAME: 'user', TYPE: 'N' }],
            PropLogObjectId: ['entity.item.property.add', { ENTITY: storageId, PROPERTY: 'OBJECT_ID', NAME: 'object ID', TYPE: 'S' }],
            PropLogObjectType: ['entity.item.property.add', { ENTITY: storageId, PROPERTY: 'OBJECT_TYPE', NAME: 'object type', TYPE: 'S' }],
            PropLogDescription: ['entity.item.property.add', { ENTITY: storageId, PROPERTY: 'DESCRIPTION', NAME: 'descrpiption', TYPE: 'S' }]
        };
        _.createEntity(storageId, propData);
    }

    createEntityFilter() {
        const _ = this;
        const storageId = DataStorage.filter;

        const propData = {
            PropFilterTable: ['entity.item.property.add', { ENTITY: storageId, PROPERTY: 'TABLE', NAME: 'table id', TYPE: 'S' }],
            PropFilterData: ['entity.item.property.add', { ENTITY: storageId, PROPERTY: 'DATA', NAME: 'data', TYPE: 'S' }],
            PropFilterDefault: ['entity.item.property.add', { ENTITY: storageId, PROPERTY: 'DEFAULT', NAME: 'default', TYPE: 'S' }],
            PropFilterUser: ['entity.item.property.add', { ENTITY: storageId, PROPERTY: 'USER', NAME: 'user', TYPE: 'S' }]
        };

        _.createEntity(storageId, propData);
    }

    createEntityFilterSort() {
        const _ = this;
        const storageId = DataStorage.filterSort;

        const propData = {
            PropFilterSortTable: ['entity.item.property.add', { ENTITY: storageId, PROPERTY: 'TABLE', NAME: 'table id', TYPE: 'S' }],
            PropFilterSortData: ['entity.item.property.add', { ENTITY: storageId, PROPERTY: 'DATA', NAME: 'data', TYPE: 'S' }],
            PropFilterSortUser: ['entity.item.property.add', { ENTITY: storageId, PROPERTY: 'USER', NAME: 'user', TYPE: 'S' }]
        };

        _.createEntity(storageId, propData);
    }

    async bindEvents() {
        const _ = this;
        if (!_.eventHandler) {
            _.events.forEach((x) => {
                _.addProgressKey(`EventKey${x}`);
            });
            return;
        }

        try {
            const eventCopies = _.events.slice();
            const bindedEvents = await Rest.callMethod('event.get', {}, true);
            bindedEvents.items.forEach(eventItem => {
                const index = eventCopies.findIndex(x => eventItem.event === x);
                if (index > -1) {
                    eventCopies.slice(index, 1);
                    _.addProgressKey(`EventKey${eventItem.event}`);
                }
            });

            if (eventCopies.length > 0) {
                const batchData = {};
                eventCopies.forEach(x => {
                    batchData[`EventKey${x}`] = ['event.bind', { event: x, handler: _.eventHandler }]
                });

                Rest.callBatch(batchData, (batchResult) => {
                    const keys = Object.keys(batchResult);
                    keys.forEach(key => {
                        const eventResult = batchResult[key];
                        if (eventResult.error()) {
                            console.error('error-event-bind', eventResult.error());
                        }
                        else {
                            _.addProgressKey(key);
                        }
                    });
                });
            }
        }
        catch (err) {
            console.error('event.get', err);
        }
    }

    bindPlacements() {
        const _ = this;
        Rest.callMethod('placement.get').then(placements => {
            const dealTab = placements.items.find(x => x.placement === 'CRM_DEAL_DETAIL_TAB');
            if (dealTab) {
                _.addProgressKey('PlacementDeal');
            }
            else {
                //_.bindPlacementDeal();
            }
        }).catch(err => {
            const error = err.ex ? err.ex : err;
            if (error.error === 'ACCESS_DENIED') {
                console.warn('cant get placement list');
                _.addProgressKey('PlacementDeal');
            }
            else {
                console.error('cant get placement list', err);
            }
        });
    }

    // bindPlacementDeal() {
    //     const _ = this;
    //     Rest.callMethod('placement.bind', {
    //         PLACEMENT: 'CRM_DEAL_DETAIL_TAB',
    //         HANDLER: '',
    //         TITLE: ''
    //     }).then(res => {
    //         _.addProgressKey('PlacementDeal');
    //     }).catch(err => {
    //         const error = err.ex ? err.ex : err;
    //         if (error.error === 'ACCESS_DENIED') {
    //             console.warn('cant bind placement CRM_DEAL_DETAIL_TAB');
    //             _.addProgressKey('PlacementDeal');
    //         }
    //         else {
    //             console.error('cant bind placement CRM_DEAL_DETAIL_TAB', err);
    //         }
    //     });
    // }

    createEntity(storageId, properties) {
        const _ = this;
        Rest.callMethod('entity.add', { ENTITY: storageId, NAME: storageId, ACCESS: { AU: 'X' } }).then((result) => {
            _.createEntityProperties(storageId, properties);
        }).catch((err) => {
            const error = err.ex ? err.ex : err;
            if (error.error !== 'ERROR_ENTITY_ALREADY_EXISTS') {//ERROR_ENTITY_ALREADY_EXISTS
                console.error('error-add-storage', storageId, error);
            }
            else {
                _.createEntityProperties(storageId, properties);
            }
        });
    }

    createEntityProperties(storageId, properties) {
        const _ = this;
        Rest.callBatch(properties, function (result) {
            for (var key in result) {
                if (key.startsWith('Prop')) {
                    var r = result[key];
                    if (r.error()) {
                        const err = r.error().error ? r.error() : r.error().ex;
                        if (err.error !== 'ERROR_PROPERTY_ALREADY_EXISTS') {
                            console.error(key, err, r.error());
                        }
                    }
                    _.addProgressKey(key);
                }
            }
            _.addProgressKey(storageId);
        });
    }

    render() {
        return (
            <div>
                <div className="progress">
                    <div className="progress-bar" role="progressbar" style={{ width: this.getPercent() }}></div>
                </div>
            </div>
        );
    }
}