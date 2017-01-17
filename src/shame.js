'use strict'
const smb = require('slack-message-builder')
const strava = require('strava-v3')

module.exports = (app) => {

  let slapp = app.slapp
  let donutUrl = 'https://dl.dropboxusercontent.com/u/156187/donut.png'

  slapp.message('shame', ['direct_mention', 'direct_message'], (msg, text) => {
    var motivations = [
      'Train insane or remain the same.',
      'You look like a can of biscuits that’s just popped open.',
      'Your tears are like jet fuel to me.',
      'Gat yer arse on that tarmac ya Big Mac eating duffelbagers.',
      'All I do is eat gunpowder and run. What about you?',
      'Go away, you smell like failure and corn chips.',
      'There will be no crying or whining for any reason or a reason will be issued to you.'
    ]

    strava.clubs.listMembers({id: app.config.clubId}, function (err, members) {
      strava.clubs.listActivities({id: app.config.clubId}, function (err, activities) {
        let shamingList = []
        members.forEach(function (member) {
          let memberHasActivity = false
          activities.forEach(function (activity) {
            if (member.id === activity.athlete.id) {
              memberHasActivity = true
            }
          })

          if (!memberHasActivity) {
            shamingList.push(member)
            //console.log(member.firstname + ' does not have activities')
          }
        })

        let lazyStr = ''
        shamingList.forEach(function (shamee, index) {
          let comma = (index !== shamingList.length - 1) ? ', ' : ''
          lazyStr += shamee.firstname + ' ' + shamee.lastname + comma
        })

        let m = smb()
        if (shamingList.length === 0) {
          m.text('*Everyone is active.* Ain\'t no shame in your Strava team\'s game!')
          msg.say({ text: m.data.text })
        } else {
          m.text('Your Strava team might need some motivation.')
            .attachment()
              .fallback('Required plain-text summary of the attachment.')
              .mrkdwnIn(['text'])
              .authorName(lazyStr)
              .authorIcon(donutUrl)
              .text(motivations[Math.floor(Math.random() * (motivations.length + 1))])
          msg.say({ text: m.data.text, attachments: m.data.attachments})
        }
      })
    })
  })
}

