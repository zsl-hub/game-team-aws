# game-team-aws

### Env files

Env files are environment files that we use for storing sensitive data as well as running docker
All of our env files are included in .gitignore file so you will have to create them every time
It may be usefull to keep the all established files in a seprate private repo
There are three different files differentiated based on the environment:
1. local.env for local environment
2. devlopment.env for data used in development environment
3. production.env for data used in production environment

We have two env folders in our project:

1. Env folder at the root of our project (not in .gitignore)
It contains all data required for running docker containers such as:
FRONTEND_PORT="your port"
BACKEND_PORT="your port"
FRONTEND_START_ENVIRONMENT="your environment" (either: loc, dev or prod)
BACKEND_START_ENVIRONMENT="your environment" (either: loc, dev or prod)

2. Env folder at the backend folder (in .gitignore)
It contains all sensitive data required for running backend such as:
AWS_ACCESS_KEY_ID="Your AWS access key id" 
AWS_SECRET_ACCESS_KEY="Your AWS secret access key"
ABLY_API_KEY="your api key"

When running the app through docker compose you will have to specify the env file used to run docker with --enf-file flag

### Config files

Config files (config.json) located in config folder both in backend and frontend are used for holding non-sensitive data.

### Running app locally

Run `docker compose -f services.yaml --env-file ./env/{filename}.env up --build`

Enjoy app at `localhost/startpage`
