import { Request, Response } from 'express';
import prisma from '../prisma';

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const { content, imageUrl, videoUrl } = req.body;
    // @ts-ignore - Assuming auth middleware attaches user
    const authorId = req.user?.id; 

    if (!authorId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const newPost = await prisma.post.create({
      data: {
        content,
        imageUrl,
        videoUrl,
        authorId
      }
    });
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};
