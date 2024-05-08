'use strict'
const log = require('logger')
const fetch = require('./fetch')
const BOT_NAMESPACE = process.env.BOT_NAMESPACE || process.env.NAME_SPACE || 'default', BOT_SET_NAME = process.env.BOT_SET_NAME || 'bot', BOT_SVC = process.env.BOT_SVC || 'bot', BOT_SVC_PORT = process.env.BOT_SVC_PORT || 3000
let NUM_SHARDS = 0

const start = async()=>{
  try{
    let opts = { method: 'GET', timeout: 60000, compress: true }
    let res = await fetch(`http://${BOT_SET_NAME}-${0}.${BOT_SVC}.${BOT_NAMESPACE}:${BOT_SVC_PORT}/getNumShards`, opts)
    if(res?.body?.totalShards > 0){
      NUM_SHARDS = +res.body.totalShards
      log.info(`Set Number of bot shards to ${NUM_SHARDS}...`)
      return
    }
    setTimeout(start, 5000)
  }catch(e){
    log.error(e)
    setTimeout(start, 5000)
  }
}
start()
const getId = (sId)=>{
  if(NUM_SHARDS > 0 && sId > 0){
    let shardId = (Number(BigInt(sId) >> 22n) % (NUM_SHARDS))
    return shardId?.toString()
  }
}
module.exports.getId = getId
module.exports.getPodName = (sId)=>{
  if(!sId) return
  let shardId = getId(sId)
  if(!shardId) return
  return `${BOT_SET_NAME}-${shardId}`
}
module.exports.getNumShards = ()=>{
  return NUM_SHARDS
}
module.exports.setNumShards = (data = {})=>{
  try{
    if(data.replicas && data.replicas !== NUM_SHARDS && data.name === BOT_SET_NAME && data.namespace === BOT_NAMESPACE){
      let oldCount = NUM_SHARDS
      NUM_SHARDS = +data.replicas
      log.info(`Number of bot shards changed from ${oldCount} to ${NUM_SHARDS}..`)
    }
  }catch(e){
    log.error(e)
  }
}
