#!/bin/bash

server='http://localhost:8080'

# server='https://ievgenlukashleague.herokuapp.com'

curl $server

echo ""
#curl $server/fakedata -X 'POST' -d ''
#sleep 3

echo ""

curl $server/signup -X 'POST' -H 'Content-Type: application/json' -d @- <<EOF
{
  "email" : "email3@gmail.com",
  "password" : "abracadabra",
  "profile" : {
    "age": 25,
    "gender": "M"
  },
  "preference" : {
    "gender": "F"
  }
}
EOF

curl $server/signup -X 'POST' -H 'Content-Type: application/json' -d @- <<EOF
{
  "email" : "email4@gmail.com",
  "password" : "badobra",
  "profile" : {
    "age": 20,
    "gender": "F"
  },
  "preference" : {
    "age": [18, 27],
    "gender": "M"
  }
}
EOF

echo ""

curl $server/login -X 'POST' -H 'Content-Type: application/json' -d @- <<EOF
{
  "email" : "email3@gmail.com",
  "password" : "abracadabra"
}
EOF

# Use session returned as text from previous /login call
session="5844e25de0492056007dfc9d"

echo ""

curl $server/me -H "Session-Key: $session"

echo ""
echo "matches"

curl $server/matches -H "Session-Key: $session"

echo ""
