"""Colonnes du fichier Excel des bijoux, partagées par l'export et l'import."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
CATALOG = ROOT / "lib/commerce/mock/catalog.json"

# Tailles par défaut selon le type d'option (mêmes valeurs que lib/commerce/mock/provider.ts)
DEFAULT_SIZES = {
    "longueur": ["40 cm", "45 cm", "50 cm"],
    "sautoir": ["70 cm", "80 cm"],
    "ras-de-cou": ["36 cm", "38 cm", "40 cm"],
    "bracelet": ["S · 15 cm", "M · 17 cm", "L · 19 cm"],
    "unique": ["Taille unique"],
}
# option par défaut d'un nouveau bijou selon sa catégorie
OPTION_BY_CATEGORY = {"colliers": "longueur", "sautoirs": "sautoir", "ras-de-cou": "ras-de-cou", "bracelets": "bracelet", "boucles-d-oreilles": "unique"}

TAGS = [("Pièce unique", "piece-unique"), ("Nouveauté", "nouveau"), ("Coup de cœur", "best-seller"), ("Édition limitée", "edition-limitee")]

# (en-tête, largeur, aide)
COLUMNS = [
    ("Référence", 26, "Ne pas modifier. Laisser vide pour un nouveau bijou : elle sera créée à partir du nom."),
    ("Nom", 30, "Nom affiché sur le site."),
    ("Collection", 20, "Choisir dans la liste."),
    ("Catégorie", 18, "Choisir dans la liste."),
    ("Prix (€)", 10, "Prix de vente TTC."),
    ("Prix barré (€)", 12, "Facultatif : ancien prix, affiché barré (soldes)."),
    ("Tailles proposées", 26, "Séparées par « / », ex. 40 cm / 45 cm / 50 cm. Vide = tailles habituelles de la catégorie."),
    *[(label, 11, "Oui ou vide.") for label, _ in TAGS],
    ("Accroche", 40, "Une phrase courte, sous le nom."),
    ("Description", 60, "Le texte de la fiche produit."),
    ("Matières", 40, "Perles, fil, apprêts…"),
    ("Dimensions", 30, "Facultatif : taille du pendentif, des perles, poids…"),
    ("Photos", 34, "Pour information : noms de fichiers attendus (public/images/produits/)."),
]
HEADERS = [c[0] for c in COLUMNS]


def load():
    return json.loads(CATALOG.read_text(encoding="utf-8"))


def save(data):
    CATALOG.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
