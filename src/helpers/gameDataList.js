'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const statCalc = require('statcalc');

let statCalcReady
const updateGameData = async()=>{
  let obj = (await mongo.find('botSettings', {_id: 'gameData'}))[0]
  if(!obj?.data || !obj?.version) return
  let status = statCalc.setGameData(obj.data)
  if(status){
    statCalcReady = true
    log.info(`gameData set to ${obj?.version}`)
    return true
  }
}
const update = async( data )=>{
  try{
    let status = mongo.status()
    if(status) status = await updateGameData()
    if(status) return
    setTimeout(()=>update(data))
  }catch(e){
    log.error(e)
    setTimeout(()=>update(data))
  }
}
update()
module.exports.update = update
module.exports.status = ()=>{
  return statCalcReady
}
