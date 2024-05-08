'use strict'
const log = require('logger')
const rabbitmq = require('src/helpers/rabbitmq')
const cmdProcessor = require('./cmdProcessor')
let QUE_NAME = process.env.NAME_SPACE || 'default', POD_NAME = process.env.POD_NAME || 'sync-worker', consumer, WORKER_TYPE = process.env.WORKER_TYPE || 'guild'
QUE_NAME += `.sync.${WORKER_TYPE}`

const processCmd = async(obj = {})=>{
  try{
    await cmdProcessor(obj)
    return 1
  }catch(e){
    log.error(e)
    return 1
  }
}
const start = async()=>{
  if(consumer) await consumer.close()
  consumer = rabbitmq.createConsumer({ consumerTag: POD_NAME, concurrency: 1, qos: { prefetchCount: 1 }, queue: QUE_NAME, queueOptions: { durable: true, arguments: { 'x-queue-type': 'quorum' } } }, processCmd)
  consumer.on('error', (err)=>{
    log.info(err)
  })
  consumer.on('ready', ()=>{
    log.info(`${POD_NAME} ${WORKER_TYPE}-sync consumer created...`)
  })
  return true
}
module.exports.start = start
module.exports.restart = (data)=>{
  if(!data || data?.set !== WORKER_TYPE || data?.cmd !== 'restart') return
  log.info(`${POD_NAME} received a consumer restart cmd...`)
  setTimeout(start, 5000)
}
