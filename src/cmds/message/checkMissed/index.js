'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const botRequest = require('src/helpers/botrequest')
const swgohClient = require('src/swgohClient')
const createMissedMsg = require('./createMissedMsg')

module.exports = async(obj = {})=>{
  let ticketCount = +(obj.ticketCount || 600)
  let cache = (await mongo.find('ticketCache', {_id: obj.guildId}))[0]
  if(!cache) return
  let gObj = await swgohClient('guild', { guildId: obj.guildId, includeRecentGuildActivityInfo: true })
  if(!gObj?.guild?.member) return

  gObj = gObj.guild
  let timeDiff = Date.now() - cache.updated
  if(14400000 > timeDiff ){
    gObj.updated = Date.now()
    let embedMsg = createMissedMsg(gObj, ticketCount, cache)
    if(embedMsg){
      botRequest('sendMsg', { chId: obj.chId, sId: obj.sId, msg: { embeds: [embedMsg] } })
      await mongo.set('guilds', { _id: obj.guildId }, { 'auto.missed': Date.now() })
    }
  }else{
    botRequest('sendMsg', { chId: obj.chId, sId: obj.sId, msg: {content: 'Sorry I could not check who missed becuase the cached data is too old'} } )
    await mongo.set('guilds', { _id: obj.guildId }, { 'auto.missed': Date.now() })
  }
}
