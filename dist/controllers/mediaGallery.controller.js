"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAlbum = exports.updateAlbum = exports.createAlbum = exports.getAdminAlbums = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getAdminCategories = exports.deleteMedia = exports.updateMedia = exports.createVideo = exports.getAdminVideos = exports.createImage = exports.getAdminImages = exports.incrementLikes = exports.incrementViews = exports.getById = exports.getFeaturedVideos = exports.getFeaturedImages = exports.getPublicCategories = exports.getPublicAlbums = exports.getPublicVideos = exports.getPublicImages = void 0;
const mediaGallery_service_1 = require("../services/mediaGallery.service");
const service = new mediaGallery_service_1.MediaGalleryService();
// ==========================================
// Public Handlers
// ==========================================
const getPublicImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield service.getImages(req.query);
        res.status(200).json(Object.assign({ success: true, message: 'Retrieved images successfully' }, result));
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getPublicImages = getPublicImages;
const getPublicVideos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield service.getVideos(req.query);
        res.status(200).json(Object.assign({ success: true, message: 'Retrieved videos successfully' }, result));
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getPublicVideos = getPublicVideos;
const getPublicAlbums = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.getAlbums(req.query);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getPublicAlbums = getPublicAlbums;
const getPublicCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.getCategories();
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getPublicCategories = getPublicCategories;
const getFeaturedImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.getFeaturedImages();
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getFeaturedImages = getFeaturedImages;
const getFeaturedVideos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.getFeaturedVideos();
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getFeaturedVideos = getFeaturedVideos;
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.getById(req.params.id);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
});
exports.getById = getById;
const incrementViews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type } = req.body; // 'image' | 'video'
        yield service.incrementViews(req.params.id, type);
        res.status(200).json({ success: true, message: 'View incremented' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.incrementViews = incrementViews;
const incrementLikes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type } = req.body; // 'image' | 'video'
        yield service.incrementLikes(req.params.id, type);
        res.status(200).json({ success: true, message: 'Like incremented' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.incrementLikes = incrementLikes;
// ==========================================
// Admin Handlers
// ==========================================
// Image CRUD
const getAdminImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield service.getAdminImages(req.query);
        res.status(200).json(Object.assign({ success: true }, result));
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getAdminImages = getAdminImages;
const createImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.createImage(req.body);
        res.status(201).json({ success: true, message: 'Image created successfully', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.createImage = createImage;
// Video CRUD
const getAdminVideos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield service.getAdminVideos(req.query);
        res.status(200).json(Object.assign({ success: true }, result));
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getAdminVideos = getAdminVideos;
const createVideo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.createVideo(req.body);
        res.status(201).json({ success: true, message: 'Video created successfully', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.createVideo = createVideo;
// Media Update & Delete
const updateMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.updateMedia(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Media updated successfully', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.updateMedia = updateMedia;
const deleteMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield service.deleteMedia(req.params.id);
        res.status(200).json({ success: true, message: 'Media deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.deleteMedia = deleteMedia;
// Category CRUD
const getAdminCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield service.getAdminCategories(req.query);
        res.status(200).json(Object.assign({ success: true }, result));
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getAdminCategories = getAdminCategories;
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.createCategory(req.body);
        res.status(201).json({ success: true, message: 'Category created successfully', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.createCategory = createCategory;
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.updateCategory(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Category updated successfully', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.updateCategory = updateCategory;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield service.deleteCategory(req.params.id);
        res.status(200).json({ success: true, message: 'Category deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.deleteCategory = deleteCategory;
// Album CRUD
const getAdminAlbums = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield service.getAdminAlbums(req.query);
        res.status(200).json(Object.assign({ success: true }, result));
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getAdminAlbums = getAdminAlbums;
const createAlbum = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.createAlbum(req.body);
        res.status(201).json({ success: true, message: 'Album created successfully', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.createAlbum = createAlbum;
const updateAlbum = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service.updateAlbum(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Album updated successfully', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.updateAlbum = updateAlbum;
const deleteAlbum = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield service.deleteAlbum(req.params.id);
        res.status(200).json({ success: true, message: 'Album deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.deleteAlbum = deleteAlbum;
