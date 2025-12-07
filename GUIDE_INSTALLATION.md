# 🚗 Guide d'installation : Extension AutoMate

Ce guide vous explique comment transformer le code source en une extension active dans votre navigateur Chrome.

---

## Étape 1 : Préparation

Assurez-vous d'avoir **Node.js** installé sur votre ordinateur.

1. Ouvrez votre terminal (Invite de commande ou PowerShell).
2. Placez-vous dans le dossier du projet.
3. Installez les dépendances nécessaires en exécutant :

```bash
npm install
```

---

## Étape 2 : Construction (Build)

Nous devons transformer le code React/TypeScript en code compréhensible par Chrome.

1. Lancez la commande de build :

```bash
npm run build
```

Cela va créer un dossier **`dist`** à la racine du projet. Ce dossier contient l'extension prête à l'emploi.

> **Astuce pour le développement :**
> Si vous faites des modifications fréquentes, utilisez `npm run watch`. Cette commande reconstruira automatiquement le fichier dès que vous sauvegardez une modification.

---

## Étape 3 : Installation dans Chrome

1. Ouvrez Google Chrome.
2. Dans la barre d'adresse, tapez : `chrome://extensions` et appuyez sur Entrée.
3. En haut à droite, activez le bouton **"Mode développeur"**.
4. Cliquez sur le bouton **"Charger l'extension non empaquetée"** (Load unpacked).
5. Sélectionnez le dossier **`dist`** qui vient d'être créé dans votre projet.

🎉 **L'extension est installée !** Vous devriez voir "AutoMate - Assistant Achat Auto" dans la liste.

---

## Étape 4 : Test sur LeBonCoin

1. Allez sur le site [leboncoin.fr](https://www.leboncoin.fr).
2. Allez dans la catégorie **Voitures**.
3. Cliquez sur une annonce de voiture.
4. Attendez 1 ou 2 secondes.
5. Regardez dans la colonne de droite (sous le prix ou le profil vendeur), vous devriez voir apparaître l'encart **"Assistant Budget Auto"** avec les estimations.

---

## Dépannage

*   **Rien ne s'affiche ?**
    *   Vérifiez que vous êtes bien sur une annonce "Voiture" (et non "Équipement Auto" ou "Moto").
    *   Actualisez la page (F5).
    *   Parfois, LeBonCoin change sa structure. Ouvrez la console développeur (F12) pour voir s'il y a des erreurs rouges ou le message "AutoMate: Voiture détectée !".

*   **Je modifie le code mais rien ne change ?**
    *   Si vous n'avez pas utilisé `npm run watch`, vous devez relancer `npm run build`.
    *   Ensuite, allez sur `chrome://extensions` et cliquez sur la petite flèche "Actualiser" sur la carte de votre extension.
    *   Enfin, actualisez la page LeBonCoin.
