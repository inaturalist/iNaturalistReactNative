# Contribution Guidelines for iNaturalistReactNative
Welcome! We're excited that you're interested in contributing to the iNaturalist React Native mobile application. Below you'll find some guidelines that will help you contribute to our project, whether you're on staff or a volunteer.

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
- Please do not refer to the issue number in the PR title. Do that in the comment / body.
- If you're adding new features or functionality differing from the description in the issue, please provide a clear explanation of how this work differs from what the issue describes
- Feel free to ask any questions or raise any concerns you have


## Issues and Bugs
If you find an issue or bug in our application, please report it by opening a new issue in the repository. Please include a clear and detailed description of the issue, steps to reproduce the issue, and any relevant screenshots or error messages.

Thank you for contributing to our React Native mobile application!
