export const ARTICLE_RELATIONS = { author: true, tags: true } as const;
export const ARTICLE_LIMITS = {
  TITLE_MIN: 3,
  TITLE_MAX: 200,
  DESCRIPTION_MIN: 3,
  DESCRIPTION_MAX: 255,
  BODY_MIN: 1,
  BODY_MAX: 50000,
  TAG_LIST_MAX: 10,
  TAG_MIN: 1,
  TAG_MAX: 50,
} as const;
