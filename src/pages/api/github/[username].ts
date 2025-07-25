import { NextApiRequest, NextApiResponse } from 'next'
import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // Optional: for higher rate limits
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username } = req.query

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' })
  }

  try {
    // Fetch user profile
    const { data: user } = await octokit.rest.users.getByUsername({
      username,
    })

    // Fetch user repositories (sorted by stars)
    const { data: repos } = await octokit.rest.repos.listForUser({
      username,
      sort: 'updated',
      per_page: 20,
    })

    // Filter and format repositories
    const formattedRepos = repos
      .filter(repo => !repo.fork) // Exclude forks
      .sort((a, b) => b.stargazers_count - a.stargazers_count) // Sort by stars
      .slice(0, 12) // Limit to top 12 repos
      .map(repo => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        html_url: repo.html_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        updated_at: repo.updated_at,
      }))

    // Format user profile
    const profile = {
      login: user.login,
      name: user.name,
      bio: user.bio,
      avatar_url: user.avatar_url,
      html_url: user.html_url,
      public_repos: user.public_repos,
      followers: user.followers,
      following: user.following,
      repositories: formattedRepos,
    }

    res.status(200).json(profile)
  } catch (error: any) {
    console.error('GitHub API error:', error)
    
    if (error.status === 404) {
      return res.status(404).json({ error: 'GitHub user not found' })
    }
    
    if (error.status === 403) {
      return res.status(403).json({ error: 'GitHub API rate limit exceeded' })
    }

    res.status(500).json({ error: 'Failed to fetch GitHub profile' })
  }
} 