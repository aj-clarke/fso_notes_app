require('dotenv').config()
const express = require('express');
const app = express();
const Note = require('./models/note');

app.use(express.static('dist'));
app.use(express.json());

// DO NOT SAVE YOUR PASSWORD TO GITHUB!!
// const password = process.argv[2];
// const url = `mongodb+srv://fullstack:${password}@cluster0.rt5gniz.mongodb.net/noteApp?
// retryWrites=true&w=majority&appName=Cluster0`

// mongoose.set('strictQuery',false);
// mongoose.connect(url);

// const noteSchema = new mongoose.Schema({
//   content: String,
//   important: Boolean,
// });

// noteSchema.set('toJSON', {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject._id.toString();
//     delete returnedObject._id;
//     delete returnedObject.__v;
//   }
// });

// const Note = mongoose.model('Note', noteSchema);
// app.use(cors());


// let notes = [
//   {
//     id: "1",
//     content: "HTML is easy",
//     important: true
//   },
//   {
//     id: "2",
//     content: "Browser can execute only JavaScript",
//     important: false
//   },
//   {
//     id: "3",
//     content: "GET and POST are the most important methods of HTTP protocol",
//     important: true
//   }
// ]

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:', request.path);
  console.log('Body:', request.body);
  console.log('---');
  next();
}

app.use(requestLogger);

// helper functions

// generate unique id for a note
// const generateId = () => {
//   const maxId = notes.length > 0
//   ? Math.max(...notes.map(note => Number(note.id)))
//   : 0;

//   return String(maxId + 1)
// }

// routes

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
});

app.get('/api/notes', (request, response) => {
  Note.find({})
    .then(notes => {
        response.json(notes);
    })
    .catch(error => next());
});

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.post('/api/notes', (request, response, next) => {
  const body = request.body;

  const note = new Note({
    content: body.content,
    important: body.important || false,
    // id: generateId(),
  });

  console.log(note);
  // notes = notes.concat(note);

  note.save()
    .then(savedNote => {
    response.json(savedNote);
    })
    .catch(error => next(error));
});

app.put('/api/notes/:id', (request, response, next) => {
  const { content, important } = request.body;

  Note.findById(request.params.id)
    .then(note => {
      if (!note) {
        return response.status(404).end();
      }

      note.content = content;
      note.important = important;

      return note.save().then(updatedNote => {
        response.json(updatedNote);
      });
    })
    .catch(error => next(error));
})

app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
  // const id = request.params.id;
  // notes = notes.filter(note => note.id !== id);

  // response.status(204).end();
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unkown endpoint' });
}

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  // if error is not matched above, all other errors are passed to the
  // default error handler via `next(error)` below
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});