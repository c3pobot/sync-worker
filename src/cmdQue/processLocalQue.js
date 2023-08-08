'use strict'
const log = require('logger')
const redis = require('redisclient')
const LOCAL_QUE_KEY = process.env.LOCAL_QUE_KEY
const Que = require('./que')
const Cmds = require('./cmds')

module.exports = async()=>{
  try{
    if(!LOCAL_QUE_KEY || !redis) return
    let count = 0, failed = 0
    let jobs = await redis.keys(`${LOCAL_QUE_KEY}-*`)
    if(jobs?.length > 0){
      let timeNow = Date.now()
      timeNow = +timeNow - 599999
      for(let i in jobs){
        let obj = await redis.get(jobs[i])
        if(obj?.timestamp > timeNow && Cmds[obj?.jobType]){
          count++
          await Cmds[obj.jobType](obj.data)
        }else{
          failed++
        }
        await redis.del(jobs[i])
        if(jobs[i]?.id) await Que.removeJob(jobs[i].id)
      }
    }
    log.info('Processed '+count+' left over in job que. Deleted '+failed+' invalid')
  }catch(e){
    throw(e)
  }
}
