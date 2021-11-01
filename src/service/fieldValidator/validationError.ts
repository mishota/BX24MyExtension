interface IValidationError {
    message: string;
    field: string;
    format: string | null;
    warning: string;
}

class ValidationError {
    message: string;
    field: string;
    format: string;
    warning: string;

    constructor(message: string, obj?: Partial<IValidationError>) {
        this.message = message;
        this.field = obj && obj.field || 'N';
        this.format = obj && obj.format || 'N';
        this.warning = obj && obj.warning || 'N';
    }

    get isWarning() {
        return this.warning === 'Y';
    }
}

export default ValidationError;