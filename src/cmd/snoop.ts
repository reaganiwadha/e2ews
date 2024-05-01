import inquirer from 'inquirer';

(async () => {
    const query = await inquirer
        .prompt([{ type: 'input', name: 'key', message: 'enter key' }])

    console.log(`Hello ${query.key}!`);
})();

