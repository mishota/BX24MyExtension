import ValidationError from "./validationError";

class FieldValidator {
    static validate(fields: any[], errors: any) {
        let isValid = true;
        let updateState = false;

        fields.forEach((field) => {
            field.checks.forEach((item: any) => {
                if (!errors[field.name]) {
                    errors[field.name] = [];
                }
                if (item.check && errors[field.name].length < 1) {
                    errors[field.name].push(item.error);
                    isValid = false;
                    updateState = true;
                }
                else {
                    if (errors[field.name].some((x: ValidationError) => !x.isWarning)) {
                        isValid = false;
                    }
                }
            })
        });

        return {
            isValid,
            updateState
        };
    }
}

export default FieldValidator;