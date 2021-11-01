import { Trans } from "react-i18next";
import { Link } from "react-router-dom";
import { DataStorage } from "../../enum/dataStorage";
import { Rest } from "../../rest";
import TableComponent from "./tableComponent";
import Deal from "../../models/deal";
import { LinkService } from "../../service/linkService";

class DealTable extends TableComponent {
  constructor() {
    super();
    this.Id = "deal-table-component";
    this.state.sortBy = "id";
    this.state.visibleColumns = [
      "id",
      "property_link",
      "property_stage",
      "property_opportunity",
      "property_company",
      "property_companyId",
      "property_LinkToCompany",
    ];
    const currentDefinition = this;

    this.Header.push({
      text_id: "field-id",
      field: "id",
      sortable: true,
      getCellObject: function (item) {
        return <td className="align-middle">{item.Id}</td>;
      },
    });

    this.Header.push({
      text_id: "field-event-type",
      field: "property_link",
      getCellObject: function (item) {
        // const link = LinkService.get(item.ObjectType, item.ObjectId);
        return (
          <td className="align-middle">
            <a href={item.Link}>
              <Trans>{item.Name}</Trans>
            </a>
          </td>
        );
      },
    });

    this.Header.push({
      text_id: "field-stage",
      field: "property_stage",
      //sortable: true,
      getCellObject: function (item) {
        return <td className="align-middle">{item.STAGE_ID}</td>;
      },
    });

    this.Header.push({
      text_id: "field-opportunity",
      field: "property_opportunity",
      getCellObject: function (item) {
        return <td className="align-middle">{item.Opportunity}</td>;
      },
    });

    // this.Header.push({
    //   text_id: "field-company-id",
    //   field: "property_companyId",
    //   getCellObject: function (item) {
    //     return <td className="align-middle">{item.CompanyId}</td>;
    //   },
    // });

    this.Header.push({
      text_id: "field-linkToCompany",
      field: "property_LinkToCompany",
      getCellObject: function (item) {
        return (
          <td className="align-middle">
            <a href={item.LinkToCompany}>
              <Trans>{item.COMPANY_NAME}</Trans>
            </a>
          </td>
        );
      },
    });
  }

  loadData = async () => {
    const currentDefinition = this;
    const sortBy = currentDefinition.state.sortBy.toUpperCase();
    const sortOrder = currentDefinition.state.sortOrder.toUpperCase();
    let requestData = {
      SORT: {},
      filter: {},
      start: currentDefinition.getOffset(),
      take: currentDefinition.getStep(),
    };
    requestData.SORT[sortBy] = sortOrder;
    currentDefinition.applyFilter(requestData.filter);

    try {
      let mainResult = await Rest.callMethod("crm.deal.list", requestData);
      let companiesResult = await Rest.callMethod("crm.company.list");

      let myItems = mainResult.items;
      let companies = companiesResult.items;
      console.warn("companies:", companies);

      myItems.forEach((item) => {
        let company = companies.find((comp) => comp.ID === item.COMPANY_ID);
        item.COMPANY_NAME = company.TITLE || "not found";
      });

      let items = myItems.map((x) => new Deal(x));

      currentDefinition.printRows(items, mainResult.total);
    } catch (err) {
      currentDefinition.loadDataError(err);
    } finally {
      currentDefinition.loadDataAlways();
    }
  };
}

export default DealTable;
