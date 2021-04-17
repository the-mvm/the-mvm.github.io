demo site now [mirrored](https://weathered-bread-8229.on.fleek.co/) in [IPFS](https://github.com/ipfs/ipfs#quick-summary)!

# Jekyll theme: Adam Blog 2.0
[V1.0](https://github.com/artemsheludko/adam-blog) by [Artem Sheludko](https://github.com/artemsheludko), modified by [Armando Maynez](https://github.com/amaynez)

## Additional features in v2.0:
- SEO meta tags
- Dark mode ([configurable in _config.yml file](https://github.com/the-mvm/the-mvm.github.io/blob/a8d4f781bfbc4107b4842433701d28f5bbf1c520/_config.yml#L10))
- automatic [sitemap.xml](http://the-mvm.github.io/sitemap.xml)
- automatic [archive page](http://the-mvm.github.io/archive/) with infinite scrolling capability
- [new page](https://the-mvm.github.io/tag/?tag=Coding) of posts filtered by a single tag (without needing autopages from paginator V2), also with infinite scrolling
- custom and responsive [404 page](https://the-mvm.github.io/404.html)
- responsive and automatic Table of Contents (optional per post)
- read time per post automatically calculated
- responsive post tags and social share icons (sticky or inline)
- included linkedin, reddit and bandcamp icons
- *copy link to clipboard* sharing option (and icon)
- view on github link button (optional per post)
- MathJax support (optional per post)
- tag cloud in the home page
- 'back to top' button
- comments 'courtain' to mask the disqus interface until the user clicks on it ([configurable in _config.yml](https://github.com/the-mvm/the-mvm.github.io/blob/d4a67258912e411b639bf5acd470441c4c219544/_config.yml#L13)) See the [highlighter directory](https://github.com/the-mvm/the-mvm.github.io/tree/main/assets/css/highlighter) for reference on the options.
- [CSS variables](https://github.com/the-mvm/the-mvm.github.io/blob/d4a67258912e411b639bf5acd470441c4c219544/assets/css/main.css#L8) to make it easy to customize all colors and fonts
- added several pygments themes for code syntax highlight [configurable from the _config.yml file](https://github.com/the-mvm/the-mvm.github.io/blob/e146070e9348c2e8f46cb90e3f0c6eb7b59c041a/_config.yml#L44).
- responsive footer menu and footer logo ([if setup in the config file](https://github.com/the-mvm/the-mvm.github.io/blob/d4a67258912e411b639bf5acd470441c4c219544/_config.yml#L7))

## Features preserved from v1.0
- [Google Fonts](https://fonts.google.com/)
- [Font Awesome icons](http://fontawesome.io/)
- [Disqus](https://disqus.com/)
- [MailChimp](https://mailchimp.com/)
- [Analytics](https://analytics.google.com/analytics/web/)
- [Search](https://github.com/christian-fei/Simple-Jekyll-Search)

## Demo

Check the theme in action [Demo](https://the-mvm.github.io/)

The main page looks like this:

<img width="640px" src="https://github.com/the-mvm/the-mvm.github.io/blob/main/assets/img/template_screenshots/homepage-responsive.jpg?raw=true">

Dark mode selector in main menu:
<img width="560px" src="https://github.com/the-mvm/the-mvm.github.io/blob/main/assets/img/template_screenshots/light-toggle.png?raw=true">

The post page looks like:
<img width="540px" src="https://github.com/the-mvm/the-mvm.github.io/blob/main/assets/img/template_screenshots/post.jpg?raw=true">

<img width="540px" src="https://github.com/the-mvm/the-mvm.github.io/blob/main/assets/img/template_screenshots/post_bottom.jpg?raw=true">

Custom responsive 404:
<img width="640px" src="https://github.com/the-mvm/the-mvm.github.io/blob/main/assets/img/template_screenshots/404-responsive.jpg?raw=true">

Dark mode looks like this:
<img width="640px" src="https://github.com/the-mvm/the-mvm.github.io/blob/main/assets/img/template_screenshots/homepage-dark.png?raw=true">

<img width="640px" src="https://github.com/the-mvm/the-mvm.github.io/blob/main/assets/img/template_screenshots/post-dark.png?raw=true">
<img width="640px" src="https://github.com/the-mvm/the-mvm.github.io/blob/main/assets/img/template_screenshots/post_bottom-dark.png?raw=true">

## Installation:

1. [Fork this repository](https://github.com/the-mvm/the-mvm.github.io/fork/) into your own account (if you use as destination a repository named **USERNAME.github.io** then your url will be ``username.github.io``, else ``username.github.io/REPONAME/``)
2. Modify ``_config.yml`` with your data
3. Use the files inside of the ``/_posts/`` directory as templates to modify and create your own blog posts.
4. Delete images inside of ``/assets/img/posts/`` and upload your own images for your posts.
5. Make sure Github Pages are turned on in the repository settings, and pointing to the main or master branch (where you cloned this repo)

## License

GNU General Public License v3.0
