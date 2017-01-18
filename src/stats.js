'use strict'
const smb = require('slack-message-builder')
const strava = require('strava-v3')

module.exports = (app) => {

  let slapp = app.slapp

  slapp.message('stats', ['direct_mention', 'direct_message'], (msg, text) => {
    var peopleData = []
    var athleteField = ''
    var timefield = ''
    var count = 1
    var shamingList = ''
    var motivations = [
      'Train insane or remain the same.',
      'You look like a can of biscuits that’s just popped open.',
      'Your tears are like jet fuel to me.',
      'Gat yer arse on that tarmac ya Big Mac eating duffelbagers.',
      'All I do is eat gunpowder and run. What about you?',
      'Go away, you smell like failure and corn chips.',
      'There will be no crying or whining for any reason or a reason will be issued to you.'
    ]

    var secondsToHms = function (d) {
      d = Number(d)
      var h = Math.floor(d / 3600)
      var m = Math.floor(d % 3600 / 60)
      var s = Math.floor(d % 3600 % 60)
      if (h === 0 && m === 0 && s === 0) { return '0'}
      if (m < 10) { m = ('0' + m).slice(-2) }
      if (s < 10) { s = ('0' + s).slice(-2) }
      m < 10 ? ('0' + m).slice(-2) : m
      var hDisplay = h > 0 ? h + ':' : ''
      var mDisplay = m > 0 ? m + ':' : ''
      var sDisplay = s
      return hDisplay + mDisplay + sDisplay 
    }

    strava.clubs.listMembers({id: app.config.clubId}, function (err, members) {
      strava.clubs.listActivities({id: app.config.clubId}, function (err, activities) {
        members.forEach(function (member) {
          // Add all members to object
          peopleData.push({'id':member.id, 'name':member.firstname + ' ' + member.lastname,'total':0})
          activities.forEach(function (activity, i) {
            // Add totals to each user in object
            if (member.id === activity.athlete.id) {
              for (var i = 0; i < peopleData.length; i++) {
                if (activity.athlete.id === peopleData[i].id) {
                  peopleData[i].total = peopleData[i].total + activity.moving_time
                }
              }
            }
          })
        })
        peopleData.sort(function(a, b) {
          return b.total - a.total
        })
        peopleData.forEach(function (name, i) {
          if (peopleData[i].total === 0) {
            shamingList += peopleData[i].name + ', '
          }
          athleteField += peopleData[i].name + '\n'
          timefield += secondsToHms(peopleData[i].total) + '\n'
        })
        var teamTotal = 0
        var calcTotal = function () {
          for (var i = 0; i < peopleData.length; i++) {
            teamTotal = teamTotal + peopleData[i].total;
          }
        }
        calcTotal()

        let m = smb()
        m.text('Your Strava team\'s stats')
          .attachment()
            .fallback('Required plain-text summary of the attachment.')
            .mrkdwnIn(['text'])
            .color('#FC4C02')
            .text('*Team Totals:* ' + secondsToHms(teamTotal))
            .end()
          .attachment()
            .fallback('Required plain-text summary of the attachment.')
            .mrkdwnIn(['text'])
            .color('#FFD4C2')
            .field()
              .title('Athlete')
              .value(athleteField)
              .short(true)
              .end()
            .field()
              .title('Time Active')
              .value(timefield)
              .short(true)
              .end()
            .end()
          .attachment()
            .fallback('Required plain-text summary of the attachment.')
            .mrkdwnIn(['text'])
            .color('#EFC6D9')
            .authorName(shamingList.slice(0, -2))
            .authorIcon('https://dl.dropboxusercontent.com/u/156187/donut.png')
            .text('_' + motivations[Math.floor(Math.random() * (motivations.length))] + '_')
            .footer('Stats reset Sunday morning. Get your butt out there.')
        msg.say({ text: m.data.text, attachments: m.data.attachments})
      })
    })
  })
}

