const mongoose = require('mongoose');
const chalk = require('chalk');

async function connect() {
    mongoose.set('strictQuery', false);
    try {
        const connectionString = process.env.MONGO_URI || process.env.MONGO_TOKEN;
        if (!connectionString) {
            console.log(chalk.red(`[MISSING CONFIG]`), chalk.white(`>>`), chalk.yellow(`MongoDB connection string not found.`));
            console.log(chalk.blue(`[DIAGNOSTICS]`), chalk.white(`>>`), chalk.yellow(`Available process.env keys: ${Object.keys(process.env).join(', ')}`));
            console.log(chalk.blue(`[INSTRUCTION]`), chalk.white(`>>`), chalk.green(`Please ensure you have saved 'MONGO_URI' in your Render Environment Variables.`));
            throw new Error("MONGO_URI environment variable is missing.");
        }
        console.log(chalk.blue(chalk.bold(`Database`)), (chalk.white(`>>`)), chalk.red(`MongoDB`), chalk.green(`is connecting... (Attempting connection)`))
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000 // 10 seconds timeout
        });
        console.log(chalk.blue(chalk.bold(`Database`)), (chalk.white(`>>`)), chalk.red(`MongoDB`), chalk.green(`successfully connected!`))
    } catch (err) {
        console.log(chalk.red(`[ERROR]`), chalk.white(`>>`), chalk.red(`MongoDB`), chalk.white(`>>`), chalk.red(`Failed to connect to MongoDB!`), chalk.white(`>>`), chalk.red(`Error: ${err}`))
        console.log(chalk.red("Exiting..."))
        process.exit(1)
    }


    mongoose.connection.once("open", () => {
        console.log(chalk.blue(chalk.bold(`Database`)), (chalk.white(`>>`)), chalk.red(`MongoDB`), chalk.green(`is ready!`))
    });

    mongoose.connection.on("error", (err) => {
        console.log(chalk.red(`[ERROR]`), chalk.white(`>>`), chalk.red(`Database`), chalk.white(`>>`), chalk.red(`Failed to connect to MongoDB!`), chalk.white(`>>`), chalk.red(`Error: ${err}`))
        console.log(chalk.red("Exiting..."))
        process.exit(1)
    });
    return;
}

module.exports = connect