'use strict'
const log = require('logger')
module.exports = (gObj, reqTickets = 600, cache)=>{
  try{
    const embedMsg = {
      color: 15844367,
      timestamp: new Date(gObj.updated),
      title: gObj.profile.name+' Daily Raid Tickets',
      footer: {
        text: "Data updated"
      }
    }
    let ticketCount = cache.member.reduce((acc, m)=>{
      return acc + (m.memberContribution.find(x=>x.type == 2) ? +m.memberContribution.find(x=>x.type == 2).currentValue:0)
    }, 0)
    const member = cache.member.filter(x=>x.memberContribution.some(m=>m.type == 2 && +m.currentValue < reqTickets)).map(p=>{
      return Object.assign({}, {playerId: p.playerId, name: p.playerName, tickets: +(p.memberContribution.find(t=>t.type == 2).currentValue), total: +(p.memberContribution.find(t=>t.type == 2).lifetimeValue)  })
    })
    const mArray = []
    if(ticketCount < (reqTickets * 50) && member.length > 0){
      for(let i in member){
        const gMember = gObj.member.find(x=>x.playerId == member[i].playerId)
        if(gMember){
          const mTotal = gMember.memberContribution.find(x=>x.type == 2).lifetimeValue - member[i].total - gMember.memberContribution.find(x=>x.type == 2).currentValue
          const dTotal = member[i].tickets + mTotal
          if(mTotal >= 0) ticketCount += mTotal
          if(dTotal < reqTickets) mArray.push({name: member[i].name, tickets: dTotal})
        }
      }
    }
    embedMsg.description = 'Total: **'+ticketCount?.toLocaleString()+'**/'+(reqTickets * 50)?.toLocaleString()+'\n'
    if(mArray.length > 0){
      embedMsg.description += 'Guild Members that missed\n```\n'
      for(let i in mArray){
        embedMsg.description += (mArray[i].tickets).toString().padStart(3, '0')+' : '+mArray[i].name+'\n'
      }
      embedMsg.description += '```'
    }
    return embedMsg
  }catch(e){
    log.error(e)
  }
}
