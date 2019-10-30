const express = require('express');
const graphqlHTTP = require('express-graphql'); //required for express server to understand graphql and allows it to run graphql api
const schema = require('./schema/schema');
const mongoose = require('mongoose');

const app = express();

//connect to mongo.atlas database
mongoose.connect(`mongodb+srv://guest:guest123@book-app-iw4yw.mongodb.net/test?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', () => {
    console.log('connected to database');
})


app.use('/graphql', graphqlHTTP({  //hands off any requests coming to /graphql to graphqlhttp to handle request (middleware)
    schema,                         //shorthand for object key and values being same schema:schema
    graphiql: true
}));

app.listen(4000, () => {
    console.log('now listening for requests on port 4000')
});