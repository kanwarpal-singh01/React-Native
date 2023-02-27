import validate from 'validate.js';
import Message from './MessageUtils';
import {store} from "../redux/store";
// import Strings from "./strings";

let constraints = (Strings) => ({
    name: {
        presence: {
            message: Strings.nameBlank
        },
        length: {
            maximum: 50,
            tooLong: Strings.nameLength
        },
        format: {
            pattern: /^[A-Za-zÀ-ÖØ-öø-ÿء-ي\s]*$/,
            message: Strings.nameInvalid,
        }
    },
    voucher: {
        presence: {
            message: Strings.voucherBlank
        },
        length: {
            maximum: 8,
            tooLong: Strings.voucherLength
        },

    },
    email: {
        presence: {
            message: Strings.emailBlank
        },
        format: {
            pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            message: Strings.emailInvalid,
        }
    },
    password: {
        presence: {
            message: Strings.passwordBlank
        },
        length: {
            minimum: 6,
            message: Strings.passwordLength,
        },
        format: {
            pattern: /^\S*$/,
            message: Strings.passwordInvalid,
        }
    },
    passwordBlank: {
        presence: {
            message: Strings.passwordBlank
        }
    },
    phoneNo: {
        presence: {
            message: Strings.phoneBlank
        },
        numericality: {
            onlyInteger: true,
            notValid: Strings.phoneInvalid
        },
        length: {
            maximum: 12,
            minimum: 7,
            message: Strings.phoneLength,
        },
        format: {
            pattern: /^(?!0+$)\d{7,}$/,
            message: Strings.phoneInvalid,
        }
    },
    reviewText: {
        presence: {
            message: Strings.reviewBlankError
        }
    },
    otp: {
        presence: {
            message: Strings.emptyCode
        },
        numericality: {
            onlyInteger: true,
            notValid: Strings.otpCodeInvalid,
        }
    },
    streetName: {
        presence: {
            message: Strings.streetNameBlank
        }
    },
    neighbourHood: {
        length: {
            maximum: 100,
            message: Strings.neighbourHoodInvalid
        }
    },
    addressLabel: {
        length: {
            maximum: 10,
            message: Strings.addressLabelInvalid
        }
    },
    zipCode: {
        presence: {
            message: Strings.zipCodeBlank
        },
        numericality: {
            onlyInteger: true,
            notValid: Strings.zipCodeInvalid
        },
        length: {
            maximum: 6,
            minimum: 5,
            message: Strings.zipCodeLong,
        },
    },
    country: {
        presence: {
            message: Strings.countryBlank
        },
    },
    state: {
        presence: {
            message: Strings.stateBlank
        },
    }
});

export function validation(fieldName, value) {
    let formValues = {};
    formValues[fieldName] = value === '' ? null : value;
    let result;
    let formFields = {};
    let appConfig = store.getState().appConfig,
        langCode = store.getState().langCode;

    let selectedLang = appConfig.languages.find(lang => lang.language_id === langCode);
    let Strings = selectedLang.translations;
    
    formFields[fieldName] = constraints(Strings)[fieldName];

    if (fieldName === 'phoneNo') {
        if (value !== null &&
            value !== undefined &&
            value.startsWith('0')) {
            return Strings.phoneWithoutZero
        } else {
            result = validate(formValues, formFields, {fullMessages: false});
        }
    } else {
        result = validate(formValues, formFields, {fullMessages: false});
    }

    if (result) {
        return result[fieldName][0]
    }
    return null
}


let PasswordConstraints = {
    confirmPassword: {
        equality: {
            attribute: 'password',
            message: Message.Errors.pwdMisMatch
        }
    }
};

/**
 * @return {null}
 */
export function PasswordValidate(password, confirmPassword) {
    let result1 = validate({
        password: password,
        confirmPassword: confirmPassword
    }, PasswordConstraints, {fullMessages: false});

    if (result1 !== null && result1 !== undefined) {
        if (result1['confirmPassword'] !== undefined)
            return result1['confirmPassword'][0];
    }
    return null;

}