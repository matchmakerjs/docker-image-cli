#!/usr/bin/env node

import yargs from 'yargs';
import { buildNodeImage } from './node';

const cwd = process.cwd();

yargs(process.argv.slice(2))
    .command(
        ['node', '*'],
        'Build docker image from node application',
        (yargs) => {
            return yargs;
        },
        (argv) => buildNodeImage({ cwd, argv })
    )
    .option('from', {
        type: 'string',
        description: 'The base image to use',
        default: 'node:14.10.1-alpine3.12'
    })
    .option('tag', {
        alias: 't',
        type: 'string',
        description: 'The image to use'
    })
    .option('copy', {
        alias: 'c',
        type: 'array',
        description: 'Files to include in the image',
        default: 'dist'
    })
    .argv;