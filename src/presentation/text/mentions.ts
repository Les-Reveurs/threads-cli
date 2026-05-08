import pc from 'picocolors'
import type { ThreadsMention, ThreadsMentionsListResult } from '../../domain/mentions/mention.js'

const renderMentionLine = (mention: ThreadsMention): string => [
  `- id: ${mention.id}`,
  `  username: ${mention.username ?? '-'}`,
  `  text: ${mention.text ?? '-'}`,
  `  media_type: ${mention.media_type ?? '-'}`,
  `  timestamp: ${mention.timestamp ?? '-'}`,
].join('\n')

export const renderMentionsList = (result: ThreadsMentionsListResult): string => [
  pc.green(`mentions list: ${result.data.length} item(s)`),
  ...result.data.map(renderMentionLine),
  `next_after: ${result.paging?.cursors?.after ?? '-'}`,
].join('\n')
