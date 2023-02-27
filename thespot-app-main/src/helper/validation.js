
export const validations = {
    loginValidation,
    signUpValidation,
    changePasswordValidations,
    AddressValidations
};

function loginValidation(errors, state) {
    let keysArr = Object.keys(state); // state is having all key and value from main from and then check here
    console.log(keysArr, 'key arrrr')
    for (let i = 0; i < keysArr.length; i++) {
        switch (keysArr[i]) {
            case "email":
                if (!state.email) {
                    console.log('aksdjhjksad', state.email)
                    errors = "Please enter email";
                } else if (state.email != "") { // Email is valid or not 
                    if (isNaN(state.email)) {
                        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                        if (reg.test(state.email) === false) {
                            errors = "Email is Not Correct"
                        }
                    }
                }
                break;
            case "password":
                if (!state.password) {
                    errors = "Please enter password";
                }
                break;
            case "reactions":
                if (!state.reactions) {
                    errors = "Please select allergies and reactions";
                }
                break;
            case "disease":
                if (!state.disease) {
                    errors = "Please select disease";
                }
                break;
            case "phone":
                if (!state.phone) {
                    errors = "Please enter mobile number"
                }
                break;
            case "height_inches":
                if (state.height_inches != '') {
                    if (!state.height) {
                        errors = "Please enter height also"
                    }
                }
                break;
            default:
                break;
        }
        if (errors.length > 0) {
            break;
        }
    }
    return errors;
}

function signUpValidation(errors, state) {
    let keysArr = Object.keys(state); // state is having all key and value from main from and then check here

    for (let i = 0; i < keysArr.length; i++) {
        switch (keysArr[i]) {
            case "name":
                if (!state.name) {
                    errors = "Please enter name"
                } else if (state.name.length < 3) {
                    errors = "Please add minimum 3 characters";
                } else if (state.name != '') {
                    let reg = /^([a-zA-Z]{1})+([a-zA-Z\s]{0,1})+([a-zA-Z])$/;
                    if (reg.test(state.name) === false) {
                        errors = "Allow only character value"
                    }
                }
                break;
            case "last_name":
                if (!state.last_name) {
                    errors = "Please enter last name"
                } else if (state.last_name != '') {
                    let reg = /^([a-zA-Z]{1})+([a-zA-Z\s]{0,1})+([a-zA-Z])$/;
                    if (reg.test(state.last_name) === false) {
                        errors = "Allow only character value"
                    }
                }
                break;
            case "email":
                if (!state.email) {
                    errors = "Please enter email";
                } else if (state.email != "") { // Email is valid or not 
                    let reg = /^(?=.{1,80}$)([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9])+$/;
                    if (reg.test(state.email) === false) {
                        errors = "Email is Not Correct"
                    }
                }
                break;
            case "phone":
                if (!state.phone) {
                    errors = "Please enter mobile number"
                } else if (state.phone.length < 7) {
                    errors = "Mobile Number should be greater than 7 digit"
                } else if (state.phone.length > 15) {
                    errors = "Mobile Number should be less than 15 digit"
                } else if (state.phone != '') {
                    let reg = /[0-9]/gm;
                    if (reg.test(state.phone) === false) {
                        errors = "Mobile field accept only numeric value"
                    }
                }
                break;
            case "password":
                if (!state.password) {
                    errors = "Please enter password";
                } else if (state.password != '') {
                    let reg = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,}$/;
                    if (reg.test(state.password) === false) {
                        errors = "Password must be 6-20 characters with 1 uppercase, 1 lowercase and 1 number"
                    }
                }
                break;
            case "confirm":
                if (!state.confirm) {
                    errors = "Please enter confirm password"
                } else if (state.password != state.confirm) {
                    errors = "Passwords do not match"
                }
                break;
            case "termsAndConditionsCheck":
                if (!state.termsAndConditionsCheck) {
                    errors = "Please accept terms & conditions"
                }
                break;
            case 'gender':
                if (!state.gender) {
                    errors = "Please select gender"
                }
                break;
            case 'dob':
                if (!state.dob) {
                    errors = "Please select date of birth"
                }
                break;
            case 'weight':
                if (!state.weight) {
                    errors = "Please enter weigth"
                }
                break;
            case 'height':
                if (!state.height) {
                    errors = "Please enter height"
                } else if (state.height.toString().length < 3) {
                    errors = "Height should be 3 digits"
                }
                break;
            case 'blood':
                if (!state.blood) {
                    errors = "Please select blood group"
                }
                break;
            case 'nationality':
                if (!state.nationality) {
                    errors = "Please enter nationality"
                } else if (state.nationality.length < 3) {
                    errors = "Please add minimum 3 characters";
                } else if (state.nationality != '') {
                    let reg = /^([a-zA-Z]{1})+([a-zA-Z\s]{0,1})+([a-zA-Z])$/;
                    if (reg.test(state.nationality) === false) {
                        errors = "Allow only character value"
                    }
                }
                break;
            case 'description':
                if (!state.description.trim()) {
                    errors = "Please introduction yourself"
                }
                break;
            default:
                break;
        }
        if (errors.length > 0) {
            break;
        }
    }
    return errors;
}

function changePasswordValidations(errors, state) {
    let keysArr = Object.keys(state); // state is having all key and value from main from and then check here
    for (let i = 0; i < keysArr.length; i++) {
        switch (keysArr[i]) {
            case "old":
                if (!state.old) {
                    errors = "Please enter old password";
                }
                break;
            case "new":
                if (!state.new) {
                    errors = "Please enter new password";
                }
                break;
            case "confirm":
                if (!state.confirm) {
                    errors = "Please enter confirm password"
                } else if (state.new != state.confirm) {
                    errors = "Password and confrim password not matched"
                }
                break;
            default:
                break;
        }
        if (errors.length > 0) {
            break;
        }
    }
    return errors;
}

function AddressValidations(errors, state) {
    let keysArr = Object.keys(state); // state is having all key and value from main from and then check here
    for (let i = 0; i < keysArr.length; i++) {
        switch (keysArr[i]) {
            case "flat_number":
                if (!state.flat_number) {
                    errors = "Please enter flat/buliding number";
                }
                break;
            case "street":
                if (!state.street) {
                    errors = "Please enter street";
                }
                break;
            case "area":
                if (!state.area) {
                    errors = "Please enter area"
                }
                break;
            default:
                break;
        }
        if (errors.length > 0) {
            break;
        }
    }
    return errors;
}