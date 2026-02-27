export function placeholderForTitle(title?: string | null) {
  const t = (title || 'Recipe').trim();
  const encoded = encodeURIComponent(t).replace(/%20/g, '+');
  return `https://placehold.co/1200x800/png?text=${encoded}&bg=F5F5F5&fg=333`;
}

export default placeholderForTitle;
