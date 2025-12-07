/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}", 
  ],
  // Cette option ajoute automatiquement le sélecteur ID devant toutes les classes Tailwind
  // Ex: .bg-red-500 devient #automate-extension-root .bg-red-500
  // Cela garantit que nos styles gagnent toujours sur ceux de LeBonCoin
  important: '#automate-extension-root', 
  theme: {
    extend: {},
  },
  corePlugins: {
    // CRUCIAL : Désactive le "Reset" global de Tailwind qui casse le site hôte
    preflight: false, 
  },
  plugins: [],
}