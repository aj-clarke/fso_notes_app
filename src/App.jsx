import { useState, useEffect } from 'react';
import Note from './components/Note';
import Notification from './components/Notification';
import Footer from './components/Footer';
import noteService from './services/notes'


const App = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [showAll, setShowAll] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    noteService
      .getAll()
      .then(initialNotes => {
        setNotes(initialNotes)
      })
  }, []);

  console.log('render', notes.length, 'notes')

  const addNote = (event) => {
    event.preventDefault();
    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5,
    }
    
    noteService
      .create(noteObject)
      .then(returnedNote => {
        setNotes(notes.concat(returnedNote))
        setNewNote('')
      })
  }

  const toggleImportanceOf = (id) => {
    const note = notes.find(note => note.id === id)
    const changedNote = { ...note, important: !note.important }

    noteService
      .update(id, changedNote)
      .then(returnedNote => {
        setNotes(notes.map(note => note.id === id ? returnedNote : note))
      })
      .catch(error => {
        setErrorMessage(
          `Note '${note.content}' was already deleted from the server`
        )
        setTimeout(() => {
          setErrorMessage(null)
        }, 10000)
        setNotes(notes.filter(note => note.id != id))
      })
  }

  const notesToShow = showAll ? notes : notes.filter(note => note.important);

  const handleNoteChange = (event) => {
    setNewNote(event.target.value);
  }

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />
      <div>
        <button onClick={ () => setShowAll(!showAll) }>
          show { showAll ? 'important' : 'all' }
        </button>
      </div>
      <ul>
        {notesToShow.map(note => 
          <Note
            key={note.id}
            note={note}
            toggleImportance={() => toggleImportanceOf(note.id)}
          />
        )}
      </ul>
      <form onSubmit={addNote}>
        <input
          value={newNote}
          placeholder='add note here'
          onChange={handleNoteChange}
        />
        <button type='submit'>save</button>
      </form>
      <div>debug: {newNote}</div>
      <Footer />
    </div>
  )
}

export default App;