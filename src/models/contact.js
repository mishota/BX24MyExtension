import { Rest } from "../rest";

export default class Contact {
    constructor(fields) {
        Object.assign(this, fields);
    }

    get Id() {
        return parseInt(this.ID) || 0;
    }

    get Link() {
        return `https://${Rest.getDomain()}/crm/contact/details/${this.Id}/`;
    }

    get FullName() {
        if (this.NAME && this.NAME.length > 0) {
            if (this.LAST_NAME && this.LAST_NAME.length > 0) {
                return this.NAME + ' ' + this.LAST_NAME;
            }
            return this.NAME;
        }

        if (this.EMAIL && this.EMAIL.length > 0)
            return this.EMAIL;

        return 'ID: ' + this.Id;
    }
}