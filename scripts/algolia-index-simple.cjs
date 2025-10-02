const { algoliasearch } = require('algoliasearch');

// Load environment variables from .env file if it exists
require('dotenv').config();

const ALGOLIA_APP_ID = process.env.VITE_ALGOLIA_APP_ID || 'RMUQSU88LT';
const ALGOLIA_ADMIN_KEY = process.env.VITE_ALGOLIA_ADMIN_KEY || '3477b49adc9b4c57f96a6c1b59c96639';
const ALGOLIA_INDEX_NAME = process.env.VITE_ALGOLIA_INDEX_NAME || 'portfolio_content';

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

// Sample data - in a real scenario, you'd fetch this from your CMS or database
const sampleData = [
  {
    objectID: 'blog_golang_backend',
    title: 'Scaling Golang Backend Architecture',
    type: 'blog',
    description: 'Building scalable microservices with Go, Docker, and Kubernetes',
    url: '/blog/golang_backend_architecture',
    tags: ['golang', 'microservices', 'docker'],
    priority: 10
  },
  {
    objectID: 'blog_flutter_guide',
    title: 'Flutter Mobile Development Guide',
    type: 'blog',
    description: 'Complete guide to building cross-platform mobile apps',
    url: '/blog/flutter_mobile_development',
    tags: ['flutter', 'mobile', 'dart'],
    priority: 9
  },
  {
    objectID: 'page_about',
    title: 'About Me',
    type: 'page',
    description: 'Learn about my background and experience',
    url: '/#about',
    tags: ['personal', 'experience'],
    priority: 8
  },
  {
    objectID: 'page_projects',
    title: 'Projects',
    type: 'page',
    description: 'View my portfolio of software projects',
    url: '/#projects',
    tags: ['portfolio', 'code'],
    priority: 7
  },
  {
    objectID: 'page_skills',
    title: 'Skills',
    type: 'page',
    description: 'See my technical skills and expertise',
    url: '/#skills',
    tags: ['skills', 'technologies'],
    priority: 6
  },
  {
    objectID: 'page_contact',
    title: 'Contact',
    type: 'page',
    description: 'Get in touch for collaborations',
    url: '/#contact',
    tags: ['contact', 'collaboration'],
    priority: 5
  }
];

async function indexContent() {
  try {
    console.log(`Indexing ${sampleData.length} records to Algolia...`);
    
    const result = await index.saveObjects(sampleData, {
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