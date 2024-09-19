import * as core from '@actions/core';
import axios from 'axios';
import { Client } from '@notionhq/client';
import * as glob from 'glob';
import * as fs from 'fs';

// Mock the dependencies
jest.mock('@actions/core');
jest.mock('axios');
jest.mock('@notionhq/client');
jest.mock('glob');
jest.mock('fs');

// Import the function to test
import { run } from './index';

describe('GitHub Action', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should update Notion page with Anthropic-generated content', async () => {
        // Mock input values
        (core.getInput as jest.Mock).mockImplementation((name: string) => {
            switch (name) {
                case 'codePath':
                    return '**/*.ts';
                case 'anthropicApiKey':
                    return 'mock-anthropic-api-key';
                case 'notionApiKey':
                    return 'mock-notion-api-key';
                case 'notionPageId':
                    return 'mock-notion-page-id';
                case 'prompt':
                    return 'Test prompt';
                default:
                    return '';
            }
        });

        // Mock glob.sync to return some file paths
        (glob.sync as jest.Mock).mockReturnValue(['file1.ts', 'file2.ts']);

        // Mock fs.readFileSync to return some content
        (fs.readFileSync as jest.Mock).mockReturnValue('mock file content');

        // Mock Anthropic API response
        (axios.post as jest.Mock).mockResolvedValue({
            data: {
                completion: '# Generated Markdown\n\nThis is a test.',
            },
        });

        // Mock Notion client
        const mockAppend = jest.fn().mockResolvedValue({});
        (Client as jest.Mock).mockImplementation(() => ({
            blocks: {
                children: {
                    append: mockAppend,
                },
            },
        }));

        // Run the action
        await run();

        // Assertions
        expect(glob.sync).toHaveBeenCalledWith('**/*.ts');
        expect(fs.readFileSync).toHaveBeenCalledTimes(2);
        expect(axios.post).toHaveBeenCalledWith(
            'https://api.anthropic.com/v1/completions',
            expect.any(Object),
            expect.any(Object)
        );
        expect(Client).toHaveBeenCalledWith({ auth: 'mock-notion-api-key' });
        expect(mockAppend).toHaveBeenCalledWith({
            block_id: 'mock-notion-page-id',
            children: [
                {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{ type: 'text', text: { content: '# Generated Markdown\n\nThis is a test.' } }],
                    },
                },
            ],
        });
        expect(core.setOutput).toHaveBeenCalledWith('result', 'Notion page updated successfully');
    });

    it('should handle errors and set failed status', async () => {
        // Mock an error
        (axios.post as jest.Mock).mockRejectedValue(new Error('API Error'));

        // Run the action
        await run();

        // Assertions
        expect(core.setFailed).toHaveBeenCalledWith('API Error');
    });
});