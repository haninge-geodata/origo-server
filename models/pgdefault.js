var pgDefault = function pgDefault(queryString, queryOptions) {
  var schema = queryOptions.schema;
  var table = queryOptions.table;
  var customType = queryOptions.customType;
  var gid = queryOptions.gid || 'gid';
  var condition = queryString;
  var sqlSearchFields;
  var sqlSearchFieldsFilter;
  if (queryOptions.searchField || queryOptions.searchFields?.length === 1) {
    sqlSearchFields = 'CAST("' + table + '"."' + (queryOptions.searchField || queryOptions.searchFields[0]) + '" AS TEXT)';
    sqlSearchFieldsFilter = 'LOWER(' + sqlSearchFields + ') ILIKE LOWER(\'' + condition + '%\')';
  } else if (queryOptions.searchFields?.filter((field) => field)) {
    sqlSearchFields = 'CONCAT(overlay(CONCAT_WS(\', \', ' + 
      queryOptions.searchFields.filter((field) => field)
        .map((field) => 'CAST("' + table + '"."' + field + '" AS TEXT)')
        .join(', ') +
      ') PLACING \' (\' FROM LENGTH(COALESCE(' +
      queryOptions.searchFields.filter((field) => field)
        .map((field) => 'CAST("' + table + '"."' + field + '" AS TEXT)')
        .join(', ') +
      ')) + 1 FOR 2), \')\')';
    sqlSearchFieldsFilter = 'LOWER(' + 
      queryOptions.searchFields.filter((e) => e)
        .map((field) => 'CAST("' + table + '"."' + field + '" AS TEXT)')
        .join(') LIKE LOWER(\'' + condition + '%\') OR LOWER(') + 
      ') LIKE LOWER(\'' + condition + '%\')';
  }
  var fields = queryOptions.fields;
  var geometryField = queryOptions.geometryName || 'geom';
  var useCentroid = queryOptions.hasOwnProperty('useCentroid') ? queryOptions.useCentroid : true;
  var wkt = useCentroid ? 'ST_AsText(ST_PointOnSurface(' + table + '."' + geometryField + '")) AS "GEOM" ' :
    'ST_AsText("' + table + '"."' + geometryField + '") AS "GEOM" ';
  var sqlFields = fields ? fields.join(',') + ',' : '';
  var type = ' \'' + (customType ?? table) + '\'' + ' AS "TYPE", ';
  var title = queryOptions.title ? " '" + queryOptions.title + "'" + ' AS "TITLE", ' : '';
  var searchString;
  var limit = queryOptions.limit ? ' LIMIT ' + queryOptions.limit.toString() + ' ' : '';

  searchString =
    'SELECT ' +
    sqlSearchFields + ' AS "NAMN",' +
    ' "' + table + '"."' + gid + '" AS "GID", ' +
    sqlFields +
    type +
    title +
    wkt +
    ' FROM ' + schema + '."' + table + '"' +
    ' WHERE ' + sqlSearchFieldsFilter +
    ' ORDER BY ' + sqlSearchFields +
    limit + ';';

  return searchString;
}

module.exports = pgDefault;
