'use strict'
const log = require('logger')
const Cmds = require('src/cmds')
const sleep = (ms = 5000)=>{ return new Promise(resolve=>{setTimeout(resolve, ms)})}
module.exports = async(obj = {})=>{
  try{
    if(!obj?.body?.name) return
    log.debug(`${obj.body.name} processing started...`)
    if(Cmds[obj.body.name]) await Cmds[obj.body.name](obj.body)
    if(process.env.IS_TEST) await sleep(30000)
    log.debug(`${obj.body.name} procssing done...`)
  }catch(e){
    log.error(e)
  }
}
