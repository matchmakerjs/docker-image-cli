import * as path from 'path';
import * as shell from "shelljs";

export function buildImage(options: {
    dockerFile: string,
    cwd: string,
    argv: any
}) {
    const argv = options.argv;
    const cwd = options.cwd;
    let imageName = argv.tag || argv.t;
    if (!imageName) {
        if (argv.repository) {
            imageName = argv.repository + '/' + path.basename(cwd);
        } else {
            imageName = path.basename(cwd);
        }
    }
    shell.cd(cwd);
    shell.exec(`docker build -t ${imageName} -f ${options.dockerFile} .`);
}