'use strict'
const mongo = require('mongoapiclient')
const checkMissed = require('./checkMissed')
const send = require('./send')

module.exports = async(job = {})=>{
  let status = 1, obj
  if(job.status >= 0) status = job.status
  let guild = (await mongo.find('guilds', {_id: job.guildId}, {auto: 1, sync: 1}))[0]
  if(guild){
    obj = guild.auto
    if(obj) obj.sync = guild.sync
  }
  if(status && obj && obj.hours >= 0 && obj.mins >= 0 && obj.chId && obj.guildId){
    const tempTimeNow = Date.now();
    let tempResetTime = new Date()
    tempResetTime.setUTCHours(obj.hours)
    tempResetTime.setUTCMinutes(obj.mins)
    tempResetTime.setUTCSeconds(0)
    tempResetTime.setUTCMilliseconds(0)
    let timeTillReset = (+tempResetTime.getTime() - +tempTimeNow)
    if (tempResetTime.getTime() > tempTimeNow && timeTillReset < 7200000) {
      if (!obj.sent) await send(obj)
    }else{
      if(obj.sent > 0 && (tempResetTime.getTime() < tempTimeNow || timeTillReset > 14400000)) await mongo.set('guilds', { _id: obj.guildId }, { 'auto.sent': 0 })
    }
    if(obj.sync){
      if (tempResetTime.getTime() > tempTimeNow && timeTillReset < 3600000) {
        if (!obj.followup){
          await send(obj);
          await mongo.set('guilds', { _id: obj.guildId }, { 'auto.followup': Date.now() })
        }
      }else{
        if(obj.followup > 0 && (tempResetTime.getTime() < tempTimeNow || timeDiff > 14400000)) await mongo.set('guilds', { _id: obj.guildId }, { 'auto.followup': 0 })
      }
      let timeDiff = (tempResetTime.getTime() + 86460000) - tempTimeNow
      if(timeDiff < 86400000 && timeDiff > 72000000){
        if(!obj.missed) await checkMissed(obj)
      }else{
        if(obj.missed > 0) mongo.set('guilds', { _id: obj.guildId }, { 'auto.missed': 0 })
      }
    }
  }
}
