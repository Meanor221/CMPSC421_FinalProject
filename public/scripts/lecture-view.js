
function uuid() {
  return Math.floor(Date.now() + (Math.random() * Date.now())).toString(16);
}

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
      .filter(function(s) {return s.id === slideId})
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

  function getCurrentComponent() {
    var slide = getCurrentSlide();
    var editor = editorState.get();
    var componentId = editor.currentComponent;
    return slide.components
      .filter(function(s) {return s.id === componentId})
      .pop();
  }

  function setCurrentComponent(component) {
    var slide = getCurrentSlide();
    var editor = editorState.get();
    var componentId = editor.currentComponent;
    if(!componentId) return;
    slide.components = slide.components
      .map(function(c) {
        return c.id === componentId ? component : c;
      });
    persist();
  }

  function getComponentById(id) {
    var slide = getCurrentSlide();
    return slide.components
      .filter(function(c) {return c.id === id;})
      .pop();
  }

  function setComponent(component) {
    var slide = getCurrentSlide();
    slide.components = slide.components
      .map(function(c) {
        return c.id === component.id ? component : c;
      });
    persist();
  }

  return {
    getLecture: getLecture,
    setLecture: setLecture,
    getCurrentSlide: getCurrentSlide,
    setCurrentSlide: setCurrentSlide,
    getCurrentComponent: getCurrentComponent,
    setCurrentComponent: setCurrentComponent,
    getComponentById: getComponentById,
    setComponent: setComponent,
  };
}).call(this);

var editorState = (function editorState() {
  var state = {
    currentSlide: null,
    currentComponent: null,
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
  $slide.attr('data-id', slide.id);
  $slide.html('');
  var dragOptions = {
    containment: $slide[0],
    stop: reflect,
  };
  var resizeOptions = {
    containment: $slide[0],
    stop: reflect,
  };
 
  function isCurrent(component) {
    return component.id === editor.currentComponent;
  }

  // render everything in the slide
  slide.components.forEach(function(component) {
    var $component = $("<div class='component'></div>")
      .attr('data-id', component.id)
      .attr('data-type', component.type)
      .attr('data-data', component.data)
      .css({
        top: component.y,
        left: component.x,
        width: component.width,
        height: component.height,
      })
      .draggable(dragOptions)
      .resizable(resizeOptions)
      .css('position', 'absolute');
    if(component.type === 'image') {
      var image = component;
      var img;
      if(!image.data) {
        // show url/file upload
        img = $([
          '<div class="component-image-form">',
            '<button class="x-url-insert">Insert by URL</button>',
            '<form>',
              '<input class="x-file-upload" type="file" name="image"/>',
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
      var box;
      if(isCurrent(component)) {
        box = $('<textarea class="component-textbox"></textarea>');
        box.val(component.data);
      } else {
        box = $('<div class="component-text"></div>');
        box.html(markdown.toHTML(component.data));
      }
      $component.append(box);
    } else {
      throw new Error('component.type "'+component.type+'" invalid.');
    }
    if(isCurrent(component)) {
      $component.addClass('current');
    }
    $slide.append($component);
  });
}

$(document).on('keydown', function(e) {
  var DELETE = 46;
  var BACKSPACE = 8;
  if($(e.target).is('textarea, input')) return;
  if(e.keyCode === DELETE || e.keyCode === BACKSPACE) {
    e.preventDefault();
    var slide = lectureState.getCurrentSlide();
    var component = lectureState.getCurrentComponent();
    if(slide && component) {
      slide.components = slide.components
        .filter(function(c) {return c.id !== component.id;});
      lectureState.setCurrentSlide(slide);
      update();
    }
  }
});

$(document).on('click', '#slide', function(e) {
  if($(e.target).is(this)) {
    editorState.set('currentComponent', null);
  }
});

$(document).on('click', '.component, .component *', function(e) {
  var $target = $(e.target);
  if($target.is('textarea, input')) return;
  var $component = $target.is('.component') 
    ? $target
    : $target.closest('.component');

  var id = $component.attr('data-id');
  editorState.set('currentComponent', id);
});

$(document).on('click', '.component .x-url-insert', function(e) {
  var component = lectureState.getCurrentComponent();
  var url = 'x';
  while(url && url.indexOf('http')) {
    url = prompt('Please enter the URl of the image (include http*):');
  }
  if(!url) return;
  component.data = url;
  lectureState.setCurrentComponent(component);
  update();
});

function uploadImageForm(formData, next) {
  $.ajax({
    method: 'POST',
    url: '/images',
    data: formData,
    processData: false,
    contentType: false,
    success: function(data) {
      next(data.id);
    },
    error: function() {
      throw new Error('Image upload failed');
    }
  });
}

$(document).on('change', '.component .x-file-upload', function(e) {
  var $component = $(e.target).closest('.component');
  var id = $component.attr('data-id');
  var component = lectureState.getComponentById(id);

  var formData = new FormData($(e.target).closest('form')[0]);
  uploadImageForm(formData, function(key) {
    component.data = key;
    lectureState.setComponent(component);
    update();
  });
});

$(document).on('blur', '.component .component-textbox', function(e) {
  var component = lectureState.getCurrentComponent();
  component.data = $(this).val();
  lectureState.setCurrentComponent(component);
  update();
});

function update(lecture) {
  lecture = lecture || lectureState.getLecture();
  renderLecture(lecture, editorState.get());
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

  function px(style) {
    return parseInt(style, 10);
  }

  var id = $('#slide').attr('data-id');
  var slide = lecture.slides
    .filter(function(slide) {return slide.id === id})
    .pop();
  if(slide) {
    var components = [];
    // serialize DOM components into slide.components
    var $slide = $('#slide');
    var $component = $slide.find('.component');
    $component.each(function(index, elem) {
      var $c = $(elem);
      var c = {
        id: $c.attr('data-id'),
        type: $c.attr('data-type'),
        data: $c.attr('data-data') || null,
        y: px($c.css('top')),
        x: px($c.css('left')),
        width: px($c.css('width')),
        height: px($c.css('height')),
      };
      components.push(c);
    });
    slide.components = components;
  }

  return lecture;
}

function defaultText(text) {
  return {
    id: uuid,
    type: 'text',
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    data: text || 'Type something..',
  };
}

$('#create-text').on('click', function(e) {
  var slide = lectureState.getCurrentSlide();
  slide.components.push(defaultText());
  lectureState.setCurrentSlide(slide);
  update();
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
  update();
});

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

var _rendered = false;
function commit() {
  var lecture = lectureState.getLecture();
  if(!_rendered) {
    renderLecture(lecture, editorState.get());
    _rendered = true;
  }
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

