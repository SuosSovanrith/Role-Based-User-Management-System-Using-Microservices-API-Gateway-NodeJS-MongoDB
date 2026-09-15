const schema_mongoose = require('mongoose');

const UserSchema = schema_mongoose.Schema(
    {
       _id: {type: Number},
       name: { type: String },
       email: { type: String, required: true, unique: true },
       password: { type: String },
       phone: { type: Number },
       role: { type: String },
       createdAt: { type: Date, default: Date.now },
       updatedAt: { type: Date, default: Date.now }
    }, 
    {
       timestamps: true
    }
    );

module.exports = schema_mongoose.model('user_collection', UserSchema);