# PVH Consultancy

The website for PVH Consultancy. Built with [Jekyll](https://jekyllrb.com).
It has three pages: a bio of Peter Hasler (home), his work in Ghana
(`/ghana/`), and a contact form (`/contact/`).

Live at <https://pvhconsultancy.com> (<https://www.pvhconsultancy.com>
redirects there).

## Preview mode

While Peter reviews the site, it is live at
<https://pvhconsultancy.com/preview/>. The root still shows the "coming
soon" holding page. The deploy workflow runs `just build-pages`, which builds:

- `holding/` (a tiny standalone Jekyll site) at `/`
- the full site with `_config.preview.yml` layered on at `/preview/`. That
  config sets `baseurl: /preview`, marks every page `noindex`, and shows a
  "Preview" banner.

Run `just preview-pages` to serve that combined build at
<http://localhost:4003>.

To launch at `/`: delete `holding/` and `_config.preview.yml`, remove the
`build-pages`, `preview-pages` and `lint-pages` recipes (and `lint-pages` from
`lint`), and in `.github/workflows/deploy.yml` change `just build-pages` back
to `bundle exec jekyll build` and drop the upload step's `path`.

## Content

- **Ghana photos and videos**: add entries to `_data/ghana_media.yml` (the
  file's comments show the format). Put images in `assets/images/ghana/` and
  self-hosted videos in `assets/videos/ghana/`, or use a YouTube/Vimeo embed
  URL. Until there are entries, the page shows a "coming soon" notice.
- **Contact form**: the form posts to [Formspree](https://formspree.io).
  Create a form there, then set `formspree_id` in `_config.yml` to the ID at
  the end of its endpoint URL (`https://formspree.io/f/<id>`). While it's
  empty the page shows a notice and the submit button is disabled.

## Running locally

Install dependencies:

```bash
just install
```

Then start the dev server:

```bash
just dev
```

The site will be available at <http://localhost:4002>.

To check the built site exactly as GitHub Pages will serve it (without live
reload), run `just preview`, which serves it at <http://localhost:4003>.

## Checks

The `ci` GitHub Actions workflow runs three independent checks on every push
and pull request: `just lint`, `just check-accessibility`, and
`just check-security`. The `deploy` workflow publishes the site to GitHub
Pages once `ci` passes on `main`.

### Linting

```bash
just lint
```

Lints YAML (`eslint-plugin-yml`), Markdown (`markdownlint`), SCSS
(`stylelint`), JavaScript (`eslint`), the built HTML (`html-proofer`,
checking internal links/images/anchors), and SEO basics (`robots.txt`,
`sitemap.xml`, absolute OG/canonical URLs).

### Accessibility

```bash
just check-accessibility
```

Checks accessibility with `pa11y-ci` (WCAG2AA, against every page in the
sitemap) and Lighthouse. Both build the site and serve it locally to run
against.

If `just check-pa11y` fails locally with a Chrome `dlopen` error, the
Chrome build that `pa11y-ci`'s Puppeteer dependency downloaded is corrupt -
delete `~/.cache/puppeteer` and re-run `just install`, or set
`PUPPETEER_EXECUTABLE_PATH` to an existing Chrome install.

### Security

```bash
just check-security
```

Checks dependencies for known vulnerabilities with `bundler-audit`
(Ruby gems, against the [ruby-advisory-db](https://github.com/rubysec/ruby-advisory-db))
and [`osv-scanner`](https://google.github.io/osv-scanner/) (Ruby and npm
lockfiles, against the [OSV database](https://osv.dev)). `osv-scanner`
isn't managed by `just install` - install it separately, e.g.
`brew install osv-scanner`.

Vulnerabilities that don't apply (e.g. dev-only tooling with no fix
available) are suppressed with a reason in [`osv-scanner.toml`](osv-scanner.toml)
rather than silently ignored.

Separately, [Dependabot](.github/dependabot.yml) opens a PR weekly for any
outdated Ruby gem, npm package, or GitHub Action.
