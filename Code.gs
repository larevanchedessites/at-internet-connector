function getAuthType() {
  var response = {
    'type': 'NONE'
  };
  return response;
}

function getConfig(request) {
  var config = {
    configParams: [
      {
        type: 'TEXTINPUT',
        name: 'basekey',
        displayName: 'Base 64',
        helpText: 'email@email.com:password encoded in base64',
        placeholder: 'i.e. : ZW1haWxAZW1haWwuY29tOnBhc3N3b3Jk',
      },
      {
        type: 'TEXTINPUT',
        name: 'siteid',
        displayName: 'Site ID',
        helpText: 'Enter the unique identifier of the website',
        placeholder: 'i.e. : 123',
      }
    ]
  };
  return config;
}

var fixedSchema = [
  {
    name: 'd_source',
    label: 'Source',
    description: 'Source',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'TEXT',
      semanticGroup: 'TEXT'
    }
  },
  {
    name: 'm_visits',
    label: 'Visites',
    description: 'Visites',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      semanticGroup: 'NUMERIC'
    }
  }
];

function getSchema(request) {
  return {schema: fixedSchema};
};

function isAdminUser() {
  return true;
}

function getData(request) {
  // Prepare the schema for the fields requested.
  var dataSchema = [];

  request.fields.forEach(function(field) {
    for (var i = 0; i < fixedSchema.length; i++) {
      if (fixedSchema[i].name === field.name) {
        dataSchema.push(fixedSchema[i]);
        break;
      }
    }
  });

  // Craft URL
  var url = [
    'https://apirest.atinternet-solutions.com/data/v2/json/getData?columns={d_source,m_visits}&sort={-m_visits}&space={s:',
    request.configParams.siteid,
    "}&period={R:{D:'-1'}}&max-results=50&page-num=1"
  ];

  var options = {
    "method":"get",
    "headers":{
      "authorization": "Basic " + request.configParams.basekey
    }
  }

  // Fetch the data.
  var response = JSON.parse(UrlFetchApp.fetch(encodeURI(url.join('')), options));
  var datafeed = response.DataFeed;

  // Prepare the tabular data.
  var data = [];
  datafeed[0].Rows.forEach(function(row) {

      var values = [];
      dataSchema.forEach(function(field) {
        switch(field.name) {
          case 'd_source':
            values.push(row.d_source);
            break;
          case 'm_visits':
            values.push(row.m_visits);
            break;
          default:
            values.push('');
        }
      });

      data.push({
        values: values
      });
  });

  return {
    schema: dataSchema,
    rows: data
  };
}
