import express from 'express';
import slugify from 'slugify';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import Post from '../models/schema.js';
import multer from 'multer';
//SEO-friendly URLs (slugs)?
// An SEO-friendly URL includes a readable, descriptive slug — 
// the part of the URL that identifies a specific post — and improves both user 
// experience and search engine visibility.
const router = express.Router();

// Create DOM purify instance
//required to use sanitize function to avoid any <script> tags in the content
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Helper function to generate unique slug
const generateUniqueSlug = async (title, excludeId = null) => {
  let baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = excludeId 
      ? { slug, _id: { $ne: excludeId } }
      : { slug };
    
    const existingPost = await Post.findOne(query);
    if (!existingPost) break;
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// Helper function to calculate read time
const calculateReadTime = (content) => {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

// Helper function to generate excerpt
const generateExcerpt = (content, maxLength = 150) => {
  const textContent = content.replace(/<[^>]*>/g, '');
  return textContent.length > maxLength 
    ? textContent.substring(0, maxLength) + '...'
    : textContent;
};

// GET /api/posts - Get all posts
// This route fetches paginated, published blog posts, sorted by newest first, and returns basic post 
// info (excluding full content) along with pagination metadata.

// ip 
// http://localhost:3001/api/posts?page=2&limit=5

//op {
//   "posts": [],
//   "pagination": {
//     "current": 2,
//     "pages": 1,
//     "total": 2
//   }
// }
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ published: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ published: true })
    ]);

    const postsWithImages = posts.map(post => {
      let image = null;
      if (post.image?.data && post.image?.contentType) {
        const base64 = post.image.data.toString('base64');
        image = `data:${post.image.contentType};base64,${base64}`;
      }

      return {
        _id: post._id,
        title: post.title,
        excerpt: post.excerpt,
        slug: post.slug,
        author: post.author,
        createdAt: post.createdAt,
        readTime: post.readTime,
        tags: post.tags,
        image, // ✅ base64 string
      };
    });

    res.json({
      posts: postsWithImages,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});






//returns all posts excluding content
// GET /api/posts/admin - Get all posts for admin (including drafts)
router.get('/admin', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .select('-content');

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// router.post('/user', async (req, res) => {
//   const { clerkUserId } = req.body;
//   if (!clerkUserId) {
//     return res.status(400).json({ error: 'Missing clerkUserId' });
//   }

//   try {
//     const posts = await PostModel.find({ clerkUserId });
//     res.json({posts});
//     console.log(posts);
//   } catch (err) {
//     res.status(500).json({ error: err });
//   }
// });
router.post('/user', async (req, res) => {
  const { clerkUserId } = req.body;

  if (!clerkUserId || typeof clerkUserId !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing clerkUserId' });
  }

  try {
    const posts = await Post.find({ clerkUserId });
    res.json({ posts }); // send wrapped in object for clarity
  } catch (err) {
    console.error(' Error fetching posts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


//returns a single blog based on that slug 
// GET /api/posts/:slug - Get single post by slug
// router.get('/:slug', async (req, res) => {
//   try {
//     const post = await Post.findOne({ 
//       slug: req.params.slug,
//       published: true 
//     });

//     if (!post) {
//       return res.status(404).json({ error: 'Post not found' });
//     }

//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({
      slug: req.params.slug,
      published: true
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postWithImage = {
      ...post.toObject(),
      image: post.image?.data
        ? `data:${post.image.contentType};base64,${post.image.data.toString('base64')}`
        : null
    };

    res.json(postWithImage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




//create a new post where title, content, author,CLERKUSERID are required
// op{
//   "title": "nah",
//   "content": "halo",
//   "slug": "nah",
//   "excerpt": "halo",
//   "author": "tata",
//   "published": true,
//   "tags": [],
//   "readTime": 1,
//   "clerkUserId": "23",
//   "_id": "685faf75b9e898b5f21df894",
//   "createdAt": "2025-06-28T09:01:41.980Z",
//   "updatedAt": "2025-06-28T09:01:41.980Z",
//   "__v": 0
// }
// POST /api/posts - Create new post
// router.post('/', async (req, res) => {
//   try {
//     const { title, content, author, published = true, tags = [] ,clerkUserId} = req.body;

//     if (!title || !content || !author) {
//       return res.status(400).json({ 
//         error: 'Title, content, and author are required' 
//       });
//     }

//     // Sanitize content
//     //here since i am gonna display the content as html i need to sanitize it i.e avoid any <script> tags
//     const sanitizedContent = purify.sanitize(content);
    
//     // Generate unique slug
//     const slug = await generateUniqueSlug(title);
    
//     // Calculate read time and generate excerpt
//     const readTime = calculateReadTime(sanitizedContent);
//     const excerpt = generateExcerpt(sanitizedContent);

//     const post = new Post({
//       title: title.trim(),//removes any leading or trailing spaces(extra spaces)
//       content: sanitizedContent,
//       slug,
//       excerpt,
//       author: author.trim(),
//       published,
//       tags: tags.map(tag => tag.trim()),
//       readTime,
//       clerkUserId
//     });

//     await post.save();

//     res.status(201).json(post);
//   } catch (error) {
    
//       res.status(500).json({ error: error.message });
    
//   }
// });


// Setup multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      content,
      author,
      published = true,
      tags = '[]',
      clerkUserId
    } = req.body;

    if (!title || !content || !author) {
      return res.status(400).json({
        error: 'Title, content, and author are required'
      });
    }

    // Sanitize HTML content to remove scripts
  const sanitizedContent = purify.sanitize(content);

    // Generate slug, excerpt, and read time
    const slug = await generateUniqueSlug(title);
    const readTime = calculateReadTime(sanitizedContent);
    const excerpt = generateExcerpt(sanitizedContent);

    const post = new Post({
      title: title.trim(),
      content: sanitizedContent,
      slug,
      excerpt,
      author: author.trim(),
      published: published === 'true' || published === true,
      tags: JSON.parse(tags).map(tag => tag.trim()),
      readTime,
      clerkUserId,
      image: req.file ? {
        data: req.file.buffer,
        contentType: req.file.mimetype
      } : undefined
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error('[Create Post Error]', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

//if title is changed then it will generate a new slug
// if content is changed then it will sanitize the content
// if tags are changed then it will update the tags
// if published is changed then it will update the published status
// if readTime is changed then it will update the read time
// if excerpt is changed then it will update the excerpt
// if author is changed then it will update the author
// PUT /api/posts/:slug - Update post
router.put('/:slug', async (req, res) => {
  try {
    const { title, content, published, tags = [] ,clerkUserId} = req.body;

    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Sanitize content if provided
    const sanitizedContent = content ? purify.sanitize(content) : post.content;
    
    // Generate new slug if title changed
    let newSlug = post.slug;
    if (title && title !== post.title) {
      newSlug = await generateUniqueSlug(title, post._id);
    }

    // Update fields
    post.title = title || post.title;
    post.content = sanitizedContent;
    post.slug = newSlug;
    post.published = published !== undefined ? published : post.published;
    post.tags = tags.map(tag => tag.trim()).filter(Boolean);
    post.readTime = calculateReadTime(sanitizedContent);
    post.excerpt = generateExcerpt(sanitizedContent);

    await post.save();

    res.json(post);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'A post with this slug already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});


//just deletes the post
// DELETE /api/posts/:slug - Delete post
router.delete('/:slug', async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ slug: req.params.slug });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Multer setup to store file in memory

// POST route to create a post with image


export default router;