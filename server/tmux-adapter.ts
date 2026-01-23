import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from './config';

const execAsync = promisify(exec);

function escapeForShell(str: string): string {
  // Escape single quotes for shell
  return str.replace(/'/g, "'\\''");
}

function escapeForTmux(str: string): string {
  // Escape characters that have special meaning in tmux send-keys
  // Semicolons need escaping, backslashes need doubling
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;');
}

async function sshCommand(command: string): Promise<{ stdout: string; stderr: string }> {
  const { sshHost, sshUser } = config.tmux;
  const sshTarget = `${sshUser}@${sshHost}`;

  // Use -o options for non-interactive, and -T for no pseudo-terminal allocation
  const fullCommand = `ssh -o BatchMode=yes -o ConnectTimeout=10 -T ${sshTarget} '${escapeForShell(command)}'`;

  console.log(`[Tmux] Executing SSH command: ${command}`);
  return execAsync(fullCommand);
}

async function tmuxSessionExists(): Promise<boolean> {
  const { tmuxSession } = config.tmux;
  try {
    await sshCommand(`tmux has-session -t ${tmuxSession} 2>/dev/null`);
    return true;
  } catch {
    return false;
  }
}

async function createTmuxSession(): Promise<void> {
  const { tmuxSession, claudeCommand } = config.tmux;
  console.log(`[Tmux] Creating tmux session '${tmuxSession}' with command: ${claudeCommand}`);

  // Create a detached session and run the claude command
  await sshCommand(`tmux new-session -d -s ${tmuxSession} '${escapeForShell(claudeCommand)}'`);

  // Give Claude a moment to start up
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

async function sendToTmux(message: string): Promise<void> {
  const { tmuxSession, messagePrefix } = config.tmux;
  const fullMessage = `${messagePrefix}${message}`;

  // Escape the message for tmux
  const escapedMessage = escapeForTmux(fullMessage);

  // Send the message to the tmux session and press Enter
  await sshCommand(`tmux send-keys -t ${tmuxSession} '${escapeForShell(escapedMessage)}' Enter`);
}

export async function sendMessageToTmux(message: string): Promise<void> {
  console.log(`[Tmux] Sending message: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);

  // Check if session exists, create if not
  const sessionExists = await tmuxSessionExists();
  if (!sessionExists) {
    console.log(`[Tmux] Session does not exist, creating...`);
    await createTmuxSession();
  }

  // Send the message
  await sendToTmux(message);
  console.log(`[Tmux] Message sent successfully`);
}
