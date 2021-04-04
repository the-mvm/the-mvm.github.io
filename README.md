# Jekyll theme: Adam Blog 2.0
[V1.0](https://github.com/artemsheludko/adam-blog) by [Artem Sheludko](https://github.com/artemsheludko), modified by [Armando Maynez](https://github.com/amaynez)

### Additional features or changes in this mod:
- automatic [sitemap.xml](http://the-mvm.github.io/sitemap.xml)
- automatic [archive page](http://the-mvm.github.io/archive/) with infinite scrolling capability
- changed the styling of the [tags page](http://the-mvm.github.io/tags/)
- [new page](https://the-mvm.github.io/tag/?tag=Coding) of posts filtered by a single tag (without needing autopages from paginator V2), also with infinite scrolling
- custom and responsive [404 page](https://the-mvm.github.io/404.html)
- included linkedin and reddit in the share post icons
- included linkedin icon in the contact info
- added an automatic Table of Contents, it is configurable per post (on / off). It behaves as a sticky sidebar (when the screen is wide enough) or inline after the post's title and metadata
  moved the post tag cloud and share options into a sticky sidebar when the screen resolution permits
- added MathJax support (optional per post)
- added view on github link button for posts (optional per post)
- read time per post automatically calculated and included in all relevant pages
- SEO meta tags included
- added a tag cloud to the main page (after the post card styled latest posts)
- added a 'back to top' button to the post pages.
- added a comments 'courtain' that masks the disqus interface until the user clicks on it (configurable in _config.yml)
- post images in home page appear black and white and colorize upon hovering in them
- ensured overall consistency on colors and established a color palette
- added several pygments themes for code syntax highlight configurable from the _config.yml file.
- added CSS variables to make it easy to customize colors and fonts
- added a responsive footer menu that also includes the logo if setup in the config file.

### Demo

Check the theme in action [Demo](https://the-mvm.github.io/)

The main page looks like this:

![Main page preview](https://github.com/the-mvm/the-mvm.github.io/blob/main/assets/img/template_screenshots/homepage.jpg?raw=true)

The post page looks like:

![Post page preview](https://github.com/the-mvm/the-mvm.github.io/blob/main/assets/img/template_screenshots/post.jpg?raw=true)

![Post bottom](https://github.com/the-mvm/the-mvm.github.io/blob/main/assets/img/template_screenshots/post_bottom.jpg?raw=true)

Custom responsive 404:
![404 large](https://github.com/the-mvm/the-mvm.github.io/blob/main/assets/img/template_screenshots/404.jpg?raw=true)
![404 mobile](https://github.com/the-mvm/the-mvm.github.io/blob/main/assets/img/template_screenshots/404-mobile.jpg?raw=true)


## Features

- [Google Fonts](https://fonts.google.com/)
- [Font Awesome](http://fontawesome.io/)
- [Disqus](https://disqus.com/)
- [MailChimp](https://mailchimp.com/)
- [Analytics](https://analytics.google.com/analytics/web/)
- [Search](https://github.com/christian-fei/Simple-Jekyll-Search)

## Installation:

1. [Fork this repository](https://github.com/the-mvm/the-mvm.github.io/fork/) into your own account (if you use as destination a repository named **USERNAME.github.io** then your url will be ``username.github.io``, else ``username.github.io/REPONAME/``)
2. Modify ``_config.yml`` with your data
3. Use the files inside of the ``/_posts/`` directory as templates to modify and create your own blog posts.
4. Delete images inside of ``/assets/img/posts/`` and upload your own images for your posts.
5. Make sure Github Pages are turned on in the repository settings, and pointing to the main or master branch (where you cloned this repo)

## License

GNU General Public License v3.0
