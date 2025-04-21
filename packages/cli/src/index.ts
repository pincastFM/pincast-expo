import cac from 'cac';
import { version } from '../package.json';

// Import commands
import { login } from './commands/login';
import { logout } from './commands/logout';
import { init } from './commands/init';
import { create } from './commands/create';
import { dev } from './commands/dev';
import { deploy } from './commands/deploy';
import { help } from './commands/help';

const cli = cac('pincast');

// Set version
cli.version(version);
cli.help();

// Register commands
cli.command('login', 'Authenticate with Pincast')
  .action(login);

cli.command('logout', 'Log out from Pincast')
  .action(logout);

cli.command('init', 'Initialize a new Pincast project or add to existing Nuxt project')
  .action(init);

cli.command('create [dir]', 'Create a new Pincast project with starter template')
  .action(create);

cli.command('dev', 'Start local development server with API proxy')
  .action(dev);

cli.command('deploy', 'Deploy your Pincast application')
  .option('--prod', 'Deploy to production')
  .action((options) => deploy(options.prod || false));

cli.command('help', 'Show help for a command')
  .action(help);

// Parse arguments
cli.parse(process.argv, { run: true });

// Handle errors
process.on('uncaughtException', (err) => {
  console.error('Error:', err.message);
  process.exit(1);
});