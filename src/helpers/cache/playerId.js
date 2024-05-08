'use strict'
const log = require('logger')
const mongo = require('mongoclient')
module.exports.set = async(playerId, allyCode)=>{
  try{
    if(!playerId || !allyCode) return
    return await mongo.set('playerIdCache', { _id: playerId }, { playerId: playerId, allyCode: +allyCode })
  }catch(e){
    log.error(e)
  }
}
module.exports.get = async(playerId, allyCode)=>{
  if(!playerId && !allyCode) return
  let query = {}
  if(playerId){
    query._id = playerId
  }else{
    if(allyCode) query.allyCode = +allyCode
  }
  return (await mongo.find('playerIdCache', query, {_id: 0, TTL: 0}))[0]
}
