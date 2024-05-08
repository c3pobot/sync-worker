'use strict'
const log = require('logger')
const getPlayer = require('./getPlayer');
const maxRetry = 6

const filterMembers = (all = [], found = [])=>{
  if(found?.length === 0) return all
  let foundIds = found?.map(x=>x.playerId);
  return all.filter(x=>!foundIds.includes(x.playerId));
}

const getMembers = async(members = [], projection)=>{
  let array = [], i = members.length
  while(i--) array.push(getPlayer({ playerId: members[i].playerId, allyCode: members[i].allyCode?.toString() }))
  let res = await Promise.allSettled(array)
  return res?.filter(x=>x?.value?.playerId)?.map(x=>x.value)
}

module.exports = async(members = [])=>{
  if(members.length == 0) return
  let count = 0, res = [], timeStart = Date.now()
  while(count < maxRetry){
    let tempMembers = filterMembers(members, res)
    let tempRes = await getMembers(tempMembers)
    if(tempRes?.length === members?.length) return tempRes
    if(tempRes?.length > 0) res = res.concat(tempRes)
    if(res?.length === members?.length) break;
    count++
  }
  return res
}
