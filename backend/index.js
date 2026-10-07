const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const frontendDir = path.join(__dirname, '..', 'darcknode', 'ciphergrid');

function readJson(filePath) {
  try {
    return require(filePath);
  } catch (error) {
    return [];
  }
}

const courses = readJson(path.join(__dirname, 'data', 'courses.json'));
const labs = readJson(path.join(__dirname, 'data', 'labs.json'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CipherGrid backend is running' });
});

app.get('/api/courses', (req, res) => {
  res.json(courses);
});

app.get('/api/courses/:id', (req, res) => {
  const course = courses.find((item) => item.id === req.params.id);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  res.json(course);
});

app.get('/api/labs', (req, res) => {
  res.json(labs);
});

app.get('/api/labs/:id', (req, res) => {
  const lab = labs.find((item) => item.id === req.params.id);
  if (!lab) {
    return res.status(404).json({ message: 'Lab not found' });
  }
  res.json(lab);
});

app.use(express.static(frontendDir));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`CipherGrid backend running on http://localhost:${PORT}`);
});
