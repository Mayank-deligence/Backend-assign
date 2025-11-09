const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: Schema.Types.ObjectId, required: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Progress', ProgressSchema);