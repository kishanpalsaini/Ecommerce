const mongoose = require("mongoose")


const connectDatabase = () => {
    mongoose.connect(process.env.DB_URI,
    //      {
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true,
    //     useCreateIndex: true,
    // }
    ).then((data) => {
        console.log(`monogo db connected with server: ${data.connection.host}`)
    })
}

module.exports = connectDatabase;

// export PATH="$PATH:/opt/homebrew/bin/"