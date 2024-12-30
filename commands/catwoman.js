const {SlashCommandBuilder} = require ('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
    .setName('catwoman')
    .setDescription("Owner's wifey"),

    async execute (interaction){
        await interaction.reply('F <3');
    }
};