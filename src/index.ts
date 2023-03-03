import fs from 'fs'
import path from 'path'
import { Collection, Events } from 'discord.js'
import client from './client'
import { Command } from './types'

// read and register commands
const COMMANDS = new Collection<string, Command>()
client.once(Events.ClientReady, () => {
	const commandsPath = path.join(__dirname, 'commands')
	const commandFiles = fs.readdirSync(commandsPath).filter((file: any) => file.endsWith('.command.ts'))
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file)
		const command = require(filePath)
		if ('data' in command && 'execute' in command) {
			COMMANDS.set(command.data.name, command)
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
		}
	}
	console.log(`Loaded and registered ${commandFiles.length} commands`)
})

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return

	const command = COMMANDS.get(interaction.commandName)

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`)
		return
	}

	try {
		command.execute(interaction)
	} catch (error) {
		console.error(error)
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true })
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
		}
	}
})
