/**
 * Réduit une photo avant de l'enregistrer : une photo de téléphone pèse souvent 3 à 5 Mo,
 * une case du tableau n'a besoin que de ~512 px. Le tableau reste rapide et le stockage léger.
 */
export async function reduireImage(fichier: Blob, taille = 512, qualite = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(fichier);
  const echelle = Math.min(1, taille / Math.max(bitmap.width, bitmap.height));
  const largeur = Math.round(bitmap.width * echelle);
  const hauteur = Math.round(bitmap.height * echelle);

  const canvas = document.createElement('canvas');
  canvas.width = largeur;
  canvas.height = hauteur;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, largeur, hauteur);
  bitmap.close();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? fichier), 'image/webp', qualite);
  });
}
