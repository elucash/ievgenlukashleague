#!/bin/bash

server='http://localhost:8080'

curl $server

echo ""

curl $server/signup -X 'POST' -H 'Content-Type: application/json' -d @- <<EOF
{
  "email" : "e.lucash1@gmail.com",
  "password" : "abracadabra",
  "profile" : {
    "age": 10,
    "gender": "M"
  },
  "preference" : {
    "gender": "F"
  }
}
EOF

echo ""

curl $server/login -X 'POST' -H 'Content-Type: application/json' -d @- <<EOF
{
  "email" : "e.lucash1@gmail.com",
  "password" : "abracadabra"
}
EOF

curl $server/sessions

echo ""

curl $server/me?sessionKey=5844c2a3a934176ef410e75c

echo ""
