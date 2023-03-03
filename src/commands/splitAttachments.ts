import {
	CommandInteraction,
	Events,
	ContextMenuCommandBuilder,
	ApplicationCommandType,
	ContextMenuCommandInteraction,
	Attachment,
	AttachmentBuilder,
	DiscordAPIError,
	TextChannel,
	PermissionFlagsBits,
} from 'discord.js'
import stream from 'stream'

// import client from '../client'
// client.on(Events.MessageCreate, (msg) => {
// 	if (msg.author.bot) return
// 	if (!msg.guild) return
// })

module.exports = {
	data: new ContextMenuCommandBuilder().setName('Split Attachments').setType(ApplicationCommandType.Message).setDMPermission(false),
	async execute(interaction: ContextMenuCommandInteraction) {
		let msg = interaction.options.getMessage('message')

		if (!msg) throw 'Interaction has no message'
		if (!msg.guild?.members.me) throw 'no guild or not a guild member'
		if (msg.attachments.size === 0) return interaction.reply({ content: `This message has no attachments.`, ephemeral: true })
		if (msg.attachments.size === 1) return interaction.reply({ content: `This message has one attachment.`, ephemeral: true })

		let channel = msg.channel as TextChannel
		if (!channel.permissionsFor(msg.guild.members.me).has(PermissionFlagsBits.SendMessages ^ PermissionFlagsBits.AttachFiles))
			return interaction.reply({ content: `Missing permission to send messages or attachments` })

		await interaction.deferReply()

		for (let [name, attachment] of msg.attachments) {
			await interaction.followUp({ content: '', files: [attachment], allowedMentions: { users: [] } })
		}

		if (msg.deletable) {
			await interaction.editReply(`Separated attachments from ${msg.author}'s message:`)
			await msg.delete()
		} else {
			await interaction.editReply(`Separated attachments from ${msg?.author}'s message: (missing permissions to prune original message)`)
		}
	},
}
