import { CliError } from '../../shared/errors/cli-error.js'

export type ReplyControl = 'everyone' | 'accounts_you_follow' | 'mentioned_only'
export type CreatePostMediaType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL'

export type CreatePostInput = {
  text?: string
  mediaUrl?: string
  mediaUrls?: string[]
  mediaType?: CreatePostMediaType
  altText?: string
  replyToId?: string
  quotePostId?: string
  replyControl?: ReplyControl
  waitForPublish?: boolean
  publishPollIntervalMs?: number
  publishTimeoutMs?: number
}

export type CreatePostResult = {
  id: string
  creationId: string
  mediaType: CreatePostMediaType
  containerStatus?: string
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.m4v', '.webm']

const inferMediaTypeFromUrl = (value: string): Exclude<CreatePostMediaType, 'CAROUSEL'> | undefined => {
  const normalized = value.toLowerCase().split('?')[0] || value.toLowerCase()
  if (IMAGE_EXTENSIONS.some((ext) => normalized.endsWith(ext))) return 'IMAGE'
  if (VIDEO_EXTENSIONS.some((ext) => normalized.endsWith(ext))) return 'VIDEO'
  return undefined
}

export const normalizeCreatePostInput = (input: CreatePostInput): CreatePostInput & { mediaType: CreatePostMediaType, mediaUrls?: string[] } => {
  const text = input.text?.trim()
  const singleMediaUrl = input.mediaUrl?.trim()
  const mediaUrls = input.mediaUrls?.map((value) => value.trim()).filter(Boolean)
  const replyToId = input.replyToId?.trim()
  const quotePostId = input.quotePostId?.trim()
  const altText = input.altText?.trim()
  const replyControl = input.replyControl?.trim() as ReplyControl | undefined

  if (!text && !singleMediaUrl && (!mediaUrls || mediaUrls.length === 0)) {
    throw new CliError('missing_post_content', 'post content is required (pass text, --media-url, or both)')
  }

  if (replyControl && !['everyone', 'accounts_you_follow', 'mentioned_only'].includes(replyControl)) {
    throw new CliError('invalid_reply_control', 'reply control must be one of: everyone, accounts_you_follow, mentioned_only')
  }

  const normalizedMediaUrls = mediaUrls && mediaUrls.length > 0 ? mediaUrls : (singleMediaUrl ? [singleMediaUrl] : undefined)
  const mediaType = input.mediaType || (normalizedMediaUrls && normalizedMediaUrls.length > 1
    ? 'CAROUSEL'
    : normalizedMediaUrls?.[0]
      ? inferMediaTypeFromUrl(normalizedMediaUrls[0])
      : undefined) || 'TEXT'

  if (mediaType === 'TEXT' && !text) {
    throw new CliError('missing_post_text', 'post text is required for text posts')
  }

  if ((mediaType === 'IMAGE' || mediaType === 'VIDEO') && !normalizedMediaUrls?.[0]) {
    throw new CliError('missing_media_url', 'media url is required for image/video posts (pass --media-url)')
  }

  if (mediaType === 'CAROUSEL') {
    if (!normalizedMediaUrls || normalizedMediaUrls.length < 2) {
      throw new CliError('invalid_carousel_media', 'carousel posts require at least 2 media urls')
    }
    for (const url of normalizedMediaUrls) {
      if (inferMediaTypeFromUrl(url) !== 'IMAGE') {
        throw new CliError('invalid_carousel_media', 'carousel posts currently support image urls only')
      }
    }
  }

  if (altText && mediaType !== 'IMAGE') {
    throw new CliError('invalid_alt_text', 'alt text is only supported for image posts')
  }

  return {
    text,
    mediaUrl: normalizedMediaUrls?.[0],
    mediaUrls: normalizedMediaUrls,
    mediaType,
    altText,
    replyToId,
    quotePostId,
    replyControl,
  }
}
