'use strict'
const mongo = require('mongoclient')

const checkMissed = require('./checkMissed')
const send = require('./send')

module.exports = async(data = {})=>{
  //data format { name: 'message', guildId: guildId }
  let guild = (await mongo.find('guilds', {_id: data.guildId }, { auto: 1, sync: 1 }))[0]
  if(!guild.auto) return

  if(guild.auto.hours >= 0 && guild.auto.mins >= 0 && guild.auto.chId && guild.auto.sId && guild.auto.guildId && guild.auto.status){
    let tempTimeNow = Date.now();
    let tempResetTime = new Date()
    tempResetTime.setUTCHours(guild.auto.hours)
    tempResetTime.setUTCMinutes(guild.auto.mins)
    tempResetTime.setUTCSeconds(0)
    tempResetTime.setUTCMilliseconds(0)
    let timeTillReset = (+tempResetTime.getTime() - +tempTimeNow)
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
    if(timeDiff < 86400000 && timeDiff > 72000000){
      if(!guild.auto.missed) await checkMissed(guild.auto)
    }else{
      if(guild.auto.missed > 0) mongo.set('guilds', { _id: guild.auto.guildId }, { 'auto.missed': 0 })
    }
  }
}
