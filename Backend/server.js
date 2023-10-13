const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://officialsabarinarayan:9447103050@cluster0.buyzcu4.mongodb.net/movie', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// Define a User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' }
});

const User = mongoose.model('User', userSchema);

// define Movie schema 

const movieSchema = new mongoose.Schema({
  movieName: {
    type: String,
    required: true,
  },
  image: {
    type: String, // You can store the image URL here
    required: true,
  },
  category: {
    type: String,
    enum: ['UA', 'A', 'PG', 'G'], // Example categories; modify as needed
    required: true,
  },
  languages: {
    type: [String], // Store languages as an array
    required: true,
  },
  cast: {
    type: [String], // Store cast members as an array
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  ticketRates: {
    type: Number,
    required: true,
  },
  seatsAvailable: {
    type: Number,
    required: true,
  },
  averageRating: {
    type: Number,
    default: 0, // You can initialize this to 0
  },
  ticketsSoldPerDay: {
    type: Number,
    default: 0, // You can initialize this to 0
  },
  movieTimings:{
    type: [String],
    required: true ,
  }
});

const Movie = mongoose.model('Movie', movieSchema);


// Register a new user
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

// user login
app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({ message: 'Login failed: User not found' });
        return;
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        // Generate a JWT token
        const token = jwt.sign({ userId: user._id, role: user.role , name: user.name}, '12345', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token }); // Send token in the response
      } else {
        res.status(401).json({ message: 'Login failed: Incorrect password' });
      }
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
  });

  // Movie CRUD

  //post:

  app.post('/api/movies', async (req, res) => {
    try {
      const {
        movieName,
        image,
        category,
        languages,
        cast,
        description,
        ticketRates,
        seatsAvailable,
        averageRating,
        ticketsSoldPerDay
      } = req.body;
  
      // Create a new movie document using your Movie model
      const newMovie = new Movie({
        movieName,
        image,
        category,
        languages,
        cast,
        description,
        ticketRates,
        seatsAvailable,
        averageRating,
        ticketsSoldPerDay
      });
  
      // Save the movie to the database
      await newMovie.save();
  
      res.status(201).json(newMovie); // Return the newly created movie document as a response
    } catch (error) {
      console.error('Error creating movie:', error);
      res.status(500).json({ error: 'An error occurred while creating the movie.' });
    }
  });

  // GET Movie :
  app.get('/api/movies', async (req, res) => {
    try {
      const movies = await Movie.find(); // Fetch all movies from the database
      res.json(movies);
    } catch (error) {
      console.error('Error fetching movies:', error);
      res.status(500).json({ error: 'An error occurred while fetching movies.' });
    }
  });
   
  //get movie by id

  // Example route to get a movie by ID
app.get('/api/movies/:id', async (req, res) => {
  try {
    const movieId = req.params.id;
    // Fetch the movie from your database by its ID
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie by ID:', error);
    res.status(500).json({ error: 'An error occurred while fetching movie by ID.' });
  }
});

  // Delete Movie

  app.delete('/api/movies/:id', async (req, res) => {
    try {
      await Movie.findByIdAndRemove(req.params.id);
      res.status(200).json({ message: 'Movie deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting Movie', error: error.message });
    }
  });
  
 //update movie
 app.put('/api/movies/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get the movie ID from the URL parameter
    const updatedMovieData = req.body; // Get the updated movie data from the request body

    // Find the movie by ID and update its details
    const updatedMovie = await Movie.findByIdAndUpdate(id, updatedMovieData, { new: true });

    if (!updatedMovie) {
      // If the movie with the given ID is not found, return a 404 error
      res.status(404).json({ message: 'Movie not found' });
      return;
    }

    // Respond with the updated movie object
    res.status(200).json(updatedMovie);
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ error: 'An error occurred while updating the movie.' });
  }
});


  const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

  