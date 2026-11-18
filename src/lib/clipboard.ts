/** Copia texto. Tenta a API moderna e, se falhar, usa a seleção de um textarea de apoio. */
export async function copyText(text: string, fallbackEl?: HTMLTextAreaElement | null): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    if (!fallbackEl) return false;
    fallbackEl.focus();
    fallbackEl.select();
    try { return document.execCommand('copy'); } catch { return false; }
  }
}

/** Baixa um arquivo gerado no navegador (blob local, sem rede). */
export function downloadFile(name: string, content: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
