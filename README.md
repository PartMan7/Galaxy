# Galaxy

A visualization tool that displays GitHub contribution statistics as an interactive galaxy. Built with React, TypeScript, and Bun. Check it out at [https://galaxy.partman.dev](https://galaxy.partman.dev)!

<img src="./docs/screenshot.png" width="432" height="220" />

You can hover over a star for details and a link.

## Prerequisites

- [Bun](https://bun.com) v1.2.21 or higher
- A GitHub account
- GitHub Personal Access Token (see setup instructions below)

## Setup

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/PartMan7/Galaxy
cd Galaxy
bun install
```

### 2. GitHub Token Setup

<details>
<summary>(click to expand)</summary>

To fetch GitHub statistics, you need to generate a Personal Access Token:

#### Navigate to GitHub Settings

Go to [https://github.com/settings/tokens](https://github.com/settings/tokens) or:

- Click your profile picture
- Select Settings
- Navigate to Developer settings
- Click Personal access tokens
- Select Tokens (classic)

#### Generate New Token

- Click "Generate new token" and select "Generate new token (classic)"
- Give it a descriptive name (e.g., "Galaxy Stats App")
- Set expiration date (recommended: 90 days or No expiration for development)

#### Select Required Scopes

The following permissions are required:

- `read:user` - Read all user profile data
- `user:email` - Access user email addresses (read-only)

#### Generate and Copy Token

- Click "Generate token" at the bottom of the page
- Copy the token immediately (you won't be able to see it again)

#### Configure Environment Variables

Create a `.env` file in the project root directory:

```bash
PUBLIC_GITHUB_USERNAME=(Your username here)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Replace the placeholder values with your actual GitHub token and username.

</details>

### 3. Start Development Server

Start the development server with hot reloading:

```bash
bun dev
```

The application will be available at the default port with automatic reloading on file changes.

## Contributing

Contributions are welcome! If you're new to contributions, check out [GitHub's guide on how to contribute](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request).

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes and commit them with descriptive messages
4. Push your changes to your fork
5. Submit a pull request with a clear description of your changes
