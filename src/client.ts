import { Client, GatewayIntentBits, User } from 'discord.js'
require('dotenv').config()

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] })

client.on('ready', async () => {
	if (!client.application) return console.error('not application')
	await client.application.fetch()
	if (!(client.application.owner instanceof User)) return
	client.application.owner.send('utilbot running').catch((err) => {
		console.log(`failed to send startup message to bot owner: ${err}`)
	})
	console.log('Ready!')
})

client.login()

export default client
