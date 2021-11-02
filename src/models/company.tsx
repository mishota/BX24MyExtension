import React from "react";
import { Rest } from "../rest";

class Company {
    id: number;
    TITLE: string = '';
    
    constructor(fields: any) {
        this.id = parseInt(fields?.ID ?? fields?.id) || 0;
        this.TITLE = fields.TITLE;
    }

    get Id(): number {
        return this.id;
    }

    get LinkToCompany() {
        return `https://${Rest.getDomain()}/crm/company/details/${this.Id}/`;
      }
           
}

export default Company;