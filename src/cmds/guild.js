'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const getPlayers = require('src/helpers/getPlayers')
const formatGuild = require('src/helpers/formatGuild')

module.exports = async(data = {} )=>{
  try{
    //data format { name: 'guild', id: guildId }
    log.debug(`Started sync of guild ${data.id}`)
    if(process.env.IS_TEST) return
    let timeStart = Date.now()
    let guild = await swgohClient('guild', { guildId: data.id, includeRecentGuildActivityInfo: true })
    guild = guild?.guild
    if(!guild?.member) return
    guild.member = guild.member.filter(x=>x.memberLevel > 1)
    let members = await getPlayers(guild.member)
    let timeEnd = Date.now()
    log.debug(`guild pull took ${(timeEnd - timeStart) / 1000} seconds`)
    if(guild?.member?.length !== members?.length) return
    formatGuild(guild, members)
    if(!guild.gp) return
    await mongo.set('guildCache', { _id: data.id }, guild)
  }catch(e){
    log.error(e)
  }
}
