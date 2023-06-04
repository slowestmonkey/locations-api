# Location Demo API

Demo API to handle city/location requests (e.g. calculating by distance, fetching by area).

Implemented with Nest.js, didn't work with it for while so decided to use the opportunity.

# Operations

## Installation

1. Install [node.js](https://nodejs.org/en/) and [yarn](https://www.npmjs.com/package/yarn)
1. Run `yarn` in the project root to install the dependencies

## Building

To build the project, run `yarn build`.

## Running

To run the project, run `yarn start`.

To run and watch the project, run `yarn start:dev`.

## Testing

To run the tests, run `yarn test:e2e`.

### Todo

- add proper validation and DTOs for representation layer
- use different for prod and testing, add unit tests
- add config module and service (e.g. for storing `dbConnectionString` and server params, like host address)
- improve auth checks
- enhance error handling (e.g. throw `NotFound` if distance calculation location is not found)
- add Swagger documentation
