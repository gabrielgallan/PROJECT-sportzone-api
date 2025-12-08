import app from './app.ts'
import env from './infra/env/config.ts'

app.listen({
    port: env.PORT,
    host: '0.0.0.0'
}, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }

    console.log(`Server HTTP is running on ${address}`)
})