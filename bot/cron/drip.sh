#!/bin/bash
# @file Calls the "drip" function in the MCD_JUG contract of the MakerDAO project. This function accrues debt for every vault in the 
# Maker system.
echo 'Calling drip'
. /home/eth/.sethrc
/home/eth/.nix-profile/bin/seth send $MCD_JUG 'drip(bytes32 ilk)' $ETH_ILK
