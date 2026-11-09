// Prépare le dossier www/ pour Capacitor : index.html = le jeu en un seul fichier (dist/ninja-mugen.html)
import { copyFileSync, mkdirSync } from 'node:fs';
mkdirSync('www', { recursive: true });
copyFileSync('dist/ninja-mugen.html', 'www/index.html');
console.log('www/index.html prêt pour Capacitor');
