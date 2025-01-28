var mssqlDefault = function mssqlDefault(queryString, queryOptions, defaultLimit) {
  var schema = queryOptions.schema;
  var database = queryOptions.database;
  var table = queryOptions.table;
  var condition = queryString;
  var sqlSearchFields;
  var sqlSearchFieldsFilter;
  if (queryOptions.searchField) {
    sqlSearchFields = queryOptions.searchField;
    sqlSearchFieldsFilter = "LOWER(" + queryOptions.searchField + ") LIKE LOWER('" + condition + "%')";
  } else if (queryOptions.searchFields?.filter((field) => field)) {
    sqlSearchFields = "CONCAT(STUFF(CONCAT_WS(', ', " + queryOptions.searchFields.filter((field) => field).join(", ") + "), LEN(COALESCE(" +
      queryOptions.searchFields.filter((field) => field).join(", ") +
      ")) + 1, 2, ' ('), ')')";
    sqlSearchFieldsFilter = "LOWER(" + 
      queryOptions.searchFields.filter((field) => field).join(") LIKE LOWER('" + condition + "%') OR LOWER(") + 
      ") LIKE LOWER('" + condition + "%')";
  }
  var fields = queryOptions.fields;
  var sqlFields = fields ? fields.join(',') + "," : "";
  var geometryField = queryOptions.geometryName || "geom";
  var useCentroid = queryOptions.hasOwnProperty("useCentroid") ? queryOptions.useCentroid : true;
  var wkt = useCentroid ? geometryField + ".STPointOnSurface().ToString() AS GEOM " + " " :
    geometryField + ".ToString() AS GEOM " + " ";
  var type = " '" + table + "'" + " AS TYPE, ";
  var searchString;
  var limitNumber = queryOptions.limit || defaultLimit || 1000;
  var limit = "TOP " + limitNumber.toString() + " ";

  searchString =
    "SELECT " + limit +
    sqlSearchFields + " AS NAMN," + sqlFields + type + wkt +
    " FROM " + database + "." + schema + "." + table +
    " WHERE " + sqlSearchFieldsFilter +
    " ORDER BY " + sqlSearchFields;

  return searchString;
}

module.exports = mssqlDefault;
