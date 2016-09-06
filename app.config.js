
angular
    .module('MyApp.config', ['ui.router'])
    .config(config)
    .run(function($state) {
    $state.go('Calendar'); 
});

function config ($stateProvider) {
    
    $stateProvider.
        state('Calendar',{
                    url:'/calendar',
                    templateUrl:'Calendar.html',
                    controller:'CalendarCtrl'
        });
}