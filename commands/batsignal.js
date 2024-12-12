const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const sharp = require('sharp'); // sharp is now used to convert image formats

module.exports = {
    data: new SlashCommandBuilder()
        .setName('batsignal')
        .setDescription('Generate a simple Batman signal with your profile picture.'),

    async execute(interaction) {
        try {
            // Defer reply to process the command
            await interaction.deferReply();

            // Get the user's profile picture URL
            const avatarURL = interaction.user.displayAvatarURL({ format: 'png', size: 128 });

            // Create a canvas
            const canvas = Canvas.createCanvas(500, 500);
            const ctx = canvas.getContext('2d');

            // Fill the background with a night sky color
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const batSignalImageURL = 'https://static.wikia.nocookie.net/dcanimated/images/b/b5/Bat-signal.png/revision/latest?cb=20191204230049';
            const batSignalResponse = await fetch(batSignalImageURL);
            const batSignalBuffer = await batSignalResponse.arrayBuffer();  // Use arrayBuffer() instead of buffer()
            const batSignal = await Canvas.loadImage(Buffer.from(batSignalBuffer));  // Convert ArrayBuffer to Buffer

            // Draw the Batman signal light (full background)
            ctx.drawImage(batSignal, 0, 0, canvas.width, canvas.height);

            // Load the user's avatar using node-fetch
            const avatarResponse = await fetch(avatarURL);
            const avatarBuffer = await avatarResponse.arrayBuffer();  // Use arrayBuffer() for the avatar
            const avatarBufferConverted = Buffer.from(avatarBuffer);  // Convert ArrayBuffer to Buffer

            // Process the avatar image with sharp to ensure compatibility and convert to PNG
            const processedAvatarBuffer = await sharp(avatarBufferConverted)
                .resize(230, 230, { fit: 'cover' })  // Resize the avatar to 230px x 230px (to fill the larger circle)
                .toFormat('png')   // Convert to PNG format
                .toBuffer();

            // Load the processed avatar as PNG
            const avatar = await Canvas.loadImage(processedAvatarBuffer);

            // Draw the user's avatar in the Batman signal (centered and within the larger circle)
            ctx.save();
            ctx.beginPath();
            const circleRadius = 115;  // Set the circle radius to 115px (230px diameter)
            ctx.arc(250, 150, circleRadius, 0, Math.PI * 2);  // Create the circle for the avatar
            ctx.closePath();
            ctx.clip();

            // Center the image in the circle (230px diameter)
            const xPos = 250 - circleRadius;  // X-coordinate to center the avatar inside the circle
            const yPos = 150 - circleRadius;  // Y-coordinate to center the avatar inside the circle

            // Draw the image centered inside the circle
            ctx.drawImage(avatar, xPos, yPos, circleRadius * 2, circleRadius * 2);  // Avatar will now fill the circle
            ctx.restore();

            // Add the caption "Gotham needs {username}" below the signal with bold and italic
            ctx.fillStyle = 'white';
            ctx.font = 'italic bold 30px sans-serif';  // Make text bold, italic, and bigger (30px)
            ctx.textAlign = 'center';
            const captionText = `Gotham needs ${interaction.user.username}`;
            ctx.fillText(captionText, canvas.width / 2, 450);  // Position the text below the circle

            // Send the image
            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'batsignal.png' });
            await interaction.editReply({ files: [attachment] });
        } catch (error) {
            console.error('Error generating Batman signal:', error);
            await interaction.editReply('An error occurred while generating the Batman signal.');
        }
    },
};
