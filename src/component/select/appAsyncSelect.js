import React from "react";
import { Trans } from "react-i18next";
import AsyncSelect from 'react-select/async';

class AppAsyncSelect extends React.Component {
    constructor(props) {
        super();
        this.state = {
            selectActive: false
        };
    }

    _selectProgramFocus = () => {
        this.setState({ selectActive: true });
    }

    _selectProgramBlur = () => {
        this.setState({ selectActive: false });
    }

    _selectOnChange = (selected, action) => {
        if (selected) {
            //this.setState({value: selected});
        }
        else {
            //this.setState({value: false});
        }
        if (this.props.onChange) {
            this.props.onChange(selected, action);
        }
    }

    render() {
        const { required, title, onChange, ...newProps } = this.props;
        return (
            <React.Fragment>
                <AsyncSelect {...newProps} cacheOptions isClearable={true} placeholder='' onInputChange={this._selectInputChange} required={required} onChange={this._selectOnChange} onFocus={this._selectProgramFocus} onBlur={this._selectProgramBlur} />
                {title &&
                    <label className={`select-label ${this.props.value || this.state.selectActive ? 'active' : ''}`}><Trans>{title}</Trans></label>
                }
                {required &&
                    <input tabIndex={-1} autoComplete="off" style={{
                        opacity: 0,
                        width: "100%",
                        height: 0,
                        position: "absolute"
                    }} defaultValue={this.props.value ? 'Y' : ''} required />
                }
            </React.Fragment>
        );
    }
}

export default AppAsyncSelect;