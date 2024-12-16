const {Client,SlashCommandBuilder, GatewayIntentBits} = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});
module.exports = {
data: new SlashCommandBuilder()
.setName('message')
.setDescription('Send a message or warning to a specific user anonymously.')
.addUserOption(option =>
    option.setName('user')
    .setDescription('User to send DM')
    .setRequired(true))
.addStringOption(option =>
    option.setName('message')
    .setDescription('the message to send')
    .setRequired(true)),
async execute (interaction){
    const user = interaction.options.getUser('user');
    const message = interaction.options.getString('message');
    try{
        await user.send(message);
        await interaction.reply({content:`Message sent to ${user.tag}`, ephemeral : true});
    }catch(e){
        console.error(e);
        await interaction.reply({content: 'Failed to send DM', ephemeral: true});
    }
}
}
