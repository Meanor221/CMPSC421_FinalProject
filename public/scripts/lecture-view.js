
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

  function getCurrentSlide() {
    var editor = editorState.get();
    var slideId = editor.currentSlide;
    return state.slides
      .filter(function(s) {s.id === slideId})
      .pop();
  }

  function setCurrentSlide(slide) {
    var editor = editorState.get();
    var slideId = editor.currentSlide;
    if(!slideId) return;
    state.slides = state.slides
      .map(function(s) {
        return s.id === slideId ? slide : s;
      });
    persist();
  }

  return {
    getLecture: getLecture,
    setLecture: setLecture,

    getCurrentSlide: getCurrentSlide,
    setCurrentSlide: setCurrentSlide,
  };
}).call(this);

var editorState = (function editorState() {
  var state = {
    currentSlide: null,
    focusedComponent: null,
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
  var dragOptions = {
    containment: $slide[0],
  };
  var resizeOptions = {
    containment: $slide[0],
  };
 
  function isFocused(component) {
    return component.id === editor.focusedComponent;
  }

  // render everything in the slide
  slide.components.forEach(function(component) {
    var $component = $("<div class='component'></div>");
      .attr('data-id', component.id);
      .css({
        top: component.y,
        left: component.x,
        width: component.width,
        height: component.height,
      })
      .draggable(dragOptions)
      .resizable(resizeOptions);
    if(component.type === 'image') {
      var image = component;
      var img;
      if(!image.data) {
        // show url/file upload
        img = $([
          '<div class="component-image-form">',
            '<button class="x-url-insert">Insert by URL</button>',
            '<form>',
              '<input class="x-file-upload" type="file"/>',
            '</form>',
          '</div>'
        ].join(''));
      } else if(image.data.indexOf('http') === 0) {
        // show external image by url
        img = document.createElement('img');
        img.src = image.data;
        img.className = 'component-image';
      } else {
        // show uploaded image by key
        img = document.createElement('img');
        img.src = '/images/'+image.data;
        img.className = 'component-image';
      }
      $component.append(img);
    } else if (component.type === 'text') {
      throw 'not yet';
    } else {
      throw new Error('component.type "'+component.type+'" invalid.');
    }
    $slide.append($component);
  });
}

$(document).on('click', '.component .x-url-insert', function(e) {
  var id = $(this).closest('.component').attr('data-id');
  var component = lectureState.getComponentById(id);
  var url = 'x';
  while(url && url.indexOf('http')) {
    url = prompt('Please enter the URl of the image (include http*):');
  }
  if(!url) return;
  component.data = url;
  lectureState.setComponent(component);
  reflect();
});

$(document).on('change', '.component .x-file-upload', function(e) {
  var id = $(this).closest('.component').attr('data-id');
  var component = lectureState.getComponentById(id);
  var formData = new FormData($(this).closest('form'));
  uploadImageForm(formData, function(key) {
    component.data = key;
    lectureState.setComponent(component);
    reflect();
  });
});

function reflect() {
  renderLecture(commit(), editorState.get());
}

$('#create-slide').on('click', function(e) {
  var lecture = lectureState.getLecture();
  var n = lecture.slides.length + 1;
  lecture.slides.push(defaultSlide('New Slide '+n));
  renderLecture(commit(), editorState.get());
});

function defaultText(text) {
  return {
    id: uuid,
    type: 'text',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    data: text,
  };
}

$('#create-text').on('click', function(e) {
  var slide = lectureState.getCurrentSlide();
  slide.components.push(defaultText());
  lectureState.setCurrentSlide(slide);
  reflect();
});

function defaultImage(url) {
  return {
    id: uuid(),
    type: 'image',
    x: 0,
    y: 0,
    width: 400,
    height: 200,
    data: url,
  };
}

$('#create-image').on('click', function(e) {
  var slide = lectureState.getCurrentSlide();
  slide.components.push(defaultImage());
  lectureState.setCurrentSlide(slide);
  reflect();
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

function uuid() {
  return Math.floor(Date.now() + (Math.random() * Date.now())).toString(16),
}

function defaultSlide(name) {
  return {
    id: uuid(),
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

