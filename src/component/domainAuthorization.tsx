import React from "react";
import { Trans } from "react-i18next";
import axios from "axios";
import User from "../models/user";
import { Rest } from "../rest";
import Loader from "./loader";

interface IState {
    isLoaded: boolean,
    domainAuth?: User
}

export default class DomainAuthorization extends React.Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isLoaded: false
        }
    }

    componentDidMount() {
        this.checkDomainAuth();
    }

    async checkDomainAuth() {
        const currentUserAuthData = Rest.getAuth();
        if (!currentUserAuthData)
            return;

        try {
            const result = await axios.post('/domain/auth', currentUserAuthData);
            const data = result.data;
            this.setState({
                isLoaded: true,
                domainAuth: new User(data.domainAuth) || false
            });
        }
        catch (err) {
            console.error('error checkDomainAuth', err);
            this.setState({
                isLoaded: true
            });
        }
    }

    sendAuthData = async () => {
        const currentUserAuthData = Rest.getAuth();
        if (!currentUserAuthData)
            return;

        currentUserAuthData.lang = Rest.getLang();

        this.setState({
            isLoaded: false
        });

        try {
            const result = await axios.post('/domain/save', currentUserAuthData);
            const data = result.data;
            if (data.result) {
                this.checkDomainAuth();
            }
            else {
                console.error('error sendAuthData', data, result);
                this.setState({
                    isLoaded: true
                });
            }
        }
        catch (err) {
            console.error('catch error sendAuthData', err);
            this.setState({
                isLoaded: true
            });
        }
    }

    render() {
        if (!this.state.isLoaded) {
            return (
                <div className="row">
                    <div className="col-12 col-xl-6">
                        <Loader />
                    </div>
                </div>
            );
        }

        return (
            <div className="d-xl-flex">
                <div className="flex-grow-1">
                    {!this.state.domainAuth
                        ?
                        <div className="bg-warning shadow-1-strong p-2 text-white">
                            <Trans>msg-server-domain-not-authorized</Trans>
                        </div>
                        :
                        <a className="d-block bg-success shadow-1-strong p-2 text-white" href={this.state.domainAuth.Link} target="_blank">
                            <Trans>msg-server-domain-authorized</Trans>: {this.state.domainAuth.FullName}
                        </a>
                    }
                </div>
                <div className="ms-0 ms-xl-2 mt-2 mt-xl-0">
                    <button type="button" className="btn btn-primary h-100" onClick={this.sendAuthData}>
                        <Trans>settings-send-user-auth-data</Trans>
                    </button>
                </div>
            </div>
        );
    }
}