'use strict'
const log = require('logger')
const fetch = require('./fetch')
const { getPodName, getNumShards } = require('./botInfo')
let BOT_SVC = process.env.BOT_SVC || 'bot', BOT_SVC_PORT = process.env.BOT_SVC_PORT || 3000, BOT_SET_NAME = process.env.BOT_SET_NAME || 'bot', BOT_NAMESPACE = process.env.BOT_NAMESPACE || process.env.NAME_SPACE || 'default'
const retryCount = 7

const requestWithRetry = async(uri, opts = {}, count = 0)=>{
  let res = await fetch(uri, opts)
  if(res?.error === 'FetchError'){
    if(count < retryCount){
      count++
      return await requestWithRetry(uri, opts, count)
    }else{
      throw(`tried request ${count} time(s) and errored with ${res.error} : ${res.message}`)
    }
  }
  return res
}

let singleBotRequest = async(cmd, podName, opt = {})=>{
  let payload = { method: 'POST', timeout: 60000, compress: true, headers: {"Content-Type": "application/json"} }
  payload.body = JSON.stringify({ ...opt, ...{ cmd: cmd, podName: `${podName}` } })
  let obj = await requestWithRetry(`http://${podName}.${BOT_SVC}.${BOT_NAMESPACE}:${BOT_SVC_PORT}/cmd`, payload)
  return obj?.body
}
const allBotRequest = async(cmd, opts = {})=>{
  let array = [], res = [], i = getNumShards(), count = 0
  if(!i) return
  while(count<i){
    array.push(singleBotRequest(cmd, `${BOT_SET_NAME}-${count}`, opts))
    count++
  }
  let tempRes = await Promise.allSettled(array)
  for(let i in tempRes){
    if(tempRes[i]?.value) res.push(tempRes[i].value)
  }
  return res
}

module.exports = async(cmd, opts = {})=>{
  if(!cmd) return
  let podName = opts.podName
  if(!podName) podName = getPodName(opts.sId)
  if(!podName && cmd == 'sendDM') podName = `${BOT_SET_NAME}-0`
  if(!podName) return
  if(podName === 'all') return await allBotRequest(cmd, opts)
  return await singleBotRequest(cmd, podName, opts)
}
