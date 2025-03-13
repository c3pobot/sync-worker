'use strict'
const log = require('logger')
const mongo = require('mongoclient')

const checkMissed = require('./checkMissed')
const send = require('./send')


module.exports = async(data = {})=>{
  //data format { name: 'message', id: guildId }
  log.debug(`Started message sync for guild ${data.id}`)
  if(process.env.IS_TEST) return
  let guild = (await mongo.find('guilds', {_id: data.id }, { auto: 1, sync: 1 }))[0]
  if(!guild?.auto) return

  if(guild.auto.hours >= 0 && guild.auto.mins >= 0 && guild.auto.chId && guild.auto.sId && guild.auto.guildId && guild.auto.status){
    let tempTimeNow = Date.now();
    let tempResetTime = new Date()
    tempResetTime.setUTCHours(guild.auto.hours)
    tempResetTime.setUTCMinutes(guild.auto.mins)
    tempResetTime.setUTCSeconds(0)
    tempResetTime.setUTCMilliseconds(0)
    let timeTillReset = (+tempResetTime.getTime() - +tempTimeNow)
    if(timeTillReset < 0) tempResetTime = new Date(tempResetTime.getTime() + (86400 * 1000))
    timeTillReset = (+tempResetTime.getTime() - +tempTimeNow)

    if (tempResetTime.getTime() > tempTimeNow && timeTillReset < 7200000) {
      if (!guild.auto.sent) await send(guild.auto)
    }else{
      if(guild.auto.sent > 0 && (tempResetTime.getTime() < tempTimeNow || timeTillReset > 14400000)) await mongo.set('guilds', { _id: guild.auto.guildId }, { 'auto.sent': 0 })
    }
    if(!guild.sync) return

    let timeDiff = (tempResetTime.getTime() + 86460000) - tempTimeNow
    if (tempResetTime.getTime() > tempTimeNow && timeTillReset < 3600000) {
      if (!guild.auto.followup){
        await send(guild.auto);
        await mongo.set('guilds', { _id: guild.auto.guildId }, { 'auto.followup': Date.now() })
      }
    }else{
      if(guild.auto.followup > 0 && (tempResetTime.getTime() < tempTimeNow || timeDiff > 14400000)) await mongo.set('guilds', { _id: guild.auto.guildId }, { 'auto.followup': 0 })
    }
    
    let tempMissedTime = new Date()
    tempMissedTime.setUTCHours(guild.auto.hours)
    tempMissedTime.setUTCMinutes(guild.auto.mins)
    tempMissedTime.setUTCSeconds(0)
    tempMissedTime.setUTCMilliseconds(0)
    let missedTimeDiff = (tempMissedTime.getTime() + 86460000) - tempTimeNow

    if(missedTimeDiff < 86400000 && missedTimeDiff > 72000000){
      if(!guild.auto.missed) await checkMissed(guild.auto)
    }else{
      if(guild.auto.missed > 0) mongo.set('guilds', { _id: guild.auto.guildId }, { 'auto.missed': 0 })
    }
  }
}
