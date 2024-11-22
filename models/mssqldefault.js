var mssqlDefault = function mssqlDefault(queryString, queryOptions) {
  var schema = queryOptions.schema;
  var database = queryOptions.database;
  var table = queryOptions.table;
  var condition = queryString;
  var sqlSearchFields;
  var sqlSearchFieldsFilter;
  if (queryOptions.searchField) {
    sqlSearchFields = queryOptions.searchField;
    sqlSearchFieldsFilter = "LOWER(" + queryOptions.searchField + ") LIKE LOWER('" + condition + "%')";
  } else if (queryOptions.searchFields.filter((e) => e)) {
    sqlSearchFields = "CONCAT(" + queryOptions.searchFields.filter((e) => e)[0] + ", ' (', " +
      queryOptions.searchFields.filter((e) => e).slice(1).join(", ', ', ") +
      ", ')')";
    sqlSearchFieldsFilter = "LOWER(" + 
      queryOptions.searchFields.filter((e) => e).join(") LIKE LOWER('" + condition + "%')\n   OR LOWER(") + 
      ") LIKE LOWER('" + condition + "%')";
  }
  var customType = queryOptions.customType;
  var fields = queryOptions.fields;
  var sqlFields = fields ? fields.join(',') + "," : "";
  var geometryField = queryOptions.geometryName || "geom";
  var useCentroid = queryOptions.hasOwnProperty("useCentroid") ? queryOptions.useCentroid : true;
  var wkt = useCentroid ? geometryField + ".STPointOnSurface().ToString() AS GEOM " + " " :
    geometryField + ".ToString() AS GEOM " + " ";
  var title = queryOptions.title ? " '" + queryOptions.title + "'" + ' AS "TITLE", ' : '';
  var type = " '" + (customType ?? table) + "'" + " AS TYPE, ";
  var searchString;
  var limit = queryOptions.limit ? "TOP " + queryOptions.limit.toString() + " " : "";

  searchString =
    "SELECT " + limit +
    sqlSearchFields + " AS NAMN," + 
    sqlFields +
    type +
    title +
    wkt +
    " FROM " + database + "." + schema + "." + table +
    " WHERE " + sqlSearchFieldsFilter +
    " ORDER BY " + sqlSearchFields;

  return searchString;
};

module.exports = mssqlDefault;
