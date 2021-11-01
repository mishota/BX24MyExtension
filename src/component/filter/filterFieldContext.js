import React from "react";

const defaultFieldContext = {
    value: false,
    filterItem: {},
    onChange: () => {},
    language: ''
};

export const FilterFieldContext = React.createContext(defaultFieldContext);