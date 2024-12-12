const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config(); // For environment variables
const activeChannels = require('./activechannels'); // Adjust the path if needed


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});
const token = process.env.TOKEN;
const clientID = process.env.CLIENT_ID;

// Command collection
client.commands = new Collection();

// Dynamically load commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];  // Array to store the command data for registration

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON()); // Collect command data for registration
}

// Event: Bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setStatus('dnd');  // 'dnd' is the status for Do Not Disturb
    client.user.setActivity('Creating Batcaves 🦇', { type: 'PLAYING' });  // Custom activity (you can change this message)
});

// Register commands with Discord API (Global or Guild-specific)
const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationCommands(clientID), { body: commands })  // Use Routes.applicationCommands(clientID, guildID) for guild-specific commands
    .then(() => {
        console.log('Successfully registered application commands.');
    })
    .catch(console.error);

// Event: Interaction create (slash commands)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true
        });
    }
});
client.on('voiceStateUpdate', async (oldState, newState) => {
    const channelId = oldState.channelId || newState.channelId;
    
    // Check if the channel is a personal channel in activeChannels map
    if (channelId && activeChannels.has(channelId)) {
        const channel = activeChannels.get(channelId);

        // If the channel is empty, delete it
        const membersInChannel = channel.channel.members.size;
        if (membersInChannel === 0) {
            await channel.channel.delete();
            activeChannels.delete(channelId); // Remove the channel from the active channels map
            console.log(`Deleted empty channel: ${channel.channel.name}`);
        }
    }
});

// Log in the bot
client.login(token);
