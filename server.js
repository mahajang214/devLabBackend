const logger = require("./src/config/logger");
const web = require("./src/Web/web");
const express = require('express');







web.listen(3001,()=>{
logger.info("Server is running on port 3001");
})