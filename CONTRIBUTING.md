# Contribution Guidelines for iNaturalistReactNative
Welcome! We're excited that you're interested in contributing to the iNaturalist React Native mobile application. Below you'll find some guidelines that will help you contribute to our project.

We welcome volunteer contributions! This app is still early in its development and a lot of things are in flux, but there's usually something to work on. Please keep the following in mind:

1. Work on [existing issues](https://github.com/inaturalist/iNaturalistReactNative/issues) (though if you have ideas for improvement that aren't directly related to features, let us know)
1. Leave a comment on the issue so we can assign you and other people know not to work on it
1. Name your branch starting with the issue number and then something descriptive, e.g. `123-login-with-locale-crash`
1. We try to review pull requests as soon as we can, but that might be up to a week or two

## Getting Started
1. Fork the repository.
2. Clone the forked repository to your local machine.
3. Follow [the README](README.md) to setup your local repository.
4. Create a new branch for the issue you're working on; the branch name should start with the issue number and by concise but descriptive, e.g. `123-login-with-locale-crash`.
5. Make changes to the codebase.
6. Push your changes to your forked repository.

## Submitting Changes
1. Make sure your changes are up-to-date with the latest changes in the main repository.
2. Make sure your code is well-tested and passes all unit and integration tests.
3. It would be nice if you could run e2e tests locally with your own app credentials.
4. Create a pull request to the main repository with your changes.

## Guidelines
- Give your pull request a **clear and descriptive title** (e.g. "Remove predictions state on blur and focus in ARCamera") and a comment that includes a reference to the issue number (e.g. "Closes #123" or "Partially addresses #123" in case of an open issue) and maybe a detailed description of the changes you've made.
- If you're adding new features or functionality differing from the description in the issue, please provide a clear explanation of how this work differs from what the issue describes.
- Feel free to ask any questions or raise any concerns you have.
- Please make sure your code includes unit tests, and our linting rules were applied (should happen automatically).

## Code Style Guide
- We use [ESLint](https://eslint.org/) to enforce our code style guide.
- We have enabled several eslint plugins to enforce best practices, e.g. in testing and accessibility. We also have enabled a pre-commit hook to run `eslint --fix --quiet` on all staged files. This will fix issues that can be fixed automatically.

## Issues and Bugs
If you find an issue or bug in our application, please report it by opening a new issue in the repository. Please include a clear and detailed description of the issue, steps to reproduce the issue, and any relevant screenshots or error messages.

Thank you for contributing to our React Native mobile application!
