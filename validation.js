
var jsonschema = require('jsonschema');
var v = new jsonschema.Validator();

var componentSchema = {
  id: '/component',
  type: 'object',
  properties: {
    x: {type: 'number'},
    y: {type: 'number'},
    width: {type: 'number'},
    height: {type: 'number'},
  },
  required: ['x', 'y', 'width', 'height'],
};
v.addSchema(componentSchema);

var slideSchema = {
  id: '/slide',
  type: 'object',
  properties: {
    id: {type: 'string'},
    name: {type: 'string'},
    components: {
      type: 'array',
      items: {$ref: '/component'},
    }
  },
  required: ['id', 'name', 'components'],
};
v.addSchema(slideSchema);

var lectureSchema = {
  id: '/lecture',
  type: 'object',
  properties: {
    id: {type: 'string'},
    name: {type: 'string'},
    updated: {type: 'number'},
    slides: {
      type: 'array',
      items: {$ref: '/slide'}
    }
  },
  required: ['id', 'name', 'slides'],
};

module.exports = function(lecture) {
  return v(lecture, lectureSchema).errors;
}

