'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const { calcRosterStats } = require('statcalc')
const swgohClient = require('src/swgohClient')
const formatPlayer = require('./formatPlayer')
const updateCache = async(obj = {})=>{
  try{
    if(!obj.playerId || !obj.allyCode) return
    mongo.set('playerIdCache', { _id: obj.playerId }, { allyCode: +obj.allyCode, playerId: obj.playerId })
    mongo.set('guildIdCache', { _id: obj.playerId }, { allyCode: +obj.allyCode, playerId: obj.playerId, guildId: obj.guildId, guildName: obj.guildName })
  }catch(e){
    log.error(e)
  }
}
module.exports = async(opt = {})=>{
  try{
    if(!opt.playerId && !opt.allyCode) return
    if(opt.playerId) delete opt.allyCode
    let player = await swgohClient('player', opt)
    if(!player.rosterUnit) return
    updateCache(player)
    let profile = calcRosterStats(player.rosterUnit)
    if(!profile?.summary) return
    let stats = { zetaCount: profile.summary.zeta, sixModCount: profile.summary.mod.r6, omiCount: profile.summary.omi, roster: profile.roster, summary: profile.summary }
    stats.omiCount.gac = profile.summary.omi.ga
    stats.omiCount.conquest = profile.summary.omi.cq
    player = { ...player,...stats }
    formatPlayer(player)
    if(!player.gp) return
    mongo.set('playerCache', { _id: player.playerId }, player)
    return player
  }catch(e){
    log.error(e)
  }
}
