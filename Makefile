dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

prod:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend
