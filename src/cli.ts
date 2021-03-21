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
        description: 'The base image to use'
    })
    .option('tag', {
        alias: 't',
        type: 'array',
        description: 'The image to use'
    })
    .argv;