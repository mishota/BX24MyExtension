import moment from "moment";

export default class Log {
    constructor(fields) {
        Object.assign(this, fields);
    }

    get Id() {
        return parseInt(this.ID) || 0;
    }

    get Type() {
        return this.PROPERTY_VALUES.TYPE;
    }

    get ObjectId() {
        return this.PROPERTY_VALUES.OBJECT_ID;
    }

    get ObjectType() {
        return this.PROPERTY_VALUES.OBJECT_TYPE;
    }

    get UserId() {
        return parseInt(this.PROPERTY_VALUES.USER) || 0;
    }

    get Description() {
        return this.PROPERTY_VALUES.DESCRIPTION;
    }
    

    get Date() {
        return moment(parseInt(this.PROPERTY_VALUES.DATE) || 0);
    }
}