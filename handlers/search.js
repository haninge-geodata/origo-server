var dbConfig = require('../conf/dbconfig');
var dbConnectors = require('../lib/dbconnectors');
var searchModel = require('../conf/dbconfig').models.search;
var dbType = require('../lib/dbtype');
var sendResponse = require('../lib/sendresponse');
var sendError = require('../lib/senderror');
var model = require('../models/dbmodels');

var search = function(req, res) {
  var query = req.query.q;
  var connectors = dbConfig.connectors.search;
  var multiSearchModels = Object.values(searchModel);
  var limit = dbConfig.limit || 100;

  // If a query was made to a non-root endpoint (e g origoserver/search/comma-separated-tags),
  // then query only the search models which have at least one tag matching a tag supplied in the URL.
  if (req.params.searchTags) {
    var searchTagArray = req.params.searchTags.split(',');
    multiSearchModels = multiSearchModels.filter((model) => {
      if (model.tags && Array.isArray(model.tags)) {
        var relevantTagsInModel = model.tags.filter((tag) => searchTagArray.includes(tag));
        return (relevantTagsInModel.length > 0);
      }
      else return false;
    });
    // Exit if the tags supplied does not match any tags on any search models in dbconfig.js
    if (multiSearchModels.length === 0) {
      return sendError(res, 404, 'No search model with tags \'' + searchTagArray.join(', ') + '\'');
    }
  }
  
  var finishedModels = 0;
  var mergedResult = [];
  multiSearchModels.forEach((multiSearchModel) => {
    var db = multiSearchModel.connector || dbType(connectors) || 'pg';
    var queries = [];
    var tables = req.query.layers || multiSearchModel.tables;
    tables.forEach((table) => {
      var options = Object.assign({}, connectors[db], multiSearchModel, table);
      var searchString = model[db](query, options, limit);
      queries.push({
        queryString: searchString
      });
    });

    var connector = Object.assign({}, connectors[db], multiSearchModel);
    dbConnectors[db](res, queries, connector)
      .then((result) => {
        mergedResult.push.apply(mergedResult, result);
        finishedModels += 1;
        if(finishedModels == multiSearchModels.length) {
          sendResponse(res, JSON.stringify(mergedResult));
        }
      });
  });
}

module.exports = search;
