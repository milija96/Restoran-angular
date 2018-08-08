// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiBaseUrl: "https://biber-so.herokuapp.com/webapi/",
  firebaseConfig : {
    apiKey: "AIzaSyD7a-qluxJN_g1iYHrrVD2YuBGmXohlk6E",
    authDomain: "restoranapp-15444.firebaseapp.com",
    databaseURL: "https://restoranapp-15444.firebaseio.com",
    projectId: "restoranapp-15444",
    storageBucket: "",
    messagingSenderId: "1027404922717"
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
