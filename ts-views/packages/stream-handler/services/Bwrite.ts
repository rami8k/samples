import fetch from 'node-fetch'

const articleQuery = `query article($articleId: String!) { article(id: $articleId) { id headline postedDate } }`
const articlesQuery = `query articlesByIds($articleIds: [String]) {
  articles(includeArticleIds: $articleIds) {
    count
    items {
      id
      postedDate
    }
  }
}`

export class Bwrite {
  async queryBwrite(query, variables: {}) {
    try {
      const result = await fetch(`${process.env.BWRITE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          variables: variables
        })
      })
      .then(res => res.json())
      .then(res => res)

      return result.data
    } catch (err) {
      console.error(err)
      return {}
    }
  }

  async getArticle(articleId) {
    const result = await this.queryBwrite(articleQuery, { articleId: articleId })
    return result.article
  }
}