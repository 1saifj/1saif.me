// Folds text for search so a query matches however it is typed: no case, no Latin accents ("resume" finds "Résumé"),
// and Arabic without diacritics or tatweel, with hamza forms on plain letters, ة as ه and ى as ي.
// NFD splits أ إ آ ؤ ئ into the plain letter plus a combining mark, which the strip below removes.
export const searchText = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ًͯ-ٰٟـ]/g, '')
    .replace(/ٱ/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase()
