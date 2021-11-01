import React from 'react';
import { NavLink } from "react-router-dom";
import { Trans } from 'react-i18next';
import { AppContext } from '../context/app.context';
import { AccessKey } from '../enum/accessKey';
import '../css/header.css';

class Header extends React.Component {
    static contextType = AppContext;
    render() {
        return (
            <>
                <header className="row">
                    <div className="col-sm-6 col-lg-6">
                        <NavLink className="profile-menu-item pb-3" activeClassName="profile-menu-item-active" exact to="/">
                            <Trans>page-main</Trans>
                        </NavLink>
                        {this.context.access(AccessKey.settings) &&
                            <>
                                <NavLink className="profile-menu-item pb-3" activeClassName="profile-menu-item-active" to="/log">
                                    <Trans>page-log</Trans>
                                </NavLink>
                                <NavLink className="profile-menu-item pb-3" activeClassName="profile-menu-item-active" to="/settings">
                                    <Trans>page-settings</Trans>
                                </NavLink>
                            </>
                        }
                    </div>
                    <div className="col-sm-6 col-lg-6 d-flex flex-row-reverse header-right-buttons">
                        <a href="https://google.com" target="_blank">
                            <a className="btn btn-success btn-md btn-floating me-1" role="button">
                                <i className="fas fa-shopping-cart"></i>
                            </a>
                            <Trans>btn-rates</Trans>
                        </a>
                        <a href="https://google.com" target="_blank" className="me-2">
                            <a className="btn btn-warning btn-md btn-floating me-1" role="button">
                                <i className="fas fa-dollar-sign"></i>
                            </a>
                            <Trans>btn-buy</Trans>
                        </a>
                        <a href="https://google.com" target="_blank" className="me-2">
                            <a className="btn btn-info btn-md btn-floating me-1" role="button">
                                <i className="fas fa-question"></i>
                            </a>
                            <Trans>btn-help</Trans>
                        </a>
                    </div>
                </header>
                <hr className="mt-0 mb-4" />
            </>
        );
    }
}

export default Header;