'use strict'
const botRequest = require('botrequest')
const log = require('logger')
const mongo = require('mongoapiclient')
const swgohClient = require('swgohClient')

const getLowTickets = require('./getLowTickets')

module.exports = async(obj = {})=>{
  try{
    let gObj = await swgohClient('guild', {guildId: obj.guildId, includeRecentGuildActivityInfo: true}, null)
    if(gObj?.guild) gObj = gObj.guild
    if(gObj?.member){
      if(gObj.profile?.id) mongo.set('ticketCache', {_id: gObj.profile.id}, {member: gObj.member, updated: Date.now(), TTL: new Date(gObj.nextChallengesRefresh * 1000)})
      const embedMsg = getLowTickets(gObj)
      if(embedMsg) botRequest('sendMsg', {sId: obj.sId, chId: obj.chId, msg: {embeds: [embedMsg]}})
    }
    await mongo.set('guilds', { _id: obj.guildId }, { 'auto.final': Date.now() })
  }catch(e){
    log.error(e)
  }
}
