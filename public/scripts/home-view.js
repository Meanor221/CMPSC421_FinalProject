
$(document).on('click', '#create-lecture', function() {
  var $button = $(this);
  
  var lecture = {name: 'Untitled'};

  $button.attr('disabled', true);
  var prev = $button.text();
  $button.text('Creating lecture...');

  superagent
    .post('/lectures')
    .send(lecture)
    .end(function(error, res) {
      if(error) return warn([error]);
      if(res.body.errors && res.body.errors.length) return warn(errors); 
      var lectureId = res.body.id;
      navigation.goToLecture(lectureId);

      $button.text(prev);
    });
});

$(document).on('click', '.lecture-list-item', function(e) {
  var id = $(this).attr('data-id');
  navigation.goToLecture(id);
});

function loadLectureList() {
  var $list = $('#home-view .lecture-list');
  var loadingList = 'Loading lectures...';
  var emptyList = 'There are no lectures to edit, you must create one.';

  function pt(x) {return '<p>'+x+'</p>';}

  $list.html(pt(loadingList));

  superagent
    .get('/lectures')
    .end(function(error, res) {
      if(error) return warn(error);
      var lectures = res.body.lectures;
      if(!lectures.length) {
        $list.html(pt(emptyList));
      } else {
        $list.html(renderLectureList(res.body.lectures));
      }
    });

  function renderLectureList(lectures) {
    function renderLectureItem(lecture) {
      var date = capitalize(relativeDate(new Date(lecture.updated)));
      return [
        "<div class='lecture-list-item nav' data-id='"+lecture.id+"'>",
          "<h2>"+lecture.name+"</h2>",
          "<p>"+date+"</p>",
        "</div>"
      ].join('');
    }

    return lectures
      .map(renderLectureItem)
      .join('');
  }
}

navigation.listen(function(state) {
  var $home = $('#home-view');
  if(state.view === 'home') {
    loadLectureList();
    document.title = 'Slate';
    $home.removeClass('hidden');
  } else {
    $home.addClass('hidden');
  }
});

