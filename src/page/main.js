import React from "react";
import DealTable from "../component/table/dealTable";
import { AppContext } from "../context/app.context";
import { Rest } from "../rest";
import Filter from "../component/filter/filter";
import FilterItem from "../component/filter/filterItem";
import FilterType from "../component/filter/filterType";

export default class MainPage extends React.Component {
  constructor() {
    super();
    this.state = {
      profileName: "noName",
    };
    this.filterItems = [
      new FilterItem(FilterType.Hidden, "id", "field-id", {
        Typing: "Y",
        PREFIX: "Y",
      }),
    ];

    this.table = React.createRef();
    this.filter = React.createRef();
  }
  // static appContext = AppContext;

  componentDidMount() {
    this.showInformation();
  }

  showInformation = () => {
    Rest.callMethod("profile").then((res) => {
      this.profileInfo = res.items[0].NAME;
      this.setState({ profileName: res.items[0].NAME });
    });
  };

  refreshTable = () => {
    if (this.table && this.table.current) {
      this.table.current.tryLoadData();
    }
  };

  render() {
    return (
      <div>
        <h1>Привет, {this.state.profileName}, вот список твоих сделок.</h1>
        <div className="d-xl-flex mb-3 mt-3">
          <Filter
            ref={this.filter}
            id={"filter-deal"}
            items={this.filterItems}
            refreshTable={this.refreshTable}
          />
        </div>
        <DealTable ref={this.table} />
      </div>
    );
  }
}
