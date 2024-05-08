'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const botRequest = require('src/helpers/botrequest')
const swgohClient = require('src/swgohClient')

const sendMessages = require('./sendMessages')

module.exports = async(obj = {})=>{
  let gObj = await swgohClient('guild', { guildId: obj.guildId, includeRecentGuildActivityInfo: true })
  if(!gObj?.guild) return
  gObj = gObj.guild
  if(gObj?.member){
    if(gObj.profile?.id) await mongo.set('ticketCache', {_id: gObj.profile.id}, {member: gObj.member, updated: Date.now(), TTL: new Date(gObj.nextChallengesRefresh * 1000)})
    await sendMessages(obj, gObj)
  }else{
    await mongo.set('guilds', { _id: obj.guildId }, { 'auto.sent': Date.now() })
    await botRequest('sendMsg', { sId: obj.sId, chId: obj.chId, msg: { content: 'Error getting guild data to auto send messages' } })
  }
}
