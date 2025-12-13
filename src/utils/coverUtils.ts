// src/utils/coverUtils.ts

/**
 * Размеры обложек, доступные в Яндекс Музыке
 * Supported cover sizes: 30, 50, 100, 150, 200, 300, 400, 700, 800, 1000
 */
export type CoverSize = 30 | 50 | 100 | 150 | 200 | 300 | 400 | 700 | 800 | 1000;

/**
 * Преобразует шаблон coverUri в полный URL изображения
 * 
 * @param coverUri - Шаблон обложки от API (например: "avatars.yandex.net/get-music-content/4387391/bd7e0266.a.16209238-1/%%")
 * @param size - Размер обложки в пикселях (по умолчанию 200x200)
 * @returns Полный URL изображения обложки
 * 
 * @example
 * ```typescript
 * const track = await client.tracks.get('track-id');
 * const coverUrl = getCoverUrl(track.coverUri, 300);
 * // => "https://avatars.yandex.net/get-music-content/4387391/bd7e0266.a.16209238-1/300x300"
 * ```
 */
export function getCoverUrl(coverUri: string | undefined, size: CoverSize = 200): string | null {
  if (!coverUri) {
    return null;
  }

  // Шаблон содержит %%, который нужно заменить на {size}x{size}
  const urlTemplate = coverUri.replace('%%', `${size}x${size}`);
  
  // Проверим, нужно ли добавить протокол https://
  if (urlTemplate.startsWith('http://') || urlTemplate.startsWith('https://')) {
    return urlTemplate;
  }
  
  return `https://${urlTemplate}`;
}

/**
 * Проверяет, есть ли обложка у трека
 * 
 * @param coverUri - Шаблон обложки от API
 * @returns true если обложка доступна, false если нет
 */
export function hasCover(coverUri: string | undefined): boolean {
  return !!coverUri && coverUri.length > 0;
}

/**
 * Получает все доступные размеры для обложки
 * 
 * @param coverUri - Шаблон обложки от API
 * @returns Объект со всеми доступными размерами
 * 
 * @example
 * ```typescript
 * const track = await client.tracks.get('track-id');
 * const covers = getAllCoverSizes(track.coverUri);
 * // => {
 * //   small: 'https://..../60x60',
 * //   medium: 'https://..../200x200',
 * //   large: 'https://..../500x500'
 * // }
 * ```
 */
export function getAllCoverSizes(coverUri: string | undefined) {
  return {
    small: getCoverUrl(coverUri, 100),
    medium: getCoverUrl(coverUri, 200),
    large: getCoverUrl(coverUri, 300),
    xlarge: getCoverUrl(coverUri, 400),
  };
}
