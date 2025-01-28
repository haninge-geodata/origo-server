var pgDefault = function pgDefault(queryString, queryOptions, defaultLimit) {
  var schema = queryOptions.schema;
  var table = queryOptions.table;
  var gid = queryOptions.gid || 'gid';
  var condition = queryString;
  var sqlSearchFields;
  var sqlSearchFieldsFilter;
  if (queryOptions.searchField) {
    sqlSearchFields = 'CAST("' + table + '"."' + queryOptions.searchField + '" AS TEXT)';
    sqlSearchFieldsFilter = 'LOWER(CAST("' + table + '"."' + sqlSearchFields + '"' + ' AS TEXT)) ILIKE LOWER(\'' + condition + '%\')';
  } else if (queryOptions.searchFields?.filter((field) => field)) {
    sqlSearchFields = 'CONCAT(overlay(CONCAT_WS(\', \', ' + 
      queryOptions.searchFields.filter((field) => field)
        .map((field) => '"' + table + '"."' + field + '"')
        .join(', ') +
      ') PLACING \' (\' FROM LENGTH(COALESCE(' +
      queryOptions.searchFields.filter((field) => field)
        .map((field) => '"' + table + '"."' + field + '"')
        .join(', ') +
      ')) + 1 FOR 2), \')\')';
    sqlSearchFieldsFilter = 'LOWER(' + 
      queryOptions.searchFields.filter((e) => e)
        .map((field) => '"' + table + '"."' + field + '"')
        .join(') LIKE LOWER(\'' + condition + '%\') OR LOWER(') + 
      ') LIKE LOWER(\'' + condition + '%\')';
  }
  var fields = queryOptions.fields;
  var geometryField = queryOptions.geometryName || 'geom';
  var useCentroid = queryOptions.hasOwnProperty('useCentroid') ? queryOptions.useCentroid : true;
  var wkt = useCentroid ? 'ST_AsText(ST_PointOnSurface(' + table + '."' + geometryField + '")) AS "GEOM" ' :
    'ST_AsText("' + table + '"."' + geometryField + '") AS "GEOM" ';
  var sqlFields = fields ? fields.join(',') + ',' : '';
  var type = ' \'' + table + "'" + ' AS "TYPE", ';
  var searchString;
  var limitNumber = queryOptions.limit || defaultLimit || 1000;
  var limit = ' LIMIT ' + limitNumber.toString() + ' ';

  searchString =
    'SELECT ' +
    sqlSearchFields + ' AS "NAMN",' +
    ' "' + table + '"."' + gid + '" AS "GID", ' +
    sqlFields +
    type +
    wkt +
    ' FROM ' + schema + '."' + table + '"' +
    ' WHERE ' + sqlSearchFieldsFilter +
    ' ORDER BY ' + sqlSearchFields +
    limit + ';';

  return searchString;
}

module.exports = pgDefault;
