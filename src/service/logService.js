import { DataStorage } from "../enum/dataStorage";
import { Rest } from "../rest";

export default class LogService {
    constructor(logType, userId, objectId = '', objectType = '', description = '') {
        this.logType = logType;
        this.objectId = objectId;
        this.objectType = objectType;
        this.description = description;
        this.user = parseInt(userId) || 0;
        this.date = new Date().getTime();
    }

    async add() {
        const logger = this;
        const requestData = {
            ENTITY: DataStorage.log,
            NAME: `${logger.logType}_${logger.date}`,
            PROPERTY_VALUES: {
                TYPE: logger.logType,
                DATE: logger.date,
                USER: logger.user,
                OBJECT_ID: logger.objectId,
                OBJECT_TYPE: logger.objectType,
                DESCRIPTION: logger.description
            }
        };

        try {
            await Rest.callMethod('entity.item.add', requestData);
        }
        catch (err) {
            console.error('add log', err);
        }
    }
}