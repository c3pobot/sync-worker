'use strict'
module.exports = (obj = {}, members = [])=>{
  if(members.length == 0) return
  obj.updated = Date.now()
  obj.id = obj.profile.id
  obj.name = obj.profile.name
  obj.gp = 0
  obj.gpChar = 0
  obj.gpShip = 0
  obj.zetaCount = 0
  obj.sixModCount = 0
  obj.omiCount = { total: 0, tb: 0, tw: 0, gac: 0, conquest: 0 }
  let i = members.length
  while(i--){
    obj.gp += members[i].gp || 0
    obj.gpChar += members[i].gpChar || 0
    obj.gpShip += members[i].gpShip || 0
    obj.zetaCount += members[i].zetaCount || 0
    obj.sixModCount += members[i].sixModCount || 0
    obj.omiCount.total += members[i].omiCount?.total || 0
    obj.omiCount.tb += members[i].omiCount?.tb || 0
    obj.omiCount.tw += members[i].omiCount?.tw || 0
    obj.omiCount.gac += members[i].omiCount?.gac || 0
    obj.omiCount.conquest += members[i].omiCount?.conquest || 0
  }
}
