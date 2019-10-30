const graphql = require('graphql');
const _ = require('lodash');
const Book = require('../models/book');
const Author = require('../models/author');

//grab object data structure from graphql
const { GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull
} = graphql;


const AuthorType = new GraphQLObjectType({
    name: 'Author',  //<--name of model so to speak
    fields: () => ({ //using feilds function stops reerence errors later on when dealing with different types and when order matters..we cant execute types before they are declared...this gives js time to find everything before it executes the function
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        books: { //use graphqllist for has many relationship
            type: new GraphQLList(BookType),
            resolve(parent, args) {
                //sue filter instead of find to return match on multiple objects returns array of objects

                // return _.filter(books, { authorId: parent.id })
                return Book.find({ authorId: parent.id });
            }
        }
    })
});
// create a new graphqlobjecttype named book type and define its props
const BookType = new GraphQLObjectType({
    name: 'Book',  //<--name of model so to speak
    fields: () => ({ //using feilds function stops reerence errors later on when dealing with different types and when order matters (relationships)
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        genre: { type: GraphQLString },
        author: {
            type: AuthorType,
            resolve(parent, args) {

                // return _.find(authors, { id: parent.authorId });

                return Author.findById(parent.authorId);
            }
        }
    })
});


//how we initially jump into the graph to grab stuff is the rootquery //this is client side query set up
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: { //order doesnt matter here we are just reaching out and grabbing whatever dont need function
        book: { //this is name of what you will be callign from front end when making a graphql request
            type: BookType,
            args: { id: { type: GraphQLID } }, //handles what is the payload going to be details of query
            resolve(parent, args) {
                //code to get data from db /other source
                //i.e. args.id will now go to query our database and grab the book with that id
                //_find lodash function will find us the book we want and return it based on args.id
                // return _.find(books, { id: args.id });
                return Book.findById(args.id);
            }
        },
        author: {
            type: AuthorType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return Author.findById(args.id);
            }
        },
        books: { //returns all books
            type: new GraphQLList(BookType),
            resolve(parent, args) {
                return Book.find({})
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent, args) {
                return Author.find({})
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addAuthor: {
            type: AuthorType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) }
            },
            resolve(parent, args) {
                let author = new Author({
                    name: args.name,
                    age: args.age
                });
                return author.save();

            },
        },
        addBook: {
            type: BookType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                genre: { type: new GraphQLNonNull(GraphQLString) },
                authorId: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                let book = new Book({
                    name: args.name,
                    genre: args.genre,
                    authorId: args.authorId
                });
                return book.save();
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});