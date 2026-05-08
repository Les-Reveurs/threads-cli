import { CliError } from '../../shared/errors/cli-error.js'

export type ReplyControl = 'everyone' | 'accounts_you_follow' | 'mentioned_only'
export type CreatePostMediaType = 'TEXT' | 'IMAGE' | 'VIDEO'

export type CreatePostInput = {
  text?: string
  mediaUrl?: string
  mediaType?: CreatePostMediaType
  altText?: string
  replyToId?: string
  quotePostId?: string
  replyControl?: ReplyControl
}

export type CreatePostResult = {
  id: string
  creationId: string
  mediaType: CreatePostMediaType
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.m4v', '.webm']

const inferMediaTypeFromUrl = (value: string): CreatePostMediaType | undefined => {
  const normalized = value.toLowerCase().split('?')[0] || value.toLowerCase()
  if (IMAGE_EXTENSIONS.some((ext) => normalized.endsWith(ext))) return 'IMAGE'
  if (VIDEO_EXTENSIONS.some((ext) => normalized.endsWith(ext))) return 'VIDEO'
  return undefined
}

export const normalizeCreatePostInput = (input: CreatePostInput): CreatePostInput & { mediaType: CreatePostMediaType } => {
  const text = input.text?.trim()
  const mediaUrl = input.mediaUrl?.trim()
  const replyToId = input.replyToId?.trim()
  const quotePostId = input.quotePostId?.trim()
  const altText = input.altText?.trim()
  const replyControl = input.replyControl?.trim() as ReplyControl | undefined

  if (!text && !mediaUrl) {
    throw new CliError('missing_post_content', 'post content is required (pass text, --media-url, or both)')
  }

  if (replyControl && !['everyone', 'accounts_you_follow', 'mentioned_only'].includes(replyControl)) {
    throw new CliError('invalid_reply_control', 'reply control must be one of: everyone, accounts_you_follow, mentioned_only')
  }

  const mediaType = input.mediaType || (mediaUrl ? inferMediaTypeFromUrl(mediaUrl) : undefined) || 'TEXT'

  if (mediaType === 'TEXT' && !text) {
    throw new CliError('missing_post_text', 'post text is required for text posts')
  }

  if ((mediaType === 'IMAGE' || mediaType === 'VIDEO') && !mediaUrl) {
    throw new CliError('missing_media_url', 'media url is required for image/video posts (pass --media-url)')
  }

  if (altText && mediaType !== 'IMAGE') {
    throw new CliError('invalid_alt_text', 'alt text is only supported for image posts')
  }

  return {
    text,
    mediaUrl,
    mediaType,
    altText,
    replyToId,
    quotePostId,
    replyControl,
  }
}
