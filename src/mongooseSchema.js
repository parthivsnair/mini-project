const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/your-database-name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['patient', 'doctor'], required: true },
    email: { type: String },
    createdAt: { type: Date, default: Date.now },
  });
  
  const User = mongoose.model('User', userSchema);