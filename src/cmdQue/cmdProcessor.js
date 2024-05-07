'use strict'
const log = require('logger')
const redis = require('redisclient')
const Cmds = require('./cmds')

const processJob = async(job = {})=>{
  try{
    let res
    if(redis && process.env.LOCAL_QUE_KEY && job?.id) await redis.setTTL(process.env.LOCAL_QUE_KEY+'-'+job.id, job)
    if(Cmds[job?.jobType]) res = await Cmds[job.jobType](job.data);
    if(redis && process.env.LOCAL_QUE_KEY && job?.id) await redis.del(process.env.LOCAL_QUE_KEY+'-'+job.id)
    return res;
  }catch(e){
    throw(e)
  }
}
module.exports = async(job)=>{
  try{
    let obj = job?.data
    if(!obj) return
    if(job?.opts?.jobId) obj.id = job.opts.jobId
    if(job?.timestamp) obj.timestamp = job.timestamp
    return await processJob(obj)
  }catch(e){
    log.error(e)
  }
}
