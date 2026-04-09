#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');
const ollamaHelper = require('./lib/ollama-helper');
const server = require('./server');

const program = new Command();

program
  .name('modelfile-builder')
  .description('CLI and Web UI tool for creating Ollama Modelfiles')
  .version('1.0.0');

program
  .command('serve')
  .description('Start the Modelfile Builder web server')
  .option('-p, --port <port>', 'Port to run server on', '3000')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    const port = parseInt(options.port);
    
    console.log(chalk.cyan('╔═══════════════════════════════════════════╗'));
    console.log(chalk.cyan('║       Modelfile Builder v1.0.0             ║'));
    console.log(chalk.cyan('╚═══════════════════════════════════════════╝\n'));

    console.log(chalk.yellow('→ Checking for Ollama...'));
    
    try {
      const ollamaInfo = await ollamaHelper.findOllama();
      
      if (ollamaInfo.found) {
        console.log(chalk.green('  ✓ Ollama found at: ') + chalk.white(ollamaInfo.path));
        
        if (ollamaInfo.models && ollamaInfo.models.length > 0) {
          console.log(chalk.green('  ✓ Found ') + chalk.white(ollamaInfo.models.length) + chalk.green(' installed models:'));
          ollamaInfo.models.forEach(m => {
            console.log(chalk.gray('    • ') + m.name + (m.size ? ` (${m.size})` : ''));
          });
        } else {
          console.log(chalk.yellow('  ⚠ No installed models found'));
        }
      } else {
        console.log(chalk.yellow('  ⚠ Ollama not found in PATH'));
        console.log(chalk.gray('  → Using fallback popular models list'));
      }
    } catch (err) {
      if (options.verbose) {
        console.log(chalk.red('  ✗ Error: ') + err.message);
      }
      console.log(chalk.yellow('  ⚠ Ollama not available, using fallback models'));
    }

    console.log(chalk.cyan('\n→ Starting server...'));
    
    server.start(port);
  });

program
  .command('check')
  .description('Check if Ollama is installed and list models')
  .action(async () => {
    console.log(chalk.cyan('Checking for Ollama...\n'));
    
    try {
      const ollamaInfo = await ollamaHelper.findOllama();
      
      if (ollamaInfo.found) {
        console.log(chalk.green('✓ Ollama found at: ') + ollamaInfo.path);
        
        if (ollamaInfo.models && ollamaInfo.models.length > 0) {
          console.log(chalk.green('\nInstalled models:'));
          ollamaInfo.models.forEach(m => {
            console.log(`  ${chalk.white(m.name)} ${m.size ? chalk.gray('(' + m.size + ')') : ''}`);
          });
        } else {
          console.log(chalk.yellow('\nNo models installed'));
        }
      } else {
        console.log(chalk.red('✗ Ollama not found in PATH'));
        console.log(chalk.gray('\nTo install Ollama, visit: https://ollama.com'));
      }
    } catch (err) {
      console.log(chalk.red('Error: ') + err.message);
    }
  });

program.parse(process.argv);