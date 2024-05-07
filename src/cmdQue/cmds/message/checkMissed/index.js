'use strict'
const botRequest = require('botrequest')
const log = require('logger')
const mongo = require('mongoapiclient')

const swgohClient = require('swgohClient')
const createMissedMsg = require('./createMissedMsg')

module.exports = async(obj = {})=>{
  try{
    let ticketCount = 600
    if(obj.ticketCount >= 0) ticketCount = obj.ticketCount
    let cache = (await mongo.find('ticketCache', {_id: obj.guildId}))[0]
    let gObj = await swgohClient('guild', {guildId: obj.guildId, includeRecentGuildActivityInfo: true}, null)
    if(gObj?.guild) gObj = gObj.guild
    let timeDiff = Date.now() - cache.updated
    if(cache && gObj?.member){
      if(14400000 > timeDiff ){
        gObj.updated = Date.now()
        const embedMsg = createMissedMsg(gObj, ticketCount, cache)
        if(embedMsg){
          botRequest('sendMsg', { chId: obj.chId, sId: obj.sId, msg: {embeds: [embedMsg]}})
          await mongo.set('guilds', { _id: obj.guildId }, { 'auto.missed': Date.now() })
        }
      }else{
        botRequest('sendMsg', { chId: obj.chId, sId: obj.sId, msg: {content: 'Sorry I could not check who missed becuase the cached data is too old'} } )
        await mongo.set('guilds', { _id: obj.guildId }, { 'auto.missed': Date.now() })
      }
    }
  }catch(e){
    log.error(e)
  }
}
