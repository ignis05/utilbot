module.exports = {
	apps: [
		{
			name: 'utilbot',
			script: 'index.js',

			// Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
			args: '',
			instances: 1,
			autorestart: true,
			watch: [],
			max_memory_restart: '1G',
		},
	],
}
