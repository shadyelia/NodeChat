// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  azureStorage: {
    containerName: "samplecontaier",
    storageAccessToken:
      "?sv=2019-02-02&ss=bfqt&srt=sco&sp=rwdlacup&se=2019-10-27T18:00:30Z&st=2019-10-27T10:00:30Z&spr=https&sig=HnS9SGu592e7%2F0sPkpwJhcY3MClD2lankS68YFqhfW4%3D",
    storageUri: "https://orcatechsotrage.blob.core.windows.net"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
