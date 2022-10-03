const authResolver = require("./auth");
const eventResolver = require("./event");
const bookingResolver = require("./booking");

// Coz in old version Apollo see only last exported resolver
const mergeResolvers = (resolvers) => {
    const mergedResolvers = {
      Query: {},
      Mutation: {},
    };
  
    for (const { Query, Mutation } of resolvers) {
      for (const key in Query) {
        mergedResolvers.Query[key] = Query[key];
      }
      for (const key in Mutation) {
        mergedResolvers.Mutation[key] = Mutation[key];
      }
    }
    return mergedResolvers;
  }
const rootResolver = mergeResolvers([authResolver, eventResolver, bookingResolver]);

module.exports = rootResolver;
