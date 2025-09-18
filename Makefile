# Makefile simple pour le projet CDA
# Usage: make [commande]

.PHONY: help backend frontend build clean deploy-backend deploy-frontend

# Commande par défaut
backend:
	@echo "🚀 Démarrage du backend..."
	cd Back-end && dotnet run

# Démarre le frontend
frontend:
	@echo "🚀 Démarrage du frontend..."
	cd Front-end && npm start


# Nettoie les fichiers temporaires
clean:
	@echo "🧹 Nettoyage..."
	cd Back-end && dotnet clean
	cd Front-end && rm -rf dist node_modules/.cache
	rm -rf deploy deploy-frontend
	rm -f *.zip

# Créé un package de déploiement pour le backend
deploy-backend:
	@echo "📦 Création du package de déploiement..."
	rm -rf deploy
	mkdir -p deploy
	cd Back-end && dotnet publish -c Release -o ../deploy
	cd deploy && zip -r ../cda-backend.zip .


# Créé un package de déploiement pour le frontend
deploy-frontend:
	@echo "📦 Création du package de déploiement frontend..."
	rm -rf deploy-frontend
	mkdir -p deploy-frontend
	cd Front-end && npm run build
	cp -r Front-end/dist/* deploy-frontend/
	cd deploy-frontend && zip -r ../cda-frontend.zip .

