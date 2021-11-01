import React from "react";
import { Link } from "react-router-dom";
import { Trans } from "react-i18next";
import { Rest } from '../rest';
import { AppContext } from '../context/app.context';
import UserSelect from "../component/select/user";
import DomainAuthorization from "../component/domainAuthorization";

export default class SettingsPage extends React.Component {
    static contextType = AppContext;

    constructor() {
        super();
        this.state = {
            isLoaded: false,
            loading: true,
            admins: []
        };
    }

    componentDidMount() {
        this.refreshData();
    }

    async refreshData() {
        this.setState({
            loading: true
        });

        const users = await Rest.getUsers(this.context.settings.AdminList.Value);
        const admins = [];

        this.context.settings.AdminList.Value.forEach(id => {
            if (users[id]) {
                admins.push({ value: users[id].Id, label: users[id].FullName });
            }
        });
        this.setState({
            loading: false,
            admins: admins
        }, () => {
            Rest.resizeFrame()
        });
    }

    onAdminsChange = (selected) => {
        this.setState({
            admins: selected
        });
    }

    onSubmit = async (e) => {
        if (e) e.preventDefault();
        const _ = this;
        const adminIds = _.state.admins.map(x => x.value);

        if (adminIds.length > 0 && !adminIds.includes(_.context.getCurrentUser().Id)) {
            adminIds.push(_.context.getCurrentUser().Id);
        }
        await _.context.setAppSettings('AdminList', adminIds);
        await _.context.initAppSettings();
        _.refreshData();
    }

    render() {
        return (
            <div>
                <form onSubmit={this.onSubmit}>
                    <div className="row mt-4">
                        <div className="col-12 col-lg-8 col-xl-7 col-xxl-6">
                            <div><Trans>field-administrators</Trans></div>
                            <div className="form-outline">
                                <UserSelect value={this.state.admins} onChange={this.onAdminsChange} isMulti={true} />
                            </div>
                        </div>
                    </div>
                    {!this.loading &&
                        <div className="mt-4">
                            <button type="submit" className="btn btn-primary me-2"><Trans>btn-save</Trans></button>
                            <Link to="/" className="btn btn-outline-primary"><Trans>btn-cancel</Trans></Link>
                        </div>
                    }
                </form>
            </div>
        );
    }
    /* <hr />
<div className="row mt-4">
    <div className="col-12 col-lg-8 col-xl-7 col-xxl-6">
        <DomainAuthorization />
    </div>
</div> */
}