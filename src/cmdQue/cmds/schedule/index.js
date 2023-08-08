'use strict'
const enumEvents = {
  gac: {join: 'GAC is open for Joining', remind: '~2 hours left to join GAC', remindTime: 79200000},
  conquest: {start: 'Conquest is open for battle'}
}
module.exports = async()=>{
  try{
    const schedule = await mongo.find('guildSchedule', {})
    if(schedule && schedule.length > 0){
      const timeNow = Date.now()
      for(let i in schedule){
        if(timeNow > +schedule[i].time){
          if(schedule[i].settings && schedule[i].settings.status && enumEvents[schedule[i].event] && enumEvents[schedule[i].event][schedule[i].state]){
            const msg2send = (schedule[i].settings.roleId ? '<@&'+schedule[i].settings.roleId+'> ':'')+enumEvents[schedule[i].event][schedule[i].state]
            MSG.SendMsg({chId: schedule[i].settings.chId}, {content: msg2send})
          }
          if(schedule[i].state == 'join' && enumEvents[schedule[i].event] && enumEvents[schedule[i].event].remind){
            await mongo.set('guildSchedule', {_id: schedule[i]._id}, {state: 'remind', time: (+schedule[i].time + (enumEvents[schedule[i].event].remindTIme || 79200000)).toString()})
          }else{
            await mongo.del('guildSchedule', {_id: schedule[i]._id})
          }
        }
      }
    }
  }catch(e){
    console.error(e)
  }
}
