'use strict'
const express = require('express')
const Slapp = require('slapp')
const ConvoStore = require('slapp-convo-beepboop')
const Context = require('slapp-context-beepboop')

var config = {
  port: process.env.PORT || 5000,
  webUrl: process.env.WEB_URL || 'http://localhost:5000',
  stravaToken: process.env.STRAVA_ACCESS_TOKEN,
  clubId: process.env.CLUB_ID
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

var slapp = Slapp({
  convo_store: ConvoStore(),
  context: Context()
})

var server = slapp.attachToExpress(express())

var app = {
  config,
  slapp,
}

var shame = require('./src/shame')(app)
var stats = require('./src/stats')(app)

server.use(express.static('public'))

console.log('Listening on port ' + config.port)
server.listen(config.port)
