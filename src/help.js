'use strict'

module.exports = (app) => {

  let slapp = app.slapp

  slapp.message('help', ['mention', 'direct_mention', 'direct_message'], (msg) => {
    msg.say('I will respond to the following messages: \n' +
        '`stats` to see your Strava team\'s weekly stats.\n' +
        '`help` to see this again.')
  })
}

