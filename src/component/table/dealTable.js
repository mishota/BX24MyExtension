import { Trans } from "react-i18next";
import { Rest } from "../../rest";
import TableComponent from "./tableComponent";
import Deal from "../../models/deal";

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
      "property_LinkToCompany",
    ];

    this.Header.push({
      text_id: "field-id",
      field: "id",
      sortable: true,
      getCellObject: function (item) {
        return <td className="align-middle">{item.Id}</td>;
      },
    });

    this.Header.push({
      text_id: "field-deal-title",
      field: "property_link",
      getCellObject: function (item) {
        return (
          <td className="align-middle">
            {/* <span
              onClick={() => {
                Rest.openPath(item.shortLink);
              }}
            >
              <Trans>{item.Name}</Trans>
            </span> */}
            <a href={item.Link} target="_blank" rel="noreferrer">
              <Trans>{item.Name}</Trans>
            </a>
          </td>
        );
      },
    });

    this.Header.push({
      text_id: "field-stage",
      field: "property_stage",
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

    this.Header.push({
      text_id: "field-Company",
      field: "property_LinkToCompany",
      getCellObject: function (item) {
        return (
          <td className="align-middle">
            {item.Company && (
              <a
                href={item.Company.LinkToCompany}
                target="_blank"
                rel="noreferrer"
              >
                <Trans>{item.Company.TITLE}</Trans>
              </a>
            )}
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
      let deals = mainResult.items;
      let companyIds = new Set();
      deals.forEach((deal) => {
        companyIds.add(deal.COMPANY_ID);
      });
      companyIds = Array.from(companyIds);

      let companies = await Rest.getCompanies(companyIds);

      deals.forEach((deal) => {
        if (companies[deal.COMPANY_ID]) {
          deal.Company = companies[deal.COMPANY_ID];
        }
      });

      let items = deals.map((x) => new Deal(x));

      currentDefinition.printRows(items, mainResult.total);
    } catch (err) {
      currentDefinition.loadDataError(err);
    } finally {
      currentDefinition.loadDataAlways();
    }
  };
}

export default DealTable;
