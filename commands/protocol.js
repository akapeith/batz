const {SlashCommandBuilder, PermissionFlagsBits} = require ('discord.js');
const {saveServerConfig} = require ('../serverdb.js');
module.exports = {
    data : new SlashCommandBuilder()
        .setName('protocol')
        .setDescription('Identify the server configurations for new members.')
        .addChannelOption(option=>
            option
            .setName('channel')
            .setDescription('Channel to send welcome messages to')
            .setRequired(true))
        .addRoleOption(option =>
            option 
            .setName('role')
            .setDescription('Role to give to new users')
            .setRequired(true))
        .addStringOption(option =>
            option 
            .setName('message')
            .setDescription('The welcome message to send')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

        async execute (interaction){
            const channel = interaction.options.getChannel('channel');
            const role = interaction.options.getRole('role');
            const message = interaction.options.getString('message');
            const serverId = interaction.guild.id;
            try {
                await saveServerConfig(serverId, channel.id, role.id, message);
                interaction.reply({
                  content: `✅ Welcome settings updated:\n- **Channel:** <#${channel.id}>\n- **Role:** ${role.name}\n- **Message:** ${message}`,
                  ephemeral: true,
                });
              } catch (error) {
                console.error(error);
                interaction.reply({
                  content: 'Failed to save the configuration. Please try again later.',
                  ephemeral: true,
                });

        }
    }
};