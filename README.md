# game-team-aws

### Env files

env folder holds all .env files that are used for holding all sensitive data on backend
We have three different files differentiated based on the environment:
local.env for local environment
devlopment.env for data used in development environment
production.env for data used in production environment

common variables that we use are: 
AWS_ACCESS_KEY_ID = "Your AWS access key id"
AWS_SECRET_ACCESS_KEY = "Your AWS secret access key"

### Config files

Config files (config.json) located in config folder both in backend and frontend are used for holding non-sensitive data.

### Running app locally

Run `docker compose -f services.yaml --build`

Enjoy app at `localhost/startpage`