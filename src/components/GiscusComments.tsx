import React from 'react'
import Giscus from '@giscus/react'

interface GiscusCommentsProps {
  postSlug: string
  postTitle: string
}

export const GiscusComments: React.FC<GiscusCommentsProps> = ({ postSlug, postTitle }) => {
  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Discussion
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Join the conversation using your GitHub account. Comments are powered by GitHub Discussions.
        </p>
      </div>
      
      <Giscus
        id="comments"
        repo="your-username/1saif.me" // You'll need to update this with your actual repo
        repoId="your-repo-id" // You'll get this from GitHub
        category="General"
        categoryId="your-category-id" // You'll get this from GitHub
        mapping="specific"
        term={postSlug}
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="preferred_color_scheme"
        lang="en"
        loading="lazy"
      />
    </div>
  )
}

// Instructions for setup:
// 1. Enable GitHub Discussions in your repository
// 2. Visit https://giscus.app/ to configure your settings
// 3. Replace the repo, repoId, categoryId values above with your actual values
// 4. The tool will generate the exact configuration for you 