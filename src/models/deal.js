import { Rest } from "../rest";

export default class Deal {
  constructor(fields) {
    this.ID = fields.ID;
    this.TITLE = fields.TITLE;
    this.OPPORTUNITY = fields.OPPORTUNITY;
    this.STAGE_ID = fields.STAGE_ID;
    this.COMPANY_ID = fields.COMPANY_ID;
    this.COMPANY_NAME = fields.COMPANY_NAME;
    // console.warn("this", this);
  }

  get Id() {
    return parseInt(this.ID) || 0;
  }

  get Link() {
    return `https://${Rest.getDomain()}/crm/deal/details/${this.Id}/`;
  }

  get Name() {
    return this.TITLE;
  }

  get Opportunity() {
    return parseInt(this.OPPORTUNITY) || 0;
  }

  get CompanyId() {
    return parseInt(this.COMPANY_ID) || 0;
  }

  get LinkToCompany() {
    return `https://${Rest.getDomain()}/crm/company/details/${this.CompanyId}/`;
  }
}
