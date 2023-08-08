'use strict'
const log = require('logger')
const mongo = require('mongoapiclient')
const botRequest = require('botrequest')
const swgohClient = require('swgohClient')

const sendMessages = require('./sendMessages')

module.exports = async(obj = {})=>{
  try{
    let gObj = await swgohClient('guild', {guildId: obj.guildId, includeRecentGuildActivityInfo: true}, null)
    if(gObj?.guild) gObj = gObj.guild
    if(gObj?.member){
      if(gObj.profile?.id) mongo.set('ticketCache', {_id: gObj.profile.id}, {member: gObj.member, updated: Date.now(), TTL: new Date(gObj.nextChallengesRefresh * 1000)})
      await sendMessages(obj, gObj)
    }else{
      await mongo.set('guilds', { _id: obj.guildId }, { 'auto.sent': Date.now() })
      await botRequest('sendMsg', { sId: obj.sId, chId: obj.chId, msg: {content: 'Error getting guild data to auto send messages'} })
    }
  }catch(e){
    log.error(e)
  }
}
