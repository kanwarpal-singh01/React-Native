/* -- set app title --*/
const AppTitle = "The Spot";

/* -- set app mode -- */
const AppMode = ["production"];

/* -- set API URLs --*/
const development = "https://thespot.devtechnosys.info/api/"; //https://myfam.devtechnosys.tech/api/
const production = "https://admin.thespotapplication.com/api/";
// const testing = "http://192.168.43.178:4000";
// const testing = "http://192.168.1.10:4000";
// const testing = "http://142.93.210.127:4000";



/* -- API URL Configuration --*/
var ApiUrl;
switch (AppMode[0]) {
    case "development":
        ApiUrl = development;
        break;
    case "production":
        ApiUrl = production;
        break;
    case "testing":
        ApiUrl = testing;
        break;
    default:
        ApiUrl = "https://thespot.devtechnosys.info/api/"
}

export {
    AppTitle,
    ApiUrl,
    AppMode
}