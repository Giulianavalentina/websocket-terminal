import { WebSocketServer } from 'ws';
import chalk from 'chalk';
import readline from 'readline/promises';

const wss = new WebSocketServer({ port: 8080 });
const clients = new Map();

console.log(chalk.green('Servidor de chat iniciado en ws://localhost:8080'));

wss.on('connection', ws => {
    let username;

    ws.on('message', message => {
        const data = message.toString().trim();

        if (!username) {
            username = data;
            clients.set(ws, username);
            broadcast(`${chalk.yellow('[Servidor]')}: El usuario "${chalk.cyan(username)}" se ha unido al chat.`, ws);
            ws.send(`${chalk.yellow('[Servidor]')}: ¡Bienvenido al chat, ${chalk.cyan(username)}!`);
            return;
        }

        const formattedMessage = `${chalk.cyan(username)}: ${data}`;
        broadcast(formattedMessage, ws);
    });

    ws.on('close', () => {
        if (username) {
            clients.delete(ws);
            broadcast(`${chalk.yellow('[Servidor]')}: El usuario "${chalk.cyan(username)}" ha salido del chat.`);
        }
    });

    ws.on('error', error => {
        console.error('Error en el WebSocket:', error);
        if (username) {
            clients.delete(ws);
            broadcast(`${chalk.yellow('[Servidor]')}: El usuario "${chalk.cyan(username)}" salió del chat debido a un error.`);
        }
    });
});

async function broadcastServerMessage() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
        while (true) {
            const serverMessage = await rl.question(chalk.bgYellow.black('Enviar mensaje del servidor: ') + ' ');
            if (serverMessage) {
                broadcast(`${chalk.bgYellow.black('[Servidor]')}: ${serverMessage}`);
            }
        }
    } finally {
        rl.close();
    }
}

function broadcast(message, sender) {
    clients.forEach((clientUsername, clientSocket) => {
        if (clientSocket !== sender && clientSocket.readyState === 1) {
            clientSocket.send(message);
        } else if (!sender && clientSocket.readyState === 1) { // Para mensajes del servidor
            clientSocket.send(message);
        }
    });
}

// Iniciar la función para enviar mensajes del servidor
broadcastServerMessage();