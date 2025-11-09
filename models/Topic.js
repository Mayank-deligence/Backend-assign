const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProblemSchema = new Schema({
  title: String,
  level: String,
  leetcodeLink: String,
  codeforcesLink: String,
  youtubeLink: String,
  articleLink: String
}, { timestamps: true });

const TopicSchema = new Schema({
  title: String,
  description: String,
  problems: [ProblemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Topic', TopicSchema);