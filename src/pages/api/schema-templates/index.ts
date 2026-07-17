import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const templates = await prisma.schemaTemplate.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(templates);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, schema } = req.body;
      const template = await prisma.schemaTemplate.create({
        data: {
          name,
          schema: typeof schema === 'string' ? schema : JSON.stringify(schema)
        }
      });
      res.status(201).json(template);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
