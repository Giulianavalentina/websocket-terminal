import WebSocket from 'ws';
import readline from 'readline/promises';
import chalk from 'chalk';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ws = new WebSocket('ws://localhost:8080');
let username;

ws.on('open', async () => {
    console.log(chalk.green('Conectado al servidor de chat.'));
    username = await rl.question('Por favor, ingresa tu nombre de usuario: ');
    ws.send(username);
});

ws.on('message', message => {
    console.log(message.toString());
});

ws.on('close', () => {
    console.log(chalk.red('Desconectado del servidor.'));
    rl.close();
});

ws.on('error', error => {
    console.error(chalk.red('Error de conexión:'), error);
    rl.close();
});

rl.on('line', async input => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(input);
    } else {
        console.log(chalk.yellow('No se puede enviar el mensaje. La conexión no está abierta.'));
    }
});

rl.on('close', () => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.close();
    }
});