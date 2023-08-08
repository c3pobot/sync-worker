'use strict'
const log = require('logger')
const redis = require('redisclient')
const mongo = require('mongoapiclient')
const swgohClient = require('./swgohClient')
let logLevel = process.env.LOG_LEVEL || log.Level.INFO;
log.setLevel(logLevel);

const CmdQue = require('./cmdQue')
const CheckRedis = ()=>{
  try{
    let status = redis.status()
    if(status){
      CheckMongo()
      return
    }
    setTimeout(CheckRedis, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckRedis, 5000)
  }
}
const CheckMongo = ()=>{
  try{
    let status = mongo.status()
    if(status){
      CheckAPIReady()
      return
    }
    setTimeout(CheckMongo, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckMongo, 5000)
  }
}
const CheckAPIReady = async()=>{
  try{
    let obj = await swgohClient('metadata')
    if(obj?.latestGamedataVersion){
      log.info(`API is ready...`)
      CmdQue.start()
      return
    }
    log.info(`API is not ready...`)
    setTimeout(CheckAPIReady, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckAPIReady, 5000)
  }
}
CheckRedis()
