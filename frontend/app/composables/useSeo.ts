const SITE = 'https://kickon.ru'

interface SeoOptions {
  title: string
  description?: string
  image?: string
  path?: string
  type?: 'website' | 'article' | 'profile'
}

export function useSeo(getter: SeoOptions | (() => SeoOptions)) {
  useHead(computed(() => {
    const opts = typeof getter === 'function' ? getter() : getter
    const {
      title,
      description = 'Скейт-челленджи с AI-оценкой трюков, онлайн S.K.A.T.E. и рейтинг райдеров',
      image,
      path = '/',
      type = 'website',
    } = opts
    const fullTitle = title.endsWith('| KickOn') ? title : `${title} | KickOn`
    const fullUrl = `${SITE}${path}`
    const fullImage = image ?? `${SITE}/icon-512.png`
    return {
      title: fullTitle,
      meta: [
        { name: 'description', content: description },
        { property: 'og:title', content: fullTitle },
        { property: 'og:description', content: description },
        { property: 'og:image', content: fullImage },
        { property: 'og:url', content: fullUrl },
        { property: 'og:type', content: type },
        { property: 'og:site_name', content: 'KickOn' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: fullTitle },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: fullImage },
      ],
      link: [{ rel: 'canonical', href: fullUrl }],
    }
  }))
}
