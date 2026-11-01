# PVH Consultancy

The website for PVH Consultancy. Built with [Jekyll](https://jekyllrb.com).
For now it's a single holding page.

Live at <https://pvhconsultancy.com> (<https://www.pvhconsultancy.com>
redirects there).

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
