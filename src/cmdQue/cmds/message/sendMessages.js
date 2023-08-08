'use strict'
const botRequest = require('botrequest')
const log = require('logger')
const mongo = require('mongoapiclient')

const getLowTickets = require('./getLowTickets')

const BOT_NODE_NAME_PREFIX = process.env.BOT_NODE_NAME_PREFIX || 'bot'

const MomWatchMsg = (member, momId, sId)=>{
  try{
    let momMsg = "Oh Dear!\nI am sorry to bother you, my maker suggested that I send you a message about the following slackers who have not gotten thier daily 600 done : \n```\n"
    for(let i in member){
      momMsg += member[i].name+' only has '+member[i].tickets+'\n'
    }
    momMsg += '```'
    let payload = { sId: sId, msg: { content: momMsg }, dId: momId}
    if(!payload.sId) payload.podName = `${BOT_NODE_NAME_PREFIX}-0`
    botRequest('sendDM', payload)
  }catch(e){
    log.error(e)
  }
}
const GetPlayerDiscordId = async(playerId)=>{
  try{
    let obj = (await mongo.find('discordId', {'allyCodes.playerId': playerId}))[0]
    if(obj) return obj._id
  }catch(e){
    log.error(e)
  }
}
module.exports = async(obj = {}, gObj = {})=>{
  try{
    let momWatch = [], momId, ticketCount = 600, sId = obj.sId
    let guild = (await mongo.find('guilds', {_id: gObj.profile.id}))[0]
    if(guild?.auto){
      mongo.set('guilds', {_id: gObj.profile.id}, {'auto.sent': Date.now()})
      if(guild.auto.momWatch && guild.auto.momWatch.length > 0) momWatch = guild.auto.momWatch;
      if(guild.auto.momId) momId = guild.auto.momId
      if(guild.auto.ticketCount >= 0) ticketCount = + guild.auto.ticketCount
    }
    let member = gObj.member.filter(x => x.memberContribution.some(m => m.type == 2 && +m.currentValue < ticketCount)).map(p => {
      return Object.assign({}, { playerId: p.playerId, name: p.playerName, tickets: +(p.memberContribution.find(t => t.type == 2).currentValue) })
    })
    if(member.length > 0){
      let guildMsg = ''
      let lowTicketMsg = "Hi! If you are online, Please get your "+ticketCount+" done!\nCurrent Ticket Count : "
      let momWatchMember = []
      for (let i in member) {
        if (momWatch && momWatch.filter(x => x.playerId === member[i].playerId).length > 0) momWatchMember.push(member[i]);
        let discordId = await GetPlayerDiscordId(member[i].playerId)
        if (discordId) {
          let payload = { sId: sId, msg: { content: lowTicketMsg + member[i].tickets+' for '+member[i].name }, dId: discordId}
          if(!payload.sId) payload.podName = `${BOT_NODE_NAME_PREFIX}-0`
          let status = await botRequest('sendDM', payload )
          if(status?.id){
            guildMsg += 'message sent to ' + member[i].name+'\n'
          }else{
            guildMsg += 'unable to send a DM to ' + member[i].name+'\n'
          }
        } else {
          guildMsg += member[i].name + ' does not have allyCode linked to discordId\n'
        }
      }
      if(momId && momWatchMember.length > 0){
        MomWatchMsg(momWatchMember, momId, sId)
        let momName = 'Mom';
        let usr = await botRequest('getMember', {sId: obj.sId, dId: momId});
        if(usr?.username) momName = usr.username
        guildMsg += 'Message sent to '+momName+' about their posse\n'
      }
      botRequest('sendMsg', { sId: obj.sId, chId: obj.chId, method: 'sendMsg', msg: { content: guildMsg } })
    }
    let embedMsg = getLowTickets(gObj, ticketCount);
    if (embedMsg) botRequest('sendMsg', { sId: obj.sId,  chId: obj.chId, msg: { embeds: [embedMsg] } });
  }catch(e){
    log.error(e)
  }
}
