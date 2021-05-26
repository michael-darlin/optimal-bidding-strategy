#!/bin/bash
# @file Adds a timestamp to any output sent to the console
while read x; do
	echo -n `TZ=America/New_York date +%m/%d/%Y\ %H:%M:%S`;
	echo -n " ";
	echo $x;
done
