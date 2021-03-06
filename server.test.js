const mongoose = require('mongoose');
const chai = require('chai');
const { expect } = chai;
const sinon = require('sinon');
const server = require('./server');
const chaiHTTP = require('chai-http');

const Game = require('./models');

chai.use(chaiHTTP);

describe('Games', () => {
  before(done => {
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/test');
    const db = mongoose.connection;
    db.on('error', () => console.error.bind(console, 'connection error'));
    db.once('open', () => {
      console.log('we are connected');
      done();
    });
  });

  after(done => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(done);
      console.log('we are disconnected');
    });
  });
  // declare some global variables for use of testing
  // hint - these wont be constants because you'll need to override them.
  let gameId = null;
  let testGame = null;
  beforeEach(done => {
    // write a beforeEach hook that will populate your test DB with data
    // each time this hook runs, you should save a document to your db
    // by saving the document you'll be able to use it in each of your `it` blocks
    const myGame = new Game({
      title: 'Star Wars',
      genre: 'action',
      releaseDate: 'May 2018'
    });
    myGame
      .save()
      .then(game => {
        testGame = game;
        gameId = game._id;
        done();
      })
      .catch(err => {
        console.error(err);
        done();
      });
  });

  afterEach(done => {
    // simply remove the collections from your DB.
    Game.remove({}, err => {
      if (err) console.error(err);
      done();
    });
  });

  // test the POST here
  describe(`[POST] /api/game/create`, () => {
    it(`should add a new game`, done => {
      const myGame = {
        title: 'California Games',
        genre: 'Sports',
        releaseDate: 'June 1987'
      };
      chai
        .request(server)
        .post('/api/game/create')
        .send(myGame)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.title).to.equal('California Games');
          done();
        });
    });
    it(`should send back 422 upon bad data`, done => {
      const myGame = {
        itle: 'California Games',
        genre: 'Sports',
        releaseDate: 'June 1987'
      };
      chai
        .request(server)
        .post('/api/game/create')
        .send(myGame)
        .end((err, res) => {
          if (err) {
            expect(err.status).to.equal(422);
            done();
          }
        });
    });
  })

  // test the GET here
  describe(`[GET] /api/game/get`, () => {
      it('should render the list of games', done => {
        chai
          .request(server)
          .get('/api/game/get')
          .end((err, res) => {
            if (err) {
              throw new Error(err);
              done();
            }
            expect(res.body[0].title).to.eql(testGame.title);
            expect(res.body[0]._id).to.equal(gameId.toString());
            done();
          });
      });
    });
  // test the PUT here
  describe(`[PUT] /api/game/update`, () => {
    it('update given id and some text', done => {
      const gameUpdate = {
        id: gameId,
        title: 'Sta Wars',
        releaseDate: 'June 2018',
        genre: 'Romantic comedy game'
      };
      chai
        .request(server)
        .put('/api/game/update')
        .send(gameUpdate)
        .end((err, res) => {
          if (err) {
            throw new Error(err);
            done();
          }
          expect(res.body.title).to.equal(gameUpdate.title);
          done();
        });
    });

    it('handle error if bad id sent', done => {
      const gameUpdate = {
        id: 'asdfasdf',
        name: 'Sta Wars',
        releaseDate: 'June 2018',
        genre: 'Romantic comedy game'
      };
      chai
        .request(server)
        .put('/api/game/update')
        .send(gameUpdate)
        .end((err, res) => {
          if (err) {
            expect(err.status).to.equal(422);
            const { error } = err.response.body;
            expect(error).to.eql('Must Provide a title && Id');
          }
          done();
        });
    });
  });
  // --- Stretch Problem ---
  // Test the DELETE here
});
