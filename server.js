'use strict'
const express = require('express')
const Slapp = require('slapp')
const ConvoStore = require('slapp-convo-beepboop')
const Context = require('slapp-context-beepboop')
const strava = require('strava-v3')

var config = {
  port: process.env.PORT || 5000,
}

var slapp = Slapp({
  convo_store: ConvoStore(),
  context: Context()
})

var app = {
  config,
  slapp,
}

var stravaToken = process.env.STRAVA_ACCESS_TOKEN
if (!stravaToken) {
  console.error('STRAVA_ACCESS_TOKEN is required!')
  process.exit(1)
}

var clubId = process.env.CLUB_ID
if (!clubId) {
  console.error('CLUB_ID is required!')
  process.exit(1)
}

var motivations = [
  'Train insane or remain the same.',
  'You look like a can of biscuits that’s just popped open.',
  'Your tears are like jet fuel to me.',
  'Gat yer arse on that tarmac ya Big Mac eating duffelbagers.',
  'All I do is eat gunpowder and run. What about you?',
  'Go away, you smell like failure and corn chips.',
  'There will be no crying or whining for any reason or a reason will be issued to you.'
]

app.slapp.message('stats', ['mention', 'direct_mention', 'direct_message'], (msg) => {
  strava.clubs.listMembers({id: clubId}, function (err, members) {
    strava.clubs.listActivities({id: clubId}, function (err, activities) {
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
          console.log(member.firstname + ' does not have activities')
        }
      })

      let lazyStr = ''
      shamingList.forEach(function (shamee, index) {
        let comma = (index !== shamingList.length) ? ', ' : ''
        lazyStr += shamee.firstname + ' ' + shamee.lastname + comma
      })

      lazyStr += motivations[Math.floor(Math.random() * (motivations.length + 1))]
      msg.say(lazyStr)
    })
  })
})


app.slapp.message('help', ['mention', 'direct_mention', 'direct_message'], (msg) => {
  msg.say('I will respond to the following messages: \n' +
      '`stats` for a simple message.\n' +
      '`help` to see this again.')
})


// attach Slapp to express server
var server = slapp.attachToExpress(express())

// start http server
server.listen(config.port, (err) => {
  if (err) {
    return console.error(err)
  }

  console.log(`Listening on port ${config.port}`)
})
