const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const activeChannels = require('../activechannels'); // Ensure this is properly initialized

module.exports = {
    data: new SlashCommandBuilder()
        .setName('batcave')
        .setDescription('Create and manage a personal voice channel')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new personal voice channel')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Name of the new voice channel')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option
                        .setName('limit')
                        .setDescription('User limit (0 for no limit)')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('lock')
                .setDescription('Lock or unlock your personal voice channel')
                .addBooleanOption(option =>
                    option
                        .setName('status')
                        .setDescription('Set to true to lock or false to unlock')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setlimit')
                .setDescription('Change the user limit for your personal voice channel')
                .addIntegerOption(option =>
                    option
                        .setName('limit')
                        .setDescription('New user limit (0 for no limit)')
                        .setRequired(true))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const member = interaction.member;

        if (subcommand === 'create') {
            const voiceState = member.voice;

            if (!voiceState.channel) {
                return interaction.reply({
                    content: 'You must be in a voice channel to use this command.',
                    ephemeral: true,
                });
            }

            const name = interaction.options.getString('name');
            const limit = interaction.options.getInteger('limit') || 0;

            try {
                // Create the new voice channel
                const newChannel = await interaction.guild.channels.create({
                    name,
                    type: ChannelType.GuildVoice,
                    userLimit: limit,
                    parent: voiceState.channel?.parent, // Use the same category as the current channel
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.Connect],
                        },
                        {
                            id: member.id,
                            allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ManageChannels],
                        },
                    ],
                });

                // Track the created channel and its owner
                activeChannels.set(newChannel.id, { creator: member.id, channel: newChannel });

                // Move the user to the newly created channel
                await member.voice.setChannel(newChannel);

                return interaction.reply({
                    content: `Voice channel **${name}** created successfully, and you have been moved to it.`,
                    ephemeral: true,
                });
            } catch (error) {
                console.error('Error creating voice channel:', error);
                return interaction.reply({
                    content: 'There was an error creating your personal voice channel.',
                    ephemeral: true,
                });
            }
        }

        if (subcommand === 'lock') {
            const status = interaction.options.getBoolean('status');
            const userChannel = Array.from(activeChannels.values()).find(
                (ch) => ch.creator === member.id
            );

            if (!userChannel) {
                return interaction.reply({
                    content: 'You do not own any active personal voice channel.',
                    ephemeral: true,
                });
            }

            try {
                await userChannel.channel.permissionOverwrites.edit(interaction.guild.id, {
                    Connect: !status, // Deny CONNECT for everyone if locked, allow otherwise
                });

                return interaction.reply({
                    content: `Channel has been ${status ? 'locked' : 'unlocked'}.`,
                    ephemeral: true,
                });
            } catch (error) {
                console.error('Error locking channel:', error);
                return interaction.reply({
                    content: 'There was an error updating the lock status of your channel.',
                    ephemeral: true,
                });
            }
        }

        if (subcommand === 'setlimit') {
            const newLimit = interaction.options.getInteger('limit');
            const userChannel = Array.from(activeChannels.values()).find(
                (ch) => ch.creator === member.id
            );

            if (!userChannel) {
                return interaction.reply({
                    content: 'You do not own any active personal voice channel.',
                    ephemeral: true,
                });
            }

            try {
                await userChannel.channel.setUserLimit(newLimit);

                return interaction.reply({
                    content: `User limit has been updated to ${newLimit}.`,
                    ephemeral: true,
                });
            } catch (error) {
                console.error('Error setting user limit:', error);
                return interaction.reply({
                    content: 'There was an error updating the user limit.',
                    ephemeral: true,
                });
            }
        }
    },
};
