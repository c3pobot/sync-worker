'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const rabbitmq = require('./rabbitmq')
const swgohClient = require('./swgohClient')
const cmdQue = require('./cmdQue')
const { dataList } = require('./helpers/dataList')
require('./exchange')

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
      rabbitmq.notify({ cmd: 'requestNumBotShards' })
      CheckBot()
      return
    }
    setTimeout(CheckRabbitMQ, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckRabbitMQ, 5000)
  }
}
const CheckBot = ()=>{
  try{
    if(dataList?.numBotShards){
      CheckAPIReady()
      return
    }
    setTimeout(CheckBot, 5000)
  }catch(e){
    setTimeout(CheckBot, 5000)
    log.error(e)
  }
}
const CheckAPIReady = async()=>{
  try{
    let obj = await swgohClient('metadata')
    if(obj?.latestGamedataVersion){
      log.info('API is ready ..')
      cmdQue.start()
      return
    }
    log.info('API is not ready. Will try again in 5 seconds')
    setTimeout(CheckAPIReady, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckAPIReady, 5000)
  }
}

CheckMongo()
