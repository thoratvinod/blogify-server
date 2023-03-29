import mongoose from 'mongoose';

const blogSchema = mongoose.Schema({
    title: String,
    content: String,
    name: String,
    creator: String,
    tags: [String],
    selectedFile: String,
    likes: { type: [String], default: [] },
    comments: { type: [String], default: [] },
    createdAt: {
        type: Date,
        default: new Date(),
    },
})

export default mongoose.model('Blog', blogSchema);