export default defineAppConfig({
  docus: {
    title: 'Pincast Expo Documentation',
    description: 'The official documentation for Pincast Expo SDK, CLI, and Extension',
    socials: {
      github: 'pincast/expo'
    },
    github: {
      root: 'content',
      edit: true,
      contributors: true
    },
    aside: {
      level: 1,
      filter: [],
      collapsed: false
    },
    header: {
      title: 'Pincast Expo',
      logo: true,
      showLinkIcon: true
    },
    footer: {
      credits: {
        icon: 'IconPincast',
        text: 'Pincast Expo Documentation',
        href: 'https://pincast.fm'
      },
      textLinks: [
        {
          text: 'Pincast © 2025',
          href: 'https://pincast.fm'
        }
      ],
      iconLinks: [
        {
          icon: 'simple-icons:github',
          href: 'https://github.com/pincast',
          label: 'GitHub'
        }
      ]
    }
  },
  seo: {
    siteName: 'Pincast Expo Documentation',
    siteUrl: 'https://docs.pincast.fm'
  }
})