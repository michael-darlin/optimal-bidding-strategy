#!/bin/bash
# @file calls the upEvents and upCities files, which updates the SQL database with new events and new address-city pairings, 
# respectively.
. /home/eth/.bashrc
node /home/eth/tempest/maker/exec/listener/upEvents.js kovan
node /home/eth/tempest/maker/exec/listener/upEvents.js main
node /home/eth/tempest/maker/exec/listener/upCities.js kovan
node /home/eth/tempest/maker/exec/listener/upCities.js main

