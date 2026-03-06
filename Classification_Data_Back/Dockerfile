# 1. Utilise une image Python officielle
FROM python:3.11-slim

# 2. Définit le dossier de travail dans le conteneur
WORKDIR /app

# 3. Copie le fichier des dépendances et les installe
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copie le code de l'application
COPY . .

# 5. Commande pour démarrer l'app Flask via gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:5000", "hello:app"]