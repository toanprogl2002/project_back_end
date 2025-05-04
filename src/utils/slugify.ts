import slugify from 'slugify';

export class SlugifyUtil {
  static slugify(
    input: string,
    options?: {
      replacement?: string;
      remove?: RegExp;
      lower?: boolean;
      strict?: boolean;
      locale?: string;
      trim?: boolean;
    },
  ): string {
    return slugify(input, {
      lower: true,
      strict: true,
      trim: true,
      locale: 'vi',
      ...options,
    });
  }
}
