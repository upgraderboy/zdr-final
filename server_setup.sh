#!/bin/bash

# File to be modified
FILE=".next/standalone/server.js"
LINE_NUMBER=9

# Use sed to replace on specific line only
sed -i "${LINE_NUMBER}s/process\.env\.HOSTNAME/process.env.SERVER_NAME/" "$FILE"

echo "Line $LINE_NUMBER updated: HOSTNAME replaced with SERVER_NAME in $FILE"

sudo cp -r ./public .next/standalone/
sudo cp ca.cert .next/standalone/

#
