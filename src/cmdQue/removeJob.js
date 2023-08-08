'use strict'
const log = require('logger')
const redis = require('redisclient')
const QUE_NAME = process.env.CMD_QUE_NAME || 'guildQue'
module.exports = async(jobId)=>{
  try{
    if(cmdQue?.name){
      let jobs = await redis.keys('bull:'+QUE_NAME+':'+jobId+'*')
      for(let i in jobs) await redis.del(jobs[i])
    }
  }catch(e){
    log.error(e);
  }
}
