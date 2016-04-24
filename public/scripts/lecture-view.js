
var lectureState = (function lectureState() {
  var state = null;

  function persist() {
    if(!(state && state.id)) return;
    superagent
      .put('/lectures/'+state.id)
      .send(state)
      .end(function(error, res) {
        if(error) return warn(error);
        var errors = res.body.errors;
        if(errors && errors.length) return warn(errors);
      });
  }

  function getLecture() {
    return state;
  }

  function setLecture(lecture) {
    state = lecture;
    persist();
  }

  return {
    getLecture: getLecture,
    setLecture: setLecture,
  };
}).call(this);

var editorState = (function editorState() {
  var state = {
    currentSlide: null,
  };

  var listeners = [];

  function listen(callback) {
    listeners.push(callback);
  }

  function change() {
    listeners.forEach(function(callback) {
      callback(state);
    });
  }

  function get() {
    return state;
  }

  function set(key, value) {
    if(typeof key === 'object') {
      state = newState;
    } else {
      state[key] = value;
    }
    change();
  }

  return {
    get: get,
    set: set,
    listen: listen,
  };
}).call(this);

function renderLecture(lecture, editor) {
  // display lecture from pure state
  var $lec = $('#lecture-view');
  var title = lecture.name+' - Slate';
  var id = editor.currentSlide;
  var slide = lecture.slides
    .filter(function(slide) {return slide.id === id;})
    .pop();

  if(slide) title = slide.name+' - '+title;
  document.title = title;
  
  // render side bar
  var $side = $lec.find('.lecture-side');
  $side.find('input[name=name]').val(lecture.name);
  $side.find('input[name=instructor]').val(lecture.instructor);
  $side.find('input[name=course]').val(lecture.course);

  // render slide list
  var $slideList = $side.find('.lecture-slide-list');
  $slideList.html(lecture.slides
    .map(function renderSlideItem(slide) {
      var classNames = ['slide-list-item'];
      if(editor.currentSlide === slide.id) {
        classNames.push('selected');
      }
      return [
        "<div class='"+classNames.join(' ')+"' data-id='"+slide.id+"'>",
          "<p>"+slide.name+"</p>",
        "</div>"
      ].join('');
    })
    .join(''));
  $slideList.sortable({
    placeholder: "ui-state-highlight",
    update: reflect,
  });

  // render slide
  var $slide = $lec.find('#slide');
  
  // render everything in the slide
}

function reflect() {
  renderLecture(commit(), editorState.get());
}

$('#create-slide').on('click', function(e) {
  var lecture = lectureState.getLecture();
  var n = lecture.slides.length + 1;
  lecture.slides.push(defaultSlide('New Slide '+n));
  renderLecture(commit(), editorState.get());
});

$(document).on('blur', '.lecture-metadata input', function(e) {
  renderLecture(commit(), editorState.get());
});

$(document).on('click', '.slide-list-item', function(e) {
  var id = $(this).attr('data-id');
  editorState.set('currentSlide', id);
});

$(document).on('click', '.slide-list-item.selected', function(e) {
  var id = $(this).attr('data-id');
  var name = prompt("Rename this slide");
  if(!name) return;
  var lecture = lectureState.getLecture();
  lecture.slides = lecture.slides
    .map(function(slide) {
      if(slide.id === id) slide.name = name;
      return slide;
    });
  lectureState.setLecture(lecture);
  pureRender();
});

$('#home-button').on('click', function() {
  navigation.goToHome();
});

function recordLecture(lecture) {
  // merge view changes into existing lecture state
  var $lec = $('#lecture-view');
  var $meta = $lec.find('.lecture-metadata');

  ['name', 'instructor', 'course']
    .forEach(function(key) {
      var value = $meta.find('input[name='+key+']').val();
      lecture[key] = value || lecture[key];
    });

  var $slideListItems = $lec.find('.slide-list-item');
  if($slideListItems.length === lecture.slides.length) {
    var slides = [];
    $slideListItems.each(function(index, elem) {
      var id = $(elem).attr('data-id');
      var slide = lecture.slides
        .filter(function(s) {return s.id === id;})
        .pop();
      slides.push(slide);
    });
    lecture.slides = slides;
  }

  var id = editorState.get().currentSlide;
  var slide = lecture.slides
    .filter(function(slide) {return slide.id === id})
    .pop();
  if(slide) {
    var components = [];
    // serialize DOM components into slide.components
    slide.components = components;
  }

  return lecture;
}

function defaultSlide(name) {
  return {
    id: Math.floor(Date.now() + (Math.random() * Date.now())).toString(16),
    name: name || 'First Slide',
    components: [], 
  };
}

function loadLecture(id) {
  $('#loading-wall').removeClass('hidden');
  superagent
    .get('/lectures/'+id)
    .end(function(error, res) {
      if(error) return warn(error);
      var lecture = res.body.lecture;
      if(!lecture.slides.length) {
        lecture.slides.push(defaultSlide());
      }
      lectureState.setLecture(lecture);
      var firstId = lecture.slides[0].id;
      editorState.set('currentSlide', firstId);
      $('#loading-wall').addClass('hidden');
    });
}

function pureRender() {
  var editor = editorState.get();
  var lecture = lectureState.getLecture();
  renderLecture(lecture, editor);
}

function commit() {
  var lecture = lectureState.getLecture();
  var finalLecture = recordLecture(lecture);
  lectureState.setLecture(finalLecture);
  return finalLecture;
}

editorState.listen(function(state) {
  renderLecture(commit(), state);
});

navigation.listen(function(state) {
  var $lecture = $('#lecture-view');
  if(state.view === 'lecture') {
    loadLecture(state.viewKey);
    $lecture.removeClass('hidden');
  } else {
    $lecture.addClass('hidden');
  }
});

