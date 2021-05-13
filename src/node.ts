import * as shell from "shelljs";
import { Arguments } from "yargs";
import { buildImage } from './build';
import { writeDockerfile } from './docker-file';

export async function buildNodeImage(options: {
    cwd: string,
    argv: Arguments
}): Promise<void> {
    const startTime = process.hrtime.bigint();
    const argv = options.argv
    const cwd = options.cwd;

    const _docker = cwd + '/.docker';
    shell.rm('-rf', _docker + '/*');
    shell.mkdir(_docker);
    shell.cp(cwd + '/package.json', _docker);
    shell.cp(cwd + '/.npmrc', _docker);
    shell.cd(_docker);
    shell.exec('npm i --production --prefer-offline');
    shell.rm('-rf', cwd + '/.npmrc');

    const files = [
        ['.docker/node_modules', 'node_modules/'],
        ['package.json', 'package.json']
    ]

    const appFiles: string[] = argv.copy as string[];
    if (appFiles) {
        appFiles.forEach(entry => {
            const [from, to] = entry.split(':');
            files.push([from, to || './']);
        });
    }

    const dockerFile = `${_docker}/Dockerfile`;
    try {
        await writeDockerfile(dockerFile, {
            baseImage: (argv.from as string) || 'node:14.10.1-alpine3.12',
            workDir: (argv.workDir as string) || '/app',
            entryPoint: `[ "node", "${argv?.script || '.'}" ]`,
            files
        }).then(() => buildImage({ cwd, argv, dockerFile }));
    } finally {
        shell.rm('-rf', _docker);
        console.log(`Time taken: ${Number(process.hrtime.bigint() - startTime) / 1000000}ms`)
    }
}