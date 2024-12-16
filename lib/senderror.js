var sendError = function(res, errorCode, errorMessage, contentType = 'text/plain') {
  if (!res.header('Access-Control-Allow-Origin')) {
    res.header("Access-Control-Allow-Origin", "*");
  }
  if (!res.header('Access-Control-Allow-Headers')) {
    res.header("Access-Control-Allow-Headers", "Content-Type");
  }
  res.writeHead(errorCode, {
    'content-type': contentType,
    'content-length': Buffer.byteLength(errorMessage)
  });
  res.end(errorMessage);
}

module.exports = sendError;
