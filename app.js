
angular.module('MyApp',['MyApp.config','ngAnimate', 'ngSanitize', 'ui.bootstrap'])

  .constant('CLIENT_ID', '93518187478-rccudv7ld6i7ln0pnvc2naemphbu711r.apps.googleusercontent.com')
  .constant('API_KEY','AIzaSyC-35UVsno34Q3XBeFCa9gGzFn7V5GHkqQ')        
  .constant('SCOPES',['https://www.googleapis.com/auth/calendar'])
  
  .controller('CalendarCtrl',['$scope','CLIENT_ID','SCOPES','$uibModal', function($scope, CLIENT_ID, SCOPES, $uibModal){
    $scope.newEvent={};   
    $scope.events=[];

    $scope.eventWindow=function(event, jsEvent, view){
           var modalInstance = $uibModal.open({
                                          animation: true,
                                          templateUrl: 'tmpl2.html',
                                          controller: 'EventCtrl as vm',
                                          resolve: {
                                            event: function () {
                                                  return event;
                                                  }
                                          }
                                              
            });
    }

    $scope.createEvent=function(date, jsEvent, view){
      var modalInstance = $uibModal.open({
                                          animation: true,
                                          templateUrl: 'tmpl.html',
                                          controller: 'ModalInstanceCtrl as vm',
                                          resolve: {
                                            date: function () {
                                                  return date.format();
                                                  }
                                          }
                                              
                                         });
    }

    var initializeCalendar={
                          header: {
                            left: 'prev,next today',
                            center: 'title',
                            right: 'month,agendaWeek,agendaDay'
                          },
                          defaultDate: '2016-08-30',
                          editable: true,
                          eventLimit: true, // allow "more" link when too many events
                          eventClick: $scope.eventWindow,
                          dayClick: $scope.createEvent,
    };


    
    $scope.renderCalendar=function(events){
      initializeCalendar.events=events;
      $('#calendar').fullCalendar(initializeCalendar);
    }

    $scope.$on('eventCreationEvent', function (event, arg) { 
     console.log("Arguement is");
     console.log(arg);
     $scope.events = $scope.events.push(arg);
     $('#calendar').fullCalendar( 'renderEvent', arg , true );
     // $scope.renderCalendar($scope.events);
    });

    $scope.handleAuthResult=function(authResult) {
      var authorizeDiv = document.getElementById('authorize-div');
        if (authResult && !authResult.error) {
          authorizeDiv.style.display = 'none';
          $scope.loadCalendarApi();
        } else {
        authorizeDiv.style.display = 'inline';
        }
    }

    $scope.handleAuthClick=function(event) {
      gapi.auth.authorize(
        {'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': false},
        $scope.handleAuthResult);
        return false;
    }

    $scope.loadCalendarApi=function() {
      gapi.client.load('calendar', 'v3').then(function() { 
        gapi.client.calendar.events.list({
          'calendarId': 'primary',
          'timeMin': (new Date()).toISOString(),
          'showDeleted': false,
          'singleEvents': true,
          'orderBy': 'startTime'
          }).then(function(resp) {
          
          angular.forEach(resp.result.items, function(value, key) {
            var obj={}; 
            obj.end=value.end.dateTime;
            obj.start=value.start.dateTime;
            obj.title=value.summary;
          
            if(value.attendees)
              obj.attendees=value.attendees;
            this.push(obj);
          }, $scope.events);
          console.log($scope.events);
          
          $scope.renderCalendar($scope.events);        
          // console.log($scope.events);
          }, function(reason) {
            console.log('Error: ' + reason.result.error.message);
        });
      });
    }
      
    $scope.createEventDialogue = function (date, view) {  
      var modalInstance = $uibModal.open({
                                          animation: true,
                                          templateUrl: 'tmpl.html',
                                          controller: 'ModalInstanceCtrl as vm',
                                          resolve: {
                                            date: function () {
                                                  return date.format();
                                                  }
                                          }
                                              
                                        });
    }     
    }])
    .controller('EventCtrl',['$scope','event','$uibModalInstance','$filter',function($scope, event, $uibModalInstance, $filter){
        var vm = this;
        vm.event=event;
        console.log(vm.event);
        vm.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };

    }])
    .controller('ModalInstanceCtrl',['$scope','$rootScope','date','$uibModalInstance','$filter',function($scope, $rootScope,date , $uibModalInstance, $filter){
        var vm = this;
        $scope.startDateTime=new Date(date);
        if(!date.includes("T")){
          $scope.startDateTime.setHours(01);
          $scope.startDateTime.setMinutes(0);
        }else{
          $scope.startDateTime.setHours($scope.startDateTime.getHours()-5);
          $scope.startDateTime.setMinutes($scope.startDateTime.getMinutes()-30);

        }

        $scope.startDateTime.setSeconds(0);
        $scope.startDateTime.setMilliseconds(0);
        
        $scope.endDateTime=new Date(date);
        $scope.endDateTime.setHours($scope.startDateTime.getHours()+1);
        $scope.endDateTime.setMinutes($scope.startDateTime.getMinutes());
        $scope.endDateTime.setSeconds(0);
        $scope.endDateTime.setMilliseconds(0);
          
        vm.newEvent={};
        
        vm.newEvent.attendees=[];
        
        vm.add=function(){
          vm.newEvent.attendees.push({ 
            placeholder:'Type your friends email here...'
          });
        };

        vm.ok = function () {
          var ob=[];
          vm.newEvent.startDateTime=$filter('date')($scope.startDateTime, 'yyyy-MM-ddTHH:mm:ss');
          vm.newEvent.endDateTime=$filter('date')($scope.endDateTime, 'yyyy-MM-ddTHH:mm:ss');
          console.log(vm.newEvent);    

          angular.forEach(vm.newEvent.attendees, function(value, key) {
          var obj={}; 
          obj.email=value.email;
          this.push(obj);
          }, ob);

          console.log(ob);
          
          var object = {
                'end': {
                    'dateTime': vm.newEvent.endDateTime,//end,
                    'timeZone': 'Asia/Kolkata'
                },
                'start': {
                    'dateTime': vm.newEvent.startDateTime,//start,
                    'timeZone': 'Asia/Kolkata'
                },
                'summary': vm.newEvent.title,
                'description': vm.newEvent.description,
                'attendees':ob
          };

          var calendarObject =
            {
                'calendarId': 'primary',
                'sendNotifications':true,
                'resource': object
            };
          var request = gapi.client.calendar.events.insert(calendarObject);
              request.then(function(resp) {
                
                var event={};
                event.end=vm.newEvent.endDateTime;
                event.start=vm.newEvent.startDateTime;
                event.title=vm.newEvent.title;
                event.attendees=ob;

                $rootScope.$broadcast('eventCreationEvent', event);

              }, function(reason) {
                    console.log('Error: ' + reason.result.error.message);
              });
             $uibModalInstance.close();
          };   
    
        

        vm.cancel = function () {
          console.log('inside cancel');
          $uibModalInstance.dismiss('cancel');
        }

    }]);
     