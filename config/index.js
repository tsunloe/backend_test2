module.exports = {
    name: 'Tested',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development',
    serverSettings: {
        port: process.env.PORT || 3000
    },
    dbSettings: {
        db: process.env.DB || "Backend",
        server: process.env.DB_SERVER || '127.0.0.1:27017',
        get url (){
             return `mongodb://${this.server}/${this.db}`
        }
    },
    tokenSettings: {
        publicKey: process.env.PUBLIC_KEY || 'Backend',
        accessTokenExpiry: 60 * 60 * 24 * 14, // 2 weeks.
        privateKey: process.env.PRIVATE_KEY || 'Backend',
        privateAccessTokenExpiry: 60 * 60, // 1 minute.
        privateRefreshTokenExpiry: 60000 * 60000, // 1 minute.
    }
}