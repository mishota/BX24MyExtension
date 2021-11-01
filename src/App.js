import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Modal from "react-modal";
import moment from "moment";
import "moment/locale/ru";
import MainPage from "./page/main";
import LogPage from "./page/log";
import SettingsPage from "./page/settings";
import UpdatePage from "./page/update";
import { AppContext } from "./context/app.context";
import { DataStorage } from "./enum/dataStorage";
import Loader from "./component/loader";
import { Rest } from "./rest";
import Utils from "./utils";
import i18n from "./i18n";
import { AccessKey } from "./enum/accessKey";
import Header from "./component/header";
import MainTable from "./page/mainTable";

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      appVersion: 1,
      settingsCache: {},
      settings: {},
      loading: true,
      needUpdate: false,
      headerVisibility: true,
    };

    this.DefaultSettings = [
      new SettingsItem("AdminList", "", function () {
        return [];
      }),
      new SettingsItem(
        "Version",
        "",
        function () {
          return 0;
        },
        false
      ),
    ];

    Modal.setAppElement("#root");
  }

  componentDidMount() {
    this.init();
  }

  async init() {
    const _ = this;
    try {
      const currentUser = await Rest.init();
      moment.locale(Rest.getLang());
      i18n.changeLanguage(Rest.getLang());
      _.setState(
        {
          currentUser: currentUser,
        },
        async () => {
          await _.initAppSettings();
          _.setState({
            loading: false,
          });

          if (parseInt(_.state.settings.Version.Value) !== _.state.appVersion) {
            _.setNeedUpdate();
          } else {
            await _.tryCheckInstall();
          }
        }
      );
    } catch (err) {
      _.setState({
        loading: false,
      });
    }
  }

  setAppSettings = async (key, data) => {
    var rd = {
      ENTITY: DataStorage.settings,
      NAME: key,
      ID: "",
      PROPERTY_VALUES: {
        VALUE: JSON.stringify(data),
      },
    };

    if (this.state.settingsCache[key]) {
      rd.ID = this.state.settingsCache[key].ID;
      const result = await Rest.callMethod("entity.item.update", rd);
      return true;
    } else {
      const result = await Rest.callMethod("entity.item.add", rd);
      return true;
    }
  };

  initAppSettings = () => {
    const _ = this;
    return new Promise((resolve, reject) => {
      _.setState(
        {
          settingsCache: {},
        },
        async () => {
          await _.getAppSettingsCache();
          var appSettings = {};
          _.DefaultSettings.forEach(function (item) {
            const appSettingsValue = _.getAppSettings(item.Key);
            appSettings[item.Key] = new SettingsItem(
              item.Key,
              appSettingsValue ? appSettingsValue : item.Default(),
              item.Default,
              item.SaveInSettings
            );
          });
          _.setState(
            {
              settings: appSettings,
            },
            () => {
              resolve(true);
            }
          );
        }
      );
    });
  };

  getAppSettingsCache = async () => {
    const settingsCache = {};
    try {
      const result = await Rest.callMethod(
        "entity.item.get",
        { ENTITY: DataStorage.settings },
        true
      );
      result.items.forEach(function (item) {
        settingsCache[item.NAME] = item;
      });
      this.setState({
        settingsCache: settingsCache,
      });
    } catch (err) {
      console.error("getAppSettingsCache", err);
      this.setNeedUpdate();
    }
  };

  getAppSettings = (key) => {
    return this.state.settingsCache[key]
      ? Utils.tryParseJson(this.state.settingsCache[key].PROPERTY_VALUES.VALUE)
      : false;
  };

  updateComplete = () => {
    this.setState({
      needUpdate: false,
    });
  };

  access = (key) => {
    const user = this.state.currentUser || null;
    if (!user) return false;

    switch (key) {
      case AccessKey.settings:
        if (
          this.state.settings &&
          this.state.settings["AdminList"].Value.includes(user.Id)
        ) {
          return true;
        }
        return user.isAdmin;
    }
    return user.isAdmin;
  };

  getCurrentUser = () => {
    return this.state.currentUser;
  };

  setNeedUpdate() {
    this.setState({
      needUpdate: true,
    });
  }

  async tryCheckInstall() {
    //для ситуации когда переустановили с сохранением параметров
    try {
      const result = await Rest.callMethod("app.info");
      if (result.items && result.items.length > 0) {
        if (!result.items[0].INSTALLED) {
          this.setNeedUpdate();
          return false;
        }
        return true;
      }
    } catch (err) {
      console.error("tryCheckInstall", err);
      return false;
    }
  }

  setHeaderVisibility = (state) => {
    this.setState({
      headerVisibility: state,
    });
  };

  render() {
    if (this.state.loading) {
      return (
        <div className="app container-fluid my-2">
          <div className="text-center">
            <Loader />
          </div>
        </div>
      );
    }

    if (!Rest.isInitComplete()) {
      return (
        <div className="app container-fluid my-2">
          This is Sparta! (not bitrix) 123
        </div>
      );
    }

    return (
      <AppContext.Provider
        value={{
          appVersion: this.state.appVersion,
          getCurrentUser: this.getCurrentUser,
          settings: this.state.settings,
          initAppSettings: this.initAppSettings,
          setAppSettings: this.setAppSettings,
          updateComplete: this.updateComplete,
          access: this.access,
          setHeaderVisibility: this.setHeaderVisibility,
        }}
      >
        <Router>
          <div className="app container-fluid my-2">
            {!this.state.loading && !this.state.needUpdate && (
              <>
                {this.state.headerVisibility && <Header />}
                <Switch>
                  <Route path="/log" component={LogPage} />
                  <Route path="/settings" component={SettingsPage} />
                  <Route path="/" component={MainPage} />
                </Switch>
              </>
            )}
            {this.state.needUpdate && <UpdatePage />}
          </div>
        </Router>
      </AppContext.Provider>
    );
  }
}

class SettingsItem {
  constructor(key, value, funcDefault, saveInSettings = true) {
    this.Key = key;
    this.Value = value;
    this.Default = funcDefault;
    this.SaveStatus = true;
    this.SaveInSettings = saveInSettings;
  }
}
