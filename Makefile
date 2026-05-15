# Makefile for Fourfold Production

IMAGE_NAME = fourfold-prod
CONTAINER_PORT = 3000
HOST_PORT = 3000

.PHONY: build run rebuild rerun stop clean shell

build:
	docker build -f Dockerfile.prod -t $(IMAGE_NAME) .

# Run in detached mode so 'make stop' can find it later
run:
	docker run -d -p $(HOST_PORT):$(CONTAINER_PORT) -e REDIS_HOST=localhost --name $(IMAGE_NAME)-container $(IMAGE_NAME)

rebuild: build

# Improved stop: xargs -r only runs if there is input, avoiding "requires at least 1 argument" errors
stop:
	-docker ps -q --filter ancestor=$(IMAGE_NAME) | xargs -r docker stop
	-docker ps -aq --filter ancestor=$(IMAGE_NAME) | xargs -r docker rm

# Enter the running container
shell:
	docker exec -it $$(docker ps -q --filter ancestor=$(IMAGE_NAME) | head -n 1) bash

rerun: stop build run

clean:
	-docker rmi $(IMAGE_NAME)

# Increments the MINOR version (1.0.1 -> 1.1.0)
minor:
	@latest=$$(git describe --tags --abbrev=0 2>/dev/null || echo "1.0.0"); \
	new=$$(echo $$latest | awk -F. '{print $$1"."$$2+1".0"}'); \
	echo "Tagging from $$latest to $$new"; \
	git tag $$new; \
	echo "Created tag $$new"
	git push origin dev
	git push --tags

# Increments the PATCH version (1.0.1 -> 1.0.2)
patch:
	@latest=$$(git describe --tags --abbrev=0 2>/dev/null || echo "1.0.0"); \
	new=$$(echo $$latest | awk -F. '{print $$1"."$$2"."$$3+1}'); \
	echo "Tagging from $$latest to $$new"; \
	git tag $$new; \
	echo "Created tag $$new"
	git push origin dev
	git push --tags
