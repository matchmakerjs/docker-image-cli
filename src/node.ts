import * as shell from "shelljs";
import { Arguments } from "yargs";
import { buildImage } from './build';
import { writeDockerfile } from './docker-file';
import * as fs from "fs";
import * as path from "path";

export async function buildNodeImage(options: {
    cwd: string,
    argv: Arguments
}): Promise<void> {
    const startTime = process.hrtime.bigint();
    const argv = options.argv
    const cwd = options.cwd;

    const _docker = cwd + `/.docker_${process.hrtime.bigint()}`;
    shell.rm('-rf', _docker + '/*');
    shell.mkdir(_docker);

    const buffer = fs.readFileSync(cwd + '/package.json');
    const packageJson = JSON.parse(buffer.toString());
    delete packageJson.devDependencies;
    fs.writeFileSync(_docker + '/package.json', JSON.stringify(packageJson));

    // shell.cp(cwd + '/package.json', _docker);

    shell.cp(cwd + '/.npmrc', _docker);
    shell.cd(_docker);

    const installStartTime = process.hrtime.bigint();
    shell.exec('npm i --production --prefer-offline');
    const installEndTime = process.hrtime.bigint();

    const files = [
        [`${path.relative(cwd, _docker)}/node_modules/`, 'node_modules/'],
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
        });
        await buildImage({ cwd, argv, dockerFile });
    } finally {
        shell.rm('-rf', _docker);
        const npmICost = Number(installEndTime - installStartTime);
        const totalCost = Number(process.hrtime.bigint() - startTime);
        console.log(`Time taken: ${totalCost / 1000000}ms (npm i: ${npmICost / 1000000}ms)`);
    }
}