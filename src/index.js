'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const rabbitmq = require('./rabbitmq')
const swgohClient = require('./swgohClient')
const gameDataList = require('./helpers/gameDataList')

const CheckMongo = ()=>{
  try{
    log.debug(`start up mongo check...`)
    let status = mongo.status()
    if(status){
      CheckRabbitMQ()
      return
    }
    setTimeout(CheckMongo, 5000)
  }catch(e){
    reportError(e)
    setTimeout(CheckMongo, 5000)
  }
}
const CheckRabbitMQ = ()=>{
  try{
    if(!rabbitmq?.status) log.debug(`rabbitmq is not ready...`)
    if(rabbitmq?.status){
      log.debug(`rabbitmq is ready...`)
      CheckAPIReady()
      return
    }
    setTimeout(CheckRabbitMQ, 5000)
  }catch(e){
    reportError(e)
    setTimeout(CheckRabbitMQ, 5000)
  }
}
const CheckAPIReady = async()=>{
  try{
    let obj = await swgohClient('metadata')
    if(obj?.latestGamedataVersion){
      log.info('API is ready ..')
      CheckGameData()
      return
    }
    log.info('API is not ready. Will try again in 5 seconds')
    setTimeout(CheckAPIReady, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckAPIReady, 5000)
  }
}
const CheckGameData = async()=>{
  try{
    let status = gameDataList.status()
    if(status){
      rabbitmq.start()
      return
    }
    setTimeout(CheckGameData, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckGameData, 5000)
  }
}
CheckMongo()
