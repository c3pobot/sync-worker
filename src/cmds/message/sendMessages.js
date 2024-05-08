'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const botRequest = require('src/helpers/botrequest')
const getLowTickets = require('./getLowTickets')

const checkCache = async(playerId)=>{
  if(!playerId) return
  let player = (await mongo.find('playerIdCache', { _id: playerId}, {_id: 0, TTL: 0}))[0]
  if(player?.allyCode) return player
}
const getMember = async(playerId, name, memberContribution)=>{
  try{
    let obj = await checkCache(playerId)
    if(!obj?.allyCode) obj = await swgohClient.post('playerArena', { playerId: playerId, playerDetailsOnly: true } )
    if(obj?.allyCode){
      let dObj = (await mongo.find('discordId', {'allyCodes.playerId': playerId}))[0]
      return { playerId: playerId, tickets: +(memberContribution.find(t => t.type == 2)?.currentValue), allyCode: +obj.allyCode, name: obj.name || name, dId: dObj?._id }
    }
  }catch(e){
    log.error(e)
  }
}
const getMembers = async(member = [])=>{
  let array = [], i = member.length
  while(i--) array.push(getMember(member[i].playerId, member[i].playerName, member[i].memberContribution))
  let res = await Promise.allSettled(array)
  return res?.filter(x=>x?.value?.playerId)?.map(x=>x.value)
}
const momWatchMsg = async(member = [], momId, sId)=>{
  if(!momId || !sId) return
  let momMsg = "Oh Dear!\nI am sorry to bother you, my maker suggested that I send you a message about the following slackers who have not gotten thier daily 600 done : \n```\n"
  for(let i in member){
    momMsg += member[i].name+' only has '+member[i].tickets+'\n'
  }
  momMsg += '```'
  return await botRequest('sendDM', { sId: sId, dId: momId, msg: { content: momMsg } })
}
module.exports = async(obj = {}, gObj = {})=>{
  let momWatch = obj.momWatch || [], ticketCount = +(obj.ticketCount || 600), momId = obj.momId, momWatchMember = []
  let lowTicketMsg = "Hi! If you are online, Please get your "+ticketCount+" done!\nCurrent Ticket Count : ", guildMsg = ''
  let member = await getMembers(gObj.member.filter(x => x.memberContribution.some(m => m.type == 2 && +m.currentValue < ticketCount)))
  await mongo.set('guilds', { _id: obj.guildId }, {'auto.sent': Date.now()})
  if(member?.length > 0){
    if(obj.skipMessageSending) guildMsg += 'Sending messages to players is disabled via settings\n'
    for(let i in member){
      if (momWatch?.filter(x => x.playerId === member[i].playerId).length > 0) momWatchMember.push(member[i]);
      if(obj.skipMessageSending) continue
      if(member[i]?.dId){
        let status = await botRequest('sendDM', { sId: obj.sId, dId: member[i]?.dId, msg: { content: `${lowTicketMsg}\n${member[i].name} : ${member[i].tickets}` }})
        if(status?.id){
          guildMsg += 'message sent to ' + member[i].name+'\n'
        }else{
          guildMsg += 'unable to send a DM to ' + member[i].name+'\n'
        }
      }else{
        guildMsg += member[i].name + ' does not have allyCode linked to discordId\n'
      }
    }

    if(momId && momWatchMember.length > 0){
      let status = await momWatchMsg(momWatchMember, momId, obj.sId)
      if(status?.id){
        let momName = 'Mom';
        let usr = await botRequest('getMember', { sId: obj.sId, dId: momId });
        if(usr?.username) momName = usr.username
        guildMsg += 'Message sent to '+momName+' about their posse\n'
      }
    }
    await botRequest('sendMsg', { sId: obj.sId, chId: obj.chId, method: 'sendMsg', msg: { content: guildMsg } })
  }

  let embedMsg = getLowTickets(gObj, ticketCount);
  if (embedMsg) botRequest('sendMsg', { sId: obj.sId,  chId: obj.chId, msg: { embeds: [embedMsg] } });
}
