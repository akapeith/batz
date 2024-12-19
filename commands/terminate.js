const{SlashCommandBuilder,PermissionFlagsBits} = require ('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
    .setName('terminate')
    .setDescription('kick a members')
    .addUserOption(option=>
        option
        .setName('user')
        .setDescription('user to kick')
        .setRequired(true))
    .addStringOption(option=>
        option
        .setName('reason')
        .setDescription('reason for kick')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
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
if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
  return interaction.reply({
    content: 'You do not have permission to kick members.',
    ephemeral: true
  });
}

// Kick the member
try {
  await member.kick({ reason });
  await interaction.reply({
    content: `✅ **${user.tag}** has been kicked.\n**Reason:** ${reason}`,
    ephemeral: true
  });
} catch (error) {
  console.error(error);
  interaction.reply({
    content: 'I was unable to kick this user. Please check my permissions and role hierarchy.',
    ephemeral: true
  });
}
} 
};