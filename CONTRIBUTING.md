# Contribution Guidelines for iNaturalistReactNative

## About this codebase

iNaturalist's code is open source primarily for **transparency** — we want our community to be able to see how the platform works. Unlike many open source projects, we don't maintain this codebase as a general-purpose tool for forking or customization. We build it with one deployment in mind: iNaturalist.org and the iNaturalist mobile apps.

We will probably close pull requests that don't address open issues. Again, if you want to change functionality, the discussion should start in the [Forum](https://forum.inaturalist.org/), and if staff agree something should change, we'll make an issue, label it, and then you can work on it.

We're a small team. Our capacity to review and integrate external contributions is limited, and we can't commit to responding to every inquiry or pull request.

## Bugs and feature requests

**Please don't open GitHub issues for user-facing bug reports or feature requests.**

We track our work internally and triage inbound requests through the [iNaturalist Forum](https://forum.inaturalist.org). Filing a GitHub issue is unlikely to result in action, and you're much more likely to get a response — and to hear from other community members with similar experiences — on the Forum.

- **Bug reports:** [forum.inaturalist.org](https://forum.inaturalist.org) → Bug Reports category
- **Feature requests:** [forum.inaturalist.org](https://forum.inaturalist.org) → Feature Requests category

If you've found a problem in the code, please supply detailed reproduction conditions, cite line numbers, include exceptions / stack traces, etc. If you can't supply this kind of information, we will probably close your issue and suggest you post to the forum links above.

# Reporting Security Issues

You should report security issues that require confidential communication to [help+security@inaturalist.org](mailto:help+security@inaturalist.org). We do not offer any rewards or bounties for reporting security issues, though we may offer to list your name and URL here if we act on your report.

---

## Translations

Translations are handled separately through [Crowdin](https://crowdin.com/project/inaturalistios), not through pull requests. If you'd like to help translate iNaturalist into another language, that's the place to start — and it's one of the most impactful ways to contribute to the project.

---

## Code of conduct

All contributors are expected to follow the [iNaturalist Community Guidelines](https://www.inaturalist.org/pages/community+guidelines), or at least the parts that aren't specific to using iNaturalist as a naturalist.

---

## Questions about the code

If you have a technical question about how something works — you're building an integration, you're curious about an architectural decision, or you've encountered something confusing — you can open a [GitHub Discussion](https://github.com/inaturalist/iNaturalistReactNative/discussions/3477). We can't promise a quick response, but discussions are more likely to get attention than issues, and they benefit others who have the same question.

## Code contributions

Please keep the following in mind:

1. Work on [existing, unassigned issues](https://github.com/inaturalist/iNaturalistReactNative/issues?q=is%3Aissue+is%3Aopen+no%3Aassignee) (feature requests should go through the [Forum](https://forum.inaturalist.org/c/feature-requests/16))
1. Leave a comment on the issue you want to work on so we can assign you and other people know not to work on it
1. Name your branch starting with the issue number and then something descriptive, e.g. `123-login-with-locale-crash`
1. We try to review pull requests as soon as we can, but that might be up to a week or two

## Getting Started
1. Fork the repository
1. Clone the forked repository to your local machine
1. Follow [the README](README.md) to set up your dev environment
1. Create a new branch for the issue you're working on; the branch name should start with the issue number and be concise but descriptive, e.g. `123-login-with-locale-crash`
1. Start coding!

## Code Style
- We use [ESLint](https://eslint.org/) to enforce our code style; you should have this integrated into your editor / IDE
- We also have enabled a pre-commit hook to run `eslint --fix --quiet` on all staged files. This will fix issues that can be fixed automatically and should prevent commits that violate the rules
- We only have partial TypeScript adoption. It would be nice if new files were in TypeScript and those files were type safe, but it's not a requirement

## Commit Style

Please follow this guidance when committing to the main branch, including merge commits from PRs. Atomic commits in branches that don't make it into main can be more freeform.

1. Try to use the [imperative mood](https://www.git-basics.com/docs/git-commit/commit-message-rules), so your message should fill in the blank in, "If applied, this commit will \_\_\_\_\_"
1. Describe the impact on the end user if possible, so "Fix broken photo sharing in iOS 18" would be better than "Switch to a fork of photo-sharing-library-x"
1. Append developer-relevant details on subsequent lines, e.g.
    ```
    Fix broken photo sharing in iOS 18

    * Switch to fork of photo-sharing-library-x
    * Minor UI touch-ups
    ```
1. Include `Closes #1234` on a subsequent line if your commit closes issue 1234; that will automatically close the issue on GitHub and helps link commits to the issues they address. Example
    ```
    Fix broken photo sharing in iOS 18

    Closes #1234
    ```

1. Semantic commit labels are fine (e.g. `fix: broken photo sharing in iOS 18`), but we don't (yet) require them

## Submitting Changes
1. Ensure tests are passing (run `npm test`). If tests are not passing we will not merge your PR
1. Ensure your branch is up-to-date with the main branch of the primary repository
1. Ensure your branch has no merge conflicts with the `main` branch. We will not merge PRs with conflicts
1. Create a pull request to the primary repository with your changes

## Pull Request Guidelines
- Give your pull request a **clear and descriptive title** (e.g. "Remove predictions state on blur and focus in ARCamera") and a comment that includes a reference to the issue number (e.g. "Closes #123" or "Partially addresses #123" in case of an open issue) and maybe a detailed description of the changes you've made
- Don't include new features or functionality differing from the description in the issue.