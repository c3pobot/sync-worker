'use strict'
process.on('unhandledRejection', (error) => {
  console.error(error)
});
require('./src')
