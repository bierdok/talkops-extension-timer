# TalkOps Extension: Timer
![Docker Pulls](https://img.shields.io/docker/pulls/bierdok/talkops-extension-timer)

A TalkOps Extension made to work with [TalkOps](https://link.talkops.app/talkops).

This Extension allows to manage timers **by voice in real-time**.

## Features
* Create a timer
* Check timer states
* Cancel a timer

## Installation Guide

_[TalkOps](https://link.talkops.app/install-talkops) must be installed beforehand._


## Integration Guide

Add the service and setup the environment variables if needed:

_compose.yml_
``` yml
name: talkops

services:
...
  talkops-extension-timer:
    image: bierdok/talkops-extension-timer
    volumes:
      - talkops-extension-timer_data:/data
    restart: unless-stopped

volumes:
...
  talkops-extension-timer_data: ~

```

## Environment Variables

#### AGENT_URLS

A comma-separated list of WebSocket server URLs for real-time communication with specified agents.
* Default value: `ws://talkops`
* Possible values: `ws://talkops1` `ws://talkops2`
