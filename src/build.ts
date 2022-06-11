import * as path from 'path';
import * as shell from "shelljs";
import { Arguments } from 'yargs';

export function buildImage(options: {
    dockerFile: string,
    cwd: string,
    argv: Arguments
}) {
    const argv = options.argv;
    const cwd = options.cwd;
    let imageName = argv.tag || argv.t;
    let platform = argv.platform;
    if (!imageName) {
        if (argv.repository) {
            imageName = argv.repository + '/' + path.basename(cwd);
        } else {
            imageName = path.basename(cwd);
        }
    }
    shell.cd(cwd);
    let script = 'docker build';
    if (platform) {
        script = `${script} --platform ${platform}`;
    }
    shell.exec(`${script} -t ${imageName} -f ${options.dockerFile} .`);
}