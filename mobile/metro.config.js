// Metro : l'app mobile partage du TypeScript pur avec le site Next (dossier racine `lib/`),
// sans rien déplacer. On ne surveille que les dossiers partagés (pas `.next` ni node_modules du site).
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "..");
const config = getDefaultConfig(projectRoot);

config.watchFolders = [path.join(repoRoot, "lib"), path.join(repoRoot, "components", "app", "widgets")];
// Les dépendances viennent TOUJOURS de mobile/node_modules (une seule copie de React).
config.resolver.nodeModulesPaths = [path.join(projectRoot, "node_modules")];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
