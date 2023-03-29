import express from 'express';
import mongoose from 'mongoose';

import BlogModal from '../models/Blog.js';

const router = express.Router();

export const getBlogs = async (req, res) => {
    const { page } = req.query;
    
    try {
        const LIMIT = 8;
        const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page
    
        const total = await BlogModal.countDocuments({});
        const blogs = await BlogModal.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex);

        res.json({ data: blogs, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)});
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}

export const getBlogsBySearch = async (req, res) => {
    const { searchQuery, tags } = req.query;

    try {
        const title = new RegExp(searchQuery, "i");

        const blogs = await BlogModal.find({ $or: [ { title }, { tags: { $in: tags.split(',') } } ]});

        res.json({ data: blogs });
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}

export const getBlogsByCreator = async (req, res) => {
    const { name } = req.query;

    try {
        const blogs = await BlogModal.find({ name });

        res.json({ data: blogs });
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}

export const getBlog = async (req, res) => { 
    const { id } = req.params;

    try {
        const blog = await BlogModal.findById(id);
        
        res.status(200).json(blog);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createBlog = async (req, res) => {
    const blog = req.body;

    const newBlog = new BlogModal({ ...blog, creator: req.userId, createdAt: new Date().toISOString() })

    try {
        await newBlog.save();

        res.status(201).json(newBlog);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const updateBlog = async (req, res) => {
    const { id } = req.params;
    const { title, content, creator, selectedFile, tags } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No blog with id: ${id}`);

    const updatedBlog = { creator, title, content, tags, selectedFile, _id: id };

    await BlogModal.findByIdAndUpdate(id, updatedBlog, { new: true });

    res.json(updatedBlog);
}

export const deleteBlog = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No blog with id: ${id}`);

    await BlogModal.findByIdAndRemove(id);

    res.json({ message: "Blog deleted successfully." });
}

export const likeBlog = async (req, res) => {
    const { id } = req.params;

    if (!req.userId) {
        return res.json({ message: "Unauthenticated" });
      }

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No blog with id: ${id}`);
    
    const blog = await BlogModal.findById(id);

    const index = blog.likes.findIndex((id) => id ===String(req.userId));

    if (index === -1) {
      blog.likes.push(req.userId);
    } else {
      blog.likes = blog.likes.filter((id) => id !== String(req.userId));
    }

    const updatedBlog = await BlogModal.findByIdAndUpdate(id, blog, { new: true });

    res.status(200).json(updatedBlog);
}

export const commentBlog = async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;

    const blog = await BlogModal.findById(id);

    blog.comments.push(value);

    const updatedBlog = await BlogModal.findByIdAndUpdate(id, blog, { new: true });

    res.json(updatedBlog);
};

export default router;