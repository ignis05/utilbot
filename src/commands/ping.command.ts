import { CommandInteraction, SlashCommandBuilder } from 'discord.js'

module.exports = {
	data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
	async execute(interaction: CommandInteraction) {
		let latency = Date.now() - interaction.createdTimestamp
		let msg = `Pong! (${latency}ms)`
		console.log(msg)
		await interaction.reply(msg)
	},
}
