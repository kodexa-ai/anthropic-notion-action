# Update Notion with Anthropic-Generated Content

This GitHub Action reads specified code files, sends their content to the Anthropic API along with a prompt, and updates a Notion page with the generated markdown content.

## Inputs

| Name | Description | Required |
|------|-------------|----------|
| `codePath` | Path to code files (glob pattern) | Yes |
| `anthropicApiKey` | Anthropic API Key | Yes |
| `notionApiKey` | Notion API Key | Yes |
| `notionPageId` | Notion page ID | Yes |
| `prompt` | Prompt for Anthropic API | Yes |

## Usage

To use this action in your workflow, you can add the following step:

```yaml
- uses: your-github-username/your-repo-name@v1
  with:
    codePath: '**/*.ts'
    anthropicApiKey: ${{ secrets.ANTHROPIC_API_KEY }}
    notionApiKey: ${{ secrets.NOTION_API_KEY }}
    notionPageId: 'your-notion-page-id'
    prompt: 'Your prompt for Anthropic API'
```

Make sure to set up the `ANTHROPIC_API_KEY` and `NOTION_API_KEY` as secrets in your GitHub repository settings.

## Example Workflow

Here's an example of a complete workflow file:

```yaml
name: Update Notion Page

on:
  workflow_dispatch:
    inputs:
      codePath:
        description: 'Path to code files (glob pattern)'
        required: true
      notionPageId:
        description: 'Notion page ID'
        required: true
      prompt:
        description: 'Prompt for Anthropic API'
        required: true

jobs:
  update-notion:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: your-github-username/your-repo-name@v1
        with:
          codePath: ${{ github.event.inputs.codePath }}
          anthropicApiKey: ${{ secrets.ANTHROPIC_API_KEY }}
          notionApiKey: ${{ secrets.NOTION_API_KEY }}
          notionPageId: ${{ github.event.inputs.notionPageId }}
          prompt: ${{ github.event.inputs.prompt }}
```

## Development

To set up this project locally for development:

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the TypeScript code: `npm run build`
4. Run tests: `npm test`
5. Package the action: `npm run package`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.