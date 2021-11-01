import React from "react";
import i18next from "i18next";
import { Trans } from "react-i18next";
import Select from "react-select";
import {
  MDBCheckbox,
  MDBDropdown,
  MDBDropdownMenu,
  MDBDropdownToggle,
  MDBDropdownItem,
  MDBDropdownLink,
} from "mdb-react-ui-kit";
import TableStyle from "./tableStyle";
import Loader from "../loader";
import Utils from "../../utils";
import { Rest } from "../../rest";
import lodash from "lodash";

class TableComponent extends React.Component {
  constructor() {
    super();
    this.Id = "table-component";
    this.state = {
      items: [],
      total: 0,
      currentPage: 1,
      filter: false,
      showOnPage: true,
      onPage: 10,
      editColumns: true,
      sortBy: "id",
      sortOrder: "desc",
      visibleColumns: [],
      showColumnVisibility: false,
      selectedItems: [],
      groupAction: false,
      filterKeysLenght: 0,
      messages: {
        empty: "data-not-found",
        filterEmpty: "data-not-found",
      },
      firstLoadComplete: false,
      loading: true,
    };
    this.Header = [];
    this.GroupActions = [];
    this.localSaveTimestamp = 0;
  }

  getComponentId() {
    return this.Id;
  }

  componentDidMount() {
    this.loadTableSettings();
  }

  loadTableSettings() {
    const settings = Utils.getFromLocalStorage(
      `${this.getComponentId()}-settings`
    );
    if (settings) {
      this.setState(settings);
    }
  }

  trySaveTableSettings() {
    const timestamp = new Date().getTime();
    const _ = this;
    _.localSaveTimestamp = timestamp;
    setTimeout(() => {
      if (timestamp !== _.localSaveTimestamp) {
        return;
      }
      _.saveTableSettings();
    }, 400);
  }

  saveTableSettings() {
    Utils.saveToLocalStorage(`${this.getComponentId()}-settings`, {
      onPage: this.state.onPage,
      visibleColumns: this.state.visibleColumns,
      sortBy: this.state.sortBy,
      sortOrder: this.state.sortOrder,
    });
  }

  loadData() {
    throw "not override in child";
  }

  getBlockView(item) {
    throw "not override in child";
  }

  getSmallBlockView(item) {
    throw "not override in child";
  }

  loadDataError(err) {
    console.error("loadDataError", err);
    this.setState({
      loading: false,
    });
  }

  loadDataAlways() {
    if (!this.state.firstLoadComplete) {
      this.setState({
        firstLoadComplete: true,
      });
    }
    Rest.resizeFrame();
  }

  tryLoadData() {
    this.setState(
      {
        loading: true,
      },
      () => {
        this.loadData();
      }
    );
  }

  applyFilter(filterData) {
    if (this.state.filter) {
      this.state.filter.fillRequestFilter(filterData);
      this.setState({
        filterKeysLenght: Object.keys(filterData).length,
      });
    }
    if (this.props.filter) {
      this.props.filter.current.fillRequestFilter(filterData);
      this.setState({
        filterKeysLenght: Object.keys(filterData).length,
      });
    }
  }

  setFilter(filter) {
    const _ = this;
    _.setState({ filter: filter }, () => {
      _.state.filter.FilterContainer.on("filter:find", function () {
        _.tryLoadData();
      });
    });
  }

  getChunk(data) {
    if (!data) return [];
    const currentDefinition = this;
    const chunk =
      currentDefinition.state.currentPage %
        (50 / currentDefinition.state.onPage) ||
      50 / currentDefinition.state.onPage;
    return lodash.chunk(data, currentDefinition.state.onPage)[chunk - 1] || [];
  }

  printRows(items, total) {
    items = this.getChunk(items);
    this.setState({
      loading: false,
      items: items,
      selectedItems: [],
      total: total,
    });
    if (!this.state.firstLoadComplete) {
      this.setState({
        firstLoadComplete: true,
      });
    }
  }

  getDropdownContent(
    buttons,
    className = "shadow-0 px-3",
    iconClassName = "fas fa-bars"
  ) {
    return (
      <MDBDropdown>
        <MDBDropdownToggle className={className} color="white">
          <i className={iconClassName}></i>
        </MDBDropdownToggle>
        <MDBDropdownMenu>
          {buttons.map((btn, i) => (
            <MDBDropdownItem key={i}>{btn}</MDBDropdownItem>
          ))}
        </MDBDropdownMenu>
      </MDBDropdown>
    );
  }

  getDropdownCell(buttons, id) {
    return (
      <td className="align-middle px-0">
        {this.getDropdownContent(buttons, id)}
      </td>
    );
  }

  selectRow = (id) => {
    if (this.state.selectedItems.includes(id)) {
      this.setState({
        selectedItems: this.state.selectedItems.filter((x) => x !== id),
      });
    } else {
      var { selectedItems } = this.state;
      selectedItems.push(id);
      this.setState({
        selectedItems: selectedItems,
      });
    }
  };

  selectAll = (e) => {
    var { selectedItems } = this.state;
    if (selectedItems.length === this.state.items.length) {
      this.setState({
        selectedItems: [],
      });
      return;
    }
    this.state.items.forEach(function (item) {
      if (!selectedItems.includes(item.id)) {
        selectedItems.push(item.id);
      }
    });
    this.setState({
      selectedItems: selectedItems,
    });
  };

  getSelectAllCell = function () {
    return (
      <th className="align-middle">
        <MDBCheckbox
          id="row-all"
          checked={this.isSelectedAll()}
          onChange={(e) => this.selectAll(e)}
        />
      </th>
    );
  };

  isSelected = (id) => {
    const { selectedItems } = this.state;
    return selectedItems.includes(id);
  };

  isSelectedAll = () => {
    const { items, selectedItems } = this.state;
    return items.length > 0 && items.length === selectedItems.length;
  };

  getSelectRowContent(id) {
    return (
      <MDBCheckbox
        name={`row-${id}`}
        id={`row-${id}`}
        checked={this.isSelected(id)}
        onChange={() => this.selectRow(id)}
      />
    );
  }

  getSelectRowCell(id) {
    return <td className="align-middle">{this.getSelectRowContent(id)}</td>;
  }

  getOffset() {
    return (this.state.currentPage - 1) * this.getStep();
  }

  getStep() {
    if (this.state.showOnPage) {
      return this.state.onPage;
    }
    return 10;
  }

  changeOnPage = (value) => {
    if (this.state.onPage === value) {
      return;
    }
    const _ = this;
    _.setState({ onPage: value, currentPage: 1 }, () => {
      _.trySaveTableSettings();
      _.tryLoadData();
    });
  };

  clickPaging = (value) => {
    if (value === "...") return;
    if (this.state.currentPage === value) {
      return;
    }
    const _ = this;
    _.setState({ currentPage: value }, () => {
      _.tryLoadData();
    });
  };

  clickSort = (e, field) => {
    const _ = this;
    if (this.state.sortBy === field) {
      this.setState(
        {
          sortOrder: this.state.sortOrder === "asc" ? "desc" : "asc",
        },
        () => {
          _.trySaveTableSettings();
          _.tryLoadData();
        }
      );
      return;
    }
    this.setState(
      {
        sortBy: field,
        sortOrder: "desc",
      },
      () => {
        _.trySaveTableSettings();
        _.tryLoadData();
      }
    );
  };

  clickEditColumnsVisibility = () => {
    this.setState({ showColumnVisibility: !this.state.showColumnVisibility });
  };

  clickShowColumn = (e, field) => {
    e.preventDefault();
    const visibleColumns = this.state.visibleColumns;

    const index = visibleColumns.indexOf(field);
    if (index > -1) {
      visibleColumns.splice(index, 1);
    } else {
      visibleColumns.push(field);
    }
    const _ = this;
    this.setState({ visibleColumns: visibleColumns }, () => {
      _.trySaveTableSettings();
    });
  };

  getArrayPagination = (num, limit, range) => {
    range = range || 3;
    var arr = [];
    for (let i = 1; i <= limit; i++) {
      if (
        i <= range ||
        (i > num - range / 2 && i < num + range / 2) ||
        i > limit - range
      ) {
        if (arr[arr.length - 1] && i != arr[arr.length - 1] + 1)
          arr.push("...");
        arr.push(i);
      }
    }
    return arr;
  };

  changeGroupAction(e) {
    this.setState({ groupAction: e.target.value });
  }

  clickApplyGroupAction = () => {
    const _ = this;
    const item = _.GroupActions.find((x) => x.id === _.state.groupAction);
    if (item) {
      _.btnGroupAction.setAttribute("disabled", "disabled");
      item.action(function () {
        _.btnGroupAction.removeAttribute("disabled");
      });
    }
  };

  getEmptyView = () => {
    return (
      <div className="default-block table-empty-block p-2 p-lg-3">
        <i className="fas fa-exclamation-triangle fa-2x me-2 text-danger"></i>
        <span className="ms-2 ms-lg-3">
          <Trans>
            {this.state.filterKeysLenght > 0
              ? this.state.messages.filterEmpty
              : this.state.messages.empty}
          </Trans>
        </span>
      </div>
    );
  };

  getLoadingView = () => {
    return (
      <div className="default-block table-empty-block p-2 p-lg-3 text-center">
        <Loader />
      </div>
    );
  };

  render() {
    if (!this.state.firstLoadComplete) return this.getLoadingView();

    if (this.state.items.length < 1) return this.getEmptyView();

    var lastPage = Math.floor(this.state.total / this.getStep());
    if (this.state.total % this.getStep() > 0) lastPage += 1;
    const arPagination = this.getArrayPagination(
      this.state.currentPage,
      lastPage,
      3
    );

    const groupActions = [];

    if (this.GroupActions.length > 0 && this.state.selectedItems.length > 0) {
      groupActions.push({
        value: "",
        label: i18next.t("table-select-group-action"),
      });
      this.GroupActions.forEach((item, index) => {
        groupActions.push({
          value: item.id,
          label: i18next.t(item.textId),
        });
      });
    }

    return (
      <React.Fragment>
        {this.props.style === TableStyle.block && (
          <div className="row">
            {this.state.items.map((item, index) => (
              <React.Fragment key={index}>
                {this.getBlockView(item)}
              </React.Fragment>
            ))}
          </div>
        )}
        {this.props.style === TableStyle.smallBlock && (
          <div className="row">
            {this.state.items.map((item, index) => (
              <React.Fragment key={index}>
                {this.getSmallBlockView(item)}
              </React.Fragment>
            ))}
          </div>
        )}
        {(this.props.style === TableStyle.default || !this.props.style) && (
          <div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    {this.Header.map((headerItem, i) => {
                      if (
                        headerItem.field &&
                        !headerItem.alwaysVisible &&
                        !this.state.visibleColumns.includes(headerItem.field)
                      )
                        return;
                      if (headerItem.getHeaderObject) {
                        return (
                          <React.Fragment key={i}>
                            {headerItem.getHeaderObject()}
                          </React.Fragment>
                        );
                      } else {
                        return (
                          <th
                            key={i}
                            className={
                              headerItem.sortable
                                ? "align-middle sortable"
                                : "align-middle"
                            }
                            onClick={(e) =>
                              headerItem.sortable
                                ? this.clickSort(e, headerItem.field)
                                : false
                            }
                          >
                            {headerItem.icon && (
                              <i className={headerItem.icon}></i>
                            )}
                            {headerItem.text_id && (
                              <span>
                                <Trans>{headerItem.text_id}</Trans>
                              </span>
                            )}
                            {headerItem.sortable &&
                              this.state.sortBy !== headerItem.field && (
                                <i className="fas fa-angle-down ms-1"></i>
                              )}
                            {this.state.sortBy == headerItem.field && (
                              <i
                                className={
                                  this.state.sortOrder !== "asc"
                                    ? "fas fa-angle-down ms-1"
                                    : "fas fa-angle-up ms-1"
                                }
                              ></i>
                            )}
                          </th>
                        );
                      }
                    })}
                  </tr>
                </thead>
                <tbody>
                  {this.state.items.map((item, index) => (
                    <tr key={item.id}>
                      {this.Header.map((headerItem, i) => {
                        if (
                          headerItem.field &&
                          !headerItem.alwaysVisible &&
                          !this.state.visibleColumns.includes(headerItem.field)
                        )
                          return;
                        return (
                          <React.Fragment key={i}>
                            {headerItem.getCellObject(item)}
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {this.GroupActions.length > 0 && this.state.selectedItems.length > 0 && (
          <div className="table-group-actions">
            <div className="row">
              <div className="col-12 col-lg-8 col-xl-5">
                <div className="d-flex">
                  <Select
                    className="w-100"
                    defaultValue={
                      this.state.groupAction
                        ? this.state.groupAction
                        : groupActions[0]
                    }
                    onChange={(e) => this.changeGroupAction(e)}
                    options={groupActions}
                  ></Select>
                  {this.state.groupAction.length > 0 && (
                    <button
                      className="btn btn-success m-0 ms-2 py-1"
                      ref={(ref) => (this.btnGroupAction = ref)}
                      onClick={this.clickApplyGroupAction}
                    >
                      <Trans>btn-apply</Trans>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="row my-3">
          <div className="col-12 col-lg-6">
            {arPagination.length > 0 && (
              <div className="table-pagination d-flex">
                {arPagination.map((item, index) => (
                  <button
                    key={index}
                    disabled={item === "..." ? true : false}
                    className={item == this.state.currentPage ? "active" : ""}
                    onClick={() => this.clickPaging(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
          {this.state.showOnPage && (
            <div className="col-12 col-lg-6 table-on-page d-flex flex-row-reverse">
              {this.state.editColumns && (
                <MDBDropdown>
                  <MDBDropdownToggle className="shadow-0" color="light">
                    <i className="fas fa-cog"></i>
                  </MDBDropdownToggle>
                  <MDBDropdownMenu>
                    {this.Header.map((headerItem, i) => {
                      if (headerItem.alwaysVisible) return;
                      if (headerItem.field) {
                        return (
                          <MDBDropdownItem key={i}>
                            <MDBDropdownLink
                              tag="button"
                              type="button"
                              className={
                                this.state.visibleColumns.includes(
                                  headerItem.field
                                )
                                  ? "active"
                                  : ""
                              }
                              onClick={(e) =>
                                this.clickShowColumn(e, headerItem.field)
                              }
                            >
                              <Trans>{headerItem.text_id}</Trans>
                            </MDBDropdownLink>
                          </MDBDropdownItem>
                        );
                      }
                    })}
                  </MDBDropdownMenu>
                </MDBDropdown>
              )}
              {[50, 25, 10].map((item, i) => (
                <button
                  className={item == this.state.onPage ? "active" : ""}
                  key={i}
                  onClick={() => this.changeOnPage(item)}
                >
                  {item}
                </button>
              ))}
              <span>
                <Trans>table-on-page</Trans>
              </span>
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
}

export default TableComponent;
