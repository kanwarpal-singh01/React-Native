const Errors = {
    nameBlank: "Please enter Name",
    nameLength: "Name characters exceed limit",
    nameInvalid: 'Name is invalid',
    emailBlank: "Please enter Email",
    emailValidity: "Email is not valid",
    pwdBlank: "Please enter Password",
    pwdInvalid: "Password cannot contain whitespaces",
    pwdLengthMinimum: "Password must be at least 6 characters",
    pwdMisMatch: "Password not match",

    phoneBlank: 'Phone number is required',
    phoneInvalid: 'Phone number is invalid',
    phoneTooLong: 'Phone number  exceed limit',
    phoneTooShort: 'Phone number is too short',

    addressLineFirstLength: "Address exceed limit",
    addressLineFirstBlank: 'Please enter address',

    addressLineSecondLength:'Address exceed limit',

    addressLabelLength:'Label exceed limit',

    cityNameBlank: 'Please enter CityName',
    cityNameLength: 'city name exceed limit',
    zipCodeBlank: 'Please enter ZipCode',
    zipCodeInvalid: 'Zip Code is invalid',
    zipCodeLong: 'Zip Code must be 5 to 6 digits',

    countryBlank: 'Please select country',
    stateBlank: 'Please select state',

    serverError: "Something went wrong.Please try again.",
    internetError: "Internet not available.",
    invalidToken: "User is unauthorized. Please login again.",
    requestTimeOut: "Something went wrong.Please try again.",
};

const PermissionMessage = {
    cancel: 'Cancel',
    ok: 'ok',
    openSetting: 'Open Setting',
    authorized: 'authorized',
    denied: 'denied',
    restricted: 'restricted',
    granted: 'granted',
    never_ask_again: 'never_ask_again',

    //Camera
    cameraPermissionTitle: 'Camera',
    cameraPermissionMessage: "We need access so you can take pic, please open this app's setting and allow camera access",

    //Photo
    photoPermissionTitle: 'Photo',
    photoPermissionMessage: "We need access so you can upload pic, please open this app's setting and allow photo access",

    //Location
    locationPermissionTitle: 'Location',
    locationPermissionMessage: "We need access so we can get your current location, please open this app's setting and allow location access.",


    //Notification
    notificationPermissionTitle: 'Notification',
    notificationPermissionMessage: "We need access so you can get notification, please open this app's setting and allow notification access.",

    //Storage
    storagePermissionTitle: 'Storage',
    storagePermissionMessage: "We need access so we can get your storage, please open this app's setting and allow storage access.",

    //Contacts
    contactPermissionTitle: 'Contact',
    contactPermissionMessage: "We need access so we can get your contacts, please open this app's setting and allow contacts access.",

    //Phone Call
    phoneCallPermissionTitle: 'PhoneCall',
    phoneCallPermissionMessage: "We need access so we can allow you to call, please open this app's setting and allow phone call access.",

    //Read Sms
    readSmsPermissionTitle: 'ReadSms',
    readSmsPermissionMessage: "We need access so we can get your sms, please open this app's setting and allow message access.",
};

export default {Errors, PermissionMessage};

