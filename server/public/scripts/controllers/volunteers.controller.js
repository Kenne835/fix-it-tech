myApp.controller('VolunteersController', function($location, $http, UserAuthService, $mdDialog){
  console.log('VolunteersController loaded.');
  var vm = this;

  vm.proficiencies = ['High','Medium','Low','None','Interested in Learning'];
  vm.skillsObject = {};
  vm.skillProfile = {};
  vm.userAuthService = UserAuthService;
  vm.userObject = UserAuthService.userObject;
  vm.skillProfileObject = UserAuthService.skillProfileObject;

  console.log('vm.skillProfileObject:', vm.skillProfileObject);


  getSkills();

  vm.roles = [
    {value: 1, text: 'Admin'},
    {value: 2, text: 'Volunteer'}
  ];

  vm.statuses = [
    {value: 'active', text: 'active'},
    {value: 'inactive', text: 'inactive'}
  ];

  vm.follow_up = [
    {value: 'Yes', text: 'Yes'},
    {value: 'No', text: 'No'}
  ];


  vm.getVolunteers = function() {
      console.log( 'in getVolunteers function' );
      // ajax call to server to get tasks
      $http.get('/volunteers').then(function(response){
        vm.volunteersObject = response.data;
        convertToEmailArray(vm.volunteersObject.volunteers);
        console.log('volunteers.controller vmvolunteersObject', vm.volunteersObject);
      }).catch(function(err){
       swal(
         'Oops...',
         'Something went wrong!',
         'error'
       );
     });
   }; // end getVolunteers

    vm.getVolunteers();

    //Edit a Volunteer in the Volunteers table
    vm.editVolunteer = function(people){
      console.log( 'in editVolunteer functon', people);
      $http.put('/volunteers/edit', people).then(function(people){
        editVolunteerAlert();
        vm.getVolunteers();
      }).catch(function(err){
       swal(
         'Oops...',
         'Something went wrong!',
         'error'
       );
     });
    }; // end editVolunteer

    vm.goBack = function(){
      $location.path('/volunteers');
    };

//Getting the skills of a volunteer for admin to view
    vm.volunteerProfileSkills = function(id){

      $http.get('/volunteers/getSkills/' + id).then(function(response){
        vm.skillProfileObject.profile = response.data;
        console.log('here is the profile skills being sent back based on the specific id', vm.skillProfileObject);
        $location.path('/viewSkill');
      }).catch(function(err){
      });
    };
    // vm.addVolunteer = function (volunteer){
    //   console.log( 'in addVolunteer function' );
    //   // ajax call to server to get tasks
    //   $http.post('/volunteers/add', volunteer).then(function(response){
    //     console.log('volunteer.controller vm.volunteerObject');
    //   }); // end success
    // };

    vm.volunteerProfileAdd = function (newVolunteer, proficiency){
      console.log( 'in volunteerProfileAdd' );
      console.log(proficiency);
      console.log(newVolunteer);
      $http.post('/volunteers/newVolunteer', newVolunteer).then(function(response){
        console.log('response:', response);
        var newSkillProfile = {};
        newSkillProfile.proficiency = proficiency;
        newSkillProfile.volunteerId = response.data.newVolunteer[0].id;
        console.log('here is the new skill profile:', newSkillProfile);
        $http.post('/volunteers/skill', newSkillProfile).then(function(response){
          volunteerProfileAlert();
          console.log('volunteer.controller vm.skill', newSkillProfile);
          vm.userAuthService.getuser();
        }).catch(function(err){
         swal(
           'Oops...',
           'Something went wrong!',
           'error'
         );
       });
      });
    };

    vm.volunteerProfileAdminAdd = function (newVolunteer, proficiency){
      console.log( 'in volunteerProfileAdd' );
      console.log(proficiency);
      console.log(newVolunteer);
      $http.post('/volunteers/newVolunteer/admin', newVolunteer).then(function(response){
        console.log('response:', response);
        var newSkillProfile = {};
        newSkillProfile.proficiency = proficiency;
        newSkillProfile.volunteerId = response.data.newVolunteer[0].id;
        console.log('here is the new skill profile:', newSkillProfile);
        $http.post('/volunteers/skill', newSkillProfile).then(function(response){
          console.log('volunteer.controller vm.skill: ', newSkillProfile);

          vm.userAuthService.getuser();
          addVolunteerAlert();
        });
      });
    };

    function getSkills(){
        console.log( 'in getVolunteers function' );
        // ajax call to server to get tasks
        $http.get('/volunteers/getSkills').then(function(response){
          vm.skillsObject = response.data;
          for (var i = 0; i < vm.skillsObject.skills.length; i++) {
            for (var j = 0; j < vm.userObject.skills.length; j++) {
              if (vm.userObject.skills[j].skill_id == vm.skillsObject.skills[i].id) {
                vm.skillsObject.skills[i].proficiency = vm.userObject.skills[j].proficiency_id;
                vm.skillsObject.skills[i].profile_id = vm.userObject.skills[j].id;
              }
            }
            if (vm.skillsObject.skills[i].proficiency === undefined) {
              vm.skillsObject.skills[i].proficiency = '4';
              vm.skillsObject.skills[i].profile_id = undefined;
            }

          }
          console.log('skills object:', vm.skillsObject);
        }).catch(function(err){
         swal(
           'Oops...',
           'Something went wrong!',
           'error'
         );
       }); // end success
      } // end getEvents

// SweetAlert2 Functions
// admin view ? we currently only have one function
function addVolunteerAlert() {
  swal({
    title: "Success!",
    text: "This volunteer has been added",
    confirmButtonText: "View All Volunteers",
    type: "success"
  }).then(function() {
    window.location.href = "#/volunteers";
  });
}

// for voluteer view
function volunteerProfileAlert() {
  swal({
    title: "Success!",
    text: "Your profile has been added",
    confirmButtonText: "View Upcoming Events",
    type: "success"
  }).then(function() {
    window.location.href = "#/home";
  });
}

function editVolunteerAlert() {
    swal({
      title: "Success!",
      text: "This volunteer profile has been updated",
      confirmButtonText: "View profile",
      type: "success"
    });
  }

  vm.filterVolunteers = function(skillId) {
    console.log('Filter volunteers with the skill ID:', skillId);
    $http.get('/volunteers/filter/' + skillId).then(function(response) {
      console.log('Filter response:', response);
      vm.volunteersObject.volunteers = response.data.volunteers;
      convertToEmailArray(vm.volunteersObject.volunteers);
    });
  };

  function convertToEmailArray (array) {
    newArray = [];
    for (var i = 0; i < array.length; i++) {
      var newObject = {};
      newObject.email = array[i].email;
      newObject.first_name = array[i].first_name;
      newObject.last_name = array[i].last_name;
      newArray.push(newObject);
    }
    vm.csvObject = newArray;
  }

});
