'use strict'
const path = require('path')
const fetch = require('./fetch')
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'
let retryCount = 11

const requestWithRetry = async(uri, opts = {}, count = 0)=>{
  try{
    let res = await fetch(uri, opts)
    if(res?.error === 'FetchError' || res?.body?.code === 6 || (res?.status === 400 && res?.body?.message)){
      if(count < retryCount){
        count++
        return await requestWithRetry(uri, opts, count)
      }else{
        throw(`tried request ${count} time(s) and errored with ${res.error} : ${res.message}`)
      }
    }
    return res
  }catch(e){
    throw(e)
  }
}
module.exports = async(uri, payload, identity)=>{
  try{
    let body = {}
    if(payload) body.payload = payload
    if(identity) body.identity = identity
    let opts = { headers: { "Content-Type": "application/json" }, timeout: 30000, method: 'POST', compress: true, body: JSON.stringify(body) }
    let res = await requestWithRetry(path.join(CLIENT_URL, uri), opts)
    if(res?.body?.code !== 5 && res?.body?.message) throw(uri+' : Code : '+res.body.code+' : Msg : '+res.body.message)
    if(res?.body) return res.body
    if(res?.error) throw(uri+' : '+res.error+' '+res.type)
  }catch(e){
    throw(e);
  }
}
