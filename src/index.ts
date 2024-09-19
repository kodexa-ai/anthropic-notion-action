import * as core from '@actions/core';
import * as glob from 'glob';
import * as fs from 'fs';
import axios from 'axios';
import { Client } from '@notionhq/client';

export async function run() {
    try {
        const codePath = core.getInput('codePath', { required: true });
        const anthropicApiKey = core.getInput('anthropicApiKey', { required: true });
        const notionApiKey = core.getInput('notionApiKey', { required: true });
        const notionPageId = core.getInput('notionPageId', { required: true });
        const prompt = core.getInput('prompt', { required: true });

        // Read files
        const files = glob.sync(codePath);
        const fileContents = files.map(file => fs.readFileSync(file, 'utf8')).join('\n\n');

        // Call Anthropic API
        const anthropicResponse = await axios.post(
            'https://api.anthropic.com/v1/completions',
            {
                prompt: `${prompt}\n\nCode:\n${fileContents}`,
                model: 'claude-v1',
                max_tokens_to_sample: 1000,
                temperature: 0.7,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': anthropicApiKey,
                },
            }
        );

        const generatedMarkdown = anthropicResponse.data.completion;

        // Update Notion page
        const notion = new Client({ auth: notionApiKey });
        await notion.blocks.children.append({
            block_id: notionPageId,
            children: [
                {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{ type: 'text', text: { content: generatedMarkdown } }],
                    },
                },
            ],
        });

        core.setOutput('result', 'Notion page updated successfully');
    } catch (error) {
        core.setFailed(error.message);
    }
}

// Call run() if this file is being run directly
if (require.main === module) {
    run().then(r => console.log("Done"));
}