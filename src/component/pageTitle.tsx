import React from 'react';
import { Trans } from 'react-i18next';

interface IProps {
    text: string,
    values?: any
}

export default class PageTitle extends React.Component<IProps> {
    render() {
        return (
            <h4><Trans i18nKey={this.props.text} values={this.props.values}></Trans></h4>
        );
    }
}