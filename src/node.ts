import * as shell from "shelljs";
import { buildImage } from './build';
import { writeDockerfile } from './docker-file';

export function buildNodeImage(options: {
    cwd: string,
    argv: any
}): Promise<void> {
    const argv = options.argv
    const cwd = options.cwd;

    const _docker = cwd + '/.docker';
    shell.rm('-rf', _docker + '/*');
    shell.mkdir(_docker);
    shell.cp(cwd + '/package.json', _docker);
    shell.cd(_docker);
    shell.exec('npm i --production --prefer-offline');

    const dockerFile = `${_docker}/Dockerfile`;
    return writeDockerfile(dockerFile, {
        baseImage: (argv.from as string) || 'node:14.10.1-alpine3.12',
        workDir: (argv.workDir as string) || '/app',
        entryPoint: `[ "node", "${argv?.script || '.'}" ]`,
        files: [
            ['.docker/node_modules', 'node_modules/'],
            ['package.json', 'package.json'],
            ['dist', 'dist/']
        ]
    }).then(() => buildImage({ cwd, argv, dockerFile }));
}