import { Trans, useTranslation } from "react-i18next";
import ValidationError from "../service/fieldValidator/validationError";

interface IProps {
    errors: ValidationError[]
}

function FieldErrors(props: IProps) {
    const { t } = useTranslation();
    return (
        <div>
            {props.errors && props.errors.length > 0 &&
                <ul className="mb-0">
                    {props.errors.map((error: ValidationError) => (
                        <li className={error.warning === 'Y' ? 'text-warning' : 'text-danger'} key={error.message}>
                            {error.field === 'Y' &&
                                <Trans i18nKey="validate-field" values={{ name: t(error.message) }}></Trans>
                            }
                            {error.format !== 'N' &&
                                <Trans i18nKey="validate-format" values={{ val: { name: t(error.message), format: error.format } }}></Trans>
                            }
                            {error.field !== 'Y' && error.format === 'N' &&
                                <Trans>{error.message}</Trans>
                            }
                        </li>
                    ))}
                </ul>
            }
        </div>
    );
}

export default FieldErrors;