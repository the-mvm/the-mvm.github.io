demo site now [mirrored](https://weathered-bread-8229.on.fleek.co/) in [IPFS](https://github.com/ipfs/ipfs#quick-summary)!

# Jekyll theme: Adam Blog 2.0
by [Armando Maynez](https://github.com/amaynez) based on [V1.0](https://github.com/artemsheludko/adam-blog) by [Artem Sheludko](https://github.com/artemsheludko). 

Adam Blog 2.0 is a Jekyll theme that was built to be 100% compatible with [GitHub Pages](https://pages.github.com/). If you are unfamiliar with GitHub Pages, you can check out [their documentation](https://help.github.com/categories/github-pages-basics/) for more information. [Jonathan McGlone's guide](http://jmcglone.com/guides/github-pages/) on creating and hosting a personal site on GitHub is also a good resource.

### What is Jekyll?

Jekyll is a simple, blog-aware, static site generator for personal, project, or organization sites. Basically, Jekyll takes your page content along with template files and produces a complete website. For more information, visit the [official Jekyll site](https://jekyllrb.com/docs/home/) for their documentation. Codecademy also offers a great course on [how to deploy a Jekyll site](https://www.codecademy.com/learn/deploy-a-website) for complete beginners.

### Never Used Jekyll Before?

The beauty of hosting your website on GitHub is that you don't have to actually have Jekyll installed on your computer. Everything can be done through the GitHub code editor, with minimal knowledge of how to use Jekyll or the command line. All you have to do is add your posts to the `_posts` directory and edit the `_config.yml` file to change the site settings. With some rudimentary knowledge of HTML and CSS, you can even modify the site to your liking. This can all be done through the GitHub code editor, which acts like a content management system (CMS).

## Features of v2.0:
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
- added several themes for code syntax highlight [configurable from the _config.yml file](https://github.com/the-mvm/the-mvm.github.io/blob/e146070e9348c2e8f46cb90e3f0c6eb7b59c041a/_config.yml#L44).
- responsive footer menu and footer logo ([if setup in the config file](https://github.com/the-mvm/the-mvm.github.io/blob/d4a67258912e411b639bf5acd470441c4c219544/_config.yml#L7))
- search shows results based on full post content, not just the description
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

# Installation

## Local Installation

For a full local installation of Adam Blog 2.0, [download your own copy of Adam Blog 2.0](https://github.com/the-mvm/the-mvm.github.io/archive/refs/heads/main.zip) and unzip it into it's own directory. From there, open up your favorite command line tool, enter `bundle install`, and then enter `jekyll serve`. Your site should be up and running locally at [http://localhost:4000](http://localhost:4000).

If you're completely new to Jekyll, I recommend checking out the documentation at <https://jekyllrb.com/> or there's a tutorial by [Smashing Magazine](https://www.smashingmagazine.com/2014/08/build-blog-jekyll-github-pages/).

If you are hosting your site on GitHub Pages, then committing a change to the `_config.yml` file (or any other file) will force a rebuild of your site with Jekyll. Any changes made should be viewable soon after. If you are hosting your site locally, then you must run `jekyll serve` again for the changes to take place.

Head over to the `_posts` directory to view all the posts that are currently on the website, and to see examples of what post files generally look like. You can simply just duplicate the template post and start adding your own content.

## GitHub Pages Installation

### **STEP 1.**
[Fork this repository](https://github.com/the-mvm/the-mvm.github.io/fork/) into your own account.

#### Using Github Pages

You can host your Jekyll site for free with Github Pages. [Click here](https://pages.github.com/) for more information.

 When forking, if you use as destination a repository named ``USERNAME.github.io`` then your url will be ``https://USERNAME.github.io/``, else ``https://USERNAME.github.io/REPONAME/``) and your site will be published to the gh-pages branch. Note: if you are hosting several sites under the same GitHub username, then you will have to use [Project Pages instead of User Pages](https://help.github.com/articles/user-organization-and-project-pages/) - just change the repository name to something other than 'http://USERNAME.github.io'.

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
discus_identifier:  # Add your discus identifier
comments_curtain: yes # leave empty to show the disqus embed directly
```
More information on [how to set up Disqus](http://www.perfectlyrandom.org/2014/06/29/adding-disqus-to-your-jekyll-powered-github-pages/).

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
Delete everything within `<style></style>` just before the line above:
```HTML
<style>
/* latin */
@font-face {
  font-family: 'Lora';
  ...
</style>
```

### **STEP 7.**

You will find example posts in your `/_posts/` directory. Go ahead and edit any post and re-build the site to see your changes, for github pages, this happens automatically with every commit. You can rebuild the site in many different ways, but the most common way is to run `jekyll serve`, which launches a web server and auto-regenerates your site when a file is updated.

To add new posts, simply add a file in the `_posts` directory that follows the convention of `YYYY-MM-DD-name-of-post.md` and includes the necessary front matter. Take a look at any sample post to get an idea about how it works. If you already have a website built with Jekyll, simply copy over your posts to migrate to Adam Blog 2.0.

The front matter options for each post are:
```YAML
---
layout: post #ensure this one stays like this
read_time: true # calculate and show read time based on number of words
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

## Additional documentation

### Directory Structure

If you are familiar with Jekyll, then the Adam Blog 2.0 directory structure shouldn't be too difficult to navigate. The following some highlights of the differences you might notice between the default directory structure. More information on what these folders and files do can be found in the [Jekyll documentation site](https://jekyllrb.com/docs/structure/).

```bash
Adam Blog 2.0/
├── _includes                  # Theme includes
├── _layouts                   # Theme layouts (see below for details)
├── _posts                     # Where all your posts will go
├── assets                     # Style sheets and images are found here
|  ├── css                     # Style sheets go here
|  |  └── _sass                # Folder containing SCSS files
|  |  └── main.css             # Main SCSS file
|  |  └── highlighter          # Style sheet for code syntax highlighting
|  └── img                     # 
|     └── posts                # Images go here
├── _pages                     # Website pages (that are not posts)
├── _config.yml                # Site settings
├── Gemfile                    # Ruby Gemfile for managing Jekyll plugins
├── index.html                 # Home page
├── LICENSE.md                 # License for this theme
├── README.md                  # Includes all of the documentation for this theme
├── feed.xml                   # Generates atom file which Jekyll points to
├── 404.html                   # custom and responsive 404 page
├── all-posts.json             # database of all posts used for infinite scroll
├── ipfs-404.html              # 404 page for IPFS
├── posts-by-tag.json          # database of posts by tag
├── robots.txt                 # SEO crawlers exclusion file
├── search.json                # database of posts used for search
└── sitemap.xml                # automatically generated sitemap for search engines
```

### Starting From Scratch

To completely start from scratch, simply delete all the files in the `_posts`, `assets/img/posts` folders, and add your own content. Everything in the `_config.yml` file can be edited to suit your needs. Also change the `favicon.ico` file to your own favicon.

### Click to tweet

If you have a tweetable quote in your blog post and wish to feature it as a click to tweet block, you just have to use the `<tweet></tweet>` tags, everything between them will be converted in a click to tweet box.

<img width="640px" src="https://github.com/the-mvm/the-mvm.github.io/blob/main/assets/img/template_screenshots/ctt-markdown.png?raw=true">

<img width="640px" src="https://github.com/the-mvm/the-mvm.github.io/blob/main/assets/img/template_screenshots/ctt-render.png?raw=true">

### Google Analytics

It is possible to track your site statistics through [Google Analytics](https://www.google.com/analytics/). Similar to Disqus, you will have to create an account for Google Analytics, and enter the correct Google ID for your site under `google-ID` in the `_config.yml` file. More information on [how to set up Google Analytics](https://michaelsoolee.com/google-analytics-jekyll/).

### Atom Feed

Atom is supported by default through [jekyll-feed](https://github.com/jekyll/jekyll-feed). With jekyll-feed, you can set configuration variables such as 'title', 'description', and 'author', in the `_config.yml` file.

Your atom feed file will be live at `https://your.site/feed.xml` [example](https://the-mvm.github.io/feed.xml).

### Social Media Icons

All social media icons are courtesy of [Font Awesome](http://fontawesome.io/). You can change which icons appear, as well as the account that they link to, in the `_config.yml` file.

### MathJax

Adam Blog 2.0 comes out of the box with [MathJax](https://www.mathjax.org/), which allows you to display mathematical equations in your posts through the use of [LaTeX](http://www.andy-roberts.net/writing/latex/mathematics_1). Just add `Mathjax: yes` in the frontmatter of your post.

```markdown
<p style="text-align:center">
\(\theta_{t+1} = \theta_{t} - \dfrac{\eta}{\sqrt{\hat{v}_t} + \epsilon} \hat{m}_t\).
</p>
```
![rendered mathjax](/assets/img/template_screenshots/MathjaxRendered.jpg)


### Syntax Highlighting

Adam Blog 2.0 provides syntax highlighting through [fenced code blocks](https://help.github.com/articles/creating-and-highlighting-code-blocks/). Syntax highlighting allows you to display source code in different colors and fonts depending on what programming language is being displayed. You can find the full list of supported programming languages [here](https://github.com/jneen/rouge/wiki/List-of-supported-languages-and-lexers). Another option is to embed your code through [Gist](https://en.support.wordpress.com/gist/).

You can choose the color theme for the syntax highlight in the `_config.yml` file:
```YAML
highlight_theme: syntax-base16.monokai.dark # select a theme for the code highlighter
```
See the [highlighter directory](https://github.com/the-mvm/the-mvm.github.io/tree/main/assets/css/highlighter) for reference on the options.

### Markdown

Jekyll offers support for GitHub Flavored Markdown, which allows you to format your posts using the [Markdown syntax](https://guides.github.com/features/mastering-markdown/).

## Everything Else

Check out the [Jekyll docs][jekyll-docs] for more info on how to get the most out of Jekyll. File all bugs/feature requests at [Jekyll's GitHub repo][jekyll-gh]. If you have questions, you can ask them on [Jekyll Talk][jekyll-talk].

[jekyll-docs]: http://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/

## Contributing

If you would like to make a feature request, or report a bug or typo in the documentation, then please [submit a GitHub issue](https://github.com/the-mvm/the-mvm.github.io/issues/new). If you would like to make a contribution, then feel free to [submit a pull request](https://help.github.com/articles/about-pull-requests/) - as a bonus, I will credit all contributors below! If this is your first pull request, it may be helpful to read up on the [GitHub Flow](https://guides.github.com/introduction/flow/) first.

Adam Blog 2.0 has been designed as a base for users to customize and fit to their own unique needs. Please keep this in mind when requesting features and/or submitting pull requests. Some examples of changes that I would love to see are things that would make the site easier to use, or better ways of doing things. Please avoid changes that do not benefit the majority of users.

## Questions?

This theme is completely free and open source software. You may use it however you want, as it is distributed under the [MIT License](http://choosealicense.com/licenses/mit/). If you are having any problems, any questions or suggestions, feel free to  [file a GitHub issue](https://github.com/the-mvm/the-mvm.github.io/issues/new).