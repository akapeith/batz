const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
    .setName('execute')
    .setDescription('ban a user')
    .addUserOption(option =>
        option
        .setName('user')
        .setDescription('user to ban')
        .setRequired(true))
    .addStringOption(option =>
        option
        .setName('reason')
        .setDescription('reason for ban')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
        async execute (interaction){
            const user = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason');

            const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: 'The specified user is not a member of this server.',
        ephemeral: true
      });
    }

    // Check if the command executor has higher role than the target
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        content: 'You do not have permission to ban members.',
        ephemeral: true
      });
    }

    // Ban the member
    try {
      await member.ban({ reason });
      await interaction.reply({
        content: `✅ **${user.tag}** has been banned.\n**Reason:** ${reason}`,
        ephemeral: true
      });
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: 'I was unable to ban this user. Please check my permissions and role hierarchy.',
        ephemeral: true
      });
    }
  } 
};
