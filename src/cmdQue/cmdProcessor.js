'use strict'
const log = require('logger')
const Cmds = require('src/cmds')
const sleep = (ms = 5000)=>{ return new Promise(resolve=>{setTimeout(resolve, ms)})}
module.exports = async(data = {})=>{
  try{
    if(!data?.id || !data?.name || !Cmds[data?.name]) return
    log.debug(`${data?.name} processing started for id ${data.id}...`)
    let status = await Cmds[data.name](data)
    if(process.env.IS_TEST) await sleep(30000)
    log.debug(`${data?.name} processing done for id ${data.id}...`)
  }catch(e){
    log.error(e)
  }
}
