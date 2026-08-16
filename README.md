# <img src="./cnt_ait_logo.png" width="50" height="50" style="vertical-align: middle; margin-right: 10px;"> Répertoire Libertaire - CNT-AIT

![CNT-AIT](https://img.shields.io/badge/Organisation-CNT--AIT-dc2626?style=for-the-badge&logo=flag)
![Licence](https://img.shields.io/badge/Document-Libre-black?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-Single--File-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Rouge_&_Noir-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Leaflet](https://img.shields.io/badge/Carte-Leaflet.js-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Responsive](https://img.shields.io/badge/Design-100%25_Responsive-991b1b?style=for-the-badge)

Application web interactive répertoriant **l'intégralité des 111 sections, groupes, permanences, syndicats, locaux et librairies libertaires** 

--- ## Présentation du Projet

Ce projet transforme le document source PDF ([document_sections_groupes_libertaires_CNT_AIT.pdf](./document_sections_groupes_libertaires_CNT_AIT.pdf)) en une base de données interactive accessible via une interface web moderne, rapide et élégante aux couleurs de l'anarcho-syndicalisme (**Rouge et Noir**).

### Statistiques de la Base de Données
- **Total des structures répertoriées** : `111`
- **Villes & Zones couvertes** : `74` (France & Belgique)
- **Organisations représentées** :
  - **CNT-AIT** (Confédération Anationale des Travailleurs - AIT)
  - **Fédération anarchiste (FA)**
  - **UCL** (Union Communiste Libertaire)
  - **CNT-F / Vignoles**
  - **CNT-SO** (Solidarité Ouvrière)
  - **Organisation Anarchiste (OA)**
  - **OCL** (Organisation Communiste Libertaire)
  - **Indépendants, Locaux & Collectifs** (France & Belgique)

--- ## Fonctionnalités Principales

- ** Carte Interactive Géolocalisée (Leaflet.js)** :
  - Affichage simultané des **111 structures** sous forme de puces circulaires avec leurs **vrais logos officiels** (*CNT-AIT, FA, UCL, CNT-F, CNT-SO*).
  - Suppression totale des chiffres de regroupement au profit d'un disposition en **spirale dorée** autour des villes denses (Paris, Toulouse, Marseille, Bruxelles, etc.).
  - Fonds de carte sombre haut contraste (*CartoDB Dark Matter*) sans mentions de bas de page parasites.

- ** Recherche Globale & Filtres Multicritères** :
  - Recherche en temps réel sur tous les champs (nom, organisation, ville, courriel, adresse, type).
  - Filtres déroulants par **Organisation**, **Type de structure** (*Groupe, Liaison, Section, Union locale, Local, Collectif, Librairie...*) et **Zone géographique** (*France / Belgique*).
  - **Puces de filtres rapides** arborant les véritables logos officiels.

- ** 3 Modes d'Affichage** :
  - **Grille de Cartes** : Visualisation responsive en blocs d'informations.
  - **Tableau Interactif** : Tableau triable par Nom, Organisation et Ville.
  - **Carte Plein Écran** : Exploration géographique interactive.

- ** Favoris & Export Data** :
  - Gestion des favoris enregistrés localement dans le navigateur (`localStorage`).
  - Exportation directe des données filtrées ou complètes au format **CSV**.

- ** 100% Mobile & Responsive Design** :
  - Optimisé pour smartphones, tablettes, portables et écrans ultra-larges.
  - Support complet des gestes tactiles (*touch scroll*, *pinch-to-zoom*).

--- ## Installation & Lancement

### Options de Lancement

#### Option 1 : Lancement direct sans dépendances
Double-cliquez simplement sur le fichier `index.html` ou ouvrez-le directement dans votre navigateur web.
```bash
file:///home/anar/Bureau/document_sections_groupes_libertaires_CNT_AIT/index.html
```

#### Option 2 : Serveur local Python
```bash
# Lancer le serveur HTTP sur le port 1936
python3 -m http.server 1936
```
Puis accédez à : **`http://localhost:1936`**

#### Option 3 : Avec Docker
```bash
# Binder et exécuter le conteneur Nginx
docker build -t repertoire-libertaire .
docker run -d -p 1936:80 --name repertoire_libertaire repertoire-libertaire
```

#### Option 4 : Avec Docker Compose
```bash
# Lancer en arrière-plan avec Docker Compose
docker-compose up -d
```
Puis accédez à : **`http://localhost:1936`**

--- ## Structure du Projet

```
document_sections_groupes_libertaires_CNT_AIT/
├── index.html                                 # Application HTML5 monopage autonome
├── styles.css                                 # Design System & Thème Rouge et Noir
├── cnt_ait_logo.png                           # Logo officiel CAT / CNT-AIT
├── logo_fa.svg                                # Logo officiel Fédération Anarchiste (SVG)
├── logo_ucl.svg                               # Logo officiel UCL (SVG)
├── logo_cnt.svg                               # Logo officiel CNT (SVG)
├── logo_cnt_so.jpg                            # Logo officiel CNT-SO
├── data.js                                    # Base de données JS des 111 entrées géolocalisées
├── entries.json                               # Export JSON brut des 111 structures
├── document_sections_groupes_libertaires_CNT_AIT.pdf # Document PDF original
├── Dockerfile                                 # Image Docker Nginx Alpine
├── docker-compose.yml                         # Fichier Docker Compose
└── README.md                                  # Documentation du projet
```

--- ## Crédits & Source
