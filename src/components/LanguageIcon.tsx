import { getLanguageIconUrl } from '@/lib/languageIcons';

export function LanguageIcon({ name, size = 16 }: { name: string; size?: number }) {
  const iconUrl = getLanguageIconUrl(name);
  if (!iconUrl) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={iconUrl}
      alt={name}
      width={size}
      height={size}
      style={{ flexShrink: 0 }}
    />
  );
}
