'use strict'
const numeral = require('numeral')
const sorter = require('json-array-sorter')

module.exports = (obj = {}, reqTickets = 600)=>{
  let ticketCount = obj.member.reduce((acc, m)=>{
    return acc + (m.memberContribution.find(x=>x.type == 2) ? +m.memberContribution.find(x=>x.type == 2).currentValue:0)
  }, 0)
  let member = obj.member.filter(x=>x.memberContribution.some(m=>m.type == 2 && +m.currentValue < reqTickets)).map(p=>{
    return Object.assign({}, {playerId: p.playerId, name: p.playerName, tickets: +(p.memberContribution.find(t=>t.type == 2).currentValue) })
  })
  let timeStamp = obj.updated || Date.now()
  let embedMsg = {
    color: 15844367,
    timestamp: new Date(timeStamp),
    title: obj.profile.name + " Daily Raid Tickets",
    description: 'Total: **'+ticketCount?.toLocaleString()+'**/'+(reqTickets * 50).toLocaleString()+'\n',
    footer: {
      text: "Data updated"
    }
  }
  embedMsg.description += "Guild Members Low **"+member.length+'**/'+obj.member.length+'\n'
  if(obj.inventory && obj.inventory.currencyItem && obj.inventory.currencyItem.find(x => x.currency === 20)) embedMsg.description += 'Current Total Rancor Tickets **' + numeral(obj.inventory.currencyItem.find(x => x.currency === 20).quantity).format('0,0') + '**\n'
  if(member.length > 10) embedMsg.description += 'Showing **10** with lowest ticket count\n'
  embedMsg.description += '```autohotkey+\n'
  if(member.length > 0){
    const sortedMember = sorter([{column: 'tickets', order: 'ascending'}], member)
    const array = sortedMember.slice(0, 10)
    for(let i in array){
      embedMsg.description += (array[i].tickets).toString().padStart(3, '0')+' : '+array[i].name+'\n'
    }
  }else{
    if(ticketCount >= (reqTickets * 50)){
      embedMsg.description += numeral((reqTickets * 50)/1000).format('0.0')+'K !!\n'
    }else{
      embedMsg.description += 'No one in the guild is low on tickets however you don\'t have '+numeral((reqTickets * 50)/1000).format('0.0')+'k. Maybe you are missing a member'
    }
  }
  embedMsg.description += '```'
  return embedMsg
}
