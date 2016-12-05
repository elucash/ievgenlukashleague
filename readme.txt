# API Call examples

# Assuming server variable

server='https://ievgenlukashleague.herokuapp.com'

# Creating user, registering profile

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

# Only age gender and religion is working, no distance etc
# Creating another user
curl $server/signup -X 'POST' -H 'Content-Type: application/json' -d @- <<EOF
{
  "email" : "email4@gmail.com",
  "password" : "hocuspocus",
  "profile" : {
    "age": 20,
    "gender": "F",
    "religion": "A"
  },
  "preference" : {
    "age": [18, 27],
    "gender": "M"
  }
}
EOF

# Signing in as email3@gmail.com
curl $server/login -X 'POST' -H 'Content-Type: application/json' -d @- <<EOF
{
  "email" : "email3@gmail.com",
  "password" : "abracadabra"
}

# Plaintext output from the previous command is the session id
session="5844e25de0492056007dfc9d"

# Display my profile
curl $server/me -H "Session-Key: $session"

# Display at most five matches to review (non viewed yet)
curl $server/matches -H "Session-Key: $session"

# Load some fake data, executes asynchronously
curl $server/fakedata -X 'POST' -d ''
