const { algoliasearch } = require('algoliasearch');
const { publishedBlogs } = require('../src/data/blogs');
const { projects } = require('../src/data/projects');

// Load environment variables from .env file if it exists
require('dotenv').config();

const ALGOLIA_APP_ID = process.env.VITE_ALGOLIA_APP_ID || 'RMUQSU88LT';
const ALGOLIA_ADMIN_KEY = process.env.VITE_ALGOLIA_ADMIN_KEY || '3477b49adc9b4c57f96a6c1b59c96639';
const ALGOLIA_INDEX_NAME = process.env.VITE_ALGOLIA_INDEX_NAME || 'portfolio_content';

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

async function indexContent() {
  try {
    // Prepare blog posts for indexing
    const blogRecords = publishedBlogs.map(blog => ({
      objectID: `blog_${blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      title: blog.title,
      description: blog.description,
      type: 'blog',
      url: `/blog/${blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      tags: blog.tags,
      priority: 10,
      createdAt: blog.createdAt
    }));

    // Prepare projects for indexing
    const projectRecords = projects.map(project => ({
      objectID: `project_${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      title: project.name,
      description: project.description,
      type: 'project',
      url: `/projects#${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      tags: [project.language, project.sourceType].filter(Boolean),
      priority: 9,
      language: project.language
    }));

    // Static pages
    const pageRecords = [
      {
        objectID: 'page_about',
        title: 'About Me',
        description: 'Learn about my background and experience',
        type: 'page',
        url: '/#about',
        tags: ['personal', 'experience'],
        priority: 8
      },
      {
        objectID: 'page_projects',
        title: 'Projects',
        description: 'View my portfolio of software projects',
        type: 'page',
        url: '/#projects',
        tags: ['portfolio', 'code'],
        priority: 7
      },
      {
        objectID: 'page_skills',
        title: 'Skills',
        description: 'See my technical skills and expertise',
        type: 'page',
        url: '/#skills',
        tags: ['skills', 'technologies'],
        priority: 6
      },
      {
        objectID: 'page_contact',
        title: 'Contact',
        description: 'Get in touch for collaborations',
        type: 'page',
        url: '/#contact',
        tags: ['contact', 'collaboration'],
        priority: 5
      }
    ];

    const allRecords = [...blogRecords, ...projectRecords, ...pageRecords];

    console.log(`Indexing ${allRecords.length} records to Algolia...`);
    
    const result = await index.saveObjects(allRecords, {
      autoGenerateObjectIDIfNotExist: true
    });

    console.log('Indexing completed successfully!');
    console.log(`Indexed ${result.objectIDs.length} objects`);
    
    // Configure index settings for better search
    await index.setSettings({
      searchableAttributes: [
        'title',
        'description',
        'tags'
      ],
      attributesForFaceting: [
        'type',
        'tags'
      ],
      customRanking: [
        'desc(priority)',
        'desc(createdAt)'
      ],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>'
    });

    console.log('Index settings configured!');

  } catch (error) {
    console.error('Error indexing to Algolia:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  if (!process.env.VITE_ALGOLIA_ADMIN_KEY) {
    console.error('Error: VITE_ALGOLIA_ADMIN_KEY environment variable is required');
    console.error('Please set your Algolia Admin API Key');
    process.exit(1);
  }
  
  indexContent();
}

module.exports = { indexContent };