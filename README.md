demo site now [mirrored](https://weathered-bread-8229.on.fleek.co/) in [IPFS](https://github.com/ipfs/ipfs#quick-summary)!

# Jekyll theme: Adam Blog 2.0
[V1.0](https://github.com/artemsheludko/adam-blog) by [Artem Sheludko](https://github.com/artemsheludko), modified by [Armando Maynez](https://github.com/amaynez)

## Additional features in v2.0:
- SEO meta tags
- Dark mode ([configurable in _config.yml file](https://github.com/the-mvm/the-mvm.github.io/blob/a8d4f781bfbc4107b4842433701d28f5bbf1c520/_config.yml#L10))
- automatic [sitemap.xml](http://the-mvm.github.io/sitemap.xml)
- automatic [archive page](http://the-mvm.github.io/archive/) with infinite scrolling capability
- [new page](https://the-mvm.github.io/tag/?tag=Coding) of posts filtered by a single tag (without needing autopages from paginator V2), also with infinite scrolling
- click to tweet functionality (just add a `<tweet> </tweet>` tag in your markdown.
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
- comments 'courtain' to mask the disqus interface until the user clicks on it ([configurable in _config.yml](https://github.com/the-mvm/the-mvm.github.io/blob/d4a67258912e411b639bf5acd470441c4c219544/_config.yml#L13))
- [CSS variables](https://github.com/the-mvm/the-mvm.github.io/blob/d4a67258912e411b639bf5acd470441c4c219544/assets/css/main.css#L8) to make it easy to customize all colors and fonts
- added several pygments themes for code syntax highlight [configurable from the _config.yml file](https://github.com/the-mvm/the-mvm.github.io/blob/e146070e9348c2e8f46cb90e3f0c6eb7b59c041a/_config.yml#L44). See the [highlighter directory](https://github.com/the-mvm/the-mvm.github.io/tree/main/assets/css/highlighter) for reference on the options.
- responsive footer menu and footer logo ([if setup in the config file](https://github.com/the-mvm/the-mvm.github.io/blob/d4a67258912e411b639bf5acd470441c4c219544/_config.yml#L7))
- smoother menu animations 

## Features preserved from v1.0
- [Google Fonts](https://fonts.google.com/)
- [Font Awesome icons](http://fontawesome.io/)
- [Disqus](https://disqus.com/)
- [MailChimp](https://mailchimp.com/)
- [Analytics](https://analytics.google.com/analytics/web/)
- [Search](https://github.com/christian-fei/Simple-Jekyll-Search)

## Demo

[Check the theme in action](https://the-mvm.github.io/)

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

Click to tweet:

<img width="640px" src="https://github.com/the-mvm/the-mvm.github.io/blob/main/assets/img/template_screenshots/ctt-render.png?raw=true">
<img width="640px" src="https://github.com/the-mvm/the-mvm.github.io/blob/main/assets/img/template_screenshots/ctt-markdown.png?raw=true">

## Installation:

If you're completely new to Jekyll, I recommend checking out the documentation at <https://jekyllrb.com/> or there's a tutorial by [Smashing Magazine](https://www.smashingmagazine.com/2014/08/build-blog-jekyll-github-pages/).

### **STEP 1.**
[Fork this repository](https://github.com/the-mvm/the-mvm.github.io/fork/) into your own account.

#### Using Github Pages

You can host your Jekyll site for free with Github Pages. [Click here](https://pages.github.com/) for more information.

 When forking, if you use as destination a repository named ``USERNAME.github.io`` then your url will be ``https://USERNAME.github.io/``, else ``https://USERNAME.github.io/REPONAME/``) and your site will be published to the gh-pages branch.

##### A configuration tweak if you're using a gh-pages branch

In addition to your github-username.github.io repo that maps to the root url, you can serve up sites by using a gh-pages branch for other repos so they're available at github-username.github.io/repo-name.

This will require you to modify the `_config.yml` like so:

```yml
# Site settings
title: Repo Name
email: your_email@example.com
author: Your Name
description: "Repo description"
baseurl: "/repo-name"
url: "https://github-username.github.io"
```

This will ensure that the the correct relative path is constructed for your assets and posts.

### **STEP 2.**
Modify ``_config.yml`` file, located in the root directory, with your data.

```YAML
# Site settings
title: The Title for Your Website
description: 'A description of your blog'
permalink: ':title:output_ext' # how the permalinks will behave
baseurl: "/" # the subpath of your site, e.g. /blog
url: "" # the base hostname & protocol for your site, e.g. http://example.com
logo: "" # the logo for your site
logo-icon: "" # a smaller logo, typically squared
logo-icon-SEO: "" # must be a non SVG file, could be the same as the logo-icon

# Night/Dark mode default mode is "auto", "auto" is for auto nightshift (19:00 - 07:00), "manual" is for manual toggle, and "on/off" is for default on/off. Whatever the user's choice is, it will supersede the default setting of the site and be kept during the visit (session). Only the dark mode setting is "manual", it will be always kept on every visit (i.e. no matter the browser is closed or not)
night_mode: "auto"
logo-dark: "/assets/img/branding/MVM-logo-full-dark.svg" #if you want to display a different logo when in dark mode
highlight_theme: syntax-base16.monokai.dark # select a dark theme for the code highlighter if needed


# Author settings
author: Your Name # add your name
author-pic: '' # a picture of you
about-author: '' # a brief description of you

# Contact links
email: your@email.com # Add your Email address
phone: # Add your Phone number
website:  # Add your website
linkedin:  # Add your Linkedin handle
github:  # Add your Github handle
twitter:  # Add your Twitter handle
bandcamp:  # Add your Bandcamp username

# Tracker
analytics: # Google Analytics tag ID
fbadmin: # Facebook ID admin

# Paginate
paginate: 6 # number of items to show in the main page
paginate_path: 'page:num'
words_per_minute: 200 # default words per minute to be considered when calculating the read time of the blog posts
```
### **STEP 3.**
To configure the newsletter, please create an account in https://mailchimp.com, set up a web signup form and paste the link from the embed signup form in the `config.yml` file:
```YAML
# Newsletter
mailchimp: "https://github.us1.list-manage.com/subscribe/post?u=8ece198b3eb260e6838461a60&amp;id=397d90b5f4"
```
### **STEP 4.**
To configure Disqus, set up a [Disqus site](https://disqus.com/admin/create/) with the same name as your site. Then, in `_config.yml`, edit the `disqus_identifier` value to enable.
```YAML
# Disqus
discus_identifier: amaynez-github-io # Add your discus identifier
comments_curtain: yes # leave empty to show the disqus embed directly
```
### **STEP 5.**
Customize the site colors. Modify `/assets/css/main.css` as follows:
```CSS
html {
  --shadow:       rgba(32,30,30,.3);
  --accent:       #DB504A;    /* accent */
  --accent-dark:  #4e3e51;    /* accent 2 (dark) */
  --main:         #326273;    /* main color */
  --main-dim:     #879dab;    /* dimmed version of main color */
  --text:         #201E1E;
  --grey1:        #5F5E58;
  --grey2:        #8D897C;
  --grey3:        #B4B3A7;
  --grey4:        #DAD7D2;
  --grey5:        #F0EFED;
  --background:   #ffffff;
}

html[data-theme="dark"]  {
  --accent:       #d14c47;    /* accent */
  --accent-dark:  #CD8A7A;    /* accent 2 (dark) */
  --main:         #4C6567;    /* main color */
  --main-dim:     #273335;    /* dimmed version of main color */
  --text:         #B4B3A7;
  --grey1:        #8D897C;
  --grey2:        #827F73;
  --grey3:        #76746A;
  --grey4:        #66645D;
  --grey5:        #4A4945;
  --background:   #201E1E;
  --shadow:       rgba(180,179,167,.3);
}
```
### **STEP 6.**
Customize the site fonts. Modify `/assets/css/main.css` as follows:
```CSS
...
  --font1: 'Lora', charter, Georgia, Cambria, 'Times New Roman', Times, serif;/* body text */
  --font2: 'Source Sans Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif; /* headers and titles   */
  --font1-light:      400;
  --font1-regular:    400;
  --font1-bold:       600;
  --font2-light:      200;
  --font2-regular:    400;
  --font2-bold:       700;
...
```
If you change the fonts, you need to also modify `/_includes/head.html` as follows:
Uncomment and change the following line with your new fonts and font weights:
```HTML
<link href="https://fonts.googleapis.com/css?family=Lora:400,600|Source+Sans+Pro:200,400,700" rel="stylesheet">
```
Delete everything within `<style></style>` just before the above line:
```HTML
<style>
/* latin */
@font-face {
  font-family: 'Lora';
  ...
</style>
```

### **STEP 7.**
Use the files inside of the ``/_posts/`` directory as templates to modify and create your own blog posts.

The options for each post are:
```YAML
---
layout: post #ensure this one stays like this
read_time: true # calculate and show read time baased on number of words
show_date: true # show the date of the post
title:  Your Blog Post Title
date:   XXXX-XX-XX XX:XX:XX XXXX
description: "The description of your blog post"
img: # the path for the hero image, from the image folder (if the image is directly on the image folder, just the filename is needed)
tags: [tags, of, your, post]
author: Your Name
github: username/reponame/ # set this to show a github button on the post
toc: yes # leave empty or erase for no table of contents
---
```
Edit your blogpost using markdown. [Here is a good guide about how to use it.](https://www.markdownguide.org/)

### **STEP 7.**
Delete images inside of ``/assets/img/posts/`` and upload your own images for your posts.

### **STEP 8.**
Make sure Github Pages are turned on in the repository settings, and pointing to the main or master branch (where you cloned this repo).

## License

GNU General Public License v3.0
