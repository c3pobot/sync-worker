'use strict'
const log = require('logger')
const { dataList } = require('src/helpers/dataList')

const Cmds = {}
Cmds.setLogLevel = (data = {})=>{
  try{
    if(data?.logLevel){
      data?.logLevel
    }else{
      log.setLevel('info');
    }
  }catch(e){
    log.error(e)
  }
}
Cmds.numBotShardsNotify = ({ numBotShards })=>{
  if(!numBotShards) return
  if(numBotShards === dataList.numBotShards) return
  dataList.numBotShards = numBotShards
  log.info(`set number of numBotShards to ${dataList.numBotShards}...`)
}
module.exports = (data)=>{
  try{
    if(!data) return
    if(Cmds[data?.routingKey]) Cmds[data.routingKey](data)
    if(Cmds[data?.cmd]) Cmds[data.cmd](data)
  }catch(e){
    log.error(e)
  }
}
