import Article from '../models/Article.js';

// @desc    Get all published articles (public)
// @route   GET /api/articles
// @access  Public
export const getArticles = async (req, res) => {
  try {
    const { category, tag, page = 1, limit = 10 } = req.query;

    const filters = { status: 'published' };

    if (category) {
      filters.category = category;
    }

    if (tag) {
      filters.tags = tag;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const articles = await Article.find(filters)
      .populate('author', 'firstName lastName')
      .select('-content')
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Article.countDocuments(filters);

    res.status(200).json({
      success: true,
      count: articles.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: { articles }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener artículos',
      error: error.message
    });
  }
};

// @desc    Get single article by slug (public)
// @route   GET /api/articles/:slug
// @access  Public
export const getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOne({ 
      slug: req.params.slug,
      status: 'published'
    }).populate('author', 'firstName lastName');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado'
      });
    }

    // Increment views
    article.views += 1;
    await article.save();

    res.status(200).json({
      success: true,
      data: { article }
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener artículo',
      error: error.message
    });
  }
};

// @desc    Get all articles for admin (including drafts)
// @route   GET /api/articles/admin
// @access  Private (Admin only)
export const getAdminArticles = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;

    const filters = {};

    if (status) {
      filters.status = status;
    }

    if (category) {
      filters.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const articles = await Article.find(filters)
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Article.countDocuments(filters);

    res.status(200).json({
      success: true,
      count: articles.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: { articles }
    });
  } catch (error) {
    console.error('Error fetching admin articles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener artículos',
      error: error.message
    });
  }
};

// @desc    Get single article by ID for admin
// @route   GET /api/articles/admin/:id
// @access  Private (Admin only)
export const getAdminArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'firstName lastName');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: { article }
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener artículo',
      error: error.message
    });
  }
};

// @desc    Create new article
// @route   POST /api/articles
// @access  Private (Admin only)
export const createArticle = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      status,
      tags
    } = req.body;

    const articleData = {
      title,
      excerpt,
      content,
      featuredImage,
      category,
      status: status || 'draft',
      tags: tags || [],
      author: req.user._id
    };

    if (slug) {
      articleData.slug = slug;
    }

    const article = await Article.create(articleData);

    res.status(201).json({
      success: true,
      message: 'Artículo creado exitosamente',
      data: { article }
    });
  } catch (error) {
    console.error('Error creating article:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un artículo con ese slug'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear artículo',
      error: error.message
    });
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private (Admin only)
export const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado'
      });
    }

    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      status,
      tags
    } = req.body;

    if (title) article.title = title;
    if (slug) article.slug = slug;
    if (excerpt) article.excerpt = excerpt;
    if (content) article.content = content;
    if (featuredImage !== undefined) article.featuredImage = featuredImage;
    if (category) article.category = category;
    if (status) article.status = status;
    if (tags) article.tags = tags;

    await article.save();

    res.status(200).json({
      success: true,
      message: 'Artículo actualizado exitosamente',
      data: { article }
    });
  } catch (error) {
    console.error('Error updating article:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un artículo con ese slug'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar artículo',
      error: error.message
    });
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private (Admin only)
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado'
      });
    }

    await article.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Artículo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar artículo',
      error: error.message
    });
  }
};

// @desc    Toggle article status (draft/published)
// @route   PUT /api/articles/:id/toggle-status
// @access  Private (Admin only)
export const toggleArticleStatus = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado'
      });
    }

    article.status = article.status === 'published' ? 'draft' : 'published';
    
    if (article.status === 'published' && !article.publishedAt) {
      article.publishedAt = new Date();
    }

    await article.save();

    res.status(200).json({
      success: true,
      message: article.status === 'published' ? 'Artículo publicado' : 'Artículo despublicado',
      data: { article }
    });
  } catch (error) {
    console.error('Error toggling article status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del artículo',
      error: error.message
    });
  }
};

// @desc    Get article categories
// @route   GET /api/articles/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Article.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
};
