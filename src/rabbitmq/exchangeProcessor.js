'use strict'
const log = require('logger')
const reportError = require('src/reportError')
const Cmds = {}
Cmds['setLogLevel'] = (data = {})=>{
  try{
    if(data?.logLevel){
      data?.logLevel
    }else{
      log.setLevel('info');
    }
  }catch(e){
    reportError(e)
  }
}
Cmds['updateData'] = require('src/helpers/gameDataList').update
module.exports = (data)=>{
  try{
    if(!data) return
    if(Cmds[data?.routingKey]) Cmds[data.routingKey](data)
    if(Cmds[data?.cmd]) Cmds[data.cmd](data)
  }catch(e){
    reportError(e)
  }
}
