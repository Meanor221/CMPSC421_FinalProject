
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function warn(errors) {

  function renderError(error) {
    return '<p>'+error.message+'</p>';
  }

  // display errors for debugging
  if(!Array.isArray(errors)) errors = [errors];
  errors.forEach(function(error) {
    if(typeof error === 'string') {
      error = new Error(error);
    }
    $('#errors').append(renderError(error));
    console.log(error);
  });
}

var navigation = (function navigation() {
  // controller for navigation state
  
  var listeners = [];
  var state = {
    view: 'home', // Either 'home' or 'lecture',
    viewKey: null, // If view=lecture, viewKey=lecture.id,
  };

  function listen(callback) {
    listeners.push(callback);
  }

  function change() {
    listeners.forEach(function(callback) {
      callback(state);
    });
  }

  function goToHome() {
    state.view = 'home';
    state.viewKey = null;
    change();
  }

  function goToLecture(id) {
    if(!id) throw new Error('Lecture id required');
    state.view = 'lecture';
    state.viewKey = id;
    change();
  }

  setTimeout(change, 100); // initial render

  return {
    goToHome: goToHome,
    goToLecture: goToLecture,
    listen: listen,
  };
}).call(this);

