up:
	docker compose -f ./build/docker-compose.yml up -d 
	docker logs -f ac-backend-nest-dev

down:
	docker compose -f ./build/docker-compose.yml down

restart:
	docker restart ac-backend-nest-dev
	docker logs -f ac-backend-nest-dev

logs:
	docker logs -f ac-backend-nest-dev

exec:
	docker exec -it ac-backend-nest-dev sh

# up-migrate:
# 	docker compose -f ./build/docker-compose.migrate.yml up
# 	docker logs -f elasticode-vbroadcast-next-migrate

# down-migrate:
# 	docker compose -f ./build/docker-compose.migrate.yml down

chown:
	sudo chown -R $$USER .

cp-module:
	sudo rm -r node_modules
	sudo docker cp ac-backend-nest-dev:/usr/src/app/node_modules .

rmi:
	sudo rm -r node_modules
	docker rmi registry.gitlab.com/ac-project/ac-backend-nest:dev