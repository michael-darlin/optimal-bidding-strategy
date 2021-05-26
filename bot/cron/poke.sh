#!/bin/bash
# @file Calls the "poke" function in the PIP_ETH contract of the MakerDAO project. This function updates the price in the Maker OSM.
echo 'Calling poke'
. /home/eth/.sethrc
/home/eth/.nix-profile/bin/seth send $PIP_ETH 'poke()'
