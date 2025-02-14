'use strict'
const log = require('logger')
const client = require('./client')
const reportError = require('src/reportError')
const exchange = require('./exchange')
const consumer = require('./consumer')

let POD_NAME = process.env.POD_NAME || 'sync-worker', NAME_SPACE = process.env.NAME_SPACE || 'default'
let DEFAULT_EXCHANGE = `${NAME_SPACE}.cmds`

let exchanges = [{ exchange: DEFAULT_EXCHANGE, type: 'topic', maxAttempts: 5 }]

log.info(`${POD_NAME} topic exchange publisher created...`)

let publisher = client.createPublisher({ exchanges: exchanges })
publisher.on('close', ()=>{
  log.info(`${POD_NAME} topic exchange publisher disconnected...`)
})
module.exports = {
  get status(){
    return client?.ready
  }
}
module.exports.notify = async( data, routingKey, exchange )=>{
  try{
    if(!data || !client.ready) return
    if(!exchange) exchange = DEFAULT_EXCHANGE
    await publisher.send({ exchange: exchange, routingKey: routingKey }, data)
    return true
  }catch(e){
    reportError(e)
  }
}
module.exports.start = () =>{
  exchange.start()
  consumer.start()
}
