import React from 'react';
import { createRoot } from 'react-dom/client';
import { ExtensionWidget } from './components/ExtensionWidget';
import { extractCarDetailsFromDOM } from './services/domParser';

// ID pour éviter d'injecter plusieurs fois l'extension
const EXTENSION_ROOT_ID = 'automate-extension-root';
const TAILWIND_CDN = 'https://cdn.tailwindcss.com';

/**
 * Injecte le CSS Tailwind dans la page cible (Méthode rapide pour le Dev)
 * En prod, on builderait un fichier CSS statique.
 */
const injectStyles = () => {
  if (!document.querySelector(`script[src="${TAILWIND_CDN}"]`)) {
    const script = document.createElement('script');
    script.src = TAILWIND_CDN;
    document.head.appendChild(script);
  }
};

/**
 * Tente de trouver le meilleur endroit pour insérer l'extension
 * Sur LeBonCoin Desktop, on vise la sidebar droite.
 */
const findInjectionTarget = (): HTMLElement | null => {
  // Stratégie LeBonCoin : Chercher la Sidebar
  // Note: Les classes sont souvent obfusquées, on cherche des balises sémantiques ou des IDs
  const lbcSidebar = document.querySelector('aside');
  if (lbcSidebar) {
    // On essaie d'insérer après le premier bloc (souvent le bloc vendeur ou prix)
    if (lbcSidebar.children.length > 0) {
      return lbcSidebar.children[0] as HTMLElement;
    }
    return lbcSidebar;
  }

  // Fallback: Si pas de sidebar trouvée, on retourne le body (mode flottant forcé)
  return document.body;
};

const mountExtension = () => {
  // 1. Vérifier si on est déjà injecté
  if (document.getElementById(EXTENSION_ROOT_ID)) return;

  // 2. Parser les infos de la voiture
  const carDetails = extractCarDetailsFromDOM(document, window.location.href);

  // Si on ne trouve pas de voiture (ex: page d'accueil), on ne fait rien
  if (!carDetails) {
    console.log("AutoMate: Aucune voiture détectée sur cette page.");
    return;
  }

  console.log("AutoMate: Voiture détectée !", carDetails);
  injectStyles();

  // 3. Créer le conteneur
  const targetElement = findInjectionTarget();
  const container = document.createElement('div');
  container.id = EXTENSION_ROOT_ID;
  
  // Si on a trouvé la sidebar (aside), on s'insère proprement dedans
  const isInline = targetElement?.tagName === 'ASIDE' || targetElement?.closest('aside');

  if (isInline && targetElement) {
    // Insertion dans la sidebar (après le 1er élément pour être bien visible)
    targetElement.insertAdjacentElement('afterend', container);
    // Un peu de margin pour espacer
    container.style.marginTop = '1rem';
    container.style.marginBottom = '1rem';
  } else {
    // Fallback: Mode flottant en bas à droite
    document.body.appendChild(container);
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    container.style.maxWidth = '350px';
  }

  // 4. Monter l'app React
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ExtensionWidget 
        car={carDetails} 
        mode={isInline ? 'inline' : 'floating'} 
        minimizedByDefault={!isInline}
        onClose={() => container.remove()}
      />
    </React.StrictMode>
  );
};

// --- GESTION DU CHARGEMENT ---

// 1. Exécution initiale
if (document.readyState === 'complete') {
  mountExtension();
} else {
  window.addEventListener('load', mountExtension);
}

// 2. Gestion du Routing Client-Side (SPA)
// LeBonCoin change d'URL sans recharger la page. On observe les changements.
let lastUrl = location.href; 
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // Petit délai pour laisser le temps au DOM de LBC de se mettre à jour
    setTimeout(mountExtension, 1500);
  }
}).observe(document, { subtree: true, childList: true });
