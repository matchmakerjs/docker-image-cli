import * as fs from 'fs';

export type DockerfileOptions = {
    baseImage: string;
    files?: string[][];
    workDir?: string;
    entryPoint?: string;
};

export function writeDockerfile(dockerFile: string, options: DockerfileOptions): Promise<void> {
    return new Promise((res, rej) => {
        fs.writeFile(dockerFile, Dockerfile(options), (e) => {
            if (e) return rej(e);
            res();
        })
    });
}

function Dockerfile(options: DockerfileOptions): string {
    return `
FROM ${options.baseImage}

${workDir(options.workDir)}

${copyList(options.files)}

${entryPoint(options.entryPoint)}
`.replace(/[\n]{3,}/g, '\n\n').trim();
}

function workDir(value: string) {
    if (!value) return '';
    return `WORKDIR ${value}`;
}

function entryPoint(value: string) {
    if (!value) return '';
    return `ENTRYPOINT ${value}`;
}

function copyList(files: string[][]): string {
    if (!files?.length) return '';
    return files.map(it => {
        const resList = it.map(res => `"${res}"`).join(',');
        return `COPY [${resList}]`
    }).join('\n');
}