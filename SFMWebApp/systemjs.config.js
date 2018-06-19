/**
 * System configuration for Angular 2 samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
  System.config({
    paths: {
      // paths serve as alias
      'npm:': 'node_modules/'
    },
    // map tells the System loader where to look for things
    map: {
      // our app is within the app folder
      app: 'app',

      // angular bundles
      '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
      '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
      '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
      '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
      '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
      '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
      '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
      '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',

      // other libraries
      'rxjs': 'npm:rxjs',
      'ag-grid': 'npm:ag-grid',
      'ag-grid-angular': 'npm:ag-grid-angular',
      'angular2-datatable': 'npm:angular2-datatable',
      'lodash': 'npm:lodash',
      'angular2-busy': 'npm:angular2-busy',
      'angular2-dynamic-component': 'npm:angular2-dynamic-component',
      'ts-metadata-helper': 'npm:ts-metadata-helper',
      'core-js': 'npm:core-js',
    },
    // packages tells the System loader how to load when no filename and/or no extension
    packages: {
      app: {
        main: './main.js',
        defaultExtension: 'js'
      },
      rxjs: {
        defaultExtension: 'js'
      },
      'angular2-datatable': {
          main: 'index.js',
          defaultExtension: 'js'
      },
      'lodash': {
        main: 'lodash.js',
        defaultExtension: 'js'
      },
      'ag-grid': {
          main: 'main.js',
          defaultExtension: 'js'
      },
      'ag-grid-angular': {
          main:'main.js',
          defaultExtension:'js'
      },
      'angular2-busy': {
          main: 'index.js',
          defaultExtension: 'js'
      },
      'angular2-dynamic-component': {
          main: 'index.js',
          defaultExtension: 'js'
      },
      'ts-metadata-helper': {
          main: 'index.js',
          defaultExtension: 'js'
      },
      'core-js': {
          main: 'index.js',
          defaultExtension: 'js'
      }
    }
  });
})(this);