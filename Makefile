all: up
	# @echo 127.0.0.1 pong.42.fr >> /etc/hosts

build:
	@docker-compose -f srcs/docker-compose.yml build

start-db:
	@docker-compose -f srcs/docker-compose.yml up -d postgres

migrate:
	@docker-compose -f srcs/docker-compose.yml run django python pong_backend/manage.py makemigrations game
	@docker-compose -f srcs/docker-compose.yml run django python pong_backend/manage.py migrate

start-app:
	@docker-compose -f srcs/docker-compose.yml up -d django frontend

up: build start-db migrate start-app

front:
	@docker-compose -f srcs/docker-compose.yml up -d --build frontend

down:
	@docker-compose -f srcs/docker-compose.yml down

clean:
	@docker-compose -f srcs/docker-compose.yml down -v --rmi all

reset:
	@docker-compose -f srcs/docker-compose.yml down -v --rmi all
	@docker system prune -a --volumes -f

.PHONY: build start-db migrate start-app up down clean reset
