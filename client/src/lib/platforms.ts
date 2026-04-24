export const PLATFORMS = [
  { id: 'github-actions', label: 'GitHub Actions', filename: '.github/workflows/ci.yml', color: 'bg-gray-800 text-gray-100' },
  { id: 'gitlab-ci',     label: 'GitLab CI',      filename: '.gitlab-ci.yml',           color: 'bg-orange-900 text-orange-200' },
  { id: 'circleci',      label: 'CircleCI',        filename: '.circleci/config.yml',     color: 'bg-green-900 text-green-200' },
  { id: 'bitbucket',     label: 'Bitbucket',       filename: 'bitbucket-pipelines.yml',  color: 'bg-blue-900 text-blue-200' },
  { id: 'jenkins',       label: 'Jenkins',         filename: 'Jenkinsfile',              color: 'bg-red-900 text-red-200' },
] as const

export type PlatformId = (typeof PLATFORMS)[number]['id']

export function getPlatform(id: string) {
  return PLATFORMS.find(p => p.id === id)
}

export function getPlatformFilename(id: string): string {
  return getPlatform(id)?.filename ?? 'pipeline.yml'
}
