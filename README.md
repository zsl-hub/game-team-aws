# game-team-aws

### Env files

env folder holds all .env files that are used for holding all sensitive data on backend
You need to always create one in folder called backend and add two mainly used files:
local.env for local environment sensitive data that cannot be pushed to repo
devlopment.env for data used in development environment
production.env for data used in production environment

common variables that we use are: 
AWS_ACCESS_KEY_ID = "Your AWS access key id"
AWS_SECRET_ACCESS_KEY = "Your AWS secret access key"

### Running app locally

Run `docker compose -f services.yaml --build`

Enjoy app at `localhost/startpage`

