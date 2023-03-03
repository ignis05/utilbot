import fs from 'fs'
import path from 'path'
import { Collection, Events, REST, Routes } from 'discord.js'
import client from './client'
import { Command } from './types'

require('dotenv').config()
if (!process.env.DISCORD_TOKEN) throw 'No token'

// read commands
const COMMANDS = new Collection<string, Command>()
client.once(Events.ClientReady, () => {
	const commandsPath = path.join(__dirname, 'commands')
	const commandFiles = fs.readdirSync(commandsPath).filter((file: any) => file.endsWith('.js') || file.endsWith('.ts'))
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file)
		const command = require(filePath)
		if ('data' in command && 'execute' in command) {
			COMMANDS.set(command.data.name, command)
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
		}
	}
	console.log(`Loaded ${commandFiles.length} commands`)
})

// register commands
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN)
client.once(Events.ClientReady, async () => {
	if (!client.user) throw 'no clientUser'
	try {
		await rest.put(Routes.applicationCommands(client.user.id), { body: COMMANDS.map((cmd) => cmd.data.toJSON()) })
	} catch (error) {
		console.error(error)
	}
	console.log(`Registered ${COMMANDS.size} commands for client ${client.user.tag}`)
})

// handle commands
client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) return

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
